/**
 * Owner Hierarchy Service
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
 * Nome do PERFIL do dono (nick personalizado), exibido APENAS na lista de donos.
 * Prioridade: nick fixo salvo no owner -> OWNER_PROFILE_NAME (do dono via .env,
 * só para o Capitão/dono principal) -> pushName do WhatsApp -> patente.
 */
function resolveOwnerName(owner) {
    if (!owner || !owner.jid) return owner?.name || owner?.rank || "Dono";
    // 1. nick fixo definido para este dono (via .setdono / saveOwners)
    if (owner.name) return owner.name;
    // 2. nick de perfil do dono principal (env), só quando bate com o OWNER_JID
    const profileNick = (process.env.OWNER_PROFILE_NAME || "").trim();
    if (profileNick && OWNER_JID && owner.jid.replace(/\D/g, "") === OWNER_JID.replace(/\D/g, "")) {
        return profileNick;
    }
    // 3. pushName real do WhatsApp
    try {
        const userRepo = require("../database/repositories/userRepository");
        const digits = owner.jid.replace(/\D/g, "");
        const u = userRepo.getUser(owner.jid) || userRepo.getUser(digits + "@s.whatsapp.net");
        if (u && u.name) return u.name;
    } catch (_) {}
    return owner.rank;
}

/** Nick de perfil do dono principal (para exibição em .dono e no perfil do dono). */
function getOwnerProfileName() {
    return (process.env.OWNER_PROFILE_NAME || "").trim() || null;
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
 * Localiza um dono ou patente na hierarquia oficial a partir de:
 * • JID ou LID (@s.whatsapp.net ou @lid)
 * • Dígitos de telefone (5511...)
 * • Nome da patente base (Capitão, Tenente, Sargento...)
 * • Título personalizado (customTitle)
 * • Nome registrado no cargo (owner.name)
 * • Nick registrado no perfil do bot (display_nick) ou nome do WhatsApp (pushName)
 * @param {string} query
 * @param {Array<string>} [candidates]
 * @returns {object|null}
 */
function findOwnerByQuery(query, candidates = []) {
    if (!query) return null;
    const owners = getOwners();
    const queryStr = String(query).trim();
    const norm = normalizeRank(queryStr);
    const rawDigits = queryStr.replace(/\D/g, "");

    // 1. Busca por Patente base
    let found = owners.find(o => normalizeRank(o.rank) === norm);
    if (found) return found;

    // 2. Busca por Título Customizado (customTitle)
    found = owners.find(o => o.customTitle && normalizeRank(o.customTitle) === norm);
    if (found) return found;

    // 3. Busca por Dígitos de Telefone ou JID/LID direto
    const allDigits = new Set();
    if (rawDigits.length >= 8) allDigits.add(rawDigits);
    if (Array.isArray(candidates)) {
        for (const c of candidates) {
            if (typeof c === "string") {
                const d = c.replace(/\D/g, "");
                if (d.length >= 8) allDigits.add(d);
            }
        }
    }

    if (allDigits.size > 0) {
        found = owners.find(o => {
            if (!o.active) return false;
            const jidDigits = (o.jid || "").replace(/\D/g, "");
            const phoneDigits = (o.phone || "").replace(/\D/g, "");
            for (const d of allDigits) {
                if ((jidDigits && (jidDigits.includes(d) || d.includes(jidDigits))) ||
                    (phoneDigits && (phoneDigits.includes(d) || d.includes(phoneDigits)))) {
                    return true;
                }
            }
            return false;
        });
        if (found) return found;

        // Tenta resolver por user_identities ou tabela users do SQLite
        try {
            const db = getDatabase();
            for (const d of allDigits) {
                const row = db.prepare("SELECT jid, lid, phone FROM users WHERE jid = ? OR lid = ? OR phone LIKE ?").get(queryStr, queryStr, `%${d}%`);
                if (row) {
                    const uDigits = [row.phone, row.jid, row.lid].filter(Boolean).map(s => s.replace(/\D/g, "")).filter(x => x.length >= 8);
                    found = owners.find(o => {
                        if (!o.active) return false;
                        const jidDigits = (o.jid || "").replace(/\D/g, "");
                        const phoneDigits = (o.phone || "").replace(/\D/g, "");
                        return uDigits.some(ud => ud && (jidDigits.includes(ud) || ud.includes(jidDigits) || phoneDigits.includes(ud) || ud.includes(phoneDigits)));
                    });
                    if (found) return found;
                }
            }
        } catch (_) {}
    }

    // 4. Busca por nome registrado no cargo (owner.name)
    found = owners.find(o => o.active && o.name && (normalizeRank(o.name) === norm || normalizeRank(o.name).includes(norm)));
    if (found) return found;

    // 5. Busca por nick de perfil do bot (display_nick) ou nome do WhatsApp (pushName)
    try {
        const db = getDatabase();
        const userRow = db.prepare("SELECT jid, phone, lid FROM users WHERE LOWER(display_nick) = LOWER(?) OR LOWER(name) = LOWER(?)").get(queryStr, queryStr);
        if (userRow) {
            const uDigits = [userRow.phone, userRow.jid, userRow.lid].filter(Boolean).map(s => s.replace(/\D/g, "")).filter(x => x.length >= 8);
            found = owners.find(o => {
                if (!o.active) return false;
                const jidDigits = (o.jid || "").replace(/\D/g, "");
                const phoneDigits = (o.phone || "").replace(/\D/g, "");
                return uDigits.some(ud => ud && (jidDigits.includes(ud) || ud.includes(jidDigits) || phoneDigits.includes(ud) || ud.includes(phoneDigits)));
            });
            if (found) return found;
        }
    } catch (_) {}

    return null;
}

/**
 * Valida a autorização de modificação respeitando a hierarquia militar rígida:
 * • Capitão: Imune a todos. Apenas o Capitão gerencia outros e a si mesmo.
 * • Tenente: Gerencia apenas subordinados abaixo dele (nível < 4).
 * • Demais: Sem autorização de modificação.
 * @param {string} senderJid
 * @param {string|object} targetOwnerOrRank
 * @param {Array<string>} [candidates]
 * @returns {{ allowed: boolean, reason?: string, senderRank?: any, targetOwner?: any }}
 */
function canModifyOwner(senderJid, targetOwnerOrRank, candidates = []) {
    const owners = getOwners();
    let senderRank = getOwnerRank(senderJid, candidates);

    if (!senderRank) {
        return { allowed: false, reason: "⛔ *Acesso Negado:* Você não é um Dono cadastrado na hierarquia oficial." };
    }

    let targetOwner = null;
    if (typeof targetOwnerOrRank === "object" && targetOwnerOrRank !== null && targetOwnerOrRank.rank) {
        targetOwner = owners.find(o => normalizeRank(o.rank) === normalizeRank(targetOwnerOrRank.rank)) || targetOwnerOrRank;
    } else {
        const normTarget = normalizeRank(targetOwnerOrRank);
        targetOwner = owners.find(o => normalizeRank(o.rank) === normTarget || (o.customTitle && normalizeRank(o.customTitle) === normTarget));
    }

    if (!targetOwner) {
        return { allowed: false, reason: "❌ Patente ou Dono `" + targetOwnerOrRank + "` não encontrado na hierarquia oficial. (Válidas: Capitão, Tenente, Sargento, Cabo, Soldado, Guardião, Cavaleiro, Escudeiro, Aprendiz, Recruta)" };
    }

    // REGRA 1: NINGUÉM ALTERA O CAPITÃO (Apenas o próprio Capitão)
    if (targetOwner.rank === "Capitão") {
        if (senderRank.rank !== "Capitão") {
            return { allowed: false, reason: "🛡️ *IMUNIDADE MÁXIMA:* Ninguém possui autoridade para alterar, remover ou rebaixar o *Capitão* (Comandante Supremo)." };
        }
        // Proteção contra auto-destruição: o Capitão principal não se auto-remove acidentalmente
        const senderDigits = (senderJid || "").replace(/\D/g, "");
        const targetDigits = (targetOwner.jid || "").replace(/\D/g, "");
        if (OWNER_JID && targetDigits && OWNER_JID.replace(/\D/g, "") === targetDigits && senderDigits === targetDigits) {
            return { allowed: false, reason: "⚠️ *Operação Bloqueada:* O Comandante Supremo não pode remover a si mesmo da hierarquia principal." };
        }
        return { allowed: true, senderRank, targetOwner };
    }

    // REGRA 2: O CAPITÃO PODE ALTERAR TODOS
    if (senderRank.rank === "Capitão") {
        return { allowed: true, senderRank, targetOwner };
    }

    // REGRA 3: O TENENTE ALTERA TODOS ABAIXO DELE (Sargento, Cabo, Soldado, Guardião, Cavaleiro...)
    if (senderRank.rank === "Tenente") {
        if (targetOwner.rank === "Tenente") {
            return { allowed: false, reason: "⚠️ O *Tenente* não pode alterar ou remover a si mesmo nem outro Tenente." };
        }
        if (targetOwner.level < senderRank.level) {
            return { allowed: true, senderRank, targetOwner };
        }
        return { allowed: false, reason: "⛔ O Tenente só tem autoridade para gerenciar patentes abaixo dele (Sargento, Cabo, Soldado, Guardião, etc.)." };
    }

    // REGRA 4: DEMAIS CARGOS NÃO ALTERAM DONOS
    return { allowed: false, reason: "⛔ *Acesso Restrito:* Apenas o *Capitão* e o *Tenente* têm autoridade para gerenciar ou remover Donos na hierarquia." };
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

/**
 * Extrai todos os detalhes profundos do perfil do dono no banco de dados SQLite e WhatsApp:
 * • Nick oficial cadastrado no bot via .login (display_nick)
 * • Nome pushName verificado do WhatsApp (name)
 * • Nome registrado no cargo oficial (owner.name)
 * • Telefone e JID canônico
 * • Patente, título personalizado e histórico de nomeação
 * @param {object} targetOwner
 * @param {Array<string>} [extraCandidates]
 * @returns {object}
 */
function resolveOwnerProfileDetails(targetOwner, extraCandidates = []) {
    if (!targetOwner) return null;
    let displayNick = null;
    let pushName = null;
    let phone = targetOwner.phone || null;
    let jid = targetOwner.jid || null;

    try {
        const db = getDatabase();
        const candidateDigits = resolveAllCandidateDigits(jid, extraCandidates);
        let userRow = null;

        if (jid) {
            userRow = db.prepare("SELECT * FROM users WHERE jid = ? OR lid = ?").get(jid, jid);
        }
        if (!userRow && candidateDigits.length > 0) {
            for (const d of candidateDigits) {
                userRow = db.prepare("SELECT * FROM users WHERE phone LIKE ? OR jid LIKE ?").get(`%${d}%`, `%${d}%`);
                if (userRow) break;
            }
        }
        if (!userRow && targetOwner.name) {
            userRow = db.prepare("SELECT * FROM users WHERE LOWER(display_nick) = LOWER(?) OR LOWER(name) = LOWER(?)").get(targetOwner.name, targetOwner.name);
        }

        if (userRow) {
            displayNick = userRow.display_nick || null;
            pushName = userRow.name || null;
            if (!phone && userRow.phone) phone = userRow.phone;
            if (!jid && userRow.jid) jid = userRow.jid;
        }
    } catch (_) {}

    return {
        displayNick,
        pushName,
        ownerName: targetOwner.name || null,
        phone,
        jid,
        rank: targetOwner.rank,
        customTitle: targetOwner.customTitle || null,
        level: targetOwner.level,
        appointedBy: targetOwner.appointedBy || null,
        appointedAt: targetOwner.appointedAt || null
    };
}

/**
 * Desocupa o slot de dono na hierarquia oficial e limpa os cargos relacionais e de trust
 * @param {object} targetOwner
 * @param {object} senderRank
 * @param {string} actorJid
 * @returns {object|null}
 */
function demoteOwnerComplete(targetOwner, senderRank, actorJid) {
    if (!targetOwner) return null;
    const owners = getOwners();
    const normRank = normalizeRank(targetOwner.rank);
    const slot = owners.find(o => normalizeRank(o.rank) === normRank);
    if (!slot) return null;

    const previousData = {
        rank: slot.rank,
        level: slot.level,
        name: slot.name,
        phone: slot.phone,
        jid: slot.jid,
        customTitle: slot.customTitle || null,
        appointedBy: slot.appointedBy || null,
        appointedAt: slot.appointedAt || null
    };

    slot.active = false;
    slot.name = "";
    slot.phone = "";
    slot.jid = "";
    delete slot.customTitle;
    delete slot.appointedBy;
    delete slot.appointedAt;
    saveOwners(owners);

    if (previousData.jid) {
        try {
            const permissionRepo = require("../database/repositories/permissionRepository");
            permissionRepo.removeUserRole(previousData.jid);
            permissionRepo.setTrusted(previousData.jid, false);

            const digits = previousData.jid.replace(/\D/g, "");
            if (digits) {
                permissionRepo.removeUserRole(digits + "@s.whatsapp.net");
                permissionRepo.setTrusted(digits + "@s.whatsapp.net", false);
            }
        } catch (pErr) {
            logger.warn(`[OWNER SERVICE] Falha ao remover cargo relacional: ${pErr.message}`);
        }
    }

    logger.info(`[OWNER DEMOTE] Patente ${previousData.rank} desocupada por ${senderRank?.rank || 'Dono'} (${actorJid}).`);
    return previousData;
}

module.exports = {
    DEFAULT_OWNERS,
    getOwners,
    saveOwners,
    findOwnerByQuery,
    canModifyOwner,
    updateOwner,
    updateOwnerName: updateOwner,
    removeOwner,
    demoteOwnerComplete,
    resolveOwnerProfileDetails,
    updateRankTitle,
    resetRankTitle,
    isOwner,
    resolveOwnerName,
    getOwnerProfileName,
    getOwnerRank
};
