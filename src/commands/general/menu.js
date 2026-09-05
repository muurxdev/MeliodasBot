/**
 * Comando .menu
 * Menu gerado dinamicamente a partir do registro de comandos (menuService).
 * Todo comando com `category` aparece automaticamente — nunca mais desatualiza.
 */

const env = require('../../config/env')
const { getBotName } = require('../../config/botConfig')
const dataService = require('../../services/dataService')
const { resolveCategoryKey } = require('../../config/categories')
const { buildMenu } = require('../../services/menuService')

module.exports = {
    name: 'menu',
    aliases: [
        'comandos', 'todos-comandos', 'ajuda-menu', 'menulist',
        'menurpg', 'menueco', 'menueconomia', 'menucalc',
        'menuinteracao', 'menusocial', 'menupesquisa', 'menuia',
        'menufun', 'menudiversao', 'menudev', 'menuping', 'menurede',
        'menuconfig', 'menuadmin', 'menuadm', 'menualuguel', 'menudono',
        'menuowner', 'menuall', 'menucompleto', 'menutotal', 'allmenu'
    ],
    category: 'general',
    description: 'Exibe o menu geral ou submenus específicos por categoria',
    cooldownMs: 2000,
    execute: async ({ reply, client, from, info, isAdmin, isOwner, userRole, args, commandName }) => {
        const configs = dataService.getConfigsData()
        const prefix = configs[from]?.prefix || configs['global']?.prefix || env.prefix || '.'
        const botName = configs['global']?.customMenuNames?.global || getBotName()

        const level = (userRole && userRole.level) || (isOwner ? 5 : isAdmin ? 3 : 1)
        const dispatcher = require('../../handlers/commandDispatcher')

        // Resolve categoria: via alias do comando (menurpg) ou 1º argumento
        let category = null
        let pageArg = 1
        if (commandName && commandName.startsWith('menu') && commandName !== 'menu' && commandName !== 'menulist') {
            const fromAlias = commandName.replace(/^menu/, '')
            category = (fromAlias === 'all' || fromAlias === 'completo' || fromAlias === 'total') ? 'all' : resolveCategoryKey(fromAlias)
        }
        if (!category && args[0]) {
            const a = args[0].toLowerCase()
            category = (a === 'all' || a === 'todos' || a === 'completo') ? 'all' : resolveCategoryKey(a)
            if (category && args[1]) pageArg = parseInt(args[1], 10) || 1
        } else if (category && args[0]) {
            pageArg = parseInt(args[0], 10) || 1
        }

        const menu = buildMenu({
            category,
            page: pageArg,
            prefix,
            userLevel: level,
            botName,
            registry: dispatcher.getCommands(),
            totalAliases: dispatcher.getAliases().size
        })

        const pageText = menu.pages[menu.page - 1] || menu.pages[0]
        // Página 1 vai com wallpaper; páginas seguintes como texto puro.
        if (menu.page === 1) {
            return sendMenuWithWallpaper(client, from, info, reply, pageText, menu.mediaKey)
        }
        return reply(pageText)
    }
}

async function sendMenuWithWallpaper(client, from, info, reply, textContent, category) {
    const { getMenuMedia } = require('../../utils/wallpapers')

    if (process.env.NODE_ENV === 'test') {
        return reply(textContent.trim())
    }

    try {
        const media = getMenuMedia(category)
        if (media && media.buffer) {
            if (media.type === 'video') {
                await client.sendMessage(from, {
                    video: media.buffer,
                    caption: textContent.trim(),
                    gifPlayback: true,
                    mimetype: 'video/mp4'
                }, { quoted: info })
            } else {
                await client.sendMessage(from, {
                    image: media.buffer,
                    caption: textContent.trim()
                }, { quoted: info })
            }
        } else {
            await reply(textContent.trim())
        }
    } catch (e) {
        await reply(textContent.trim())
    }
}
