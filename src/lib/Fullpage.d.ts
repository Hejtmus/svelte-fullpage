import { SvelteComponentTyped } from 'svelte';

export interface FullpageProps {
    class?: string,
    style?: string,
    activeSection?: number,
    sectionTitles?: Array<string>,
    transitionDuration?: number,
    arrows?: boolean,
    drag?: boolean,
    pullDownToRefresh?: boolean,
    dragThreshold?: number,
    touchThreshold?: number
}

export default class Fullpage extends SvelteComponentTyped<FullpageProps> {}