import { Header, Providers, ThemeScript } from "@rift/ts-shared";
import type { NavZone, RenderLinkFn, RenderLinkProps } from "@rift/ts-shared";
import { createRootRoute, HeadContent, Link, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { createServerFn } from "@tanstack/react-start";
import type { ReactNode } from "react";

import appCss from "../styles/globals.css?url";

/**
 * Wrap getServerSession in a createServerFn so the *.server.* module
 * is never statically imported into the client bundle.
 * Dynamic import inside the handler body is stripped by the plugin.
 */
const $getSession = createServerFn().handler(async () => {
	const { getServerSession } = await import("../lib/session.server");
	return getServerSession();
});

const CURRENT_ZONE: NavZone = "shell";

const renderLink: RenderLinkFn = ({ href, zone, children, className, ariaCurrent }: RenderLinkProps) => {
	if (zone === CURRENT_ZONE || href === "/" || href === "/login") {
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
	beforeLoad: async () => {
		const session = await $getSession();
		return { session };
	},
	shellComponent: RootDocument,
});

async function handleSignOut(): Promise<void> {
	const csrfRes = await fetch("/api/auth/csrf");
	const { csrfToken } = (await csrfRes.json()) as Record<string, string>;
	await fetch("/api/auth/signout", {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body: new URLSearchParams({ csrfToken }).toString(),
	});
	globalThis.location.href = "/";
}

function RootDocument({ children }: { children: ReactNode }) {
	const { session } = Route.useRouteContext();

	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				{/* Blocking inline script: applies dark class/colorScheme before first paint
				    to prevent flash-of-incorrect-theme. Must be first in <head>. */}
				<ThemeScript />
				<HeadContent />
			</head>
			<body>
				<Providers>
					<Header
						currentZone={CURRENT_ZONE}
						renderLink={renderLink}
						userName={session?.user?.name ?? null}
						onSignOut={session ? handleSignOut : undefined}
					/>
					<main className="container mx-auto px-4 py-8">{children}</main>
				</Providers>
				<TanStackRouterDevtools />
				<Scripts />
			</body>
		</html>
	);
}
