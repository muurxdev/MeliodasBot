/**
 * Serviço de saudações de grupo (welcome / leave)
 *
 * Fonte ÚNICA das mensagens de entrada/saída. Tanto o handler de eventos real
 * quanto os comandos `.welcome -config` / `.leave -config` usam estas funções,
 * garantindo que a pré-visualização mostre EXATAMENTE o que o membro verá, com
 * os dados reais do usuário e do grupo.
 */

const { getBotName } = require("../config/botConfig");

/** Substitui as variáveis {user}, {grupo}, {desc}, {membros}, {hora} no template. */
function formatTemplate(tpl, { userTag, groupName, groupDesc, memberCount, timeStr }) {
    return String(tpl)
        .replace(/\{user\}/gi, userTag)
        .replace(/\{usuario\}/gi, userTag)
        .replace(/\{membro\}/gi, userTag)
        .replace(/\{grupo\}/gi, groupName)
        .replace(/\{nome\}/gi, groupName)
        .replace(/\{desc\}/gi, groupDesc || "Sem descrição")
        .replace(/\{membros\}/gi, String(memberCount))
        .replace(/\{hora\}/gi, timeStr);
}

/**
 * Coleta as variáveis reais do grupo e do participante.
 * @param {object} client - socket
 * @param {string} groupJid
 * @param {string} participantJid - membro alvo (novo/removido, ou quem testa)
 */
async function getGreetingVars(client, groupJid, participantJid) {
    let groupName = "Grupo";
    let groupDesc = "";
    let memberCount = 0;
    try {
        const meta = await client.groupMetadata(groupJid);
        if (meta?.subject) groupName = meta.subject;
        if (meta?.desc) groupDesc = meta.desc;
        if (Array.isArray(meta?.participants)) memberCount = meta.participants.length;
    } catch (_) {}

    const userNumber = String(participantJid || "").split("@")[0].split(":")[0];
    return {
        userTag: "@" + userNumber,
        groupName,
        groupDesc,
        memberCount,
        timeStr: new Date().toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo" })
    };
}

/** Mensagem de boas-vindas (custom via template, ou o padrão oficial). */
function buildWelcomeMessage(groupConfig, vars) {
    if (groupConfig && groupConfig.welcomeMessage) {
        return formatTemplate(groupConfig.welcomeMessage, vars);
    }
    const bot = getBotName();
    let t = "╔══════════════════════════════╗\n";
    t += "║   🎉 *SEJA BEM-VINDO(A)!* 🎉   ║\n";
    t += "╚══════════════════════════════╝\n\n";
    t += "👋 Olá " + vars.userTag + "! Seja muito bem-vindo(a) ao grupo *" + vars.groupName + "*!\n\n";
    if (vars.groupDesc) t += "📜 *Regras/Descrição:* " + vars.groupDesc + "\n\n";
    t += "👥 *Membros agora:* " + vars.memberCount + " | 🕒 *Entrou às:* " + vars.timeStr + "\n\n";
    t += "📖 *Dicas do " + bot + ":*\n";
    t += "• Digite `.menu` para ver as categorias de comandos.\n";
    t += "• Digite `.dossie` para ver seu dossiê, ranking e status.\n\n";
    t += "⚔️ _Divirta-se e respeite as regras do grupo!_";
    return t;
}

/** Mensagem de despedida (custom via template, ou o padrão oficial). */
function buildLeaveMessage(groupConfig, vars) {
    if (groupConfig && groupConfig.leaveMessage) {
        return formatTemplate(groupConfig.leaveMessage, vars);
    }
    let t = "╔══════════════════════════════╗\n";
    t += "║      👋 *ATÉ LOGO...* 👋      ║\n";
    t += "╚══════════════════════════════╝\n\n";
    t += "👋 O membro " + vars.userTag + " saiu ou foi removido do grupo *" + vars.groupName + "*.\n\n";
    t += "👥 *Membros restantes:* " + vars.memberCount + " | 🕒 *Saiu às:* " + vars.timeStr + "\n\n";
    t += "🐉 _Que os Sete Pecados Capitais guiem seus passos!_";
    return t;
}

/** Guia das variáveis e subcomandos (o "processo" que o admin encaixa). */
function variableGuide(type) {
    const cmd = type === "leave" ? "leave" : "welcome";
    let g = "╭━〔 🔤 VARIÁVEIS DO TEMPLATE 〕━⬣\n";
    g += "┃ • `{user}` ➔ marca o membro (@user)\n";
    g += "┃ • `{grupo}` ➔ nome real do grupo\n";
    g += "┃ • `{desc}` ➔ descrição/regras do grupo\n";
    g += "┃ • `{membros}` ➔ total de membros\n";
    g += "┃ • `{hora}` ➔ horário do evento\n";
    g += "╰━━━━━━━━━━━━━━━━━━⬣\n\n";
    g += "╭━〔 ⚙️ COMANDOS 〕━⬣\n";
    g += "┃ • `." + cmd + " on` / `." + cmd + " off`\n";
    g += "┃ • `." + cmd + " msg <texto>` ➔ personalizar\n";
    g += "┃ • `." + cmd + " reset` ➔ voltar ao padrão\n";
    g += "┃ • `." + cmd + " -config` ➔ este painel\n";
    g += "╰━━━━━━━━━━━━━━━━━━⬣";
    return g;
}

module.exports = {
    formatTemplate,
    getGreetingVars,
    buildWelcomeMessage,
    buildLeaveMessage,
    variableGuide
};
