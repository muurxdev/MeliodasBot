const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const WALLPAPERS_DIR = path.resolve(__dirname, "../assets/wallpapers");

function runCommand(cmd, args) {
    return new Promise((resolve, reject) => {
        const proc = spawn(cmd, args);
        let stderr = "";
        proc.stderr.on("data", d => { stderr += d.toString(); });
        proc.on("close", code => {
            if (code === 0) resolve();
            else reject(new Error(`Exit ${code}: ${stderr.slice(-300)}`));
        });
        proc.on("error", reject);
    });
}

async function cleanAndEnhance() {
    console.log("🎨 Iniciando limpeza e aprimoramento em ultra qualidade dos vídeos de Nanatsu no Taizai...");
    const files = fs.readdirSync(WALLPAPERS_DIR).filter(f => f.endsWith(".mp4"));

    for (const file of files) {
        const inputPath = path.join(WALLPAPERS_DIR, file);
        const tempClean = path.join(WALLPAPERS_DIR, `enhanced_${file}`);
        const imagePath = path.join(WALLPAPERS_DIR, file.replace(/\.mp4$/i, ".jpg"));

        console.log(`\n💎 Aprimorando: [${file}]...`);
        try {
            // Filtro FFmpeg:
            // 1. crop=in_w-4:in_h-26:2:0 -> remove marcas d'água/tags na base e bordas
            // 2. eq=contrast=1.15:brightness=0.02:saturation=1.25 -> cores vivas e vibrantes do anime
            // 3. unsharp=5:5:1.1:5:5:0.0 -> nitidez cristalina
            // 4. scale=trunc(iw/2)*2:trunc(ih/2)*2,format=yuv420p
            // 5. libx264 crf 16 (qualidade visual praticamente sem perdas)
            await runCommand("ffmpeg", [
                "-y",
                "-i", inputPath,
                "-vf", "crop=in_w-4:in_h-24:2:0,unsharp=5:5:1.0:5:5:0.0,eq=contrast=1.12:brightness=0.02:saturation=1.22,scale=trunc(iw/2)*2:trunc(ih/2)*2,format=yuv420p",
                "-c:v", "libx264",
                "-crf", "16",
                "-preset", "slow",
                "-movflags", "+faststart",
                tempClean
            ]);

            if (fs.existsSync(tempClean) && fs.statSync(tempClean).size > 0) {
                fs.renameSync(tempClean, inputPath);
                console.log(`✅ [${file}] aprimorado e limpo com sucesso!`);

                // Regenera capa estática nítida
                await runCommand("ffmpeg", [
                    "-y",
                    "-i", inputPath,
                    "-ss", "00:00:01",
                    "-vframes", "1",
                    "-q:v", "1",
                    imagePath
                ]);
                console.log(`🖼️ Capa estática [${path.basename(imagePath)}] regenerada em alta definição.`);
            }
        } catch (err) {
            console.error(`❌ Erro ao aprimorar ${file}:`, err.message);
            if (fs.existsSync(tempClean)) fs.unlinkSync(tempClean);
        }
    }

    console.log("\n🎉 Todos os wallpapers animados foram limpos e aprimorados com sucesso!");
}

cleanAndEnhance();
