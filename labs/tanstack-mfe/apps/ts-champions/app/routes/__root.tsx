import { Header, Providers, ThemeScript } from "@rift/ts-shared";
import type { NavZone, RenderLinkFn, RenderLinkProps } from "@rift/ts-shared";
import { createRootRoute, HeadContent, Link, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import type { ReactNode } from "react";

import appCss from "../styles/globals.css?url";

// Injected by vite.config.ts `define` — resolves to the zone's own origin URL
// (e.g. "http://localhost:3001"). The import map uses this to fix Vite-internal
// path resolution when the zone is served through the shell proxy.
// oxlint-disable-next-line no-underscore-dangle -- vite define global
declare const __ZONE_ORIGIN__: string;

const CURRENT_ZONE: NavZone = "champions";

const renderLink: RenderLinkFn = ({ href, zone, children, className, ariaCurrent }: RenderLinkProps) => {
	if (zone === CURRENT_ZONE) {
		return (
			<Link to={href} className={className} aria-current={ariaCurrent}>
				{children}
			</Link>
		);
	}
	return (
		<a href={href} className={className} aria-current={ariaCurrent}>
			{children}
		</a>
	);
};

export const Route = createRootRoute({
	head: () => ({
		meta: [{ charSet: "utf8" }, { name: "viewport", content: "width=device-width, initial-scale=1" }],
		links: [{ rel: "stylesheet", href: appCss }],
	}),
	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				{/* Blocking inline script: applies dark class/colorScheme before first paint
				    to prevent flash-of-incorrect-theme. Must be first in <head>. */}
				<ThemeScript />
				{/* Dev-only import map: redirects Vite-internal bare specifiers
				    (/@react-refresh, /@id/virtual:tanstack-start-client-entry) to
				    absolute URLs on this zone's port so they resolve correctly
				    when the page is served via the shell proxy on a different port. */}
				{import.meta.env.DEV && (
					<script
						type="importmap"
						// oxlint-disable-next-line react/no-danger -- dev-only, safe static string
						dangerouslySetInnerHTML={{
							__html: JSON.stringify({
								imports: {
									"/@react-refresh": `${__ZONE_ORIGIN__}/@react-refresh`,
									"/@id/virtual:tanstack-start-client-entry": `${__ZONE_ORIGIN__}/@id/virtual:tanstack-start-client-entry`,
									"/@vite/client": `${__ZONE_ORIGIN__}/@vite/client`,
								},
							}),
						}}
					/>
				)}
				<HeadContent />
			</head>
			<body>
				<Providers>
					<Header currentZone={CURRENT_ZONE} renderLink={renderLink} />
					<main className="container mx-auto px-4 py-8">{children}</main>
				</Providers>
				<TanStackRouterDevtools />
				<Scripts />
			</body>
		</html>
	);
}
