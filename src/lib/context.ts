import { getContext, setContext } from 'svelte'
import { PageRegistry } from './registry.svelte'
import type { FullpageApi, FullpageConfig, SectionApi } from './types'

const SECTIONS = Symbol('svelte-fullpage.sections')
const SLIDES = Symbol('svelte-fullpage.slides')
const CONFIG = Symbol('svelte-fullpage.config')

const provideSections = (registry: PageRegistry): void => {
    setContext(SECTIONS, registry)
}

const provideSlides = (registry: PageRegistry): void => {
    setContext(SLIDES, registry)
}

const provideConfig = (config: FullpageConfig): void => {
    setContext(CONFIG, config)
}

/** Sections read what `<Fullpage>` was configured with; the defaults stand on their own. */
const consumeConfig = (): FullpageConfig =>
    getContext<FullpageConfig | undefined>(CONFIG) ?? { drag: true }

const consume = (key: symbol, requirement: string): PageRegistry => {
    const registry = getContext<PageRegistry | undefined>(key)
    if (!registry) {
        throw new Error(`svelte-fullpage: ${requirement}`)
    }
    return registry
}

const consumeSections = (): PageRegistry =>
    consume(SECTIONS, '<FullpageSection> has to be rendered inside <Fullpage>')

const consumeSlides = (): PageRegistry =>
    consume(SLIDES, '<FullpageSlide> has to be rendered inside <FullpageSection>')

// Getters rather than plain fields, so reading the api inside a template stays reactive
const toFullpageApi = (registry: PageRegistry): FullpageApi => ({
    get sections () {
        return registry.pages
    },
    get activeSection () {
        return registry.active
    },
    get activeIndex () {
        return registry.activeIndex
    },
    goTo: target => registry.goTo(target),
    next: () => registry.next(),
    previous: () => registry.previous()
})

const toSectionApi = (registry: PageRegistry): SectionApi => ({
    get slides () {
        return registry.pages
    },
    get activeSlide () {
        return registry.active
    },
    get activeIndex () {
        return registry.activeIndex
    },
    goTo: target => registry.goTo(target),
    next: () => registry.next(),
    previous: () => registry.previous()
})

/** Section navigation for any component rendered inside `<Fullpage>`. */
const useFullpage = (): FullpageApi => toFullpageApi(consumeSections())

/** Slide navigation for any component rendered inside `<FullpageSection>`. */
const useFullpageSection = (): SectionApi => toSectionApi(consumeSlides())

export {
    provideSections,
    provideSlides,
    provideConfig,
    consumeConfig,
    consumeSections,
    consumeSlides,
    toFullpageApi,
    toSectionApi,
    useFullpage,
    useFullpageSection
}
