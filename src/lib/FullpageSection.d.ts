import { SvelteComponentTyped } from 'svelte';

export interface FullpageSectionProps {
    slides: Array<string>,
    class?: string,
    style?: string,
    activeSlide?: number,
    center?: boolean,
    arrows?: boolean,
    select?: boolean,
    transitionDuration?: number,
    dragThreshold?: number,
    touchThreshold?: number
}

export default class FullpageSection extends SvelteComponentTyped<FullpageSectionProps> {}
