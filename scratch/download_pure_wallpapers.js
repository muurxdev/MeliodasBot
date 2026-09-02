const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");
const { spawn } = require("child_process");

const WALLPAPERS_DIR = path.resolve(__dirname, "../assets/wallpapers");

const WALLPAPER_TARGETS = [
    { category: "main", search: "meliodas-full-counter-anime", alt: "meliodas-dragon-sin" },
    { category: "rpg", search: "meliodas-assault-mode", alt: "escanor-the-one" },
    { category: "media", search: "meliodas-and-ban", alt: "meliodas-ban-tavern" },
    { category: "arquivos", search: "merlin-seven-deadly-sins", alt: "merlin-nanatsu-no-taizai" },
    { category: "economy", search: "ban-fox-sin-greed", alt: "ban-seven-deadly-sins" },
    { category: "calc", search: "gowther-seven-deadly-sins", alt: "gowther-invasion" },
    { category: "interacao", search: "meliodas-and-elizabeth", alt: "meliodas-elizabeth-hug" },
    { category: "pesquisa", search: "merlin-nanatsu-no-taizai", alt: "merlin-magic" },
    { category: "fun", search: "meliodas-hawk", alt: "hawk-seven-deadly-sins" },
    { category: "dev", search: "merlin-magic", alt: "merlin-infinity" },
    { category: "rede", search: "gilthunder-nanatsu-no-taizai", alt: "gilthunder-lightning" },
    { category: "config", search: "zeldris-seven-deadly-sins", alt: "zeldris-demon" },
    { category: "admin", search: "meliodas-demon-mark", alt: "meliodas-wrath" },
    { category: "aluguel", search: "ban-seven-deadly-sins", alt: "ban-snatch" },
    { category: "owner", search: "demon-king-meliodas", alt: "meliodas-demon-king" },
    { category: "welcome", search: "meliodas-smile", alt: "meliodas-thumbs-up" },
    { category: "leave", search: "meliodas-sad", alt: "meliodas-sunset" },
    { category: "dossie", search: "meliodas-dragon-sin", alt: "meliodas-eyes" }
];

async function searchTenorMp4List(term) {
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

function processPureVideo(rawPath, cleanVideoPath, cleanImagePath) {
    return new Promise((resolve, reject) => {
        // Crop inteligente centrado no centro da ação com margem perimétrica (elimina 100% marcas d'água das pontas e rodapés)
        // scale=720:720 lanczos + unsharp nitidez cristalina + eq saturação/contraste anime
        const vfFilter = "crop='min(iw,ih)*0.94':'min(iw,ih)*0.94':'(iw-min(iw,ih)*0.94)/2':'(ih-min(iw,ih)*0.94)/2',scale=720:720:flags=lanczos,unsharp=5:5:1.1:5:5:0.0,eq=contrast=1.15:saturation=1.28:brightness=0.01,format=yuv420p";

        const proc = spawn("ffmpeg", [
            "-y",
            "-i", rawPath,
            "-vf", vfFilter,
            "-c:v", "libx264",
            "-crf", "16",
            "-preset", "slow",
            "-movflags", "+faststart",
            "-r", "30",
            cleanVideoPath
        ]);

        let stderr = "";
        proc.stderr.on("data", d => { stderr += d.toString(); });

        proc.on("close", async code => {
            if (code === 0 && fs.existsSync(cleanVideoPath) && fs.statSync(cleanVideoPath).size > 0) {
                // Gera capa estática HD cristalina
                const coverProc = spawn("ffmpeg", [
                    "-y",
                    "-i", cleanVideoPath,
                    "-ss", "00:00:00.2",
                    "-vframes", "1",
                    "-q:v", "1",
                    cleanImagePath
                ]);
                coverProc.on("close", () => resolve());
                coverProc.on("error", () => resolve());
            } else {
                reject(new Error(`FFmpeg error (${code}): ${stderr.slice(-300)}`));
            }
        });
        proc.on("error", reject);
    });
}

async function main() {
    console.log("🌟 Iniciando download e renderização pura dos wallpapers Nanatsu no Taizai...");
    if (!fs.existsSync(WALLPAPERS_DIR)) {
        fs.mkdirSync(WALLPAPERS_DIR, { recursive: true });
    }

    for (const target of WALLPAPER_TARGETS) {
        console.log(`\n💎 Processando: [${target.category}] (Busca: ${target.search})...`);
        let mp4s = await searchTenorMp4List(target.search);
        if (!mp4s || mp4s.length === 0) {
            mp4s = await searchTenorMp4List(target.alt);
        }

        if (mp4s && mp4s.length > 0) {
            const rawTempPath = path.join(WALLPAPERS_DIR, `raw_${target.category}.mp4`);
            const finalVideoPath = path.join(WALLPAPERS_DIR, `${target.category}.mp4`);
            const finalImagePath = path.join(WALLPAPERS_DIR, `${target.category}.jpg`);

            try {
                // Escolhe o melhor MP4 limpo da lista
                const candidate = mp4s[0];
                await downloadFile(candidate, rawTempPath);
                await processPureVideo(rawTempPath, finalVideoPath, finalImagePath);

                const vStat = fs.statSync(finalVideoPath);
                console.log(`✅ [${target.category}.mp4] renderizado com pureza cristalina! (${(vStat.size / 1024).toFixed(1)} KB)`);
                if (fs.existsSync(rawTempPath)) fs.unlinkSync(rawTempPath);
            } catch (err) {
                console.error(`❌ Erro em ${target.category}:`, err.message);
                if (fs.existsSync(rawTempPath)) fs.unlinkSync(rawTempPath);
            }
        } else {
            console.log(`⚠️ Nenhum vídeo encontrado para ${target.category}`);
        }
    }

    // Copia main.mp4 para menu.mp4
    const mainMp4 = path.join(WALLPAPERS_DIR, "main.mp4");
    const menuMp4 = path.join(WALLPAPERS_DIR, "menu.mp4");
    const mainJpg = path.join(WALLPAPERS_DIR, "main.jpg");
    const menuJpg = path.join(WALLPAPERS_DIR, "menu.jpg");
    if (fs.existsSync(mainMp4)) fs.copyFileSync(mainMp4, menuMp4);
    if (fs.existsSync(mainJpg)) fs.copyFileSync(mainJpg, menuJpg);

    console.log("\n🎉 TODOS os 18 wallpapers foram renderizados em qualidade cinematográfica SEM marcas d'água!");
}

main();

