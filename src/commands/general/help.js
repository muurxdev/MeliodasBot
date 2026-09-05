/**
 * Dynamic Command Discovery & Help System
 * Guia de comandos categorizado e documentação detalhada com previews e variáveis (.help <categoria|comando>)
 */

const env = require('../../config/env')
const { ROLE_NAMES } = require('../../services/permissionService')
const { getWallpaperBuffer } = require('../../utils/wallpapers')
const { getBotName } = require('../../config/botConfig')
const dataService = require('../../services/dataService')

const CATEGORY_NAMES = {
    media: '📥 Mídia & Downloads',
    dev: '👨‍💻 Dev Hub & Utilitários',
    rpg: '⚔️ RPG & Combates',
    economy: '🎰 Economia & Perfil',
    admin: '🛡️ Administração de Grupos',
    config: '⚙️ Configurações do Grupo',
    owner: '👑 Donos & Servidor VPS',
    aluguel: '💎 Aluguel de Grupos & Pix',
    calc: '🧮 Calculadora & Matemática',
    pesquisa: '🔍 Pesquisa, IA & Visão',
    rede: '🌐 Rede, Pings & Telemetria',
    fun: '🎲 Diversão & Jogos',
    interacao: '💞 Interação Social & Afeto',
    general: '📚 Informações & Geral'
}

const CATEGORY_ALIASES = {
    'downloads': 'media', 'midia': 'media', 'midias': 'media',
    'eco': 'economy', 'economia': 'economy', 'perfil': 'economy',
    'configs': 'config', 'configuracao': 'config', 'configuracoes': 'config',
    'dono': 'owner', 'donos': 'owner', 'vps': 'owner',
    'rent': 'aluguel', 'planos': 'aluguel',
    'calculadora': 'calc', 'math': 'calc', 'matematica': 'calc',
    'ia': 'pesquisa', 'busca': 'pesquisa', 'google': 'pesquisa',
    'net': 'rede', 'telemetria': 'rede', 'pings': 'rede',
    'jogos': 'fun', 'diversao': 'fun',
    'social': 'interacao', 'afeto': 'interacao', 'acoes': 'interacao',
    'geral': 'general', 'info': 'general'
}

// Exemplos detalhados e previews interativos para comandos chave
const COMMAND_HELP_EXTRAS = {
    'welcome': {
        usage: '.welcome <on|off|msg|preview|reset>',
        examples: [
            '.welcome on — Ativa avisos de entrada',
            '.welcome off — Desativa avisos de entrada',
            '.welcome preview — Visualiza simulação da mensagem',
            '.welcome msg Olá {user}, seja bem-vindo ao {grupo}! Regras: {desc}'
        ],
        variables: ['{user}', '{grupo}', '{desc}', '{membros}', '{hora}']
    },
    'leave': {
        usage: '.leave <on|off|msg|preview|reset>',
        examples: [
            '.leave on — Ativa mensagens de despedida',
            '.leave off — Desativa mensagens de despedida',
            '.leave preview — Visualiza simulação da mensagem',
            '.leave msg O membro {user} saiu do {grupo}. Restam {membros} membros!'
        ],
        variables: ['{user}', '{grupo}', '{desc}', '{membros}', '{hora}']
    },
    'solicitacoes': {
        usage: '.solicitacoes [list] | .aceitar [todos/@user] | .rejeitar [todos/@user]',
        examples: [
            '.solicitacoes — Lista todos os pedidos pendentes',
            '.aceitar todos — Aceita todos com intervalo seguro anti-ban (5 a 10s)',
            '.aceitar @user — Aceita usuário específico',
            '.rejeitar todos — Rejeita todas as solicitações'
        ],
        variables: []
    },
    'setnomegrupo': {
        usage: '.setnomegrupo <novo nome>',
        examples: [
            '.setnomegrupo 🐉 Clã Nanatsu no Taizai 🐉'
        ],
        variables: ['Máximo de 100 caracteres suportados']
    },
    'setdesc': {
        usage: '.setdesc <texto da bio ou regras>',
        examples: [
            '.setdesc Regras do Grupo:\n1. Respeite os membros\n2. Sem spam/links'
        ],
        variables: ['Pode responder a uma mensagem com .setdesc']
    },
    'setfotogrupo': {
        usage: '.setfotogrupo (respondendo a uma foto)',
        examples: [
            'Envie ou responda uma imagem com .setfotogrupo'
        ],
        variables: ['Corte automático para foto de perfil do grupo']
    },
    'gruposettings': {
        usage: '.gruposettings <info|aprovacao> <admin|todos|on|off>',
        examples: [
            '.gruposettings info admin — Apenas admins alteram dados do grupo',
            '.gruposettings info todos — Todos participantes alteram dados',
            '.gruposettings aprovacao on — Liga modo de aprovação para entrar',
            '.gruposettings aprovacao off — Entrada livre por link direto'
        ],
        variables: []
    },
    'restringir': {
        usage: '.restringir <on|adm|off>',
        examples: [
            '.restringir adm — Apenas Administradores e Donos usam o bot no grupo',
            '.restringir off — Libera comandos para todos os membros'
        ],
        variables: []
    },
    'bancmd': {
        usage: '.bancmd <categoria|comando|all> [motivo]',
        examples: [
            '.bancmd rpg — Bane todos os 30 comandos de RPG',
            '.bancmd media — Bane todos os downloads e mídias',
            '.bancmd ytmp4 — Bane o download de vídeo do YouTube',
            '.bancmd all Manutenção Geral — Bane todos os comandos públicos',
            '.unbancmd all — Reativa todos os comandos globalmente'
        ],
        variables: []
    },
    'youtube': {
        usage: '.youtube <link|busca> [--mp3]',
        examples: [
            '.youtube https://youtu.be/cBpUZJ0qxqs — Baixa vídeo em MP4 HD',
            '.youtube https://youtu.be/cBpUZJ0qxqs --mp3 — Baixa áudio em MP3',
            '.youtube Linkin Park Numb — Pesquisa e baixa vídeo'
        ],
        variables: ['Compatível com WhatsApp Mobile e Web até 2GB']
    },
    'ia': {
        usage: '.ia <pergunta ou termo de pesquisa>',
        examples: [
            '.ia quem descobriu o Brasil?',
            '.ia últimas notícias de astronomia',
            '.ia como funciona a relatividade geral?'
        ],
        variables: ['Pesquisa na Web em tempo real com fontes verificadas']
    }
}

