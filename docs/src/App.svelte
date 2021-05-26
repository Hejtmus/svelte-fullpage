<script>
	import {
		Fullpage,
	 	FullpageSection,
		FullpageSlide
	} from '../../src';

	import {
		Container,
		Row,
		Col
	} from 'sveltestrap';

	//Include all titles of your sections, this is also used as number that indicate count of sections
	const sections = [
		'Svelte Fullpage',
		'Features',
		'GitHub',
		'Future'
	];
	//Have to set to 0 (or section you wish to display as default), otherwise section will not display
	let activeSection = 0;

	//Same mechanics as in sections
	const slides = [
		'slides',
		'arrows',
		'drag',
	];
	//Also has to be 0 or specific id of slide
	let activeSlide = 0;
</script>

<svelte:head>
	<title>Svelte-fullpage</title>
</svelte:head>

<Fullpage bind:activeSection arrows drag>
	<FullpageSection center>
		<Container class="text-center">
			<Row>
				<Col>
					<h1>
						Svelte Fullpage
					</h1>
					<p>
						This page is made using svelte-fullpage component, try to scroll, drag with mouse or swipe
						vertical with finger or use arrows to scroll.
					</p>
				</Col>
			</Row>
		</Container>
	</FullpageSection>
	<FullpageSection {slides} class="bg-info" arrows>
		<FullpageSlide center>
			<Container class="text-center">
				<Row>
					<Col>
						<h1>Slides</h1>
						<p>
							There is also component for slides as you can see.
							Try to drag/swipe right or left, also you can use arrows.
						</p>
					</Col>
				</Row>
			</Container>
		</FullpageSlide>
		<FullpageSlide class="bg-danger" center>
			<Container class="text-center">
				<Row>
					<Col>
						<h1>Another slide</h1>
						<p>
							You can style every individual slide, notice background change.
						</p>
					</Col>
				</Row>
			</Container>
		</FullpageSlide>
		<FullpageSlide class="bg-success" center>
			<Container class="text-center">
				<Row>
					<Col>
						<h1>Embeds</h1>
						<p>
							svelte-fullpage supports also embeds and iframes, scroll down to see example, you will see
							page but loaded using embed. Scrolling on embaded page is enabled, but also fulpage
							scrolling is still working, try to scroll hovering over fullpage section indicator (grey dots).
						</p>
					</Col>
				</Row>
			</Container>
		</FullpageSlide>
	</FullpageSection>
	<FullpageSection center>
		<embed src="https://github.com/Hejtmus/svelte-fullpage#svelte-fullpage" csp="https://github.com" class="w-100 h-100">
	</FullpageSection>
	<FullpageSection class="bg-warning" center>
		<Container class="text-center">
			<Row>
				<Col>
					<h1>Future of this component</h1>
					<p>
						This component is in development and is far from being ideal, as you noticed (maybe), there
						is problem with slide animation. Currently I'm the only contributor of this project, feel free
						to fork it and make pull request.
					</p>
				</Col>
			</Row>
		</Container>
	</FullpageSection>
</Fullpage>

<style>
</style>
