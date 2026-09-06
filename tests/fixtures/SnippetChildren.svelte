<script lang="ts">
    import { Fullpage, FullpageSection } from '$lib'
</script>

<!-- eslint-disable svelte/no-useless-children-snippet -- the explicit form is the point here -->
<!-- Explicit snippets rather than implicit children: a runes mode consumer has to get neither a
     slot deprecation warning nor a type error out of this -->
<Fullpage indicators={false}>
    {#snippet children()}
        <FullpageSection id="explicit" title="Explicit">
            {#snippet children()}
                <p>explicit snippet</p>
            {/snippet}
        </FullpageSection>
    {/snippet}
</Fullpage>
