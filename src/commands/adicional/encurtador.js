/**
 * Comando .encurtador / .desencurtar
 * Expande links encurtados, revela destino final e checa segurança básica
 */

module.exports = {
    name: 'encurtador',
    aliases: ['desencurtar', 'expandir', 'unshorten', 'revelarlink'],
    category: 'adicional',
    subcategory: '⚡ RECURSOS & COMANDOS ADICIONAIS',
    description: 'Expande links encurtados revelando para onde redirecionam com segurança',
    cooldownMs: 3000,
    execute: async ({ reply, args, prefix = '.' }) => {
        let url = (args[0] || '').trim();
        if (!url) {
            return reply(`🔗 *Expansor de Links Encurtados*\n\nUse: \`${prefix}encurtador <link>\`\n\n💡 *Exemplo:* \`${prefix}encurtador https://bit.ly/3xyz\``);
        }

        if (!/^https?:\/\//i.test(url)) url = 'https://' + url;

        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 6000);

            const res = await fetch(url, {
                method: 'HEAD',
                redirect: 'follow',
                signal: controller.signal
            });
            clearTimeout(timeout);

            const destino = res.url || url;
            const status = res.status;
            const redirecionou = destino !== url;

            let doc = `╔══════════════════════════════╗\n`;
            doc += `║     🔗 *ANÁLISE DE LINK* 🔗     ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `📥 *Link Enviado:* \`${url}\`\n`;
            doc += `🌐 *Destino Real:* \`${destino}\`\n`;
            doc += `📡 *Status HTTP:* ${status}\n`;
            doc += `🔀 *Redirecionamento:* ${redirecionou ? 'Sim (Link mascarado)' : 'Direto'}\n\n`;
            doc += `🛡️ _Sempre verifique o domínio de destino antes de inserir senhas ou dados!_`;

            return reply(doc.trim());
        } catch (err) {
            return reply(`❌ Não foi possível inspecionar o link: ${err.message}`);
        }
    }
};