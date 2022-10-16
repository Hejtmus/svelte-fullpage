<script lang="ts">
    import type { FullpageActivityStore } from './stores'
    import { tweened } from 'svelte/motion'

    export let activeSectionStore: FullpageActivityStore
    // Configuration
    export let scrollDuration: number
    export let disableDragNavigation: boolean
    export let disableArrowsNavigation: boolean
    export let pageRoundingThresholdMultiplier: number
    export let easing: (t: number) => number

    let fullpage
    const fullpageScroll = tweened(0, {
        duration: scrollDuration,
        easing
    })

    // Auxiliary variables
    let recentScroll = 0
    let dragPosition = 0
    let dragStartScroll = 0
    let dragging

    const scrollUp = () => {
        activeSectionStore.previousPage()
        setScroll()
    }
    const scrollDown = () => {
        activeSectionStore.nextPage()
        setScroll()
    }
    export const toSection = (event) => {
        const sectionId = event.detail
        activeSectionStore.toPage(sectionId)
        setScroll()
    }
    const setScroll = () => {
        fullpageScroll.set($activeSectionStore * fullpage.clientHeight)
    }
    const updateFullpageScroll = (scroll) => {
        if (fullpage) {
            requestAnimationFrame(() => {
                fullpage.scrollTop = scroll
            })
        }
    }

    const handleKey = (event) => {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault()
        }
        if (!disableArrowsNavigation) {
            switch (event.key) {
            case 'ArrowDown':
                scrollDown()
                break
            case 'ArrowUp':
                scrollUp()
                break
            }
        }
    }
    const handleWheel = (event) => {
        const now = Date.now()
        const deltaY = event.deltaY
        if (Math.abs(deltaY) > 20 && now - recentScroll >= scrollDuration) {
            handleWheelEnd(deltaY)
            recentScroll = now
        }
    }
    const handleWheelEnd = (wheelDelta) => {
        const hasScrolledUp = wheelDelta < 0
        hasScrolledUp ? scrollUp() : scrollDown()
    }
    const handleDragStart = (event) => {
        if (disableDragNavigation) return
        dragPosition = event.clientY
        dragStartScroll = fullpage.scrollTop
        dragging = true
    }
    const handleDragging = (event) => {
        if (dragging) {
            fullpageScroll.set(dragStartScroll - (event.clientY - dragPosition), {
                duration: 0
            })
        }
    }
    const handleDragEnd = () => {
        dragging = false
        const hasScrolledUp = dragStartScroll > fullpage.scrollTop
        const scrollDelta = (hasScrolledUp ? fullpage.scrollTop - fullpage.clientHeight : fullpage.scrollTop) % fullpage.clientHeight
        const hasExceededScrollRoundThreshold = Math.abs(scrollDelta) > fullpage.clientHeight / pageRoundingThresholdMultiplier
        if (hasExceededScrollRoundThreshold) {
            hasScrolledUp ? scrollUp() : scrollDown()
        } else {
            setScroll()
        }
    }
    $: updateFullpageScroll($fullpageScroll)
</script>

<svelte:window on:keydown={handleKey} on:pointerup|capture={handleDragEnd} />

<div bind:this={fullpage} on:wheel|preventDefault={handleWheel}
     on:pointerdown={handleDragStart} on:pointermove={handleDragging} {...$$restProps}>
    <slot />
</div>

<style>
    div {
        height: 100%;
        width: 100%;
        display: block;
        position: relative;
        overflow: hidden;
        user-select: none;
        touch-action: none;
    }
</style>
