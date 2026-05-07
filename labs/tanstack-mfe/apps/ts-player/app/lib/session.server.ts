import { getSession } from "@auth/core";
import type { Session } from "@auth/core/types";
import { authjsConfig } from "@rift/auth";
import { createServerFn } from "@tanstack/react-start";
import { getWebRequest } from "@tanstack/react-start/server";

/**
 * Reads the Auth.js session for the current request.
 * Used in the player zone's root `beforeLoad` to guard all /player/** routes.
 */
export const getServerSession = createServerFn().handler(async (): Promise<Session | null> => {
	const request = getWebRequest();
	return getSession(request, authjsConfig);
});
