/**
 * Comando .setwallpaper / .setvideo / .personalizacao
 * Permite aos Donos e Administradores personalizar TODOS os menus com Vídeos Animados (.mp4) ou Imagens Estáticas (.jpg)
 */

const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const { saveWallpaper, saveMenuVideo, resetMenuMedia, getAllMenuMediaStatus, getMenuMedia, normalizeCategory } = require("../../utils/wallpapers");
const { renderCard } = require("../../utils/uiEngine");
const { getBotName } = require("../../config/botConfig");
const axios = require("axios");
const logger = require("../../core/logger");

module.exports = {
    name: "setwallpaper",
    aliases: ["setvideo", "wallpaper", "mudarwallpaper", "definirwallpaper", "personalizacao", "setmedia", "menumedia", "wallpapers"],
    category: "owner",
    subcategory: "Personalização",
    description: "Define vídeos animados ou fotos estáticas personalizadas para TODOS os menus do bot",
    ownerOnly: true,
    cooldownMs: 2000,
    execute: async ({ text, info, type, reply, args, isOwner, userRole, commandName, client, from, sender }) => {
        const isUserOwner = isOwner || (userRole && userRole.level >= 4);
        if (!isUserOwner) {
            return reply("❌ *Acesso Negado:* Este comando é exclusivo para os Donos e Administradores Globais do bot.");
        }

        const botName = getBotName();
        const quoted = info?.message?.extendedTextMessage?.contextInfo?.quotedMessage;

        const isDirectImage = type === "imageMessage";
        const isDirectVideo = type === "videoMessage";
        const isQuotedImage = Boolean(quoted?.imageMessage);
        const isQuotedVideo = Boolean(quoted?.videoMessage);

        const sub = (args[0] || "").toLowerCase().trim();

        // 1. CONFIGURAÇÃO DE MODO DE EXIBIÇÃO (.setwallpaper modo <video|imagem|gif>)
        if (sub === "modo" || sub === "formato" || sub === "mode" || sub === "qualidade") {
            const { getWallpaperMode, setWallpaperMode } = require("../../utils/wallpapers");
            const currentMode = getWallpaperMode(from);
            const targetMode = (args[1] || "").toLowerCase().trim();

            if (!targetMode) {
                const modoDoc = renderCard({
                    title: "MODO DE EXIBIÇÃO DOS WALLPAPERS",
                    icon: "🎛️",
                    subtitle: `⚙️ *Configuração de Qualidade e Formato de Entrega nos Menus*`,
                    sections: [
                        {
                            title: "MODO ATUAL",
                            icon: "📌",
                            fields: [
                                `• *Modo Selecionado:* \`${currentMode.toUpperCase()}\``,
                                currentMode === "imagem"
                                    ? "🖼️ *Banner Estático Full HD (1080p):* Exibição instantânea no chat com máxima nitidez e sem buffering."
                                    : (currentMode === "gif"
                                        ? "🔁 *Loop GIF Automático:* Animação contínua no chat (o WhatsApp pode comprimir a resolução)."
                                        : "🎬 *Vídeo MP4 Nativo Full HD (1080p):* Alta fidelidade com 60fps/30fps e bitrate original sem compressão GIF do WhatsApp.")
                            ]
                        },
                        {
                            title: "COMO ALTERAR O MODO",
                            icon: "🔧",
                            fields: [
                                "• `.setwallpaper modo video` ➔ Vídeo MP4 Nativo 1080p (Qualidade Máxima de Vídeo)",
                                "• `.setwallpaper modo imagem` ➔ Banner Estático 1080p (Rápido, Nítido e Leve)",
                                "• `.setwallpaper modo gif` ➔ Live Wallpaper em Loop Contínuo"
                            ]
                        }
                    ],
                    tip: "Todos os 34 menus do bot contam com versões 1080p Full HD tanto em vídeo quanto em imagem!",
                    mentions: [sender]
                });
                return reply(modoDoc, [sender]);
            }

            const updated = setWallpaperMode(targetMode, "global");
            if (!updated) {
                return reply("❌ *Modo inválido!* Use: `.setwallpaper modo video`, `.setwallpaper modo imagem` ou `.setwallpaper modo gif`.");
            }

            const labelMap = {
                video: "🎬 *VÍDEO NATIVO FULL HD 1080P* (Vídeo MP4 em altíssima resolução sem compressão GIF)",
                imagem: "🖼️ *BANNER ESTÁTICO FULL HD 1080P* (Foto/Banner nítido e instantâneo no topo do menu)",
                gif: "🔁 *LIVE WALLPAPER EM LOOP (GIF)* (Reprodução automática contínua em loop)"
            };

            return reply(`✅ *Modo de wallpaper atualizado com sucesso!*\n\n⚙️ *Novo Modo Global:* ${labelMap[updated] || updated}\n💡 _Digite \`.menu\` para conferir nos seus menus!_`);
        }

        // 2. PREVIEW DE MÍDIA (.setwallpaper preview <categoria> [modo])
        if (sub === "preview" || sub === "ver" || sub === "teste") {
            const targetCat = args[1] || "main";
            const forceMode = args[2] ? args[2].toLowerCase().trim() : null;
            const { getMenuMedia, sendMenuMediaMessage, getWallpaperMode } = require("../../utils/wallpapers");
            const effectiveMode = forceMode || getWallpaperMode(from);
            const media = getMenuMedia(targetCat, effectiveMode === "imagem" ? "image" : "video");

            if (!media || !media.buffer) {
                return reply(`❌ Nenhuma mídia encontrada para a categoria *"${targetCat}"*.`);
            }

            const caption = renderCard({
                title: `PRÉVIA DO WALLPAPER: ${targetCat.toUpperCase()}`,
                icon: "🎬",
                subtitle: `🎨 *Formato:* ${media.type === "video" ? (effectiveMode === "gif" ? "Loop GIF" : "Vídeo Nativo Full HD 1080p") : "Imagem Estática Full HD 1080p"}`,
                sections: [
                    {
                        title: "DETALHES DO ASSET",
                        icon: "📜",
                        fields: [
                            { label: "Categoria", value: targetCat.toUpperCase(), icon: "📂" },
                            { label: "Tamanho", value: `${(media.buffer.length / 1024 / 1024).toFixed(2)} MB`, icon: "💾" },
                            { label: "Resolução", value: "1920x1080 Full HD", icon: "📐" },
                            { label: "Mimetype", value: media.mimetype, icon: "🎞️" }
                        ]
                    }
                ],
                tip: "Alterne o formato com .setwallpaper modo <video|imagem|gif>",
                mentions: [sender]
            });

            try {
                return await sendMenuMediaMessage(client, from, {
                    category: targetCat,
                    text: caption,
                    quoted: info,
                    mentions: [sender],
                    mode: effectiveMode
                });
            } catch (err) {
                return reply(`❌ Erro ao enviar prévia: ${err.message}`);
            }
        }

        // 3. LISTAGEM & GUIA GERAL DE PERSONALIZAÇÃO DE TODOS OS MENUS
        if (!isDirectImage && !isDirectVideo && !isQuotedImage && !isQuotedVideo && (!sub || sub === "list" || sub === "listar" || sub === "help" || sub === "status")) {
            const { getWallpaperMode } = require("../../utils/wallpapers");
            const currentMode = getWallpaperMode(from);
            const list = getAllMenuMediaStatus();
            let wpFields = [];

            list.forEach(m => {
                wpFields.push(`• *${m.label}:* ${m.status}`);
            });

            const doc = renderCard({
                title: "CENTRAL DE WALLPAPERS & VÍDEOS 1080P",
                icon: "🎬",
                subtitle: `🎨 *Gerencie os Live Wallpapers e Banners 1080p do ${botName}*`,
                sections: [
                    {
                        title: "CONFIGURAÇÃO GLOBAL ATUAL",
                        icon: "⚙️",
                        fields: [
                            `• *Modo de Entrega:* \`${currentMode.toUpperCase()}\` (${currentMode === "imagem" ? "Banner Estático Full HD" : (currentMode === "gif" ? "Loop GIF" : "Vídeo Nativo Full HD 1080p")})`,
                            "• *Resolução Base de Todos os Menus:* `1920x1080 Full HD` (Alta Definição)"
                        ]
                    },
                    {
                        title: "STATUS DOS 34 MENUS E HUBS",
                        icon: "📊",
                        fields: wpFields
                    },
                    {
                        title: "COMANDOS DE GERENCIAMENTO",
                        icon: "🛠️",
                        fields: [
                            "• `.setwallpaper modo <video|imagem|gif>` ➔ Altera o formato de exibição",
                            "• `.setwallpaper preview <cat>` ➔ Envia prévia do menu especificado",
                            "• `.setwallpaper <cat>` ➔ Define novo vídeo ou foto enviada/marcada",
                            "• `.setwallpaper reset <cat|all>` ➔ Restaura para o padrão do anime"
                        ]
                    },
                    {
                        title: "CATEGORIAS DISPONÍVEIS (34 MENUS & TELAS)",
                        icon: "📂",
                        fields: [
                            "⚔️ *RPG:* `rpg`, `boss`, `coliseu`, `dungeon`, `levelup`",
                            "💰 *Economia:* `economy`, `cassino`, `banco`",
                            "📥 *Mídias:* `media`, `figurinhas`, `arquivos`, `livros`",
                            "🎮 *Lazer:* `jogos`, `fun`, `interacao`",
                            "🧠 *Info & IA:* `pesquisa`, `ia`, `calc`, `utilidades`, `general`",
                            "💻 *Sistemas:* `dev`, `skycode`, `rede`",
                            "🛡️ *Gestão:* `admin`, `config`, `avisos`, `aluguel`, `owner`",
                            "👤 *Social & Eventos:* `main`, `profile`, `dossie`, `welcome`, `leave`, `help`"
                        ]
                    }
                ],
                tip: "Use .setwallpaper modo imagem para banners ultra-rápidos ou .setwallpaper modo video para vídeos nativos 1080p!",
                mentions: [sender]
            });

            return reply(doc, [sender]);
        }

        // 3. RESET DE MÍDIA (.setwallpaper reset <categoria>)
        if (sub === "reset" || sub === "padrao" || sub === "restaurar") {
            const targetCat = args[1] || "main";
            if (targetCat === "all" || targetCat === "todos") {
                const list = getAllMenuMediaStatus();
                list.forEach(m => resetMenuMedia(m.key));
                return reply("🔄 *TODOS os menus foram restaurados para os papéis de parede oficiais padrão de Nanatsu no Taizai!*");
            }

            resetMenuMedia(targetCat);
            return reply(`🔄 *Live Wallpaper do menu [${targetCat.toUpperCase()}] restaurado para o padrão oficial do anime!*`);
        }

        // 4. EXTRAÇÃO E SALVAMENTO DE MÍDIA (FOTO OU VÍDEO)
        const categoria = (sub || "main").toLowerCase().trim();
        const isVideoMedia = isDirectVideo || isQuotedVideo;
        const isImageMedia = isDirectImage || isQuotedImage;

        const mediaMsg = isDirectImage ? info?.message?.imageMessage :
                        (isDirectVideo ? info?.message?.videoMessage :
                        (isQuotedImage ? quoted?.imageMessage :
                        (isQuotedVideo ? quoted?.videoMessage : null)));

        if (!mediaMsg && args[1] && (args[1].startsWith("http://") || args[1].startsWith("https://"))) {
            // Download via URL direta
            try {
                await reply(`⏳ *Baixando live wallpaper da URL para o menu [${categoria}]...*`);
                const res = await axios.get(args[1], { responseType: "arraybuffer", timeout: 20000 });
                const buf = Buffer.from(res.data);
                const isUrlVideo = args[1].includes(".mp4") || res.headers["content-type"]?.includes("video");

                if (isUrlVideo) {
                    await saveMenuVideo(categoria, buf);
                    return reply(`🎬 *LIVE WALLPAPER ANIMADO APLICADO COM SUCESSO AO MENU [${categoria.toUpperCase()}]!*`);
                } else {
                    await saveWallpaper(categoria, buf);
                    return reply(`🖼️ *FOTO ESTÁTICA APLICADA COM SUCESSO AO MENU [${categoria.toUpperCase()}]!*`);
                }
            } catch (err) {
                return reply(`❌ Falha ao baixar mídia da URL: ${err.message}`);
            }
        }

        if (!mediaMsg) {
            return reply(`❌ Marque uma foto ou vídeo com \`.setwallpaper ${categoria}\` ou \`.setvideo ${categoria}\`.`);
        }

        try {
            const mediaType = isVideoMedia ? "video" : "image";
            await reply(`⏳ *Processando e configurando ${isVideoMedia ? "vídeo animado (Live Wallpaper)" : "imagem"} para o menu [${categoria.toUpperCase()}]...*`);

            const stream = await downloadContentFromMessage(mediaMsg, mediaType);
            let buffer = Buffer.from([]);

            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            const allCats = getAllMenuMediaStatus().map(m => m.key);

            if (categoria === "all" || categoria === "todos") {
                for (const cat of allCats) {
                    if (isVideoMedia) {
                        await saveMenuVideo(cat, buffer);
                    } else {
                        await saveWallpaper(cat, buffer);
                    }
                }
                return reply(`🎉 *${isVideoMedia ? "VÍDEO ANIMADO (LIVE WALLPAPER)" : "FOTO ESTÁTICA"} DEFINIDO COM SUCESSO PARA TODOS OS MENUS DO BOT!*`);
            }

            if (isVideoMedia) {
                await saveMenuVideo(categoria, buffer);
                return reply(`🎬 *LIVE WALLPAPER ANIMADO DEFINIDO COM SUCESSO!*\n\n📂 *Menu:* \`${categoria.toUpperCase()}\`\n🎥 *Formato:* MP4 HD com Reprodução Contínua (GIF Playback)\n✨ _Digite \`.menu ${categoria}\` ou \`.setwallpaper preview ${categoria}\` para conferir!_`);
            } else {
                await saveWallpaper(categoria, buffer);
                return reply(`🖼️ *FOTO ESTÁTICA DEFINIDA COM SUCESSO!*\n\n📂 *Menu:* \`${categoria.toUpperCase()}\`\n📸 *Formato:* Imagem em alta resolução\n✨ _Digite \`.menu ${categoria}\` para conferir!_`);
            }
        } catch (err) {
            logger.error("[SETWALLPAPER ERROR]", err);
            return reply(`❌ *Erro ao salvar mídia do menu:* ${err.message}`);
        }
    }
};
