/**
 * MeliodasBot — Serviço de transcrição de áudio (Speech-to-Text)
 *
 * Usa Whisper LOCAL (grátis, offline) via CLI. Suporta whisper.cpp
 * (whisper-cli / main) e o openai-whisper (python). Configurável por env:
 *   WHISPER_BIN   — binário (default: tenta 'whisper' e depois 'whisper-cli')
 *   WHISPER_MODEL — modelo (default: 'base'); ou caminho .bin p/ whisper.cpp
 *   WHISPER_LANG  — idioma (default: 'auto')
 *
 * Se o Whisper não estiver instalado, lança erro com instrução clara.
 */

const { spawn, spawnSync } = require('child_process')
const fs = require('fs')
const path = require('path')
const os = require('os')
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

/** Descobre qual engine de whisper está disponível. */
function detectWhisper() {
    if (process.env.WHISPER_BIN) return { bin: process.env.WHISPER_BIN, kind: process.env.WHISPER_BIN.includes('cpp') || process.env.WHISPER_BIN.includes('-cli') || process.env.WHISPER_BIN.includes('main') ? 'cpp' : 'py' }
    if (which('whisper')) return { bin: 'whisper', kind: 'py' }           // openai-whisper
    for (const c of ['whisper-cli', 'whisper-cpp', 'main']) {
        if (which(c)) return { bin: c, kind: 'cpp' }                      // whisper.cpp
    }
    return null
}

function run(cmd, args, timeoutMs = 180000) {
    return new Promise((resolve, reject) => {
        const p = spawn(cmd, args)
        let out = '', err = ''
        const t = setTimeout(() => { p.kill('SIGKILL'); reject(new Error('Tempo limite da transcrição excedido.')) }, timeoutMs)
        p.stdout.on('data', d => out += d)
        p.stderr.on('data', d => err += d)
        p.on('error', e => { clearTimeout(t); reject(e) })
        p.on('close', code => { clearTimeout(t); code === 0 ? resolve(out) : reject(new Error(err.slice(0, 200) || `código ${code}`)) })
    })
}

/**
 * Transcreve um buffer de áudio para texto.
 * @param {Buffer} audioBuffer
 * @returns {Promise<{ text: string, engine: string }>}
 */
/**
 * Transcreve via servidor HTTP compatível com a API OpenAA (ex.: faster-whisper-server).
 * Ativado por WHISPER_API_URL (endpoint /v1/audio/transcriptions).
 */
async function transcribeViaApi(audioBuffer) {
    const url = process.env.WHISPER_API_URL
    const model = process.env.WHISPER_API_MODEL || 'Systran/faster-whisper-small'
    const dir = path.join(tempDir, 'stt')
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    const inPath = path.join(dir, 'api_' + Date.now() + '.ogg')
    const wavPath = inPath.replace(/\.ogg$/, '.wav')
    fs.writeFileSync(inPath, audioBuffer)
    try {
        // Converte para WAV 16k mono (formato universal p/ o servidor decodificar)
        await run('ffmpeg', ['-y', '-i', inPath, '-ar', '16000', '-ac', '1', '-c:a', 'pcm_s16le', wavPath], 60000)
        const wavBuf = fs.readFileSync(wavPath)
        const form = new FormData()
        form.append('file', new Blob([wavBuf], { type: 'audio/wav' }), 'audio.wav')
        form.append('model', model)
        form.append('response_format', 'text')
        if (WHISPER_LANG && WHISPER_LANG !== 'auto') form.append('language', WHISPER_LANG)

        const ctrl = new AbortController()
        const to = setTimeout(() => ctrl.abort(), 180000)
        const res = await fetch(url, { method: 'POST', body: form, signal: ctrl.signal }).finally(() => clearTimeout(to))
        if (!res.ok) throw new Error(`API de transcrição respondeu ${res.status}`)
        const text = (await res.text()).trim()
        if (!text) throw new Error('Transcrição vazia da API.')
        return { text, engine: 'faster-whisper (API)' }
    } finally {
        try { fs.unlinkSync(inPath) } catch (_) {}
        try { fs.unlinkSync(wavPath) } catch (_) {}
    }
}

async function transcribeAudio(audioBuffer) {
    if (!audioBuffer || !audioBuffer.length) throw new Error('Áudio vazio.')

    // Prioriza o servidor HTTP (faster-whisper) quando configurado.
    if (process.env.WHISPER_API_URL) {
        try {
            return await transcribeViaApi(audioBuffer)
        } catch (e) {
            logger.warn(`[STT] API falhou (${e.message}); tentando whisper local...`)
        }
    }

    const engine = detectWhisper()
    if (!engine) {
        const e = new Error('WHISPER_NAO_INSTALADO')
        e.code = 'WHISPER_NAO_INSTALADO'
        throw e
    }

    const dir = path.join(tempDir, 'stt')
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    const id = 'stt_' + Date.now()
    const inPath = path.join(dir, id + '.ogg')
    const wavPath = path.join(dir, id + '.wav')
    fs.writeFileSync(inPath, audioBuffer)

    try {
        // 1. Converte para WAV 16kHz mono (formato que o Whisper espera)
        await run('ffmpeg', ['-y', '-i', inPath, '-ar', '16000', '-ac', '1', '-c:a', 'pcm_s16le', wavPath], 60000)

        let text = ''
        if (engine.kind === 'py') {
            // openai-whisper: escreve arquivos de saída no diretório
            const args = [wavPath, '--model', WHISPER_MODEL, '--output_format', 'txt', '--output_dir', dir, '--fp16', 'False']
            if (WHISPER_LANG && WHISPER_LANG !== 'auto') args.push('--language', WHISPER_LANG)
            await run(engine.bin, args)
            const txtPath = path.join(dir, id + '.txt')
            if (fs.existsSync(txtPath)) { text = fs.readFileSync(txtPath, 'utf8').trim(); try { fs.unlinkSync(txtPath) } catch (_) {} }
        } else {
            // whisper.cpp: -m modelo, -otxt, -of prefixo, -l idioma
            const args = ['-m', WHISPER_MODEL, '-f', wavPath, '-otxt', '-of', path.join(dir, id)]
            if (WHISPER_LANG) args.push('-l', WHISPER_LANG)
            await run(engine.bin, args)
            const txtPath = path.join(dir, id + '.txt')
            if (fs.existsSync(txtPath)) { text = fs.readFileSync(txtPath, 'utf8').trim(); try { fs.unlinkSync(txtPath) } catch (_) {} }
        }

        if (!text) throw new Error('Não foi possível extrair texto do áudio.')
        return { text, engine: engine.bin }
    } finally {
        try { fs.unlinkSync(inPath) } catch (_) {}
        try { fs.unlinkSync(wavPath) } catch (_) {}
    }
}

module.exports = { transcribeAudio, detectWhisper }
