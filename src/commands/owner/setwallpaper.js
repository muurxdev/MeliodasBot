/**
 * MeliodasBot — Comando .setwallpaper / .setvideo / .personalizacao
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
    description: "Define vídeos animados ou fotos estáticas personalizadas para TODOS os menus do bot",
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

        // 1. PREVIEW DE MÍDIA (.setwallpaper preview <categoria>)
        if (sub === "preview" || sub === "ver" || sub === "teste") {
            const targetCat = args[1] || "main";
            const media = getMenuMedia(targetCat);

            if (!media || !media.buffer) {
                return reply(`❌ Nenhuma mídia encontrada para a categoria *"${targetCat}"*.`);
            }

            const caption = renderCard({
                title: `PRÉVIA DO WALLPAPER: ${targetCat.toUpperCase()}`,
                icon: "🎬",
                subtitle: `🎨 *Formato Atual:* ${media.type === "video" ? "Vídeo Animado MP4 (Live HD)" : "Imagem Estática"}`,
                sections: [
                    {
                        title: "DETALHES DA MÍDIA",
                        icon: "📜",
                        fields: [
                            { label: "Categoria", value: targetCat.toUpperCase(), icon: "📂" },
                            { label: "Tamanho", value: `${(media.buffer.length / 1024 / 1024).toFixed(2)} MB`, icon: "💾" },
                            { label: "Mimetype", value: media.mimetype, icon: "🎞️" }
                        ]
                    }
                ],
                tip: "Para alterar, envie um novo vídeo ou foto com .setwallpaper " + targetCat,
                mentions: [sender]
            });

            try {
                if (media.type === "video") {
                    return await client.sendMessage(from, {
                        video: media.buffer,
                        caption: caption,
                        gifPlayback: true,
                        mimetype: "video/mp4"
                    }, { quoted: info });
                } else {
                    return await client.sendMessage(from, {
                        image: media.buffer,
                        caption: caption
                    }, { quoted: info });
                }
            } catch (err) {
                return reply(`❌ Erro ao enviar prévia: ${err.message}`);
            }
        }

        // 2. LISTAGEM & GUIA GERAL DE PERSONALIZAÇÃO DE TODOS OS MENUS
        if (!isDirectImage && !isDirectVideo && !isQuotedImage && !isQuotedVideo && (!sub || sub === "list" || sub === "listar" || sub === "help")) {
            const list = getAllMenuMediaStatus();
            let wpFields = [];

            list.forEach(m => {
                wpFields.push(`• *${m.label}:* ${m.status}`);
            });

            const doc = renderCard({
                title: "CENTRAL DE WALLPAPERS & VÍDEOS",
                icon: "🎬",
                subtitle: `🎨 *Gerencie os Live Wallpapers Animados dos Menus do ${botName}*`,
                sections: [
                    {
                        title: "STATUS ATUAL DOS LIVE WALLPAPERS",
                        icon: "📊",
                        fields: wpFields
                    },
                    {
                        title: "COMO ALTERAR OU APLICAR VÍDEO NOVO",
                        icon: "⚙️",
                        fields: [
                            "1️⃣ Envie ou responda a um *Vídeo MP4* ou *Foto*",
                            "2️⃣ Digite `.setwallpaper <categoria>` (ex: `.setwallpaper rpg`)",
                            "3️⃣ Digite `.setwallpaper preview <categoria>` para testar a prévia",
                            "4️⃣ Digite `.setwallpaper reset <categoria>` para voltar ao padrão do anime"
                        ]
                    },
                    {
                        title: "CATEGORIAS DISPONÍVEIS",
                        icon: "📂",
                        fields: [
                            "`main`, `rpg`, `media`, `economy`, `fun`, `pesquisa`, `dev`, `admin`, `config`, `welcome`, `leave`, `dossie`"
                        ]
                    }
                ],
                tip: "Live wallpapers em vídeo são reproduzidos em loop dinâmico (GIF Playback) com qualidade linda!",
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

            const allCats = ["main", "rpg", "media", "economy", "calc", "interacao", "pesquisa", "fun", "dev", "rede", "admin", "config", "aluguel", "owner", "welcome", "leave", "dossie"];

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
