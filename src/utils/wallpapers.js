/**
 * Local Meliodas Wallpapers & Media Banner Catalog
 * Gerencia papéis de parede fixos e vídeos animados para TODOS os menus do bot
 */

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const logger = require("../core/logger");

const WALLPAPERS_DIR = path.resolve(__dirname, "../../assets/wallpapers");

if (!fs.existsSync(WALLPAPERS_DIR)) {
    fs.mkdirSync(WALLPAPERS_DIR, { recursive: true });
}

// Manifesto de deduplicação: mapeia arquivos idênticos ao arquivo canônico,
// para que várias categorias sirvam o MESMO buffer (menu.mp4 = main.mp4, etc.).
let FILE_ALIASES = {};
try {
    FILE_ALIASES = require("../../assets/wallpapers/aliases.json");
} catch (_) {
    FILE_ALIASES = {};
}
function resolveAlias(filePath) {
    const base = path.basename(filePath);
    if (FILE_ALIASES[base]) return path.join(path.dirname(filePath), FILE_ALIASES[base]);
    return filePath;
}

// Cache de buffers com validação por mtime e teto de memória (LRU simples).
// Antes: cada .menu fazia fs.readFileSync SÍNCRONO de até 4,4MB do disco, toda vez.
const bufferCache = new Map();   // realPath -> { buf, mtimeMs, size }
const CACHE_BUDGET_BYTES = 48 * 1024 * 1024;
let cacheBytes = 0;

function evictIfOver() {
    // Map preserva ordem de inserção → o primeiro é o mais antigo (LRU aproximado).
    while (cacheBytes > CACHE_BUDGET_BYTES && bufferCache.size > 0) {
        const oldestKey = bufferCache.keys().next().value;
        const entry = bufferCache.get(oldestKey);
        bufferCache.delete(oldestKey);
        cacheBytes -= entry.size;
    }
}

function resolvedExists(filePath) {
    return fs.existsSync(resolveAlias(filePath));
}

function readCached(filePath) {
    const realPath = resolveAlias(filePath);
    let st;
    try { st = fs.statSync(realPath); } catch (_) { return null; }

    const hit = bufferCache.get(realPath);
    if (hit && hit.mtimeMs === st.mtimeMs) {
        // move para o fim (mais recente) para o LRU
        bufferCache.delete(realPath);
        bufferCache.set(realPath, hit);
        return hit.buf;
    }
    if (hit) cacheBytes -= hit.size;

    const buf = fs.readFileSync(realPath);
    bufferCache.set(realPath, { buf, mtimeMs: st.mtimeMs, size: buf.length });
    cacheBytes += buf.length;
    evictIfOver();
    return buf;
}

