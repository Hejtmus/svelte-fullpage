<script lang="ts">
    import type { FullpageActivityStore } from './stores'
    import { tweened } from 'svelte/motion'
    import { quartOut } from 'svelte/easing'

    export let activeSectionStore: FullpageActivityStore
    // Configuration
    export let navigationCooldown
    export let disableDragNavigation
    export let disableArrowsNavigation
    export let disablePullDownToRefresh
    export let pageRoundingThresholdMultiplier

    let fullpage
    const fullpageScroll = tweened(0, {
        duration: navigationCooldown,
        easing: quartOut
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

    // handling arrow event
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
        if (Math.abs(deltaY) > 20 && now - recentScroll >= navigationCooldown) {
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
    const handleTouchStart = (event) => {
        dragPosition = event.touches[0].screenY
        dragStartScroll = fullpage.scrollTop
    }
    $: updateFullpageScroll($fullpageScroll)
</script>

<svelte:window on:keydown={handleKey} on:mouseup|capture={handleDragEnd} /> <!-- Necessity when listening to window events -->
<svelte:body class:svelte-fp-disable-pull-refresh={disablePullDownToRefresh}/> <!-- disables slideDownToRefresh feature -->

<div class="svelte-fp-container" bind:this={fullpage} on:wheel|preventDefault={handleWheel} on:mousedown={handleDragStart}
     on:mousemove|preventDefault={handleDragging} on:touchstart={handleTouchStart} on:touchend={handleDragEnd}>
    <slot />
</div>

<style>
    .svelte-fp-container {
        height: inherit;
        width: inherit;
        position: relative;
        overflow-y: scroll;
        user-select: none;
    }
    .svelte-fp-container::-webkit-scrollbar {
        width: 0;
        background: transparent;
    }
    .svelte-fp-disable-pull-refresh {
        overscroll-behavior: contain;
    }
</style>
