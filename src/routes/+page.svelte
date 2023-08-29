<script lang="ts">
    import '../css/bootstrap.css'
    import {
        type FullpageActivityStore,
        Fullpage,
        FullpageSection,
        FullpageSlide
    } from '$lib'
    import { onMount } from 'svelte'

    let fullpageController: FullpageActivityStore
    let sectionController: FullpageActivityStore

    onMount(() => {
        window.fullpageController = fullpageController
        window.sectionController = sectionController
        console.info('Hey, you can access fullpage controller from console, try typing window.fullpageController or' +
            ' simply fullpageController, same for sectionController, try calling on them .goto(index) for programmatic navigation.')
        console.log('example: fullpageController.goto(2) will scroll to third section')
    })

    $: console.log(`Active section: ${$fullpageController}, active slide: ${$sectionController}`)
</script>

<svelte:head>
    <title>Svelte-fullpage</title>
</svelte:head>

<Fullpage bind:controller={fullpageController}>
    <FullpageSection title="Svelte Fullpage">

        <div class="container text-center">
            <div class="row">
                <div class="col">
                    <h1>
                        Svelte Fullpage
                    </h1>
                    <p>
                        This page is made using svelte-fullpage component, try to scroll, drag with mouse or swipe
                        vertical with finger or use arrows to scroll.
                    </p>
                    <p>
                        Try opening console and see what is being logged when you scroll <kbd>ctr + shift + I</kbd>
                    </p>
                </div>
            </div>
        </div>
    </FullpageSection>
    <FullpageSection title="Features" class="bg-info" bind:controller={sectionController}>
        <FullpageSlide title="slides">
            <div class="container text-center">
                <div class="row">
                    <div class="col">
                        <h1>Slides</h1>
                        <p>
                            There is also component for slides as you can see.
                            Try to drag/swipe right or left, also you can use arrows.
                        </p>
                        <p>
                            This is section {$fullpageController} and slide {$sectionController}
                        </p>
                    </div>
                </div>
            </div>
        </FullpageSlide>
        <FullpageSlide title="arrows" class="bg-danger">
            <div class="container text-center">
                <div class="row">
                    <div class="col">
                        <h1>Usage example</h1>
                        <p>
                            Look at <a href="https://github.com/Hejtmus/svelte-fullpage/blob/master/src/routes/%2Bpage.sveltea">source code</a>
                            of this very page to see how to use this component, and thus inspire yourself.
                        </p>
                    </div>
                </div>
            </div>
        </FullpageSlide>
        <FullpageSlide title="drag" class="bg-success">
            <div class="container text-center">
                <div class="row">
                    <div class="col">
                        <h1>Embeds</h1>
                        <p>
                            svelte-fullpage supports also embeds and iframes, scroll down to see example, you will see
                            page but loaded using embed. Scrolling on embaded page is enabled, but also fulpage
                            scrolling is still working, try to scroll hovering over fullpage section indicator (grey dots).
                        </p>
                    </div>
                </div>
            </div>
        </FullpageSlide>
    </FullpageSection>
<!--    <FullpageSection title="GitHub">-->
<!--        <div class="container w-100 h-100 d-flex flex-column">-->
<!--            <div class="row justify-content-center pt-5 mt-5">-->
<!--                <div class="col-auto">-->
<!--                    <h1>-->
<!--                        Recursive fullpage-->
<!--                    </h1>-->
<!--                </div>-->
<!--            </div>-->
<!--            <div class="row flex-grow-1 align-items-center justify-content-center">-->
<!--                <div class="col-10 h-75 border border-dark rounded-3 position-relative">-->
<!--                    <svelte:self />-->
<!--                </div>-->
<!--            </div>-->
<!--        </div>-->
<!--    </FullpageSection>-->
    <FullpageSection title="Future" class="bg-warning">
        <div class="container text-center">
            <div class="row">
                <div class="col">
                    <h1>Future of this component</h1>
                    <p>
                        This component is in development and is far from being ideal, as you noticed (maybe), there
                        is problem with slide animation. Currently I'm the only contributor of this project, feel free
                        to fork it and make pull request.
                    </p>
                    <p>
                        This is section {$fullpageController}
                    </p>
                </div>
            </div>
        </div>
    </FullpageSection>
</Fullpage>

<style global>
    :global(body) {
        height: 100vh;
    }
    ul.svelte-fp-slide-indicator>li>button>i {
        background-color: #fff;
        border: 1px solid #000;
    }
</style>
