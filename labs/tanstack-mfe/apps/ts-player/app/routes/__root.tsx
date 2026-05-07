import type { Session } from "@auth/core/types";
import { Header, Providers } from "@rift/ts-shared";
import type { NavZone, RenderLinkFn, RenderLinkProps } from "@rift/ts-shared";
import { createRootRouteWithContext, HeadContent, Link, Outlet, redirect, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import type { JSX } from "react";

import { getServerSession } from "../lib/session.server";
import appCss from "../styles/globals.css?url";

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
		const session = await getServerSession();
		if (!session?.user) {
			throw redirect({ to: `/login?callbackUrl=${encodeURIComponent(location.href)}` });
		}
		return { session };
	},
	component: RootComponent,
});

function handleSignOut(): void {
	globalThis.location.href = "/api/auth/signout";
}

function RootComponent(): JSX.Element {
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
					<main className="container mx-auto px-4 py-8">
						<Outlet />
					</main>
				</Providers>
				<TanStackRouterDevtools />
				<Scripts />
			</body>
		</html>
	);
}
