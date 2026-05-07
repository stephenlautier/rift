import { Header, Providers } from "@rift/ts-shared";
import type { NavZone, RenderLinkFn, RenderLinkProps } from "@rift/ts-shared";
import { createRootRoute, HeadContent, Link, Outlet, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import type { JSX } from "react";

import { getServerSession } from "../lib/session.server";
import appCss from "../styles/globals.css?url";

const CURRENT_ZONE: NavZone = "shell";

/**
 * Shell's renderLink: all nav links are intra-zone for / and /login,
 * but /champions, /tier-list, /player cross into other zones → <a href>.
 */
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
		const session = await getServerSession();
		return { session };
	},
	component: RootComponent,
});

async function handleSignOut(): Promise<void> {
	const csrfRes = await fetch("/api/auth/csrf");
	const { csrfToken } = (await csrfRes.json()) as { csrfToken: string };
	await fetch("/api/auth/signout", {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body: new URLSearchParams({ csrfToken }).toString(),
	});
	globalThis.location.href = "/";
}

function RootComponent(): JSX.Element {
	const { session } = Route.useRouteContext();

	return (
		<html lang="en">
			<head>
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
