/**
 * MeliodasBot — Owner Hierarchy Service
 * Gerencia a hierarquia militar dos 10 Donos do bot com regras rígidas de autorização:
 * • Capitão: Altera e remove todos os donos. Ninguém altera o Capitão.
 * • Tenente: Altera e remove todos abaixo dele (Sargento, Cabo, Soldado). Não altera o Capitão nem a si mesmo.
 */

const { getDatabase } = require("../database/connection");
const env = require("../config/env");
const logger = require("../core/logger");

// Hierarquia de 10 donos. Apenas Capitão (5) e Tenente (4) gerenciam a hierarquia
// (ver canModifyOwner); os demais são donos subordinados. O Capitão inicial é o
// dono do bot definido pela env BOT_OWNER_ID (o número NÃO fica no código —
// configure no seu .env); os outros slots são preenchidos via `.setdono`.
// O nome é resolvido AO VIVO do perfil do WhatsApp (pushName salvo em users.name).
const OWNER_JID = (process.env.BOT_OWNER_ID || "").trim();
const DEFAULT_OWNERS = [
    { rank: "Capitão",   level: 5, name: "", jid: OWNER_JID, phone: "", active: !!OWNER_JID },
    { rank: "Tenente",   level: 4, name: "", jid: "", phone: "", active: false },
    { rank: "Sargento",  level: 3, name: "", jid: "", phone: "", active: false },
    { rank: "Cabo",      level: 3, name: "", jid: "", phone: "", active: false },
    { rank: "Soldado",   level: 3, name: "", jid: "", phone: "", active: false },
    { rank: "Guardião",  level: 3, name: "", jid: "", phone: "", active: false },
    { rank: "Cavaleiro", level: 3, name: "", jid: "", phone: "", active: false },
    { rank: "Escudeiro", level: 3, name: "", jid: "", phone: "", active: false },
    { rank: "Aprendiz",  level: 3, name: "", jid: "", phone: "", active: false },
    { rank: "Recruta",   level: 3, name: "", jid: "", phone: "", active: false }
];

/**
 * Nome de exibição do dono, puxado AO VIVO do perfil do WhatsApp (nome verde
 * verificado = pushName salvo em users.name), com fallbacks.
 */
function resolveOwnerName(owner) {
    if (!owner || !owner.jid) return owner?.name || owner?.rank || "Dono";
    try {
        const userRepo = require("../database/repositories/userRepository");
        const digits = owner.jid.replace(/\D/g, "");
        const u = userRepo.getUser(owner.jid) || userRepo.getUser(digits + "@s.whatsapp.net");
        if (u && u.name) return u.name;
    } catch (_) {}
    return owner.name || owner.rank;
}

