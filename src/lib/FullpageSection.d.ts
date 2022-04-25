import { SvelteComponentTyped } from 'svelte';

export interface FullpageSectionProps {
    class?: string,
    style?: string,
    activeSlide?: number,
    slidesTitles: Array<string>,
    center?: boolean,
    arrows?: boolean,
    select?: boolean,
    transitionDuration?: number,
    dragThreshold?: number,
    touchThreshold?: number
}

export default class FullpageSection extends SvelteComponentTyped<FullpageSectionProps> {}