const CATEGORY_MAP = {
    "main": "main", "global": "main", "principal": "main", "menu": "main",
    "rpg": "rpg", "aventura": "rpg", "combate": "rpg", "slayer": "rpg",
    "boss": "boss", "chefe": "boss", "raid": "boss", "chefao": "boss",
    "coliseu": "coliseu", "arena": "coliseu", "gladiador": "coliseu", "vaizel": "coliseu",
    "dungeon": "dungeon", "masmorra": "dungeon", "masmorras": "dungeon",
    "economy": "economy", "eco": "economy", "economia": "economy",
    "cassino": "cassino", "aposta": "cassino", "apostas": "cassino", "roleta": "cassino", "slots": "cassino", "mines": "cassino", "crash": "cassino", "plinko": "cassino", "bicho": "cassino",
    "banco": "banco", "pix": "banco", "cofre": "banco", "investir": "banco",
    "media": "media", "midia": "media", "downloads": "media", "download": "media", "musica": "media", "play": "media",
    "figurinhas": "figurinhas", "fig": "figurinhas", "figurinha": "figurinhas", "sticker": "figurinhas", "stickers": "figurinhas", "fotos": "figurinhas", "edicao": "figurinhas",
    "jogos": "jogos", "jogo": "jogos", "games": "jogos", "quiz": "jogos", "charada": "jogos", "minigames": "jogos", "xadrez": "jogos",
    "fun": "fun", "diversao": "fun", "zoeira": "fun", "memes": "fun",
    "interacao": "interacao", "social": "interacao", "afeto": "interacao", "casamento": "interacao", "ship": "interacao",
    "pesquisa": "pesquisa", "busca": "pesquisa", "google": "pesquisa", "vision": "pesquisa",
    "ia": "ia", "ai": "ia", "gemini": "ia", "gpt": "ia", "chatgpt": "ia", "traduzir": "ia",
    "arquivos": "arquivos", "arquivo": "arquivos", "pdf": "arquivos", "docs": "arquivos", "apostilas": "arquivos",
    "livros": "livros", "livro": "livros", "biblioteca": "livros", "ebook": "livros", "gutenberg": "livros",
    "calc": "calc", "calculadora": "calc", "math": "calc",
    "utilidades": "utilidades", "util": "utilidades", "geral": "utilidades", "numfake": "utilidades", "general": "general",
    "dev": "dev", "software": "dev", "tools": "dev", "debug": "dev",
    "skycode": "skycode", "sky": "skycode", "devnet": "skycode", "painelgrupo": "skycode",
    "rede": "rede", "net": "rede", "telemetria": "rede", "ping": "rede",
    "admin": "admin", "adm": "admin", "moderacao": "admin", "seguranca": "admin",
    "config": "config", "configs": "config", "configuracoes": "config", "mensagensgrupo": "config",
    "avisos": "avisos", "aviso": "avisos", "comunicado": "avisos", "anuncio": "avisos", "anuncios": "avisos",
    "aluguel": "aluguel", "rent": "aluguel", "planos": "aluguel", "vip": "aluguel",
    "owner": "owner", "dono": "owner", "donos": "owner", "vps": "owner",
    "profile": "profile", "perfil": "profile", "rank": "profile", "ranking": "profile", "xp": "profile",
    "dossie": "dossie", "perfilcompleto": "dossie", "ficha": "dossie",
    "levelup": "levelup", "up": "levelup", "rebirth": "levelup",
    "welcome": "welcome", "bv": "welcome", "bemvindo": "welcome",
    "leave": "leave", "saiu": "leave", "adeus": "leave",
    "help": "help", "ajuda": "help", "socorro": "help"
};

function normalizeCategory(cat) {
    const clean = String(cat || "main").toLowerCase().trim().replace(/[^a-z0-9]/g, "");
    return CATEGORY_MAP[clean] || clean || "main";
}

/**
 * Retorna a mídia oficial (Vídeo Animado MP4 ou Imagem Fixa) para qualquer menu
 * @param {string} category
 * @returns {{ type: "video" | "image" | null, buffer: Buffer | null, mimetype: string, path?: string }}
 */
const MENU_KEYS_ORDER = [
    "main", "rpg", "boss", "coliseu", "dungeon", "economy", "cassino", "banco",
    "media", "figurinhas", "jogos", "fun", "interacao", "pesquisa", "ia",
    "arquivos", "livros", "calc", "utilidades", "general", "dev", "skycode",
    "rede", "admin", "config", "avisos", "aluguel", "owner", "profile", "dossie",
    "levelup", "welcome", "leave", "help"
];

/**
 * Escolhe um asset FIXO e distinto para uma categoria que não tem mídia própria.
 * Prefere vídeos (mesma pegada dos demais menus) e cai para imagens.
 * @param {string} targetKey
 * @returns {{type:string, buffer:Buffer, mimetype:string, path:string}|null}
 */
