/**
 * Comando .voceprefere — dilema "você prefere A ou B?" com pares embutidos.
 */
const PARES = [
    ['terminal em dark mode pra sempre', 'IDE lento pra sempre'],
    ['programar sem Stack Overflow', 'programar sem Google'],
    ['bug em produção na sexta 18h', 'merge conflict gigante na segunda'],
    ['code review de 2000 linhas', 'reunião de 3 horas'],
    ['tabs', 'espaços'],
    ['front-end pelo resto da vida', 'back-end pelo resto da vida'],
    ['ter que documentar tudo', 'ler código sem nenhum comentário'],
    ['deploy manual', 'CI que quebra do nada'],
    ['viver sem café', 'viver sem fones de ouvido'],
    ['reescrever o projeto do zero', 'manter o legado pra sempre'],
    ['perder o Ctrl+Z', 'perder o Ctrl+C/Ctrl+V'],
    ['internet de 1 Mbps estável', 'internet de 1 Gbps que cai toda hora']
]

module.exports = {
    name: 'voceprefere',
    aliases: ['prefere', 'vcprefere', 'wouldyourather', 'ououdilema'],
    category: 'fun',
    subcategory: 'Diversão',
    description: 'Um dilema "você prefere A ou B?" (tema dev)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        const [a, b] = PARES[Math.floor(Math.random() * PARES.length)]
        return reply(`🤔 *VOCÊ PREFERE...*\n\n🅰️ ${a}\n\n*OU*\n\n🅱️ ${b}\n\n👉 _Responda A ou B e defenda sua escolha!_`)
    }
}
