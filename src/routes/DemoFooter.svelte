<footer>
    <p>
        An ordinary footer after the last section. The document keeps its own scroll, so it is
        reachable — it only carries <code>scroll-snap-align: start</code> so mandatory snapping
        treats it as a stop of its own.
    </p>
    <p>
        <a href="https://github.com/Hejtmus/svelte-fullpage">Source on GitHub</a>
    </p>
</footer>

<style>
    footer {
        scroll-snap-align: start;
        border-block-start: var(--edge);
        padding: 3rem 1.5rem;
        background: var(--surface-soft);
        text-align: center;
    }
</style>
