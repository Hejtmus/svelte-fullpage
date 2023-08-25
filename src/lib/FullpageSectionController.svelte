<script lang="ts">
    import { tweened } from 'svelte/motion'
    import type { easingFunction, FullpageActivityStore, navigationFunction } from '$lib/types'

    export let activeSlideStore: FullpageActivityStore
    export let isSlidable: boolean
    export let isActive: boolean
    // Configuration
    export let disableCentering: boolean
    export let scrollDuration: number
    export let disableDragNavigation: boolean
    export let disableArrowsNavigation: boolean
    export let pageRoundingThresholdMultiplier: number
    export let easing: easingFunction

    let section: HTMLDivElement
    const sectionScroll = tweened(0, {
        duration: scrollDuration,
        easing
    })

    let recentScroll = 0
    let dragPosition: number
    let dragStartScroll: number
    let dragging: boolean

    const slideRight = () => {
        activeSlideStore.nextPage()
        setScroll()
    }

    const slideLeft = () => {
        activeSlideStore.previousPage()
        setScroll()
    }

    export const toSlide: navigationFunction = (event) => {
        const slideId = event.detail
        activeSlideStore.toPage(slideId)
        setScroll()
    }
    const setScroll = () => {
        sectionScroll.set($activeSlideStore * section.clientWidth)
    }
    const updateSlideScroll = (scroll: number) => {
        if (section) {
            requestAnimationFrame(() => {
                section.scrollLeft = scroll
            })
        }
    }

    // handling arrow event
    const handleKey = (event: KeyboardEvent) => {
        if (!isActive) return
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            event.preventDefault()
        }
        if (!disableArrowsNavigation) {
            switch (event.key) {
            case 'ArrowLeft':
                slideLeft()
                break
            case 'ArrowRight':
                slideRight()
                break
            }
        }
    }

    const handleWheel = (event: WheelEvent) => {
        const now = Date.now()
        const deltaX = event.deltaX
        if (Math.abs(deltaX) > 20 && now - recentScroll >= scrollDuration) {
            handleWheelEnd(deltaX)
            recentScroll = now
        }
    }
    const handleWheelEnd = (wheelDelta: number) => {
        const hasScrolledLeft = wheelDelta < 0
        hasScrolledLeft ? slideLeft() : slideRight()
    }

    const handleDragStart = (event: PointerEvent) => {
        if (disableDragNavigation) return
        dragPosition = event.clientX
        dragStartScroll = section.scrollLeft
        dragging = true
    }
    const handleDragging = (event: PointerEvent) => {
        if (dragging) {
            sectionScroll.set(dragStartScroll - (event.clientX - dragPosition), {
                duration: 0
            })
        }
    }
    const handleDragEnd = () => {
        dragging = false
        const hasScrolledLeft = dragStartScroll > section.scrollLeft
        const scrollDelta = (hasScrolledLeft ? section.scrollLeft - section.clientWidth : section.scrollLeft) % section.clientWidth
        const hasExceededScrollRoundThreshold = Math.abs(scrollDelta) > section.clientWidth / pageRoundingThresholdMultiplier
        if (hasExceededScrollRoundThreshold) {
            hasScrolledLeft ? slideLeft() : slideRight()
        } else {
            setScroll()
        }
    }

    $: updateSlideScroll($sectionScroll)
</script>

<svelte:window on:keydown={handleKey} on:pointerup|capture={handleDragEnd}/>

<div bind:this={section} class:slidable={isSlidable} class:svelte-fp-flexbox-center={!isSlidable && !disableCentering}
     on:wheel|preventDefault={handleWheel} on:pointerdown={handleDragStart} on:pointermove={handleDragging} {...$$restProps}>
    <slot />
</div>

<style>
    div {
        height: 100%;
        width: 100%;
        position: relative;
        flex: 1;
        touch-action: none;
        overflow: hidden;
        user-select: none;
    }
    .slidable {
        display: flex;
        flex-direction: row;
    }
    .svelte-fp-flexbox-center {
        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>
