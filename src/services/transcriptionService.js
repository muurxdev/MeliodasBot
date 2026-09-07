/**
 * Serviço de transcrição de áudio (Speech-to-Text) v3
 *
 * Suporte multi-camadas com conversão para WAV 16kHz mono (pcm_s16le):
 * 1. faster-whisper-server (container local na porta 8000)
 * 2. Groq Whisper Cloud (whisper-large-v3-turbo)
 * 3. Google Gemini 2.0 Flash (Multimodal Audio)
 * 4. Binário CLI local (whisper ou whisper.cpp)
 */

const { spawn, spawnSync } = require('child_process')
const fs = require('fs')
const path = require('path')
const { tempDir } = require('../config/paths')
const logger = require('../core/logger')

const WHISPER_MODEL = process.env.WHISPER_MODEL || 'base'
const WHISPER_LANG = process.env.WHISPER_LANG || 'auto'

function which(bin) {
    try {
        const r = spawnSync('sh', ['-c', `command -v ${bin}`], { encoding: 'utf8' })
        return r.status === 0 ? r.stdout.trim() : null
    } catch (_) { return null }
}

/** Descobre qual engine de whisper CLI está disponível. */
function detectWhisper() {
    if (process.env.WHISPER_BIN) {
        const isCpp = process.env.WHISPER_BIN.includes('cpp') || process.env.WHISPER_BIN.includes('-cli') || process.env.WHISPER_BIN.includes('main')
        return { bin: process.env.WHISPER_BIN, kind: isCpp ? 'cpp' : 'py' }
    }
    if (which('whisper')) return { bin: 'whisper', kind: 'py' }
    for (const c of ['whisper-cli', 'whisper-cpp', 'main']) {
        if (which(c)) return { bin: c, kind: 'cpp' }
    }
    return null
}

function run(cmd, args, timeoutMs = 180000) {
    return new Promise((resolve, reject) => {
        const p = spawn(cmd, args)
        let out = '', err = ''
        const t = setTimeout(() => { p.kill('SIGKILL'); reject(new Error('Tempo limite da conversão/transcrição excedido.')) }, timeoutMs)
        p.stdout.on('data', d => out += d)
        p.stderr.on('data', d => err += d)
        p.on('error', e => { clearTimeout(t); reject(e) })
        p.on('close', code => { clearTimeout(t); code === 0 ? resolve(out) : reject(new Error(err.slice(0, 200) || `código ${code}`)) })
    })
}

/**
 * Converte qualquer buffer de áudio (ogg, m4a, mp3, opus) para WAV 16kHz mono (pcm_s16le).
 */
async function convertToWav16k(audioBuffer) {
    const dir = path.join(tempDir, 'stt')
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    const id = 'stt_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7)
    const inPath = path.join(dir, id + '.in')
    const wavPath = path.join(dir, id + '.wav')

    fs.writeFileSync(inPath, audioBuffer)

    try {
        await run('ffmpeg', ['-y', '-i', inPath, '-vn', '-ar', '16000', '-ac', '1', '-c:a', 'pcm_s16le', wavPath], 45000)
    } catch (e) {
        try { if (fs.existsSync(inPath)) fs.unlinkSync(inPath) } catch (_) {}
        try { if (fs.existsSync(wavPath)) fs.unlinkSync(wavPath) } catch (_) {}
        throw new Error(`Falha ao converter áudio com ffmpeg: ${e.message}`)
    } finally {
        try { if (fs.existsSync(inPath)) fs.unlinkSync(inPath) } catch (_) {}
    }

    const wavBuffer = fs.readFileSync(wavPath)
    const cleanup = () => {
        try { if (fs.existsSync(wavPath)) fs.unlinkSync(wavPath) } catch (_) {}
    }

    return { wavBuffer, tempWavPath: wavPath, cleanup }
}

/**
 * 1. Transcreve via faster-whisper-server (container local na porta 8000)
 */
async function transcribeViaLocalWhisperServer(wavBuffer) {
    const url = process.env.WHISPER_API_URL
    if (!url) return null

    const model = process.env.WHISPER_API_MODEL || 'Systran/faster-whisper-base'
    const form = new FormData()
    form.append('file', new Blob([wavBuffer], { type: 'audio/wav' }), 'audio.wav')
    form.append('model', model)
    form.append('response_format', 'json')
    if (WHISPER_LANG && WHISPER_LANG !== 'auto') form.append('language', WHISPER_LANG)

    const ctrl = new AbortController()
    const to = setTimeout(() => ctrl.abort(), 45000)

    const headers = {}
    if (process.env.WHISPER_API_KEY) headers['Authorization'] = `Bearer ${process.env.WHISPER_API_KEY}`

    const res = await fetch(url, {
        method: 'POST',
        headers,
        body: form,
        signal: ctrl.signal
    }).finally(() => clearTimeout(to))

    if (!res.ok) {
        const errBody = await res.text()
        throw new Error(`Local Whisper HTTP ${res.status}: ${errBody.slice(0, 150)}`)
    }

    const data = await res.json()
    const text = (data.text || '').trim()
    if (!text) throw new Error('Transcrição retornou vazia do container Whisper.')
    return { text, engine: `Faster-Whisper (${model.split('/').pop()})` }
}

/**
 * 2. Transcreve via Groq Whisper Cloud (whisper-large-v3-turbo)
 */
