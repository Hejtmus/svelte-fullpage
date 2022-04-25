<script>
    import '../css/bootstrap.css';
    import {
        Fullpage,
        FullpageSection,
        FullpageSlide
    } from '$lib';

    // Titles for sections are optional, if they are specified, section indicator will have tooltip with section's title
    const sectionTitles = [
        'Svelte Fullpage',
        'Features',
        'GitHub',
        'Future'
    ];
    // Optional, for additional control od displayed section
    let activeSection = 0;

    // Same mechanics as in sections titles
    const slideTitles = [
        'slides',
        'arrows',
        'drag',
    ];
    // Same mechanics as in activeSection
    let activeSlide = 0;
</script>

<svelte:head>
    <title>Svelte-fullpage</title>
</svelte:head>

<Fullpage {sectionTitles} bind:activeSection arrows drag>
    <FullpageSection center>
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
                </div>
            </div>
        </div>
    </FullpageSection>
    <FullpageSection {slideTitles} class="bg-info" arrows>
        <FullpageSlide center>
            <div class="container text-center">
                <div class="row">
                    <div class="col">
                        <h1>Slides</h1>
                        <p>
                            There is also component for slides as you can see.
                            Try to drag/swipe right or left, also you can use arrows.
                        </p>
                    </div>
                </div>
            </div>
        </FullpageSlide>
        <FullpageSlide class="bg-danger" center>
            <div class="container text-center">
                <div class="row">
                    <div class="col">
                        <h1>Another slide</h1>
                        <p>
                            You can style every individual slide, notice background change.
                        </p>
                    </div>
                </div>
            </div>
        </FullpageSlide>
        <FullpageSlide class="bg-success" center>
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
    <FullpageSection center>
        <embed src="https://github.com/Hejtmus/svelte-fullpage#svelte-fullpage" csp="https://github.com" class="w-100 h-100">
    </FullpageSection>
    <FullpageSection class="bg-warning" center>
        <div class="container text-center">
            <div class="row">
                <div class="col">
                    <h1>Future of this component</h1>
                    <p>
                        This component is in development and is far from being ideal, as you noticed (maybe), there
                        is problem with slide animation. Currently I'm the only contributor of this project, feel free
                        to fork it and make pull request.
                    </p>
                </div>
            </div>
        </div>
    </FullpageSection>
</Fullpage>
