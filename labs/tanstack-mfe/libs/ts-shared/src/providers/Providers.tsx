import { Provider as JotaiProvider } from "jotai";
import type { ReactNode } from "react";

import { ThemeProvider } from "../theme/ThemeProvider";
import type { ThemeMode } from "../theme/ThemeProvider";

type ProvidersProps = {
	children: ReactNode;
	initialTheme?: ThemeMode;
};

/**
 * Client root providers — wraps the app with JotaiProvider and ThemeProvider.
 * Used in each zone's __root.tsx as the client-side wrapper.
 *
 * In TanStack Start there is no "use client" directive — all React components
 * run on both server and client (hooks are hydrated on the client).
 */
export function Providers({ children, initialTheme = "system" }: ProvidersProps): React.JSX.Element {
	return (
		<JotaiProvider>
			<ThemeProvider initialMode={initialTheme}>{children}</ThemeProvider>
		</JotaiProvider>
	);
}
