/**
 * Pinterest Media Provider
 */

const BaseProvider = require('./baseProvider')
const { PLATFORMS } = require('../constants')

class PinterestProvider extends BaseProvider {
    constructor() {
        super(PLATFORMS.PINTEREST)
    }

    match(url) {
        if (!url || typeof url !== 'string') return false
        const lower = url.toLowerCase()
        return lower.includes('pinterest.com/pin/') || lower.includes('pin.it/')
    }

    normalizeUrl(url) {
        try {
            const parsed = new URL(url)
            return `${parsed.origin}${parsed.pathname}`
        } catch (_) {
            return url
        }
    }
}

module.exports = PinterestProvider

