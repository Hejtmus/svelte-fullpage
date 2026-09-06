# Contributing guidelines

First of all, welcome and thanks for showing interest to improve this library! Any contribution is welcome.

## Issues

- Feel free to ask any kind of related questions
- When reporting bug, please provide as much information as possible, ideally with minimal reproducible example
- When requesting feature, document why do you need it, for finding optimal solution, and also requested usage/example
of new feature is welcome as well as different approaches to solve the problem

## Writing code

This lib aims to be lightweight and minimal, so try to avoid unnecessarily introducing new variables and complex computations,
that will eventually need to be removed in the cleanup release. Because of [semver](https://semver.org/), every new feature (addition to API)
has to be kept at least until major release. So, if you are not sure about your code, please open an issue and discuss it first.

## Committing

- Use [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/)
- Don't create commit history pollution, e.g. 15 commits the with same name for 1 feature

## Testing

```bash
npm test            # both suites
npm run test:unit   # vitest: the modules and the components, in jsdom
npm run test:e2e    # playwright: the demo page in a real browser
```

The split matters here. jsdom has no layout, no scrolling and no frames, so the unit suite can
only check the mechanism — what the components register, what they ask the browser to do. Anything
about scrolling, snapping, pointer gestures or animation has to be an end to end test against the
demo page, where a real browser actually does it. Bugs in this library live on that side of the
line, so put a playwright test on any change to dragging, settling or snapping.

The first playwright run needs its browser: `npx playwright install --with-deps chromium`.

## Documentation

Please keep documentation up to date. If you are adding new feature, please also add it to the documentation. If your feature
will not be documented, your PR can be still merged, but your feature may be undocumented for some time.

## Creating PR

- If PR is related to issue, please link it to it
- One feature/fix pre PR, "fix: preventing adding feature A, feat: A" is ok, "feat: A, fix: unrelated fix" is not ok

## Releasing

After your PR is merged, it will be released standalone or batched along with other changes. For now, only author (@hejtmus) can do release,
but feel free to ask for immediate release if you need it.
