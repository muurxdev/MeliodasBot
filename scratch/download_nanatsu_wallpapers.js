const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");
const { spawn } = require("child_process");

const WALLPAPERS_DIR = path.resolve(__dirname, "../../assets/wallpapers");

const CATEGORIES_SEARCH = [
    { category: "main", term: "meliodas-full-counter", fallbackTerm: "meliodas" },
    { category: "rpg", term: "meliodas-assault-mode", fallbackTerm: "escanor-the-one" },
    { category: "media", term: "meliodas-and-ban", fallbackTerm: "ban-and-meliodas" },
    { category: "arquivos", term: "merlin-seven-deadly-sins", fallbackTerm: "merlin-nanatsu-no-taizai" },
    { category: "economy", term: "ban-seven-deadly-sins", fallbackTerm: "ban-fox-sin" },
    { category: "calc", term: "gowther-seven-deadly-sins", fallbackTerm: "gowther" },
    { category: "interacao", term: "meliodas-elizabeth", fallbackTerm: "meliodas-and-elizabeth" },
    { category: "pesquisa", term: "merlin-nanatsu-no-taizai", fallbackTerm: "merlin-seven-deadly-sins" },
    { category: "fun", term: "meliodas-hawk", fallbackTerm: "hawk-nanatsu-no-taizai" },
    { category: "dev", term: "merlin-magic", fallbackTerm: "merlin-seven-deadly-sins" },
    { category: "rede", term: "gilthunder-nanatsu-no-taizai", fallbackTerm: "gilthunder" },
    { category: "config", term: "zeldris-seven-deadly-sins", fallbackTerm: "zeldris" },
    { category: "admin", term: "meliodas-demon-mark", fallbackTerm: "meliodas-wrath" },
    { category: "aluguel", term: "ban-snatch", fallbackTerm: "ban-seven-deadly-sins" },
    { category: "owner", term: "demon-king-meliodas", fallbackTerm: "meliodas-demon" },
    { category: "welcome", term: "meliodas-smile", fallbackTerm: "meliodas-happy" },
    { category: "leave", term: "meliodas-sad", fallbackTerm: "meliodas-sunset" },
    { category: "dossie", term: "meliodas-dragon-sin", fallbackTerm: "meliodas-eyes" }
];

async function searchTenorMp4(term) {
    try {
        const querySlug = term.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-gifs";
        const url = `https://tenor.com/search/${querySlug}`;
        const res = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
            }
        });
        const html = await res.text();
        const mp4Matches = html.match(/https:\/\/media[0-9]*\.tenor\.com\/[a-zA-Z0-9_\-\/]+\.mp4/g) || [];
        return Array.from(new Set(mp4Matches));
    } catch (e) {
        return [];
    }
}

function downloadFile(fileUrl, destPath) {
    return new Promise((resolve, reject) => {
        const u = new URL(fileUrl);
        const client = u.protocol === "https:" ? https : http;
        const fileStream = fs.createWriteStream(destPath);

        const req = client.get(fileUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
            }
        }, res => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                fileStream.close();
                if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
                return resolve(downloadFile(res.headers.location, destPath));
            }
            if (res.statusCode !== 200) {
                fileStream.close();
                if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
                return reject(new Error("HTTP " + res.statusCode));
            }
            res.pipe(fileStream);
            fileStream.on("finish", () => {
                fileStream.close();
                resolve(destPath);
            });
        });
        req.on("error", err => {
            fileStream.close();
            if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
            reject(err);
        });
    });
}

async function extractCoverFromVideo(videoPath, imagePath) {
    return new Promise((resolve) => {
        const ff = spawn("ffmpeg", [
            "-y",
            "-i", videoPath,
            "-ss", "00:00:01",
            "-vframes", "1",
            "-q:v", "2",
            imagePath
        ]);
        ff.on("close", () => resolve());
        ff.on("error", () => resolve());
    });
}

async function main() {
    console.log("🎬 Iniciando download dos vídeos interativos de Nanatsu no Taizai...");
    if (!fs.existsSync(WALLPAPERS_DIR)) {
        fs.mkdirSync(WALLPAPERS_DIR, { recursive: true });
    }

    for (const item of CATEGORIES_SEARCH) {
        console.log(`\n⏳ Buscando vídeo para categoria: [${item.category}] (Termo: ${item.term})...`);
        let mp4s = await searchTenorMp4(item.term);
        if (!mp4s || mp4s.length === 0) {
            console.log(`⚠️ Termo principal não retornou vídeos. Tentando fallback: ${item.fallbackTerm}...`);
            mp4s = await searchTenorMp4(item.fallbackTerm);
        }

        if (mp4s && mp4s.length > 0) {
            const selectedMp4 = mp4s[0];
            const destVideoPath = path.join(WALLPAPERS_DIR, `${item.category}.mp4`);
            const destImagePath = path.join(WALLPAPERS_DIR, `${item.category}.jpg`);

            try {
                await downloadFile(selectedMp4, destVideoPath);
                const stat = fs.statSync(destVideoPath);
                console.log(`✅ [${item.category}.mp4] baixado com sucesso! (${(stat.size / 1024).toFixed(1)} KB) -> ${selectedMp4}`);

                await extractCoverFromVideo(destVideoPath, destImagePath);
                if (fs.existsSync(destImagePath)) {
                    console.log(`🖼️ Capa estática [${item.category}.jpg] gerada.`);
                }
            } catch (err) {
                console.error(`❌ Erro ao baixar para ${item.category}:`, err.message);
            }
        } else {
            console.log(`❌ Nenhum vídeo encontrado para ${item.category}.`);
        }
    }

    // Copia main.mp4 para menu.mp4 se não existir
    const mainMp4 = path.join(WALLPAPERS_DIR, "main.mp4");
    const menuMp4 = path.join(WALLPAPERS_DIR, "menu.mp4");
    if (fs.existsSync(mainMp4) && !fs.existsSync(menuMp4)) {
        fs.copyFileSync(mainMp4, menuMp4);
    }

    console.log("\n🎉 Processo de download de vídeos interativos concluído!");
}

main();

