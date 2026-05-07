import type { JSX, ReactNode } from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { THEME_COOKIE_NAME, THEME_STORAGE_KEY } from "./constants";

export { THEME_COOKIE_NAME } from "./constants";

export type ThemeMode = "system" | "light" | "dark";

export type ThemeContextValue = {
	mode: ThemeMode;
	resolved: "light" | "dark";
	setMode: (next: ThemeMode) => void;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);

const ONE_YEAR = 60 * 60 * 24 * 365;

function isThemeMode(value: unknown): value is ThemeMode {
	return value === "system" || value === "light" || value === "dark";
}
export { isThemeMode };

function readSystemPrefersDark(): boolean {
	if (typeof globalThis.matchMedia !== "function") {
		return false;
	}
	return globalThis.matchMedia("(prefers-color-scheme: dark)").matches;
}

function resolveTheme(mode: ThemeMode): "light" | "dark" {
	return mode === "system" ? (readSystemPrefersDark() ? "dark" : "light") : mode;
}

function persistTheme(mode: ThemeMode): void {
	try {
		globalThis.localStorage?.setItem(THEME_STORAGE_KEY, mode);
	} catch {
		/* ignore */
	}
	// oxlint-disable-next-line unicorn/no-document-cookie -- Cookie Store API is async and unavailable in SSR; synchronous cookie write is intentional here
	document.cookie = `${THEME_COOKIE_NAME}=${mode}; Path=/; Max-Age=${ONE_YEAR}; SameSite=Lax`;
}

function applyTheme(resolved: "light" | "dark"): void {
	const root = document.documentElement;
	root.classList.toggle("dark", resolved === "dark");
	root.style.colorScheme = resolved;
}

export function ThemeProvider({
	initialMode = "system",
	children,
}: {
	initialMode?: ThemeMode;
	children: ReactNode;
}): JSX.Element {
	const [mode, setMode] = useState<ThemeMode>(initialMode);
	const [resolved, setResolved] = useState<"light" | "dark">(() => resolveTheme(initialMode));

	useEffect(() => {
		const next = resolveTheme(mode);
		setResolved(next);
		applyTheme(next);
		if (mode === "system") {
			const mq = globalThis.matchMedia("(prefers-color-scheme: dark)");
			const onChange = (): void => {
				const r = readSystemPrefersDark() ? "dark" : "light";
				setResolved(r);
				applyTheme(r);
			};
			mq.addEventListener("change", onChange);
			return () => {
				mq.removeEventListener("change", onChange);
			};
		}
		// oxlint-disable-next-line unicorn/no-useless-undefined -- consistent-return requires explicit undefined when the other branch returns a cleanup fn
		return undefined;
	}, [mode]);

	const setModeWithPersist = useCallback(
		(next: ThemeMode): void => {
			setMode(next);
			persistTheme(next);
		},
		[setMode],
	);

	const value = useMemo<ThemeContextValue>(
		() => ({ mode, resolved, setMode: setModeWithPersist }),
		[mode, resolved, setModeWithPersist],
	);

	return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
	const ctx = useContext(ThemeContext);
	if (!ctx) {
		throw new Error("useTheme must be used inside <ThemeProvider>");
	}
	return ctx;
}
