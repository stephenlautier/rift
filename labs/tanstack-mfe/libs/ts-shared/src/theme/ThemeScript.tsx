import type { JSX } from "react";

import { THEME_COOKIE_NAME, THEME_STORAGE_KEY } from "./constants";

/**
 * Blocking inline script injected into `<head>` to apply the `dark` class
 * and `color-scheme` before the browser paints the first frame.
 *
 * Without this, there is a flash-of-incorrect-theme on every hard refresh:
 * the server renders without a `dark` class, the browser paints light colours,
 * then `ThemeProvider`'s `useEffect` fires and toggles the class — causing a
 * visible flicker. Because this `<script>` runs synchronously (no defer/async),
 * it blocks rendering until the class is applied, eliminating the flash.
 *
 * Usage: render as the first child of `<head>` in every zone's root layout.
 * Also add `suppressHydrationWarning` to the `<html>` element since the class
 * attribute will differ between server render (no class) and client hydration
 * (class added by this script before React hydrates).
 */
const THEME_SCRIPT = `(() => {
	try {
		var ck = document.cookie.split('; ').find(function(c){return c.indexOf('${THEME_COOKIE_NAME}=')===0;});
		var stored = ck ? decodeURIComponent(ck.split('=')[1]) : (localStorage.getItem('${THEME_STORAGE_KEY}') || 'system');
		var resolved = stored === 'system'
			? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
			: stored;
		if (resolved === 'dark') document.documentElement.classList.add('dark');
		document.documentElement.style.colorScheme = resolved;
	} catch (e) {}
})();`;

export function ThemeScript(): JSX.Element {
	// oxlint-disable-next-line react/no-danger -- content is a static string we fully control, not user input
	return <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />;
}
