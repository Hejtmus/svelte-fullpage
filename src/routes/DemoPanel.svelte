<script lang="ts">
    import type { Snippet } from 'svelte'

    interface Props {
        heading: string,
        children: Snippet
    }

    let { heading, children }: Props = $props()
</script>

<div class="panel">
    <h2>{heading}</h2>
    {@render children()}
</div>

<style>
    .panel {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 1rem;
        max-inline-size: 46rem;
        margin-inline: auto;
        padding: 2rem 1.5rem;
        text-align: center;
    }
    h2 {
        margin: 0;
        font-size: clamp(1.8rem, 5vw, 3rem);
    }
</style>
