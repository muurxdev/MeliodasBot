/**
 * MeliodasBot — Comando .titulos / .titulo / .conquistas
 * Consulta, desbloqueio e equipamento de títulos de honra com persistência SQLite
 */

const dataService = require("../../services/dataService");
const { initializeUser } = require("../../services/xpService");
const { getAllTitles, getUserTitles, getTitleById, unlockUserTitle } = require("../../database/repositories/titleRepository");
const { renderCard } = require("../../utils/uiEngine");

module.exports = {
    name: "titulos",
    aliases: ["titulo", "tituloshonra", "conquistasrpg", "titulosgloria", "titulosperfil", "meustitulos"],
    category: "rpg",
    description: "Consulta, desbloqueia e equipa títulos lendários de honra no seu perfil",
    cooldownMs: 2000,
    execute: async ({ sender, args, reply }) => {
        const xpData = dataService.getXpData();
        const user = initializeUser(sender, xpData);

        const sub = (args[0] || "").toLowerCase().trim();
        const param = (args[1] || "").toLowerCase().trim();

        // 1. Auto-verificação de títulos por nível e progresso
        const userLvl = user.level || 1;
        if (userLvl >= 5) unlockUserTitle(sender, 'iniciante');
        if (userLvl >= 50) unlockUserTitle(sender, 'senhor_pecados');
        if (userLvl >= 100) unlockUserTitle(sender, 'mandamento_supremo');
        if ((user.forgeLevel || 0) >= 5) unlockUserTitle(sender, 'mestre_forjador');

        const unlocked = getUserTitles(sender);
        const unlockedIds = new Set(unlocked.map(t => t.id));

        // 2. EQUIPAR UM TÍTULO DESBLOQUEADO
        if (sub === "equipar" || sub === "usar" || sub === "set") {
            if (!param) {
                return reply("📌 *Uso:* `.titulo equipar <id_do_titulo>`\n👉 *Exemplo:* `.titulo equipar iniciante`\n\n💡 _Digite_ `.titulos` _para ver os IDs disponíveis._");
            }

            const targetTitle = getTitleById(param);
            if (!targetTitle) {
                return reply(`❌ Título com ID *"${param}"* não encontrado no catálogo.`);
            }

            if (!unlockedIds.has(param)) {
                return reply(`🔒 Você ainda não desbloqueou o título *"${targetTitle.name}"*!\n\n📜 *Requisito:* ${targetTitle.requirement}`);
            }

            user.equippedTitle = targetTitle.name;
            user.titulo = targetTitle.name;
            dataService.saveUser(user);

            const doc = renderCard({
                title: "TÍTULO EQUIPADO COM SUCESSO",
                icon: "🎖️",
                subtitle: `👑 *Novo Título Ativo:* ${targetTitle.name}`,
                sections: [
                    {
                        title: "BÔNUS DE COMBATE",
                        icon: "⚔️",
                        fields: [
                            { label: "Raridade", value: targetTitle.rarity, icon: "✨" },
                            { label: "Bônus de ATK", value: `+${targetTitle.bonus_atk}`, icon: "🗡️" },
                            { label: "Bônus de DEF", value: `+${targetTitle.bonus_def}`, icon: "🛡️" },
                            { label: "Bônus de CP", value: `+${targetTitle.bonus_cp}`, icon: "⚡" }
                        ]
                    }
                ],
                tip: "Seu título será exibido com destaque nos comandos .perfil, .dossie e .status!",
                mentions: [sender]
            });

            return reply(doc, [sender]);
        }

        // 3. MEUS TÍTULOS DESBLOQUEADOS
        if (sub === "meus" || sub === "desbloqueados") {
            let myFields = [];
            if (unlocked.length === 0) {
                myFields.push("Você ainda não possui títulos desbloqueados.");
            } else {
                for (const t of unlocked) {
                    const isEquipped = user.equippedTitle === t.name;
                    myFields.push(`${t.name} ${isEquipped ? "👑 *(Equipado)*" : `\`.titulo equipar ${t.id}\``}\n   ┗ ⚔️ +${t.bonus_atk} ATK | 🛡️ +${t.bonus_def} DEF | ⚡ +${t.bonus_cp} CP`);
                }
            }

            const doc = renderCard({
                title: "MEUS TÍTULOS DE HONRA",
                icon: "🎖️",
                subtitle: `👤 *Guerreiro:* @${sender.split("@")[0]} | 🎖️ *Desbloqueados:* ${unlocked.length}`,
                sections: [
                    {
                        title: "SEUS TÍTULOS CONQUISTADOS",
                        icon: "📜",
                        fields: myFields
                    }
                ],
                tip: "Use .titulo equipar <id> para ativar os bônus no seu perfil!",
                mentions: [sender]
            });

            return reply(doc, [sender]);
        }

        // 4. CATÁLOGO GERAL DE TÍTULOS
        const all = getAllTitles();
        let catFields = [];
        for (const t of all) {
            const hasIt = unlockedIds.has(t.id);
            const statusIcon = hasIt ? "🟢 [DESBLOQUEADO]" : "🔒 [BLOQUEADO]";
            catFields.push(`*${t.name}* (${t.rarity}) — ${statusIcon}\n   ┗ 🆔 \`${t.id}\` | Requisito: _${t.requirement}_\n   ┗ ⚔️ +${t.bonus_atk} ATK | 🛡️ +${t.bonus_def} DEF | ⚡ +${t.bonus_cp} CP`);
        }

        const doc = renderCard({
            title: "CATÁLOGO DE TÍTULOS DE HONRA",
            icon: "🎖️",
            subtitle: `🎖️ *Seus Desbloqueados:* ${unlocked.length} de ${all.length} títulos`,
            sections: [
                {
                    title: "TÍTULOS DISPONÍVEIS",
                    icon: "📜",
                    fields: catFields
                },
                {
                    title: "COMO EQUIPAR",
                    icon: "⚙️",
                    fields: [
                        "👉 `.titulo equipar <id>` ➔ Equipar um título desbloqueado",
                        "👉 `.titulos meus` ➔ Ver apenas os títulos que você conquistou"
                    ]
                }
            ],
            tip: "Evolua no RPG para desbloquear títulos míticos e elevar seu Poder de Combate (CP)!",
            mentions: [sender]
        });

        return reply(doc, [sender]);
    }
};
