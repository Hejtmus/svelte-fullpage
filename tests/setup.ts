import { beforeEach, vi } from 'vitest'

interface ObserverStub {
    root: Element | null,
    callback: IntersectionObserverCallback,
    targets: Set<Element>
}

const observers: ObserverStub[] = []

// jsdom has neither of the two browser APIs the library leans on, so both are stubbed here and
// driven by hand from the tests
class IntersectionObserverStub {
    #stub: ObserverStub

    constructor (callback: IntersectionObserverCallback, options: IntersectionObserverInit = {}) {
        this.#stub = { root: (options.root as Element) ?? null, callback, targets: new Set() }
        observers.push(this.#stub)
    }

    observe (target: Element): void {
        this.#stub.targets.add(target)
    }

    unobserve (target: Element): void {
        this.#stub.targets.delete(target)
    }

    disconnect (): void {
        this.#stub.targets.clear()
        observers.splice(observers.indexOf(this.#stub), 1)
    }

    takeRecords (): IntersectionObserverEntry[] {
        return []
    }
}

/** Reports `element` as the one filling its scroll container. */
const intersect = (element: Element, ratio = 1): void => {
    for (const observer of observers.filter(known => known.targets.has(element))) {
        const records = [...observer.targets].map(target => ({
            target,
            intersectionRatio: target === element ? ratio : 0,
            isIntersecting: target === element
        })) as IntersectionObserverEntry[]
        observer.callback(records, {} as IntersectionObserver)
    }
}

const setReducedMotion = (reduce: boolean): void => {
    vi.stubGlobal('matchMedia', (query: string) => ({
        matches: reduce && query.includes('prefers-reduced-motion'),
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {}
    }))
}

beforeEach(() => {
    observers.length = 0
    vi.stubGlobal('IntersectionObserver', IntersectionObserverStub)
    Element.prototype.scrollIntoView = vi.fn()
    setReducedMotion(false)
})

export { intersect, setReducedMotion }