function normalizeRank(r) {
    return String(r || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

function getOwners() {
    try {
        const db = getDatabase();
        const row = db.prepare("SELECT settings FROM configs WHERE group_jid = ?").get("global_owners");
        if (row && row.settings) {
            const parsed = JSON.parse(row.settings);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed;
            }
        }
    } catch (_) {}
    return DEFAULT_OWNERS;
}

function saveOwners(ownersList) {
    try {
        const db = getDatabase();
        const stmt = db.prepare(`
            INSERT OR REPLACE INTO configs (group_jid, antilink, settings, updated_at)
            VALUES ('global_owners', 0, ?, CURRENT_TIMESTAMP)
        `);
        stmt.run(JSON.stringify(ownersList));
        logger.info("[OWNER SERVICE] Hierarquia dos Donos atualizada com sucesso.");
        return true;
    } catch (err) {
        logger.error("[OWNER SERVICE ERROR] Falha ao salvar donos:", err);
        return false;
    }
}

/**
 * Valida a autorização de modificação respeitando a hierarquia rígida
 * @param {string} senderJid
 * @param {string} targetRankQuery
 * @returns {{ allowed: boolean, reason?: string, senderRank?: any, targetOwner?: any }}
 */
function canModifyOwner(senderJid, targetRankQuery, candidates = []) {
    const owners = getOwners();
    let senderRank = getOwnerRank(senderJid, candidates);

    if (!senderRank) {
        return { allowed: false, reason: "⛔ *Acesso Negado:* Você não é um Dono cadastrado na hierarquia oficial." };
    }

    const normTarget = normalizeRank(targetRankQuery);
    const targetOwner = owners.find(o => normalizeRank(o.rank) === normTarget);

    if (!targetOwner) {
        return { allowed: false, reason: "❌ Patente `" + targetRankQuery + "` não encontrada. (Válidas: Capitão, Tenente, Sargento, Cabo, Soldado, Guardião, Cavaleiro, Escudeiro, Aprendiz, Recruta)" };
    }

    // REGRA 1: NINGUÉM ALTERA O CAPITÃO (Apenas o próprio Capitão)
    if (targetOwner.rank === "Capitão") {
        if (senderRank.rank !== "Capitão") {
            return { allowed: false, reason: "🛡️ *IMUNIDADE MÁXIMA:* Ninguém possui permissão para alterar, remover ou rebaixar o *Capitão*." };
        }
        return { allowed: true, senderRank, targetOwner };
    }

    // REGRA 2: O CAPITÃO PODE ALTERAR TODOS
    if (senderRank.rank === "Capitão") {
        return { allowed: true, senderRank, targetOwner };
    }

    // REGRA 3: O TENENTE ALTERA TODOS ABAIXO DELE (Sargento, Cabo, Soldado)
    if (senderRank.rank === "Tenente") {
        if (targetOwner.rank === "Tenente") {
            return { allowed: false, reason: "⚠️ O *Tenente* não pode alterar ou remover a si mesmo." };
        }
        if (targetOwner.level < senderRank.level) {
            return { allowed: true, senderRank, targetOwner };
        }
        return { allowed: false, reason: "⛔ O Tenente só tem permissão para gerenciar patentes abaixo dele (Sargento, Cabo, Soldado)." };
    }

    // REGRA 4: DEMAIS CARGOS NÃO ALTERAM DONOS
    return { allowed: false, reason: "⛔ *Acesso Restrito:* Apenas o *Capitão* e o *Tenente* têm autoridade para gerenciar a hierarquia de Donos." };
}

function updateOwner(rankQuery, newName, phone = "", jid = "", appointedBy = "") {
    const list = getOwners();
    const norm = normalizeRank(rankQuery);
    const owner = list.find(o => normalizeRank(o.rank) === norm);

    if (owner) {
        owner.name = newName;
        owner.active = true;
        owner.appointedBy = appointedBy || owner.appointedBy || "";
        owner.appointedAt = new Date().toLocaleDateString("pt-BR");
        const targetNumber = phone || jid;
        if (targetNumber) {
            const rawDigits = targetNumber.replace(/\D/g, "");
            if (rawDigits.length >= 8) {
                owner.phone = phone.startsWith("+") ? phone : ("+" + rawDigits);
                owner.jid = rawDigits + "@s.whatsapp.net";
            }
        }
        saveOwners(list);
        return owner;
    }
    return null;
}

function removeOwner(rankQuery) {
    const list = getOwners();
    const norm = normalizeRank(rankQuery);
    const owner = list.find(o => normalizeRank(o.rank) === norm);

    if (owner) {
        owner.name = "";
        owner.phone = "";
        owner.jid = "";
        owner.active = false;
        delete owner.customTitle;
        saveOwners(list);
        return owner;
    }
    return null;
}

function updateRankTitle(rankQuery, newTitle) {
    const list = getOwners();
    const norm = normalizeRank(rankQuery);
    const owner = list.find(o => normalizeRank(o.rank) === norm || (o.customTitle && normalizeRank(o.customTitle) === norm));

    if (owner) {
        owner.customTitle = newTitle ? newTitle.trim() : "";
        saveOwners(list);
        return owner;
    }
    return null;
}

function resetRankTitle(rankQuery) {
    const list = getOwners();
    const norm = normalizeRank(rankQuery);
    const owner = list.find(o => normalizeRank(o.rank) === norm || (o.customTitle && normalizeRank(o.customTitle) === norm));

    if (owner) {
        delete owner.customTitle;
        saveOwners(list);
        return owner;
    }
    return null;
}

function resolveAllCandidateDigits(jid, candidates = []) {
    const set = new Set();
    const list = [jid, ...(Array.isArray(candidates) ? candidates : [candidates])].filter(Boolean);
    
    for (const item of list) {
        if (!item || typeof item !== "string") continue;
        const clean = item.split(":")[0].split("@")[0].replace(/\D/g, "");
        if (clean.length >= 8) set.add(clean);
    }

    // Se houver algum item com @lid, tenta buscar o telefone real no SQLite
    for (const item of list) {
        if (typeof item === "string" && item.endsWith("@lid")) {
            try {
                const db = getDatabase();
                const row = db.prepare("SELECT phone, jid FROM users WHERE lid = ? OR jid = ?").get(item, item);
                if (row) {
                    if (row.phone) set.add(row.phone.replace(/\D/g, ""));
                    if (row.jid) set.add(row.jid.split("@")[0].replace(/\D/g, ""));
                }
            } catch (_) {}
        }
    }

    return Array.from(set);
}

function isOwner(jid, candidates = []) {
    if (!jid) return false;
    if (env.isOwnerJid(jid)) return true;
    const allDigits = resolveAllCandidateDigits(jid, candidates);
    if (allDigits.some(d => env.isOwnerJid(d + "@s.whatsapp.net"))) return true;

    const owners = getOwners();
    return owners.some(o => {
        if (!o.active || !o.jid) return false;
        const ownerDigits = o.jid.replace(/\D/g, "");
        return allDigits.some(d => ownerDigits.includes(d) || d.includes(ownerDigits));
    });
}

function getOwnerRank(jid, candidates = []) {
    if (!jid) return null;
    const allDigits = resolveAllCandidateDigits(jid, candidates);
    const owners = getOwners();

    for (const o of owners) {
        if (!o.active || !o.jid) continue;
        const ownerDigits = o.jid.replace(/\D/g, "");
        if (allDigits.some(d => ownerDigits.includes(d) || d.includes(ownerDigits))) {
            return o;
        }
    }

    // Fallback: se estiver no .env mas não registrado explicitamente na lista
    if (env.isOwnerJid(jid) || allDigits.some(d => env.isOwnerJid(d + "@s.whatsapp.net"))) {
        return owners.find(o => o.rank === "Capitão") || { rank: "Capitão", level: 5, name: "", active: true };
    }

    return null;
}

module.exports = {
    DEFAULT_OWNERS,
    getOwners,
    saveOwners,
    canModifyOwner,
    updateOwner,
    updateOwnerName: updateOwner,
    removeOwner,
    updateRankTitle,
    resetRankTitle,
    isOwner,
    resolveOwnerName,
    getOwnerRank
};
