/**
 * Comando .geradorqr / .qrcode
 * Gera QR Code instantâneo em alta definição a partir de qualquer texto ou link
 */

module.exports = {
    name: 'geradorqr',
    aliases: ['criarqr', 'makeqr', 'gerarqrcode'],
    category: 'adicional',
    subcategory: '⚡ RECURSOS & COMANDOS ADICIONAIS',
    description: 'Gera um QR Code nítido para links, chaves Pix ou textos',
    cooldownMs: 3000,
    execute: async ({ reply, client, from, args, prefix = '.' }) => {
        const text = args.join(' ').trim();
        if (!text) {
            return reply(`📱 *Gerador de QR Code*\n\nUse: \`${prefix}geradorqr <link, texto ou chave pix>\`\n\n💡 *Exemplo:* \`${prefix}geradorqr https://github.com\``);
        }

        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${encodeURIComponent(text)}&margin=10`;

        try {
            const res = await fetch(qrUrl);
            if (!res.ok) throw new Error('Falha na API de QR Code');
            const buffer = Buffer.from(await res.arrayBuffer());

            let caption = `╔══════════════════════════════╗\n`;
            caption += `║      📱 *QR CODE GERADO* 📱      ║\n`;
            caption += `╚══════════════════════════════╝\n\n`;
            caption += `📝 *Conteúdo:* \`${text.slice(0, 100)}\`\n`;
            caption += `📐 *Resolução:* 512x512 px\n`;
            caption += `✨ Aponte a câmera do celular para escanear!`;

            await client.sendMessage(from, { image: buffer, caption: caption.trim() });
        } catch (err) {
            return reply(`❌ Não foi possível gerar o QR Code no momento: ${err.message}`);
        }
    }
};