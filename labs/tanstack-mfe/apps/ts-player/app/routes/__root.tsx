import type { Session } from "@auth/core/types";
import { Header, Providers } from "@rift/ts-shared";
import type { NavZone, RenderLinkFn, RenderLinkProps } from "@rift/ts-shared";
import { createRootRouteWithContext, HeadContent, Link, redirect, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { createServerFn } from "@tanstack/react-start";
import type { ReactNode } from "react";

import appCss from "../styles/globals.css?url";

/**
 * Wrap getServerSession in a createServerFn so the *.server.* module
 * is never statically imported into the client bundle.
 */
const $getSession = createServerFn().handler(async (): Promise<Session | null> => {
	const { getServerSession } = await import("../lib/session.server");
	return getServerSession();
});

type RouterContext = {
	session: Session | null;
};

const CURRENT_ZONE: NavZone = "player";

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

export const Route = createRootRouteWithContext<RouterContext>()({
	head: () => ({
		meta: [{ charSet: "utf8" }, { name: "viewport", content: "width=device-width, initial-scale=1" }],
		links: [{ rel: "stylesheet", href: appCss }],
	}),
	/**
	 * Guard all player routes at the root level.
	 * Redirects unauthenticated users to the shell login page
	 * with a callbackUrl so they return here after sign-in.
	 */
	beforeLoad: async ({ location }) => {
		const session = await $getSession();
		if (!session?.user) {
			throw redirect({ to: `/login?callbackUrl=${encodeURIComponent(location.href)}` });
		}
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
	const userName = session?.user?.name ?? undefined;

	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				<Providers>
					<Header currentZone={CURRENT_ZONE} renderLink={renderLink} userName={userName} onSignOut={handleSignOut} />
					<main className="container mx-auto px-4 py-8">{children}</main>
				</Providers>
				<TanStackRouterDevtools />
				<Scripts />
			</body>
		</html>
	);
}
