import type { Readable } from 'svelte/store'

type navigationFunction = (event: CustomEvent) => void

interface FullpageActivityStore extends Readable<number> {
    previousPage: () => void,
    nextPage: () => void,
    toPage: (pageId: number) => void
}

interface FullpageExternalControllerStore extends Readable<number> {
    goto: (pageId: number) => void
}

type registerSection = (title?: string) => number

type easingFunction = ((t: number) => number) | undefined

interface FullpageConfig {
    scrollDuration: number,
    pageRoundingThresholdMultiplier: number,
    disableDragNavigation: boolean,
    disableArrowsNavigation: boolean,
    easing: easingFunction
}

interface SectionContext {
    registerSection: registerSection,
    activeSectionStore: FullpageActivityStore,
    config: FullpageConfig
}

type registerSlide = (title?: string) => void

interface SlideContext {
    activeSlideStore: FullpageActivityStore,
    registerSlide: registerSlide,
}

export type {
    navigationFunction,
    FullpageActivityStore,
    FullpageExternalControllerStore,
    registerSection,
    easingFunction,
    SectionContext,
    registerSlide,
    SlideContext
}
