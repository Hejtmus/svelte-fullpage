<script lang="ts">
    import type { FullpageActivityStore } from './stores'

    export let activeSlideStore: FullpageActivityStore
    export let isSlidable: boolean
    export let isActive: boolean
    // Configuration
    export let disableCenter: boolean
    export let navigationCooldown: boolean
    export let disableDragNavigation: boolean
    export let disableArrowsNavigation: boolean
    export let pageRoundingThresholdMultiplier: boolean

    let recentScroll = 0
    let section
    let dragPosition
    let dragStartScroll
    let dragging

    const slideRight = () => {
        activeSlideStore.nextPage()
        updateSlideScroll()
    }

    const slideLeft = () => {
        activeSlideStore.previousPage()
        updateSlideScroll()
    }

    export const toSlide = (event) => {
        const slideId = event.detail
        activeSlideStore.toPage(slideId)
        updateSlideScroll()
    }
    const updateSlideScroll = () => {
        if (section) {
            section.scrollTo({
                left: $activeSlideStore * section.clientWidth,
                behavior: 'smooth'
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
            section.scrollTo({
                left: dragStartScroll - (event.clientX - dragPosition)
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
            updateSlideScroll()
        }
    }

    // memoize touch start X coordinate
    const handleTouchStart = (event) => {
        dragPosition = event.touches[0].screenX
        dragStartScroll = section.scrollLeft
    }
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
