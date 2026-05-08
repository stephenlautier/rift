# lol-champion-card

<!-- Auto Generated Below -->


## Overview

Displays a League of Legends champion card with splash art, name, roles and difficulty.

## Properties

| Property        | Attribute        | Description                                                                                                                                                                                                                                                                                                                       | Type                        | Default  |
| --------------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- | -------- |
| `difficulty`    | `difficulty`     | Difficulty rating 1–10                                                                                                                                                                                                                                                                                                            | `number`                    | `1`      |
| `fetchpriority` | `fetchpriority`  | Maps to the <img fetchpriority> attribute. Pass "high" for the first visible card to hint the browser to preload it. Note: set as an attribute on the host element; the prop is declared so React wrappers can accept it, but fetchpriority on the inner <img> is not set here because Stencil's JSX types do not yet include it. | `"auto" \| "high" \| "low"` | `"auto"` |
| `loading`       | `loading`        | Maps to the <img loading> attribute. Pass "eager" for above-the-fold cards to avoid lazy-loading the LCP image.                                                                                                                                                                                                                   | `"eager" \| "lazy"`         | `"lazy"` |
| `name`          | `name`           | Champion name                                                                                                                                                                                                                                                                                                                     | `string`                    | `""`     |
| `roles`         | `roles`          | Comma-separated list of roles (e.g. "Mid,Support")                                                                                                                                                                                                                                                                                | `string`                    | `""`     |
| `splashArtUrl`  | `splash-art-url` | URL to the champion splash art                                                                                                                                                                                                                                                                                                    | `string`                    | `""`     |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
