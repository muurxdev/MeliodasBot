const env = require('../config/env')

const logger = {
    error: (msg, err = '') => console.error(`[ERROR] ${new Date().toISOString()} ${msg}`, err?.stack || err?.message || err || ''),
    warn: (msg) => console.warn(`[WARN] ${new Date().toISOString()} ${msg}`),
    info: (msg) => console.log(`[INFO] ${new Date().toISOString()} ${msg}`),
    debug: (msg) => (env.debug) && console.log(`[DEBUG] ${new Date().toISOString()} ${msg}`)
}

module.exports = logger

