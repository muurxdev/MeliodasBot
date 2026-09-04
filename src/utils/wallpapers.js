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
    "rpg": "rpg", "aventura": "rpg", "combate": "rpg",
    "media": "media", "midia": "media", "downloads": "media", "download": "media",
    "arquivos": "arquivos", "arquivo": "arquivos", "livros": "arquivos", "livro": "arquivos", "pdf": "arquivos", "docs": "arquivos", "ebook": "arquivos",
    "economy": "economy", "eco": "economy", "economia": "economy", "perfil": "economy",
    "calc": "calc", "calculadora": "calc", "math": "calc",
    "interacao": "interacao", "social": "interacao", "afeto": "interacao", "acoes": "interacao",
    "pesquisa": "pesquisa", "ia": "pesquisa", "busca": "pesquisa", "google": "pesquisa", "vision": "pesquisa",
    "fun": "fun", "diversao": "fun", "jogos": "fun",
    "dev": "dev", "software": "dev", "tools": "dev",
    "rede": "rede", "net": "rede", "telemetria": "rede", "ping": "rede",
    "admin": "admin", "adm": "admin", "moderacao": "admin",
    "config": "config", "configs": "config", "configuracoes": "config",
    "aluguel": "aluguel", "rent": "aluguel", "planos": "aluguel",
    "owner": "owner", "dono": "owner", "donos": "owner", "vps": "owner",
    "welcome": "welcome", "bv": "welcome", "bemvindo": "welcome",
    "leave": "leave", "saiu": "leave", "adeus": "leave",
    "dossie": "dossie", "perfilcompleto": "dossie",
    "help": "help", "ajuda": "help"
};

function normalizeCategory(cat) {
    const clean = String(cat || "main").toLowerCase().trim().replace(/[^a-z0-9]/g, "");
    // Preserva a chave quando ela não está no mapa: antes TUDO virava "main", o que
    // fazia menus como `general` e `profile` mostrarem exatamente a mesma mídia.
    return CATEGORY_MAP[clean] || clean || "main";
}

/**
 * Retorna a mídia oficial (Vídeo Animado MP4 ou Imagem Fixa) para qualquer menu
 * @param {string} category
 * @returns {{ type: "video" | "image" | null, buffer: Buffer | null, mimetype: string, path?: string }}
 */
// Ordem estável das telas — usada só para dar a cada categoria SEM mídia própria
// um arquivo diferente (e sempre o mesmo), evitando menus visualmente idênticos.
const MENU_KEYS_ORDER = [
    "main", "rpg", "economy", "media", "fun", "dev", "general", "admin", "profile",
    "owner", "help", "config", "pesquisa", "calc", "rede", "interacao", "arquivos",
    "aluguel", "leave"
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

function getMenuMedia(category = "main") {
    const targetKey = normalizeCategory(category);
    const catDir = path.join(WALLPAPERS_DIR, targetKey);
    const mainDir = path.join(WALLPAPERS_DIR, "main");

    try {
        // 1. Vídeo Animado (.mp4) específico da categoria
        const catVideoPath = path.join(WALLPAPERS_DIR, targetKey + ".mp4");
        if (resolvedExists(catVideoPath)) {
            return { type: "video", buffer: readCached(catVideoPath), mimetype: "video/mp4", path: catVideoPath };
        }

        const catDirVideo = path.join(catDir, "video.mp4");
        if (resolvedExists(catDirVideo)) {
            return { type: "video", buffer: readCached(catDirVideo), mimetype: "video/mp4", path: catDirVideo };
        }

        // 2. Imagem Fixa (.jpg / .png) específica da categoria
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

        // 3. Fallback DISTINTO por categoria: em vez de cair todo mundo no mesmo
        //    "main" (que fazia vários menus ficarem idênticos), cada categoria sem
        //    mídia própria recebe um arquivo FIXO e diferente do acervo. Assim que
        //    existir um `<categoria>.mp4/.jpg`, ele assume automaticamente (acima).
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
 * Salva uma nova imagem estática para um menu específico
 */
async function saveWallpaper(category = "main", imageBuffer) {
    const targetKey = normalizeCategory(category);
    const targetPath = path.join(WALLPAPERS_DIR, targetKey + ".jpg");

    // Remove eventual vídeo antigo para a imagem prevalecer
    const oldVideo = path.join(WALLPAPERS_DIR, targetKey + ".mp4");
    if (fs.existsSync(oldVideo)) {
        try { fs.unlinkSync(oldVideo); } catch (_) {}
    }

    try {
        const optimized = await sharp(imageBuffer)
            .resize(1080, 1080, { fit: "cover", position: "center" })
            .jpeg({ quality: 85 })
            .toBuffer();

        fs.writeFileSync(targetPath, optimized);
        // Invalida o cache do path (o readCached recarrega pelo novo mtime).
        const cached = bufferCache.get(targetPath);
        if (cached) { cacheBytes -= cached.size; bufferCache.delete(targetPath); }
        logger.info("[WALLPAPER UPDATED] Imagem estática salva para: " + targetKey);
        return true;
    } catch (err) {
        logger.error("[WALLPAPER SAVE ERROR] Erro ao salvar imagem para " + targetKey + ":", err);
        throw err;
    }
}

/**
 * Salva um novo vídeo animado para um menu específico
 */
async function saveMenuVideo(category = "main", videoBuffer) {
    const targetKey = normalizeCategory(category);
    const targetPath = path.join(WALLPAPERS_DIR, targetKey + ".mp4");

    try {
        fs.writeFileSync(targetPath, videoBuffer);
        logger.info("[MENU VIDEO UPDATED] Vídeo animado salvo para: " + targetKey);
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
        { key: "rpg", label: "Menu RPG (.menu rpg)" },
        { key: "media", label: "Menu Mídias (.menu media)" },
        { key: "arquivos", label: "Menu Arquivos & Livros (.menu arquivos)" },
        { key: "economy", label: "Menu Economia (.menu eco)" },
        { key: "calc", label: "Menu Calculadora (.menu calc)" },
        { key: "interacao", label: "Menu Interação (.menu interacao)" },
        { key: "pesquisa", label: "Menu Pesquisa (.menu pesquisa)" },
        { key: "fun", label: "Menu Diversão (.menu fun)" },
        { key: "dev", label: "Menu Dev Hub (.menu dev)" },
        { key: "rede", label: "Menu Rede & Telemetria (.menu rede)" },
        { key: "admin", label: "Menu Administração (.menu admin)" },
        { key: "config", label: "Menu Configurações (.menu config)" },
        { key: "aluguel", label: "Menu Aluguel (.menu aluguel)" },
        { key: "owner", label: "Menu Donos & VPS (.menu dono)" },
        { key: "welcome", label: "Boas-Vindas de Grupos" },
        { key: "leave", label: "Saída de Grupos / Despedida" },
        { key: "dossie", label: "Dossiê & Perfil Completo (.dossie)" }
    ];

    return allCategories.map(cat => {
        const media = getMenuMedia(cat.key);
        let status = "📌 Padrão Oficial";
        if (media.type === "video") status = "🎬 Vídeo Animado (.mp4)";
        else if (media.type === "image") status = "🖼️ Foto Estática (.jpg)";
        return { ...cat, status, type: media.type };
    });
}

module.exports = {
    WALLPAPERS_DIR,
    CATEGORY_MAP,
    normalizeCategory,
    getMenuMedia,
    getWallpaperBuffer,
    saveWallpaper,
    saveMenuVideo,
    resetMenuMedia,
    getAllMenuMediaStatus
};
