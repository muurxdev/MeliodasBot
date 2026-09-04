const PDFDocument = require('pdfkit');
const { getBotName } = require('../../config/botConfig');
module.exports = {
    name: 'gerarpdf',
    aliases: ['pdfia', 'criarpdf', 'documentopdf'],
    category: 'general',
    description: 'Gera documento PDF a partir de qualquer tema ou texto fornecido',
    cooldownMs: 4000,
    execute: async ({ client, from, text, reply, info }) => {
        const botName = getBotName();
        const content = (text || 'Documento Oficial gerado por ' + botName).trim();
        const doc = new PDFDocument({ margin: 50 });
        const buffers = [];
        doc.on('data', b => buffers.push(b));
        doc.on('end', async () => {
            const pdfData = Buffer.concat(buffers);
            await client.sendMessage(from, {
                document: pdfData,
                mimetype: 'application/pdf',
                fileName: 'documento_' + Date.now() + '.pdf',
                caption: '📄 *PDF Gerado com Sucesso!*\n👑 *' + botName + '*'
            }, { quoted: info });
        });
        doc.fontSize(20).text(`${getBotName()} — DOCUMENTO`, { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(content);
        doc.end();
    }
};