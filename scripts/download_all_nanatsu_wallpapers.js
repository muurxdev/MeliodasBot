/**
 * Download & Optimization Engine para Wallpapers de Menus do MeliodasBOT
 * Baixa imagens de altíssima resolução temáticas de Nanatsu no Taizai
 * para cada menu e submenu e processa com sharp em qualidade Full HD / 2K.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const sharp = require('sharp');

const WALLPAPERS_DIR = path.resolve(__dirname, '../assets/wallpapers');

// Catálogo com as melhores artes temáticas de Nanatsu no Taizai (Pinterest / Wallhaven / Grand Cross)
const MENU_THEMES = [
    {
        key: 'main',
        aliases: ['menu'],
        name: 'Menu Principal',
        character: 'Meliodas - Capitão dos Sete Pecados Capitais & Lostvayne',
        urls: [
            'https://w.wallhaven.cc/full/m9/wallhaven-m9pz8k.png',
            'https://i.pinimg.com/originals/5a/57/5a/5a575aaa0a7487665cab0f4def24f73f.jpg'
        ]
    },
    {
        key: 'rpg',
        aliases: [],
        name: 'Menu RPG & Britânia',
        character: 'Sete Pecados Capitais Reunidos em Batalha',
        urls: [
            'https://w.wallhaven.cc/full/j3/wallhaven-j3551w.png',
            'https://files.yande.re/image/227fcf4b657faaa72f54f339db89bbf9/yande.re%201260020%20elizabeth_liones%20hawk_%28nanatsu_no_taizai%29%20landscape%20meliodas_%28nanatsu_no_taizai%29%20nanatsu_no_taizai%20netmarble_games%20skirt_lift%20sword%20tagme%20thighhighs.png'
        ]
    },
    {
        key: 'boss',
        aliases: [],
        name: 'Batalhas de Chefes & Raids',
        character: 'Meliodas Assault Mode (Modo Assalto Demônio)',
        urls: [
            'https://w.wallhaven.cc/full/wy/wallhaven-wyry56.jpg',
            'https://i.pinimg.com/originals/09/26/fa/0926fae33b664d60c2aa8db799a74932.jpg'
        ]
    },
    {
        key: 'coliseu',
        aliases: [],
        name: 'Coliseu de Vaizel & Arena',
        character: 'Festival de Luta de Vaizel (Meliodas vs Ban no Ringue)',
        urls: [
            'https://w.wallhaven.cc/full/28/wallhaven-28om6x.png',
            'https://i.pinimg.com/originals/51/87/42/518742781ffc7743d528b18a38520268.jpg'
        ]
    },
    {
        key: 'dungeon',
        aliases: [],
        name: 'Masmorras & Dungeons',
        character: 'Purgatório Obscuro & Caverna dos Druidas',
        urls: [
            'https://w.wallhaven.cc/full/pk/wallhaven-pk2lre.jpg',
            'https://w.wallhaven.cc/full/8o/wallhaven-8oxe22.jpg'
        ]
    },
    {
        key: 'economy',
        aliases: ['economia'],
        name: 'Menu Economia & Finanças',
        character: 'Taberna Chapéu de Javali (Boar Hat) & Cerveja de Bernia',
        urls: [
            'https://w.wallhaven.cc/full/g8/wallhaven-g83gve.png',
            'https://i.pinimg.com/originals/ec/b2/8d/ecb28da35ca16ce59ec47184ec6d6d7e.jpg'
        ]
    },
    {
        key: 'cassino',
        aliases: [],
        name: 'Cassino Royale & Apostas',
        character: 'Ban o Pecado da Ganância da Raposa Apostando',
        urls: [
            'https://w.wallhaven.cc/full/y8/wallhaven-y81y57.jpg',
            'https://i.pinimg.com/originals/2e/b0/90/2eb09035058faeb3fee935dd44272692.jpg'
        ]
    },
    {
        key: 'banco',
        aliases: [],
        name: 'Banco Central & Pix',
        character: 'Castelo Real de Liones & Tesouro da Coroa',
        urls: [
            'https://w.wallhaven.cc/full/e7/wallhaven-e7o3dk.jpg',
            'https://w.wallhaven.cc/full/39/wallhaven-39ej16.png'
        ]
    },
    {
        key: 'media',
        aliases: ['downloads'],
        name: 'Downloads & Mídias',
        character: 'Hawk o Mestre Capitão das Sobras Comendo',
        urls: [
            'https://w.wallhaven.cc/full/2e/wallhaven-2ew5og.jpg',
            'https://i.pinimg.com/originals/3f/82/38/3f8238626c927fecfefd8e7887349dd1.jpg'
        ]
    },
    {
        key: 'figurinhas',
        aliases: [],
        name: 'Figurinhas & Stickers',
        character: 'Gowther o Pecado da Luxúria em Pose Estilosa',
        urls: [
            'https://w.wallhaven.cc/full/x8/wallhaven-x81zxv.jpg',
            'https://i.pinimg.com/originals/18/3a/ea/183aea46845348bb6571550c60965d64.jpg'
        ]
    },
    {
        key: 'jogos',
        aliases: [],
        name: 'Jogos & Quizzes',
        character: 'King Harlequin com a Lança Espiritual Chastiefol',
        urls: [
            'https://w.wallhaven.cc/full/dp/wallhaven-dpgdp3.jpg',
            'https://i.pinimg.com/originals/d5/3b/01/d53b014d86a6b6761bf649a0ed813c2b.png'
        ]
    },
    {
        key: 'fun',
        aliases: ['diversao'],
        name: 'Diversão & Memes',
        character: 'Meliodas, Hawk e Elizabeth em Cenas Cômicas',
        urls: [
            'https://w.wallhaven.cc/full/ox/wallhaven-oxk39p.jpg',
            'https://w.wallhaven.cc/full/m9/wallhaven-m9y278.jpg'
        ]
    },
    {
        key: 'interacao',
        aliases: [],
        name: 'Interação & Social',
        character: 'Romance de Meliodas & Elizabeth Liones',
        urls: [
            'https://w.wallhaven.cc/full/1p/wallhaven-1ppj9g.jpg',
            'https://w.wallhaven.cc/full/m9/wallhaven-m9pz8k.png'
        ]
    },
    {
        key: 'pesquisa',
        aliases: [],
        name: 'Pesquisa & Web',
        character: 'Merlin o Pecado da Gula com a Esfera Aldan',
        urls: [
            'https://w.wallhaven.cc/full/g7/wallhaven-g7jqpe.jpg',
            'https://i.pinimg.com/originals/66/1b/ae/661bae33e2150fe1f1585cbb1fe009ee.jpg'
        ]
    },
    {
        key: 'ia',
        aliases: [],
        name: 'Inteligência Artificial',
        character: 'Merlin no Laboratório de Magia Arcana Infinita',
        urls: [
            'https://w.wallhaven.cc/full/8o/wallhaven-8oxe22.jpg',
            'https://w.wallhaven.cc/full/g7/wallhaven-g7jqpe.jpg'
        ]
    },
    {
        key: 'arquivos',
        aliases: [],
        name: 'Arquivos & PDFs',
        character: 'Biblioteca Arcana de Liones & Pergaminhos Antigos',
        urls: [
            'https://w.wallhaven.cc/full/39/wallhaven-39ej16.png',
            'https://w.wallhaven.cc/full/e7/wallhaven-e7o3dk.jpg'
        ]
    },
    {
        key: 'livros',
        aliases: [],
        name: 'Biblioteca de Livros',
        character: 'Lord Escanor Lendo e Escrevendo Poemas',
        urls: [
            'https://w.wallhaven.cc/full/l3/wallhaven-l3l5zq.jpg',
            'https://w.wallhaven.cc/full/8o/wallhaven-8oxe22.jpg'
        ]
    },
    {
        key: 'calc',
        aliases: [],
        name: 'Calculadora & Matemática',
        character: 'Gowther Lendo Nível de Poder com Olho de Balor',
        urls: [
            'https://w.wallhaven.cc/full/j3/wallhaven-j381xp.png',
            'https://w.wallhaven.cc/full/x8/wallhaven-x81zxv.jpg'
        ]
    },
    {
        key: 'utilidades',
        aliases: [],
        name: 'Utilidades & Telefonia',
        character: 'Princesa Elizabeth Curando com Luz Sagrada (Ark)',
        urls: [
            'https://w.wallhaven.cc/full/y8/wallhaven-y8dkjx.jpg',
            'https://i.pinimg.com/originals/d0/0d/16/d00d16be9ebf074d284bc78ea38a6a16.jpg'
        ]
    },
    {
        key: 'general',
        aliases: [],
        name: 'Geral & Comandos Úteis',
        character: 'Banquete dos Sete Pecados na Boar Hat',
        urls: [
            'https://w.wallhaven.cc/full/x6/wallhaven-x651zd.jpg',
            'https://w.wallhaven.cc/full/m9/wallhaven-m9pz8k.png'
        ]
    },
    {
        key: 'dev',
        aliases: [],
        name: 'Dev Hub & Ferramentas',
        character: 'Merlin Conjurando Perfect Cube & Encantamentos',
        urls: [
            'https://w.wallhaven.cc/full/ey/wallhaven-eyp1wr.jpg',
            'https://w.wallhaven.cc/full/g7/wallhaven-g7jqpe.jpg'
        ]
    },
    {
        key: 'divulgacao',
        aliases: [],
        name: 'Central de Divulgação & Avisos',
        character: 'Cavaleiros Sagrados de Liones em Formação Real',
        urls: [
            'https://files.yande.re/image/c30d1e3ed989587e001d32e4bc029ec9/yande.re%20500755%20gilthunder_%28nanatsu_no_taizai%29%20griamore_%28nanatsu_no_taizai%29%20guila_%28nanatsu_no_taizai%29%20hauser_%28nanatsu_no_taizai%29%20helbram_%28nanatsu_no_taizai%29%20jericho_%28nanatsu_no_taizai%29%20nanatsu_no_taizai.jpg',
            'https://w.wallhaven.cc/full/e7/wallhaven-e7o3dk.jpg'
        ]
    },
    {
        key: 'rede',
        aliases: [],
        name: 'Rede & Telemetria',
        character: 'Gilthunder com o Poder do Imperador do Trovão',
        urls: [
            'https://w.wallhaven.cc/full/r2/wallhaven-r2wvow.jpg',
            'https://w.wallhaven.cc/full/pk/wallhaven-pk2lre.jpg'
        ]
    },
    {
        key: 'admin',
        aliases: ['moderacao'],
        name: 'Administração & Moderação',
        character: 'Zeldris da Piedade, o Carrasco Implacável',
        urls: [
            'https://w.wallhaven.cc/full/j3/wallhaven-j38w6q.jpg',
            'https://i.pinimg.com/originals/27/ef/5f/27ef5f6df4f2d3cfc799a77ee2d7fe13.jpg'
        ]
    },
    {
        key: 'config',
        aliases: ['mensagens-grupo'],
        name: 'Configurações do Grupo',
        character: 'Gowther Ajustando as Regras e Memórias de Britânia',
        urls: [
            'https://w.wallhaven.cc/full/p9/wallhaven-p9r2qe.jpg',
            'https://w.wallhaven.cc/full/x8/wallhaven-x81zxv.jpg'
        ]
    },
    {
        key: 'avisos',
        aliases: [],
        name: 'Avisos & Comunicados Oficiais',
        character: 'Chifre de Cernunnos & Mandamento Real',
        urls: [
            'https://w.wallhaven.cc/full/l3/wallhaven-l3qw8p.jpg',
            'https://w.wallhaven.cc/full/e7/wallhaven-e7o3dk.jpg'
        ]
    },
    {
        key: 'aluguel',
        aliases: [],
        name: 'Aluguel & Planos VIP',
        character: 'Meliodas Rei Demônio & Elizabeth Rainha Suprema',
        urls: [
            'https://w.wallhaven.cc/full/72/wallhaven-7269dv.jpg',
            'https://w.wallhaven.cc/full/1p/wallhaven-1ppj9g.jpg'
        ]
    },
    {
        key: 'owner',
        aliases: [],
        name: 'Painel Supremo do Dono',
        character: 'Lord Escanor The One (Poder Solar ao Meio-Dia)',
        urls: [
            'https://w.wallhaven.cc/full/l3/wallhaven-l3l5zq.jpg',
            'https://i.pinimg.com/originals/c8/17/cb/c817cb25e2439a3fcf442e9702213709.jpg'
        ]
    },
    {
        key: 'profile',
        aliases: ['perfil'],
        name: 'Perfil, XP & Rankings',
        character: 'Tatuagem do Dragão da Ira & Brasões dos Pecados',
        urls: [
            'https://w.wallhaven.cc/full/28/wallhaven-28evyy.png',
            'https://w.wallhaven.cc/full/m9/wallhaven-m9pz8k.png'
        ]
    },
    {
        key: 'dossie',
        aliases: [],
        name: 'Dossiê Militar Completo',
        character: 'Os Dez Mandamentos (Elite do Clã Demônio)',
        urls: [
            'https://files.yande.re/image/dbe4eeaecb8847abf469e34620a03266/yande.re%20427383%20cleavage%20derrierie_%28nanatsu_no_taizai%29%20drole_%28nanatsu_no_taizai%29%20estarossa_%28nanatsu_no_taizai%29%20fraudrin_%28nanatsu_no_taizai%29%20gloxinia_%28nanatsu_no_taizai%29%20grayroad_%28nanatsu_no_taizai%29%20melascula_%28nanatsu_no_taizai%29%20monspeet_%28nanatsu_no_taizai%29%20nanatsu_no_taizai%29%20zeldris_%28nanatsu_no_taizai%29.jpg',
            'https://i.pinimg.com/originals/0f/55/7e/0f557e0e7a17721868352b575796df25.jpg'
        ]
    },
    {
        key: 'levelup',
        aliases: [],
        name: 'Level Up & Rebirth',
        character: 'Meliodas Despertando Asas de Matéria Escura',
        urls: [
            'https://w.wallhaven.cc/full/wy/wallhaven-wyry56.jpg',
            'https://w.wallhaven.cc/full/pk/wallhaven-pk2lre.jpg'
        ]
    },
    {
        key: 'welcome',
        aliases: [],
        name: 'Card de Boas-Vindas',
        character: 'Taberna Boar Hat com a Mama Hawk Verde Gigante',
        urls: [
            'https://w.wallhaven.cc/full/2e/wallhaven-2ew5og.jpg',
            'https://w.wallhaven.cc/full/g8/wallhaven-g83gve.png'
        ]
    },
    {
        key: 'leave',
        aliases: [],
        name: 'Card de Saída/Despedida',
        character: 'Meliodas Partindo ao Entardecer na Névoa',
        urls: [
            'https://w.wallhaven.cc/full/8o/wallhaven-8oxe22.jpg',
            'https://w.wallhaven.cc/full/ox/wallhaven-oxk39p.jpg'
        ]
    },
    {
        key: 'help',
        aliases: [],
        name: 'Central de Ajuda & Guia',
        character: 'Diane a Gigante Gentil com o Martelo Gideon',
        urls: [
            'https://w.wallhaven.cc/full/q2/wallhaven-q23kkq.jpg',
            'https://i.pinimg.com/originals/8a/be/8a/8abe8af15ce402d7eb433555ae245df6.jpg'
        ]
    },
    {
        key: 'adicional',
        aliases: [],
        name: 'Adicionais & Especiais',
        character: 'Arthur Pendragon Rei do Caos & Espada Sagrada Excalibur',
        urls: [
            'https://w.wallhaven.cc/full/e7/wallhaven-e7o3dk.jpg',
            'https://i.pinimg.com/originals/2a/3b/b7/2a3bb74f8c4ea7462002166e4a298be5.jpg'
        ]
    }
];

function downloadBuffer(url) {
    return new Promise((resolve, reject) => {
        const u = new URL(url);
        const options = {
            hostname: u.hostname,
            port: u.port || (u.protocol === 'https:' ? 443 : 80),
            path: u.pathname + u.search,
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
                'Referer': 'https://www.pinterest.com/'
            }
        };
        const client = u.protocol === 'https:' ? https : http;
        const req = client.request(options, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                let loc = res.headers.location;
                if (!loc.startsWith('http')) loc = new URL(loc, url).href;
                return downloadBuffer(loc).then(resolve).catch(reject);
            }
            if (res.statusCode !== 200) {
                return reject(new Error(`HTTP ${res.statusCode} ao baixar ${url}`));
            }
            const chunks = [];
            res.on('data', chunk => chunks.push(chunk));
            res.on('end', () => resolve(Buffer.concat(chunks)));
        });
        req.on('error', reject);
        req.setTimeout(20000, () => {
            req.destroy(new Error('Timeout de 20s excedido'));
        });
        req.end();
    });
}

async function processAndSaveImage(inputBuffer, targetPath) {
    // Redimensiona proporcionalmente para manter resolução Full HD / 2K nítida e ampla em tela cheia no WhatsApp
    const processedBuffer = await sharp(inputBuffer)
        .resize({
            width: 2048,
            height: 2048,
            fit: 'inside',
            withoutEnlargement: true
        })
        .jpeg({
            quality: 92,
            chromaSubsampling: '4:4:4',
            mozjpeg: true
        })
        .toBuffer();

    fs.writeFileSync(targetPath, processedBuffer);
    const meta = await sharp(processedBuffer).metadata();
    return {
        sizeBytes: processedBuffer.length,
        width: meta.width,
        height: meta.height
    };
}

async function run() {
    console.log(`🚀 Iniciando download e aplicação das artes oficiais de Nanatsu no Taizai para ${MENU_THEMES.length} menus...\n`);

    if (!fs.existsSync(WALLPAPERS_DIR)) {
        fs.mkdirSync(WALLPAPERS_DIR, { recursive: true });
    }

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < MENU_THEMES.length; i++) {
        const item = MENU_THEMES[i];
        console.log(`[${i + 1}/${MENU_THEMES.length}] Processando: ${item.key.toUpperCase()} — ${item.name} (${item.character})...`);

        let buffer = null;
        let usedUrl = '';

        for (const candidateUrl of item.urls) {
            try {
                buffer = await downloadBuffer(candidateUrl);
                if (buffer && buffer.length > 30000) {
                    usedUrl = candidateUrl;
                    break;
                }
            } catch (err) {
                // Tenta próxima URL
            }
        }

        if (!buffer) {
            console.error(`  ❌ Falha ao baixar arte para ${item.key} de todas as fontes candidatas.`);
            failCount++;
            continue;
        }

        try {
            const mainPath = path.join(WALLPAPERS_DIR, `${item.key}.jpg`);
            const info = await processAndSaveImage(buffer, mainPath);
            console.log(`  ✅ Salvo: ${item.key}.jpg | ${info.width}x${info.height} | ${(info.sizeBytes / 1024).toFixed(1)} KB`);

            // Se existir subpasta correspondente, atualiza 1.jpg
            const subDir = path.join(WALLPAPERS_DIR, item.key);
            if (fs.existsSync(subDir) && fs.statSync(subDir).isDirectory()) {
                const subPath = path.join(subDir, '1.jpg');
                fs.copyFileSync(mainPath, subPath);
                console.log(`     ↳ Subdiretório atualizado: ${item.key}/1.jpg`);
            }

            // Salva aliases (ex: economia.jpg, downloads.jpg, diversao.jpg, etc.)
            if (Array.isArray(item.aliases)) {
                for (const alias of item.aliases) {
                    const aliasPath = path.join(WALLPAPERS_DIR, `${alias}.jpg`);
                    fs.copyFileSync(mainPath, aliasPath);
                    console.log(`     ↳ Alias salvo: ${alias}.jpg`);
                }
            }

            successCount++;
        } catch (procErr) {
            console.error(`  ❌ Erro ao processar com sharp para ${item.key}:`, procErr.message);
            failCount++;
        }
    }

    console.log(`\n==================================================`);
    console.log(`🎉 Concluído: ${successCount} menus atualizados com sucesso! (Falhas: ${failCount})`);
    console.log(`==================================================\n`);
}

run().catch(err => {
    console.error('Erro fatal no script:', err);
    process.exit(1);
});
