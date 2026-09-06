/** The id the page was opened with, if any. */
const hashTarget = (): string | null => {
    if (typeof location === 'undefined') return null
    return decodeURIComponent(location.hash.slice(1)) || null
}

/**
 * `replaceState` over the current history state — rather than a new entry — keeps the back
 * button and the browser's history intact while the hash follows the scroll. A framework
 * router that owns the history stack passes its own writer instead.
 */
const writeHashTarget = (id: string, replaceHash?: (hash: string) => void): void => {
    if (hashTarget() === id) return
    const hash = `#${encodeURIComponent(id)}`
    if (replaceHash) {
        replaceHash(hash)
        return
    }
    history.replaceState(history.state, '', hash)
}

export { hashTarget, writeHashTarget }
