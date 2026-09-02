/**
 * MeliodasBot — Comando .aliases / .aliases-all / .alias-<categoria>
 * Central de Atalhos, Abreviações e Sinônimos de Comandos por Categoria
 */

const env = require('../../config/env')
const { getWallpaperBuffer } = require('../../utils/wallpapers')
const { getBotName } = require('../../config/botConfig')
const dataService = require('../../services/dataService')

const CATEGORY_NAMES = {
    admin: '🛡️ Administração de Grupos',
    config: '⚙️ Configurações do Grupo',
    media: '📥 Mídia & Downloads',
    pesquisa: '🔍 Pesquisa, IA & Visão',
    rpg: '⚔️ RPG & Combates',
    economy: '🎰 Economia, Cassino & Perfil',
    dev: '👨‍💻 Dev Hub & Ferramentas',
    calc: '🧮 Calculadora & Matemática',
    rede: '🌐 Rede, Pings & Telemetria',
    fun: '🎲 Diversão & Jogos',
    interacao: '💞 Interação Social & Afeto',
    arquivos: '📚 Livros, Apostilas & PDFs',
    aluguel: '💎 Aluguel de Grupos & Pix',
    owner: '👑 Donos & Servidor VPS',
    general: '📖 Informações & Geral'
}

const CATEGORY_ALIASES = {
    'adm': 'admin', 'moderacao': 'admin',
    'configs': 'config', 'configuracao': 'config', 'configuracoes': 'config',
    'downloads': 'media', 'midia': 'media', 'midias': 'media',
    'ia': 'pesquisa', 'busca': 'pesquisa', 'google': 'pesquisa',
    'eco': 'economy', 'economia': 'economy', 'perfil': 'economy', 'cassino': 'economy',
    'tools': 'dev', 'software': 'dev',
    'calculadora': 'calc', 'math': 'calc', 'matematica': 'calc',
    'net': 'rede', 'telemetria': 'rede', 'pings': 'rede', 'ping': 'rede',
    'jogos': 'fun', 'diversao': 'fun',
    'social': 'interacao', 'afeto': 'interacao', 'acoes': 'interacao',
    'livros': 'arquivos', 'pdf': 'arquivos', 'documentos': 'arquivos',
    'rent': 'aluguel', 'planos': 'aluguel',
    'dono': 'owner', 'donos': 'owner', 'vps': 'owner',
    'geral': 'general', 'info': 'general'
}