function pickDistinctFallback(targetKey) {
    try {
        const root = fs.readdirSync(WALLPAPERS_DIR).filter(f => /\.(mp4|jpg|png)$/i.test(f));
        // Prioriza arquivos LIVRES (que não são a mídia própria de outro menu),
        // para não repetir a mídia de uma categoria existente.
        const semExt = (f) => f.replace(/\.(mp4|jpg|png)$/i, "").toLowerCase();
        const reivindicado = (f) => MENU_KEYS_ORDER.includes(semExt(f));
        const ordena = (arr) => arr.slice().sort();

        const livresVid = ordena(root.filter(f => /\.mp4$/i.test(f) && !reivindicado(f)));
        const livresImg = ordena(root.filter(f => /\.(jpg|png)$/i.test(f) && !reivindicado(f)));
        const usadosVid = ordena(root.filter(f => /\.mp4$/i.test(f) && reivindicado(f)));
        const usadosImg = ordena(root.filter(f => /\.(jpg|png)$/i.test(f) && reivindicado(f)));

        // Se houver arquivo livre, escolhe SÓ entre eles (garante não repetir a
        // mídia de outro menu). Sem livres, aí sim reaproveita os já usados.
        const livres = livresVid.concat(livresImg);
        const pool = livres.length > 0 ? livres : usadosVid.concat(usadosImg);
        if (pool.length === 0) return null;

        let idx = MENU_KEYS_ORDER.indexOf(targetKey);
        if (idx < 0) {
            // categoria desconhecida: índice estável derivado do nome
            let h = 0;
            for (const ch of String(targetKey)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
            idx = h;
        }
        const escolhido = pool[idx % pool.length];
        const fPath = path.join(WALLPAPERS_DIR, escolhido);
        if (!resolvedExists(fPath)) return null;
        const isVideo = /\.mp4$/i.test(escolhido);
        return {
            type: isVideo ? "video" : "image",
            buffer: readCached(fPath),
            mimetype: isVideo ? "video/mp4" : (/\.png$/i.test(escolhido) ? "image/png" : "image/jpeg"),
            path: fPath
        };
    } catch (_) {
        return null;
    }
}

function getWallpaperMode(groupJid = null) {
    try {
        const configRepo = require("../database/repositories/configRepository");
        if (groupJid) {
            const grp = configRepo.getConfig(groupJid);
            if (grp && grp.wallpaperMode) return grp.wallpaperMode;
        }
        const glb = configRepo.getConfig("global");
        if (glb && glb.wallpaperMode) return glb.wallpaperMode;
    } catch (_) {}
    return "video"; // Default: Vídeo Nativo Full HD 1080p sem degradação do WhatsApp
}

function setWallpaperMode(mode, groupJid = "global") {
    const valid = ["video", "imagem", "image", "foto", "gif"];
    const clean = String(mode || "").toLowerCase().trim();
    if (!valid.includes(clean)) return false;
    const normalized = (clean === "image" || clean === "foto") ? "imagem" : clean;

    try {
        const configRepo = require("../database/repositories/configRepository");
        const target = groupJid || "global";
        const current = configRepo.getConfig(target) || {};
        current.wallpaperMode = normalized;
        configRepo.saveConfig(target, current);
        try {
            const dataService = require("../services/dataService");
            if (dataService.invalidateConfigsCache) dataService.invalidateConfigsCache();
        } catch (_) {}
        return normalized;
    } catch (err) {
        logger.error("[WALLPAPER MODE ERROR] Falha ao salvar modo de wallpaper:", err);
        return false;
    }
}

function getMenuMedia(category = "main", preferredType = null) {
    const targetKey = normalizeCategory(category);
    const catDir = path.join(WALLPAPERS_DIR, targetKey);
    const mainDir = path.join(WALLPAPERS_DIR, "main");

    const effectiveType = preferredType ? String(preferredType).toLowerCase().trim() : getWallpaperMode();
    const wantImage = effectiveType === "imagem" || effectiveType === "image" || effectiveType === "foto";

    try {
        if (wantImage) {
            // Procura primeiro imagem estática em Full HD
            const catJpgPath = path.join(WALLPAPERS_DIR, targetKey + ".jpg");
            if (resolvedExists(catJpgPath)) {
                return { type: "image", buffer: readCached(catJpgPath), mimetype: "image/jpeg", path: catJpgPath };
            }
            const catPngPath = path.join(WALLPAPERS_DIR, targetKey + ".png");
            if (resolvedExists(catPngPath)) {
                return { type: "image", buffer: readCached(catPngPath), mimetype: "image/png", path: catPngPath };
            }
            if (fs.existsSync(catDir)) {
                const files = fs.readdirSync(catDir).filter(f => f.endsWith(".jpg") || f.endsWith(".png")).sort();
                if (files.length > 0) {
                    const fixedFile = files.find(f => f === "1.jpg" || f === "cover.jpg") || files[0];
                    const fPath = path.join(catDir, fixedFile);
                    return { type: "image", buffer: readCached(fPath), mimetype: "image/jpeg", path: fPath };
                }
            }
            // Fallback para vídeo caso a categoria só tenha vídeo
            const catVideoPath = path.join(WALLPAPERS_DIR, targetKey + ".mp4");
            if (resolvedExists(catVideoPath)) {
                return { type: "video", buffer: readCached(catVideoPath), mimetype: "video/mp4", path: catVideoPath };
            }
        } else {
            // Procura primeiro vídeo animado em Full HD
            const catVideoPath = path.join(WALLPAPERS_DIR, targetKey + ".mp4");
            if (resolvedExists(catVideoPath)) {
                return { type: "video", buffer: readCached(catVideoPath), mimetype: "video/mp4", path: catVideoPath };
            }
            const catDirVideo = path.join(catDir, "video.mp4");
            if (resolvedExists(catDirVideo)) {
                return { type: "video", buffer: readCached(catDirVideo), mimetype: "video/mp4", path: catDirVideo };
            }
            // Fallback para imagem caso a categoria só tenha imagem
            const catJpgPath = path.join(WALLPAPERS_DIR, targetKey + ".jpg");
            if (resolvedExists(catJpgPath)) {
                return { type: "image", buffer: readCached(catJpgPath), mimetype: "image/jpeg", path: catJpgPath };
            }
            const catPngPath = path.join(WALLPAPERS_DIR, targetKey + ".png");
            if (resolvedExists(catPngPath)) {
                return { type: "image", buffer: readCached(catPngPath), mimetype: "image/png", path: catPngPath };
            }
            if (fs.existsSync(catDir)) {
                const files = fs.readdirSync(catDir).filter(f => f.endsWith(".jpg") || f.endsWith(".png")).sort();
                if (files.length > 0) {
                    const fixedFile = files.find(f => f === "1.jpg" || f === "cover.jpg") || files[0];
                    const fPath = path.join(catDir, fixedFile);
                    return { type: "image", buffer: readCached(fPath), mimetype: "image/jpeg", path: fPath };
                }
            }
        }

        // 3. Fallback DISTINTO por categoria
        const distinto = pickDistinctFallback(targetKey);
        if (distinto) return distinto;

        // 3.1 Fallback: Vídeo Global
        const globalVideoPath = path.join(WALLPAPERS_DIR, "menu.mp4");
        if (resolvedExists(globalVideoPath)) {
            return { type: "video", buffer: readCached(globalVideoPath), mimetype: "video/mp4", path: globalVideoPath };
        }

        // 4. Fallback: Imagem Principal
        if (fs.existsSync(mainDir)) {
            const mainFiles = fs.readdirSync(mainDir).filter(f => f.endsWith(".jpg") || f.endsWith(".png")).sort();
            if (mainFiles.length > 0) {
                const fixedMain = mainFiles.find(f => f === "1.jpg" || f === "cover.jpg") || mainFiles[0];
                const fPath = path.join(mainDir, fixedMain);
                return { type: "image", buffer: readCached(fPath), mimetype: "image/jpeg", path: fPath };
            }
        }

        const mainPath = path.join(WALLPAPERS_DIR, "main.jpg");
        if (resolvedExists(mainPath)) {
            return { type: "image", buffer: readCached(mainPath), mimetype: "image/jpeg", path: mainPath };
        }
    } catch (err) {
        logger.warn("[MENU MEDIA LOAD WARN] Falha ao ler mídia do menu de " + targetKey + ": " + err.message);
    }

    return { type: null, buffer: null, mimetype: "" };
}

function getWallpaperBuffer(category = "main") {
    const media = getMenuMedia(category);
    return media.buffer;
}

/**
 * Envia uma mensagem com mídia oficial de menu na MÁXIMA qualidade possível
 * (Evitando a compressão forçada do WhatsApp para 360p GIF quando em modo vídeo)
 * Divide captions com mais de 1000 caracteres para evitar recusa do WhatsApp.
 */
async function sendMenuMediaMessage(client, jid, { category = "main", text = "", caption = null, quoted = null, mentions = [], mode = null }) {
    const messageText = (caption !== null ? caption : text).trim();

    if (process.env.NODE_ENV === "test") {
        if (client && client.sendMessage) {
            return await client.sendMessage(jid, { text: messageText, mentions }, { quoted });
        }
        return messageText;
    }

    const effectiveMode = (mode || getWallpaperMode(jid)).toLowerCase().trim();
    const isImage = effectiveMode === "imagem" || effectiveMode === "image" || effectiveMode === "foto";
    const isGif = effectiveMode === "gif";

    const media = getMenuMedia(category, isImage ? "image" : "video");

    if (!media || !media.buffer) {
        return await client.sendMessage(jid, { text: messageText, mentions }, { quoted });
    }

    let p1 = messageText;
    let p2 = null;
    if (messageText.length > 1000) {
        const lines = messageText.split("\n");
        p1 = "";
        p2 = "";
        let inP1 = true;
        for (const line of lines) {
            if (inP1 && (p1.length + line.length + 50 > 980)) {
                inP1 = false;
                p1 += "╰━━━━━━━━━━━━━━━━━━⬣\n▸ _(continuação abaixo... )_";
            }
            if (inP1) {
                p1 += line + "\n";
            } else {
                p2 += line + "\n";
            }
        }
        p1 = p1.trim();
        p2 = p2.trim();
    }

    try {
        let sent;
        if (media.type === "video") {
            sent = await client.sendMessage(jid, {
                video: media.buffer,
                caption: p1,
                mimetype: "video/mp4",
                gifPlayback: isGif, // false preserva os 1080p nativos no WhatsApp; true só se explicitamente 'gif'
                mentions
            }, { quoted });
        } else {
            sent = await client.sendMessage(jid, {
                image: media.buffer,
                caption: p1,
                mentions
            }, { quoted });
        }

        if (p2 && normalizeCategory(category) !== "main") {
            await client.sendMessage(jid, { text: p2, mentions }, { quoted: sent || quoted });
        }

        return sent;
    } catch (err) {
        logger.warn(`[SEND MENU MEDIA WARN] Falha ao enviar mídia (${category}): ${err.message}. Enviando como texto.`);
        return await client.sendMessage(jid, { text: messageText, mentions }, { quoted });
    }
}

/**
 * Salva uma nova imagem estática para um menu específico em Full HD sem corte destrutivo
 */
async function saveWallpaper(category = "main", imageBuffer) {
    const targetKey = normalizeCategory(category);
    const targetPath = path.join(WALLPAPERS_DIR, targetKey + ".jpg");

    try {
        const meta = await sharp(imageBuffer).metadata();
        let pipeline = sharp(imageBuffer);
        if (meta.width > 1920 || meta.height > 1080) {
            pipeline = pipeline.resize(1920, 1080, { fit: "inside", withoutEnlargement: true });
        }
        const optimized = await pipeline.jpeg({ quality: 95, mozjpeg: true }).toBuffer();

        fs.writeFileSync(targetPath, optimized);
        const cached = bufferCache.get(targetPath);
        if (cached) { cacheBytes -= cached.size; bufferCache.delete(targetPath); }
        logger.info("[WALLPAPER UPDATED] Imagem Full HD salva para: " + targetKey);
        return true;
    } catch (err) {
        logger.error("[WALLPAPER SAVE ERROR] Erro ao salvar imagem para " + targetKey + ":", err);
        throw err;
    }
}

/**
 * Salva um novo vídeo animado para um menu específico em Full HD e extrai frame sincronizado
 */
async function saveMenuVideo(category = "main", videoBuffer) {
    const targetKey = normalizeCategory(category);
    const targetPath = path.join(WALLPAPERS_DIR, targetKey + ".mp4");
    const targetJpg = path.join(WALLPAPERS_DIR, targetKey + ".jpg");

    try {
        fs.writeFileSync(targetPath, videoBuffer);
        const cached = bufferCache.get(targetPath);
        if (cached) { cacheBytes -= cached.size; bufferCache.delete(targetPath); }

        try {
            const { execSync } = require("child_process");
            execSync(`ffmpeg -y -ss 00:00:01 -i "${targetPath}" -vframes 1 -q:v 2 "${targetJpg}"`, { stdio: "ignore" });
            const cachedJpg = bufferCache.get(targetJpg);
            if (cachedJpg) { cacheBytes -= cachedJpg.size; bufferCache.delete(targetJpg); }
        } catch (_) {}

        logger.info("[MENU VIDEO UPDATED] Vídeo animado Full HD salvo para: " + targetKey);
        return true;
    } catch (err) {
        logger.error("[MENU VIDEO SAVE ERROR] Erro ao salvar vídeo para " + targetKey + ":", err);
        throw err;
    }
}

/**
 * Restaura o wallpaper padrão de uma categoria
 */
function resetMenuMedia(category = "main") {
    const targetKey = normalizeCategory(category);
    const videoPath = path.join(WALLPAPERS_DIR, targetKey + ".mp4");
    const jpgPath = path.join(WALLPAPERS_DIR, targetKey + ".jpg");
    const pngPath = path.join(WALLPAPERS_DIR, targetKey + ".png");

    let deleted = false;
    if (fs.existsSync(videoPath)) { fs.unlinkSync(videoPath); deleted = true; }
    if (fs.existsSync(jpgPath)) { fs.unlinkSync(jpgPath); deleted = true; }
    if (fs.existsSync(pngPath)) { fs.unlinkSync(pngPath); deleted = true; }

    return deleted;
}

/**
 * Retorna o status de mídia de todos os menus
 */
function getAllMenuMediaStatus() {
    const allCategories = [
        { key: "main", label: "Menu Principal (.menu)" },
        { key: "rpg", label: "Menu RPG & Liones (.rpg / .menu rpg)" },
        { key: "boss", label: "Batalhas de Chefes & Raids (.boss)" },
        { key: "coliseu", label: "Coliseu de Vaizel & Arena (.coliseu)" },
        { key: "dungeon", label: "Masmorras & Dungeons (.dungeonboss)" },
        { key: "economy", label: "Menu Economia & Finanças (.menu eco)" },
        { key: "cassino", label: "Cassino Royale & Apostas (.cassino)" },
        { key: "banco", label: "Banco Central & Pix (.banco)" },
        { key: "media", label: "Downloads & Mídias (.menu media)" },
        { key: "figurinhas", label: "Figurinhas & Stickers (.figurinhas)" },
        { key: "jogos", label: "Jogos & Quizzes (.menu jogos)" },
        { key: "fun", label: "Diversão & Memes (.menu fun)" },
        { key: "interacao", label: "Interação & Social (.menu interacao)" },
        { key: "pesquisa", label: "Pesquisa & Web (.menu pesquisa)" },
        { key: "ia", label: "Inteligência Artificial (.ia)" },
        { key: "arquivos", label: "Arquivos & PDFs (.menu arquivos)" },
        { key: "livros", label: "Biblioteca de Livros (.livros)" },
        { key: "calc", label: "Calculadora & Matemática (.menu calc)" },
        { key: "utilidades", label: "Utilidades & Telefonia (.menu utilidades)" },
        { key: "general", label: "Geral & Comandos Úteis (.menu general)" },
        { key: "dev", label: "Dev Hub & Ferramentas (.menu dev)" },
        { key: "skycode", label: "Terminal Cibernético Skycode (.skycode)" },
        { key: "rede", label: "Rede & Telemetria (.menu rede)" },
        { key: "admin", label: "Administração do Grupo (.menu admin)" },
        { key: "config", label: "Configurações do Grupo (.menu config)" },
        { key: "avisos", label: "Avisos & Comunicados Oficiais (.avisogrupo)" },
        { key: "aluguel", label: "Aluguel & Planos VIP (.menu aluguel)" },
        { key: "owner", label: "Painel Supremo do Dono (.menu dono)" },
        { key: "profile", label: "Perfil & Rankings (.menu perfil)" },
        { key: "dossie", label: "Dossiê Militar Completo (.dossie)" },
        { key: "levelup", label: "Celebração de Level Up & Rebirth (.levelup)" },
        { key: "welcome", label: "Card de Boas-Vindas (.welcome)" },
        { key: "leave", label: "Card de Saída/Despedida (.leave)" },
        { key: "help", label: "Central de Ajuda & Guia (.help)" }
    ];

    return allCategories.map(cat => {
        const videoPath = path.join(WALLPAPERS_DIR, cat.key + ".mp4");
        const jpgPath = path.join(WALLPAPERS_DIR, cat.key + ".jpg");
        const hasVideo = resolvedExists(videoPath);
        const hasImage = resolvedExists(jpgPath);

        let status = "📌 Padrão Oficial (1080p)";
        if (hasVideo && hasImage) status = "✨ 1080p Full HD (Vídeo + Banner)";
        else if (hasVideo) status = "🎬 Vídeo Animado 1080p MP4";
        else if (hasImage) status = "🖼️ Foto Estática 1080p JPG";

        return { ...cat, status, hasVideo, hasImage };
    });
}

module.exports = {
    WALLPAPERS_DIR,
    CATEGORY_MAP,
    normalizeCategory,
    getWallpaperMode,
    setWallpaperMode,
    getMenuMedia,
    getWallpaperBuffer,
    sendMenuMediaMessage,
    saveWallpaper,
    saveMenuVideo,
    resetMenuMedia,
    getAllMenuMediaStatus
};