module.exports = {
    name: 'help',
    aliases: ['ajuda', 'socorro', 'comandos'],
    category: 'general',
    description: 'Guia de comandos categorizado e documentação detalhada (.help <categoria|comando>)',
    cooldownMs: 2000,
    execute: async ({ text, reply, client, from, info, isAdmin, isOwner, userRole }) => {
        const dispatcher = require('../../handlers/commandDispatcher')
        const allCommands = dispatcher.getCommands()
        const configs = dataService.getConfigsData()
        const p = configs[from]?.prefix || configs['global']?.prefix || env.prefix || '.'
        const botName = getBotName()

        const isUserAdmin = isAdmin || isOwner || (userRole && userRole.level >= 3)
        const isUserOwner = isOwner || (userRole && userRole.level >= 5)

        const query = (text || '').trim().toLowerCase()

        if (query) {
            const hasDot = /^[.!#\/]/.test(query)
            let cleanQuery = query.replace(/^[.!#\/]/, '').trim()
            if (CATEGORY_ALIASES[cleanQuery]) cleanQuery = CATEGORY_ALIASES[cleanQuery]

            // 1. CASO 1: Consulta por Categoria (Ex: .help media, .help dev, .help config, .help calc)
            const isCategory = !hasDot && Object.keys(CATEGORY_NAMES).find(c => c === cleanQuery)

            if (isCategory) {
                if ((isCategory === 'admin' || isCategory === 'config') && !isUserAdmin) {
                    return reply('❌ *Acesso Negado:* A categoria de administração é restrita aos administradores do grupo.')
                }
                if ((isCategory === 'owner' || isCategory === 'aluguel') && !isUserOwner) {
                    return reply('❌ *Acesso Negado:* A categoria de owner é exclusiva para os Donos do bot.')
                }

                const categoryCmds = Array.from(allCommands.values()).filter(c => {
                    if (c.category !== isCategory) return false
                    if (c.ownerOnly && !isUserOwner) return false
                    if (c.adminOnly && !isUserAdmin) return false
                    return true
                }).sort((a, b) => a.name.localeCompare(b.name))

                let totalCatAliases = 0
                categoryCmds.forEach(c => {
                    if (Array.isArray(c.aliases)) totalCatAliases += c.aliases.length
                })

                let catDoc = `╭━〔 ${CATEGORY_NAMES[isCategory]} 〕━⬣\n`
                catDoc += `┃ 📊 *Total:* ${categoryCmds.length} Comandos · ${totalCatAliases} Aliases Ativos\n`
                catDoc += `┣━━━━━━━━━━━━━━━━━━━━━━━━━\n`

                categoryCmds.forEach((c) => {
                    let aliasesHint = ''
                    if (Array.isArray(c.aliases) && c.aliases.length > 0) {
                        const valid = Array.from(new Set(c.aliases.filter(a => a && a !== c.name)))
                        if (valid.length > 0) {
                            aliasesHint = ` [${valid.map(a => `\`${p}${a}\``).join(', ')}]`
                        }
                    }
                    const desc = c.description ? ` — _(${c.description.slice(0, 45)})_` : ''
                    catDoc += `┃ ➤ \`${p}${c.name}\`${aliasesHint}${desc}\n`
                })

                catDoc += `╰━━━━━━━━━━━━━━━━━━⬣\n`
                catDoc += `💡 _Para ver detalhes e preview de um comando:_ \`${p}help .${categoryCmds[0]?.name || 'comando'}\`\n`
                catDoc += `📖 _Para catálogo paginado com live wallpaper:_ \`${p}menu ${isCategory}\``

                const { getMenuMedia } = require('../../utils/wallpapers');
                const media = getMenuMedia(isCategory);
                if (process.env.NODE_ENV === 'test') {
                    return reply(catDoc.trim());
                }
                try {
                    if (media && media.buffer) {
                        if (catDoc.length <= 1000) {
                            if (media.type === 'video') {
                                return client.sendMessage(from, {
                                    video: media.buffer,
                                    caption: catDoc.trim(),
                                    gifPlayback: true,
                                    mimetype: 'video/mp4'
                                }, { quoted: info });
                            } else {
                                return client.sendMessage(from, {
                                    image: media.buffer,
                                    caption: catDoc.trim()
                                }, { quoted: info });
                            }
                        } else {
                            const lines = catDoc.split('\n');
                            let p1 = '';
                            let p2 = '';
                            let inP1 = true;
                            for (const line of lines) {
                                if (inP1 && (p1.length + line.length + 50 > 980)) {
                                    inP1 = false;
                                    p1 += '╰━━━━━━━━━━━━━━━━━━⬣\n▸ _(continuação abaixo... )_';
                                }
                                if (inP1) {
                                    p1 += line + '\n';
                                } else {
                                    p2 += line + '\n';
                                }
                            }
                            if (media.type === 'video') {
                                await client.sendMessage(from, {
                                    video: media.buffer,
                                    caption: p1.trim(),
                                    gifPlayback: true,
                                    mimetype: 'video/mp4'
                                }, { quoted: info });
                            } else {
                                await client.sendMessage(from, {
                                    image: media.buffer,
                                    caption: p1.trim()
                                }, { quoted: info });
                            }
                            if (p2.trim()) {
                                await client.sendMessage(from, { text: p2.trim() }, { quoted: info });
                            }
                            return;
                        }
                    } else {
                        return reply(catDoc.trim());
                    }
                } catch (e) {
                    return reply(catDoc.trim());
                }
            }

            // 2. CASO 2: Consulta de comando específico (Ex: .help .welcome, .help leave, .help .bancmd)
            const targetCmd = dispatcher.findCommand(cleanQuery)

            if (targetCmd) {
                if (targetCmd.ownerOnly && !isUserOwner) {
                    return reply('❌ *Acesso Negado:* Este comando é exclusivo para o Dono do bot.')
                }
                if (targetCmd.adminOnly && !isUserAdmin) {
                    return reply('❌ *Acesso Negado:* Este comando é exclusivo para administradores do grupo.')
                }

                const catName = CATEGORY_NAMES[targetCmd.category] || targetCmd.category || 'Geral'
                const aliasesStr = targetCmd.aliases && targetCmd.aliases.length > 0 ? targetCmd.aliases.map(a => `${p}${a}`).join(', ') : 'Nenhum'
                const minRoleName = targetCmd.ownerOnly ? 'OWNER' : (targetCmd.adminOnly ? 'GROUP_ADMIN' : (ROLE_NAMES[targetCmd.minRole] || 'USER'))
                const cooldown = targetCmd.cooldownMs ? `${targetCmd.cooldownMs / 1000}s` : '2s'

                const extraInfo = COMMAND_HELP_EXTRAS[targetCmd.name] || null

                let cmdDoc = `╔══════════════════════════════╗\n`
                cmdDoc += `║ 📖 *DETALHES DO COMANDO* 📖 ║\n`
                cmdDoc += `╚══════════════════════════════╝\n\n`
                cmdDoc += `╭━〔 📌 \`${p}${targetCmd.name}\` 〕━⬣\n`
                cmdDoc += `┃ 📝 *Descrição:* ${targetCmd.description || 'Sem descrição cadastrada'}\n`
                cmdDoc += `┃ 📂 *Categoria:* ${catName}\n`
                cmdDoc += `┃ 🏷️ *Aliases:* ${aliasesStr}\n`
                cmdDoc += `┃ 🔐 *Permissão:* \`${minRoleName}\`\n`
                cmdDoc += `┃ ⏱️ *Cooldown:* ${cooldown}\n`
                cmdDoc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`

                if (extraInfo) {
                    cmdDoc += `╭━〔 💡 COMO UTILIZAR & PREVIEW 〕━⬣\n`
                    cmdDoc += `┃ 🎯 *Sintaxe:* \`${extraInfo.usage}\`\n`
                    if (extraInfo.examples && extraInfo.examples.length > 0) {
                        cmdDoc += `┃ 📌 *Exemplos Práticos:*\n`
                        extraInfo.examples.forEach(ex => {
                            cmdDoc += `┃   • \`${ex}\`\n`
                        })
                    }
                    if (extraInfo.variables && extraInfo.variables.length > 0) {
                        cmdDoc += `┃ 🔤 *Variáveis / Notas:*\n`
                        extraInfo.variables.forEach(v => {
                            cmdDoc += `┃   • \`${v}\`\n`
                        })
                    }
                    cmdDoc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`
                } else {
                    cmdDoc += `💡 *Como Executar:* \`${p}${targetCmd.name}\`\n\n`
                }

                cmdDoc += `👑 *${botName}*`
                return reply(cmdDoc.trim())
            }

            return reply(`❌ Comando ou categoria \`${query}\` não encontrado.\n\nUse \`${p}help\` para ver todas as categorias disponíveis.`)
        }

        // 3. CASO 3: Menu Principal de Categorias (.help sem argumentos)
        const categoriesMap = new Map()
        const aliasMap = new Map()
        const totalAliases = dispatcher.getAliases().size
        allCommands.forEach(c => {
            const cat = c.category || 'general'
            if (cat === 'admin' && !isUserAdmin) return
            if (cat === 'owner' && !isUserOwner) return

            categoriesMap.set(cat, (categoriesMap.get(cat) || 0) + 1)
            if (Array.isArray(c.aliases)) {
                aliasMap.set(cat, (aliasMap.get(cat) || 0) + c.aliases.length)
            }
        })

        let totalVisivel = 0
        categoriesMap.forEach(count => { totalVisivel += count })

        let mainDoc = `╔══════════════════════════════╗\n`
        mainDoc += `║   🤖 *${botName}* 🤖   ║\n`
        mainDoc += `╚══════════════════════════════╝\n\n`
        mainDoc += `📌 *Comandos Disponíveis para Você:* ${totalVisivel} (+${totalAliases} Aliases)\n`
        mainDoc += `💡 _Digite_ \`${p}help <categoria>\` _ou_ \`${p}menu <categoria>\` _para explorar cada seção:_\n\n`

        for (const [catKey, label] of Object.entries(CATEGORY_NAMES)) {
            const count = categoriesMap.get(catKey) || 0
            const aCount = aliasMap.get(catKey) || 0
            if (count > 0) {
                mainDoc += `╭━〔 ${label} 〕━⬣\n`
                mainDoc += `┃ 📊 *${count} comandos* · *${aCount} aliases*\n`
                mainDoc += `┃ 🔍 _Exibir:_ \`${p}help ${catKey}\` ou \`${p}menu ${catKey}\`\n`
                mainDoc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`
            }
        }

        mainDoc += `💡 *Exemplos rápidos:*\n`
        mainDoc += `• \`${p}help welcome\` — Ver guia e preview de boas-vindas\n`
        mainDoc += `• \`${p}help leave\` — Ver guia de mensagens de saída\n`
        mainDoc += `• \`${p}help media\` — Ver comandos de download com aliases\n`
        mainDoc += `• \`${p}help .play\` — Ver instruções do .play\n`
        mainDoc += `• \`${p}menu\` — Exibir menu interativo com Live Wallpaper HD\n`
        mainDoc += `• \`${p}menu all\` — Ver todos os 1.000 comandos com aliases`

        const { getMenuMedia } = require('../../utils/wallpapers');
        const media = getMenuMedia(isUserOwner ? 'owner' : (isUserAdmin ? 'admin' : 'help'));

        if (process.env.NODE_ENV === 'test') {
            return reply(mainDoc.trim());
        }

        try {
            if (media && media.buffer) {
                if (media.type === 'video') {
                    await client.sendMessage(from, {
                        video: media.buffer,
                        caption: mainDoc.trim(),
                        gifPlayback: true,
                        mimetype: 'video/mp4'
                    }, { quoted: info });
                } else {
                    await client.sendMessage(from, {
                        image: media.buffer,
                        caption: mainDoc.trim()
                    }, { quoted: info });
                }
            } else {
                await reply(mainDoc.trim());
            }
        } catch (e) {
            await reply(mainDoc.trim());
        }
    }
}
