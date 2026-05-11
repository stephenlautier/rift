import { createRouter as createTanStackRouter } from "@tanstack/react-router";

import { routeTree } from "./routeTree.gen";

export function getRouter() {
	return createTanStackRouter({
		routeTree,
		defaultPreload: "intent",
		defaultPreloadStaleTime: 0,
		scrollRestoration: true,
		// Initial context shape required by createRootRouteWithContext<RouterContext>()
		context: { session: null },
	});
}

declare module "@tanstack/react-router" {
	type Register = {
		router: ReturnType<typeof getRouter>;
	};
}
