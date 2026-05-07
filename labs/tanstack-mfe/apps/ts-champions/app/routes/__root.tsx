import { Header, Providers } from "@rift/ts-shared";
import type { NavZone, RenderLinkFn, RenderLinkProps } from "@rift/ts-shared";
import { createRootRoute, HeadContent, Link, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import type { ReactNode } from "react";

import appCss from "../styles/globals.css?url";

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
		<html lang="en">
			<head>
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
