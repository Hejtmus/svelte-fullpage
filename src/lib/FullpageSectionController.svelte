<script lang="ts">
    import type { FullpageActivityStore } from './stores'
    import { tweened } from 'svelte/motion'
    import { quartOut } from 'svelte/easing'

    export let activeSlideStore: FullpageActivityStore
    export let isSlidable: boolean
    export let isActive: boolean
    // Configuration
    export let disableCenter: boolean
    export let navigationCooldown: boolean
    export let disableDragNavigation: boolean
    export let disableArrowsNavigation: boolean
    export let pageRoundingThresholdMultiplier: boolean

    let section
    const sectionScroll = tweened(0, {
        duration: navigationCooldown,
        easing: quartOut
    })

    let recentScroll = 0
    let dragPosition
    let dragStartScroll
    let dragging

    const slideRight = () => {
        activeSlideStore.nextPage()
        setScroll()
    }

    const slideLeft = () => {
        activeSlideStore.previousPage()
        setScroll()
    }

    export const toSlide = (event) => {
        const slideId = event.detail
        activeSlideStore.toPage(slideId)
        setScroll()
    }
    const setScroll = () => {
        sectionScroll.set($activeSlideStore * section.clientWidth)
    }
    const updateSlideScroll = (scroll) => {
        if (section) {
            requestAnimationFrame(() => {
                section.scrollLeft = scroll
            })
        }
    }

    // handling arrow event
    const handleKey = (event) => {
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

    const handleWheel = (event) => {
        const now = Date.now()
        const deltaX = event.deltaX
        if (Math.abs(deltaX) > 20 && now - recentScroll >= navigationCooldown) {
            handleWheelEnd(deltaX)
            recentScroll = now
        }
    }
    const handleWheelEnd = (wheelDelta) => {
        const hasScrolledLeft = wheelDelta < 0
        hasScrolledLeft ? slideLeft() : slideRight()
    }

    const handleDragStart = (event) => {
        if (disableDragNavigation) return
        dragPosition = event.clientX
        dragStartScroll = section.scrollLeft
        dragging = true
    }
    const handleDragging = (event) => {
        if (dragging) {
            sectionScroll.set(dragStartScroll - (event.clientX - dragPosition), {
                duration: 0
            })
        }
    }
    const handleDragEnd = () => {
        dragging = false
        const hasScrolledLeft = dragStartScroll > section.scrollLeft
        const scrollDelta = section.scrollLeft % section.clientWidth
        const hasExceededScrollRoundThreshold = Math.abs(scrollDelta) > section.clientWidth / pageRoundingThresholdMultiplier
        if (hasExceededScrollRoundThreshold) {
            hasScrolledLeft ? slideLeft() : slideRight()
        } else {
            setScroll()
        }
    }

    // memoize touch start X coordinate
    const handleTouchStart = (event) => {
        dragPosition = event.touches[0].screenX
        dragStartScroll = section.scrollLeft
    }
    $: updateSlideScroll($sectionScroll)
</script>

<svelte:window on:keydown={handleKey} on:mouseup|capture={handleDragEnd}/>

<div bind:this={section} class="svelte-fp-container svelte-fp-flexbox-expand"
     class:slidable={isSlidable} class:svelte-fp-flexbox-center={!isSlidable && !disableCenter}
     on:wheel|preventDefault={handleWheel} on:mousedown={handleDragStart} on:mousemove|preventDefault={handleDragging}
     on:touchstart={handleTouchStart} on:touchend={handleDragEnd}>
    <slot />
</div>

<style>
    .svelte-fp-container {
        height: inherit;
        width: inherit;
        position: relative;
    }
    .svelte-fp-flexbox-expand {
        flex: 1;
    }
    .slidable {
        overflow-x: scroll;
        user-select: none;
        display: flex;
        flex-direction: row;
    }
    .slidable::-webkit-scrollbar {
        width: 0;
        background: transparent;
    }
    .svelte-fp-flexbox-center {
        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>
