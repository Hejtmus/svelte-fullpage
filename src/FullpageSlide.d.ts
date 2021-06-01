import { SvelteComponentTyped } from 'svelte';

export interface SlideTransition {
    duration: number,
    x: number
}

export interface FullpageSlideProps {
    class?: string,
    style?: string,
    center?: boolean,
    transitionIn?: SlideTransition,
    transitionOut?: SlideTransition
}

export default class FullpageSlide extends SvelteComponentTyped<FullpageSlideProps> {}
