import { writable, type Writable, type Readable } from 'svelte/store'

interface FullpageActivityStore extends Readable<number> {
    previousPage: () => void,
    nextPage: () => void,
    toPage: (pageId: number) => void
}
function FullpageActivity(pageCountStore: Writable<number>): FullpageActivityStore {
    let activePage = 0
    let pageCount = 0
    pageCountStore.subscribe((value) => {
        pageCount = value
    })
    const { subscribe, set } = writable(activePage)
    const previousPage = () => {
        if (activePage > 0) {
            activePage--
            set(activePage)
        }
    }
    const nextPage = () => {
        if (activePage < pageCount - 1) {
            activePage++
            set(activePage)
        }
    }
    const toPage = (pageId: number) => {
        if (pageId >= 0 && pageId < pageCount) {
            set(pageId)
        }
    }
    return {
        subscribe,
        previousPage,
        nextPage,
        toPage
    }
}

export {
    FullpageActivity
}
export type {
    FullpageActivityStore
}
