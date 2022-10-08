import { writable, type Writable } from 'svelte/store'

function FullpageActivity(pageCountStore: Writable<number>) {
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
        if (pageId > 0 && pageId < pageCount) {
            set(pageId)
        }
    }
    return {
        subscribe,
        set,
        previousPage,
        nextPage,
        toPage
    }
}

export {
    FullpageActivity
}