async function transcribeViaGroq(wavBuffer) {
    const apiKey = (process.env.GROQ_API_KEY || '').trim()
    if (!apiKey) return null

    const form = new FormData()
    form.append('file', new Blob([wavBuffer], { type: 'audio/wav' }), 'audio.wav')
    form.append('model', 'whisper-large-v3-turbo')
    form.append('response_format', 'json')
    if (WHISPER_LANG && WHISPER_LANG !== 'auto') form.append('language', WHISPER_LANG)

    const ctrl = new AbortController()
    const to = setTimeout(() => ctrl.abort(), 35000)

    const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}` },
        body: form,
        signal: ctrl.signal
    }).finally(() => clearTimeout(to))

    if (!res.ok) {
        const errBody = await res.text()
        throw new Error(`Groq Whisper HTTP ${res.status}: ${errBody.slice(0, 150)}`)
    }

    const data = await res.json()
    const text = (data.text || '').trim()
    if (!text) throw new Error('Transcrição retornou vazia do Groq.')
    return { text, engine: 'Groq Whisper Large V3' }
}

/**
 * 3. Transcreve via Google Gemini 2.0 Flash (Multimodal Audio)
 */
async function transcribeViaGemini(wavBuffer) {
    const key = (process.env.GEMINI_API_KEY || '').trim()
    if (!key) return null

    const base64Audio = wavBuffer.toString('base64')
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(key)}`
    const payload = {
        contents: [{
            parts: [
                {
                    inlineData: {
                        mimeType: 'audio/wav',
                        data: base64Audio
                    }
                },
                {
                    text: 'Transcreva exatamente o que é falado neste áudio em português. Retorne APENAS a transcrição literal, sem nenhuma introdução, aspas ou comentários adicionais.'
                }
            ]
        }],
        generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 600
        }
    }

    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(30000)
    })

    if (!res.ok) {
        const errText = await res.text()
        throw new Error(`Gemini Audio STT HTTP ${res.status}: ${errText.slice(0, 150)}`)
    }

    const json = await res.json()
    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
    if (!text) throw new Error('Gemini retornou transcrição vazia.')
    return { text, engine: 'Google Gemini 2.0 Flash' }
}

/**
 * 4. Transcreve via CLI local (whisper ou whisper.cpp)
 */
async function transcribeViaCli(wavPath, engine) {
    const dir = path.dirname(wavPath)
    const baseId = path.basename(wavPath, '.wav')
    let text = ''

    if (engine.kind === 'py') {
        const args = [wavPath, '--model', WHISPER_MODEL, '--output_format', 'txt', '--output_dir', dir, '--fp16', 'False']
        if (WHISPER_LANG && WHISPER_LANG !== 'auto') args.push('--language', WHISPER_LANG)
        await run(engine.bin, args, 120000)
        const txtPath = path.join(dir, baseId + '.txt')
        if (fs.existsSync(txtPath)) {
            text = fs.readFileSync(txtPath, 'utf8').trim()
            try { fs.unlinkSync(txtPath) } catch (_) {}
        }
    } else {
        const args = ['-m', WHISPER_MODEL, '-f', wavPath, '-otxt', '-of', path.join(dir, baseId)]
        if (WHISPER_LANG && WHISPER_LANG !== 'auto') args.push('-l', WHISPER_LANG)
        await run(engine.bin, args, 120000)
        const txtPath = path.join(dir, baseId + '.txt')
        if (fs.existsSync(txtPath)) {
            text = fs.readFileSync(txtPath, 'utf8').trim()
            try { fs.unlinkSync(txtPath) } catch (_) {}
        }
    }

    if (!text) throw new Error('Não foi possível extrair texto do áudio via CLI.')
    return { text, engine: `Whisper CLI (${engine.bin})` }
}

/**
 * Função principal de transcrição de áudio
 * @param {Buffer} audioBuffer
 * @returns {Promise<{ text: string, engine: string }>}
 */
async function transcribeAudio(audioBuffer) {
    if (!audioBuffer || !audioBuffer.length) throw new Error('Áudio vazio.')

    // Converte para WAV 16kHz mono (formato universal padrão)
    const { wavBuffer, tempWavPath, cleanup } = await convertToWav16k(audioBuffer)

    try {
        // Camada 1: faster-whisper-server (container local VPS)
        if (process.env.WHISPER_API_URL) {
            try {
                const res = await transcribeViaLocalWhisperServer(wavBuffer)
                if (res && res.text) return res
            } catch (err) {
                logger.warn(`[STT] Local Whisper falhou (${err.message}); tentando nuvem...`)
            }
        }

        // Camada 2: Groq Whisper Cloud (ultra-rápido)
        if (process.env.GROQ_API_KEY) {
            try {
                const res = await transcribeViaGroq(wavBuffer)
                if (res && res.text) return res
            } catch (err) {
                logger.warn(`[STT] Groq Whisper falhou (${err.message}); tentando Gemini...`)
            }
        }

        // Camada 3: Google Gemini 2.0 Flash (Multimodal Audio)
        if (process.env.GEMINI_API_KEY) {
            try {
                const res = await transcribeViaGemini(wavBuffer)
                if (res && res.text) return res
            } catch (err) {
                logger.warn(`[STT] Gemini Audio falhou (${err.message}); tentando CLI...`)
            }
        }

        // Camada 4: Binário Whisper local
        const engine = detectWhisper()
        if (engine) {
            try {
                return await transcribeViaCli(tempWavPath, engine)
            } catch (err) {
                logger.error(`[STT] Whisper CLI falhou: ${err.message}`)
            }
        }

        // Se nenhuma camada funcionou
        const e = new Error('Nenhum serviço de transcrição (Whisper local, Groq ou Gemini) conseguiu processar o áudio.')
        e.code = 'STT_UNAVAILABLE'
        throw e
    } finally {
        cleanup()
    }
}

module.exports = { transcribeAudio, detectWhisper }
