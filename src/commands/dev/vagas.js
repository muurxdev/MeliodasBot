module.exports = {
    name: 'vagas',
    aliases: ['jobs'],
    category: 'dev',
    description: 'Principais plataformas de vagas de tecnologia',
    execute: async ({ reply }) => {
        const vagas = `💼 *PLATAFORMAS DE VAGAS DEV:*

🌐 *LinkedIn Jobs:* https://linkedin.com/jobs
🌐 *GitHub Careers:* https://github.careers
🌐 *We Work Remotely:* https://weworkremotely.com
🌐 *Remote OK:* https://remoteok.com
🌐 *ProgramaThor:* https://programathor.com.br/jobs`
        await reply(vagas)
    }
}