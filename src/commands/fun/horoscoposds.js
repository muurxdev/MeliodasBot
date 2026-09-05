/**
 * Comando .horoscoposds — Descubra qual Pecado Capital rege o seu signo: .horoscoposds <signo>
 */
module.exports = {
    name: "horoscoposds",
    aliases: [],
    category: "fun",
    subcategory: "Horóscopo",
    description: "Descubra qual Pecado Capital rege o seu signo: .horoscoposds <signo>",
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
            const signo = (args[0] || "").toLowerCase();
            const mapa = {
                aries: "Ira do Dragão (Meliodas) — Fúria indomável e liderança nata!",
                touro: "Gula do Javali (Merlin) — Sede insaciável por conhecimento e conforto.",
                gemeos: "Inveja da Serpente (Diane) — Emoções intensas e conexão com a terra.",
                cancer: "Orgulho do Leão (Escanor) — Brilho protetor que queima os adversários!",
                leao: "Orgulho Supremo do Sol (Escanor) — O pináculo de todas as raças!",
                virgem: "Luxúria da Cabra (Gowther) — Análise lógica apurada e busca pelo coração.",
                libra: "Preguiça do Urso (King) — Equilíbrio espiritual e apego aos que ama.",
                escorpiao: "Ganância da Raposa (Ban) — Determinação feroz e sobrevivência eterna!",
                sagitario: "Mandamento da Piedade (Zeldris) — Justiça implacável e foco absoluto.",
                capricornio: "Mandamento da Verdade (Galand) — Disciplina de pedra e código de honra.",
                aquario: "Mandamento do Repouso (Gloxinia) — Criatividade livre e visão transcendental.",
                peixes: "Bênção das Deusas (Elizabeth) — Empatia divina e cura espiritual."
            };
            const res = mapa[signo] || "Ira do Dragão (Meliodas) — Poder misterioso e alma leal!";
            return reply(`🌌 *HORÓSCOPO DE BRITANNIA*\nSigno: *${signo || "Geral"}*\n▫️ Regência: *${res}*`);
        }
};