module.exports = {
    name: 'aliases',
    aliases: [
        'atalhos', 'abreviacoes', 'abreviacao', 'alias', 'sinonimos', 'siglas',
        // Atalho direto para todos
        'aliases-all', 'atalhos-all', 'abreviacoes-all', 'abreviações-all', 'allaliases', 'all-aliases', 'alias-all',
        // Atalhos dedicados por categoria
        'alias-dono', 'aliases-dono', 'alias-owner', 'aliases-owner',
        'alias-admin', 'aliases-admin', 'alias-adm', 'aliases-adm',
        'alias-media', 'aliases-media', 'alias-downloads', 'aliases-downloads',
        'alias-rpg', 'aliases-rpg',
        'alias-eco', 'aliases-eco', 'alias-economia', 'aliases-economia',
        'alias-dev', 'aliases-dev', 'alias-tools', 'aliases-tools',
        'alias-calc', 'aliases-calc', 'alias-math', 'aliases-math',
        'alias-pesquisa', 'aliases-pesquisa', 'alias-ia', 'aliases-ia',
        'alias-fun', 'aliases-fun', 'alias-jogos', 'aliases-jogos',
        'alias-interacao', 'aliases-interacao', 'alias-social', 'aliases-social',
        'alias-config', 'aliases-config',
        'alias-ping', 'aliases-ping', 'alias-rede', 'aliases-rede',
        'alias-arquivos', 'aliases-arquivos', 'alias-livros', 'aliases-livros',
        'alias-aluguel', 'aliases-aluguel'
    ],
    category: 'general',
    description: 'Lista todas as abreviações e apelidos de comandos (.aliases-all ou .aliases <categoria>)',
    cooldownMs: 2000,
    execute: async ({ text, reply, client, from, info, isAdmin, isOwner, userRole, commandName }) => {
        const dispatcher = require('../../handlers/commandDispatcher')
        const allCommands = Array.from(dispatcher.getCommands().values())
        const configs = dataService.getConfigsData()
        const p = configs[from]?.prefix || configs['global']?.prefix || env.prefix || '.'
        const botName = getBotName()

        const isUserAdmin = isAdmin || isOwner || (userRole && userRole.level >= 3)
        const isUserOwner = isOwner || (userRole && userRole.level >= 5)

        const cmdCalled = (commandName || 'aliases').toLowerCase()
        let query = (text || '').trim().toLowerCase()

        // 1. Detecção de chamada direta por aliases-all
        const isAllDirect = [
            'aliases-all', 'atalhos-all', 'abreviacoes-all', 'abreviações-all', 'allaliases', 'all-aliases', 'alias-all'
        ].includes(cmdCalled) || query === 'all' || query === 'todos' || query === 'total'

        // 2. Detecção de chamada direta por categoria no nome do comando (ex: .alias-admin, .aliases-dono)
        if (!query && cmdCalled.includes('-')) {
            const splitted = cmdCalled.split('-')[1]
            if (splitted) query = splitted
        }

        // CASO A: LISTAGEM COMPLETA (.aliases-all)
        if (isAllDirect) {
            const totalCmds = dispatcher.getCommands().size || 700;
            let totalAliasesCount = 0;
            allCommands.forEach(c => {
                if (c.aliases && Array.isArray(c.aliases)) totalAliasesCount += c.aliases.length;
            });
            const totalGatilhos = totalCmds + totalAliasesCount;

            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   🏷️ *DICIONÁRIO GERAL DE ATALHOS* 🏷️   ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `📌 *Total de Comandos Canônicos:* ${totalCmds} Comandos Únicos\n`;
            doc += `⚡ *Total de Aliases / Atalhos:* ${totalAliasesCount} Abreviações Registradas\n`;
            doc += `🌟 *Total de Gatilhos:* ${totalGatilhos} Formas de Execução\n`;
            doc += `📌 *Prefixo Ativo:* \`${p}\`\n\n`;
            doc += `✨ *Guia completo de todos os comandos e suas abreviações:*\n\n`;

            for (const [catKey, label] of Object.entries(CATEGORY_NAMES)) {
                if ((catKey === 'admin' || catKey === 'config') && !isUserAdmin) continue;
                if ((catKey === 'owner' || catKey === 'aluguel') && !isUserOwner) continue;

                let catCmds = allCommands.filter(c => {
                    const cCat = c.category || 'general';
                    if (catKey === 'arquivos') return ['livro'].includes(c.name);
                    if (catKey === 'economy') return ['economy', 'profile'].includes(cCat);
                    return cCat === catKey;
                });

                catCmds = catCmds.filter(c => c.aliases && c.aliases.length > 0);

                if (catCmds.length > 0) {
                    doc += `╭━〔 ${label} (${catCmds.length} cmds) 〕━⬣\n`;
                    catCmds.forEach(c => {
                        const aliasStr = c.aliases.map(a => `\`${p}${a}\``).join(', ');
                        doc += `┃ ➤ \`${p}${c.name}\` ➔ ${aliasStr}\n`;
                    });
                    doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
                }
            }

            doc += `💡 _Para filtrar uma categoria específica:_ \`${p}aliases <categoria>\` (ex: \`${p}aliases-rpg\`)\n`;
            doc += `👑 *${botName}*`;

            if (process.env.NODE_ENV === 'test') {
                return reply(doc.trim());
            }

            const { getMenuMedia } = require('../../utils/wallpapers');
            const media = getMenuMedia(isUserOwner ? 'owner' : (isUserAdmin ? 'admin' : 'main'));
            try {
                if (media && media.buffer) {
                    if (media.type === 'video') {
                        return client.sendMessage(from, {
                            video: media.buffer,
                            caption: doc.trim(),
                            gifPlayback: true,
                            mimetype: 'video/mp4'
                        }, { quoted: info });
                    } else {
                        return client.sendMessage(from, { image: media.buffer, caption: doc.trim() }, { quoted: info });
                    }
                } else {
                    return reply(doc.trim());
                }
            } catch (_) {
                return reply(doc.trim());
            }
        }

        // CASO B: CONSULTA POR CATEGORIA OU COMANDO ESPECÍFICO
        if (query) {
            let clean = query.replace(/^[.!#\/]/, '').trim()

            // B.1 Se for comando específico (Ex: .aliases welcome, .aliases ia)
            const foundCmd = dispatcher.findCommand(clean)
            if (foundCmd && !CATEGORY_NAMES[clean] && !CATEGORY_ALIASES[clean]) {
                const aliasList = foundCmd.aliases && foundCmd.aliases.length > 0 ? foundCmd.aliases : []
                let doc = `╔══════════════════════════════╗\n`
                doc += `║   🏷️ *ABREVIAÇÕES DO COMANDO* 🏷️   ║\n`
                doc += `╚══════════════════════════════╝\n\n`
                doc += `╭━〔 📌 \`${p}${foundCmd.name}\` 〕━⬣\n`
                doc += `┃ 📝 *Descrição:* ${foundCmd.description || 'Comando do bot'}\n`
                doc += `┃ 📂 *Categoria:* ${CATEGORY_NAMES[foundCmd.category] || foundCmd.category}\n`
                if (aliasList.length > 0) {
                    doc += `┃ 🏷️ *Abreviações / Sinônimos:*\n`
                    aliasList.forEach(a => {
                        doc += `┃    └ \`${p}${a}\`\n`
                    })
                } else {
                    doc += `┃ 🏷️ *Abreviações:* Nenhuma cadastrada (use \`${p}${foundCmd.name}\`)\n`
                }
                doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`
                doc += `💡 _Você pode digitar qualquer uma dessas abreviações para executar o mesmo comando!_\n`
                doc += `👑 *${botName}*`
                return reply(doc.trim())
            }

            // B.2 Se for categoria (Ex: .aliases admin, .aliases media, .aliases rpg)
            if (CATEGORY_ALIASES[clean]) clean = CATEGORY_ALIASES[clean]
            if (CATEGORY_NAMES[clean]) {
                const catKey = clean
                if ((catKey === 'admin' || catKey === 'config') && !isUserAdmin) {
                    return reply('❌ *Acesso Negado:* A categoria de administração é restrita aos administradores do grupo.')
                }
                if ((catKey === 'owner' || catKey === 'aluguel') && !isUserOwner) {
                    return reply('❌ *Acesso Negado:* A categoria de owner é exclusiva para os Donos do bot.')
                }

                let catCmds = allCommands.filter(c => {
                    const cCat = c.category || 'general'
                    if (catKey === 'arquivos') return ['livro'].includes(c.name)
                    if (catKey === 'economy') return ['economy', 'profile'].includes(cCat)
                    return cCat === catKey
                })

                const withAliases = catCmds.filter(c => c.aliases && c.aliases.length > 0)
                let totalAliases = 0
                withAliases.forEach(c => { totalAliases += c.aliases.length })

                let doc = `╔══════════════════════════════╗\n`
                doc += `║   🏷️ *ABREVIAÇÕES: ${catKey.toUpperCase()}* 🏷️   ║\n`
                doc += `╚══════════════════════════════╝\n\n`
                doc += `╭━〔 ${CATEGORY_NAMES[catKey]} 〕━⬣\n`
                doc += `┃ 📊 *Comandos com Atalho:* ${withAliases.length} de ${catCmds.length}\n`
                doc += `┃ 🏷️ *Total de Abreviações:* ${totalAliases}\n`
                doc += `┣━━━━━━━━━━━━━━━━━━━━━━━━━\n`

                catCmds.forEach(c => {
                    const aliasStr = c.aliases && c.aliases.length > 0 ? c.aliases.map(a => `\`${p}${a}\``).join(', ') : '_Sem atalho_'
                    doc += `┃ ➤ \`${p}${c.name}\`\n`
                    doc += `┃    └ 🏷️ ${aliasStr}\n`
                })

                doc += `╰━━━━━━━━━━━━━━━━━━━━━━━━━⬣\n\n`
                doc += `💡 _Digite qualquer uma das abreviações acima para acionar o comando rapidamente._\n`
                doc += `👑 *${botName}*`

                const { getMenuMedia } = require('../../utils/wallpapers');
                const media = getMenuMedia(catKey);
                if (process.env.NODE_ENV === 'test') {
                    return reply(doc.trim());
                }
                try {
                    if (media && media.buffer) {
                        if (media.type === 'video') {
                            return client.sendMessage(from, {
                                video: media.buffer,
                                caption: doc.trim(),
                                gifPlayback: true,
                                mimetype: 'video/mp4'
                            }, { quoted: info });
                        } else {
                            return client.sendMessage(from, {
                                image: media.buffer,
                                caption: doc.trim()
                            }, { quoted: info });
                        }
                    } else {
                        return reply(doc.trim());
                    }
                } catch (_) {
                    return reply(doc.trim());
                }
            }
        }

        // CASO C: MENU CENTRAL DE ATALHOS (.aliases sem argumentos)
        let totalAliases = 0
        const catStats = {}

        allCommands.forEach(c => {
            const cat = c.category || 'general'
            if ((cat === 'admin' || cat === 'config') && !isUserAdmin) return
            if ((cat === 'owner' || cat === 'aluguel') && !isUserOwner) return

            if (c.aliases && c.aliases.length > 0) {
                totalAliases += c.aliases.length
                catStats[cat] = (catStats[cat] || 0) + c.aliases.length
            }
        })

        let doc = `╔══════════════════════════════╗\n`
        doc += `║   🏷️ *CENTRAL DE ABREVIAÇÕES* 🏷️   ║\n`
        doc += `╚══════════════════════════════╝\n\n`
        doc += `✨ O *${botName}* possui *${totalAliases} abreviações e atalhos* ativos para facilitar seu uso diário!\n\n`
        doc += `💡 _Comandos diretos por categoria:_\n\n`

        for (const [catKey, label] of Object.entries(CATEGORY_NAMES)) {
            const count = catStats[catKey] || (catKey === 'arquivos' ? 8 : 0)
            if (count > 0) {
                doc += `╭━〔 ${label} 〕━⬣\n`
                doc += `┃ 🏷️ *${count} abreviações*\n`
                doc += `┃ 🔍 _Comando:_ \`${p}aliases-${catKey}\` ou \`${p}aliases ${catKey}\`\n`
                doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`
            }
        }

        doc += `🌟 *Atalhos Principais:*\n`
        doc += `• \`${p}aliases-all\` ➔ Dicionário completo de todas as categorias\n`
        doc += `• \`${p}aliases-admin\` ➔ Atalhos de moderação de grupos\n`
        doc += `• \`${p}aliases-media\` ➔ Atalhos de download de vídeos/áudios\n`
        doc += `• \`${p}aliases-rpg\` ➔ Atalhos do sistema de RPG e combate\n`
        doc += `• \`${p}aliases-dev\` ➔ Atalhos do Dev Hub\n`
        doc += `• \`${p}aliases-dono\` ➔ Atalhos dos donos\n\n`
        doc += `👑 *${botName}*`

        const { getMenuMedia } = require('../../utils/wallpapers');
        const media = getMenuMedia('main');
        if (process.env.NODE_ENV === 'test') {
            return reply(doc.trim());
        }
        try {
            if (media && media.buffer) {
                if (media.type === 'video') {
                    return client.sendMessage(from, {
                        video: media.buffer,
                        caption: doc.trim(),
                        gifPlayback: true,
                        mimetype: 'video/mp4'
                    }, { quoted: info });
                } else {
                    return client.sendMessage(from, {
                        image: media.buffer,
                        caption: doc.trim()
                    }, { quoted: info });
                }
            } else {
                return reply(doc.trim());
            }
        } catch (_) {
            return reply(doc.trim());
        }
    }
}
