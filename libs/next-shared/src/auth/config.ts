import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

/**
 * Demo credentials — username matches the seeded player's `subjectId` so
 * `session.user.id === players.subjectId` without any extra lookup table.
 */
export const DEMO_USER = {
	id: "rift-demo",
	name: "RiftDemo",
	email: "demo@rift.local",
} as const;

export const DEMO_USERNAME = "rift-demo";
export const DEMO_PASSWORD = "demo";

/**
 * Shared NextAuth v5 configuration used by all zones. Shell wires the
 * `handlers`; non-shell zones only call `auth()` to read the session.
 *
 * The JWT is signed with `AUTH_SECRET` (must be identical across all zones).
 * `AUTH_URL` must point to the shell's public URL so NextAuth resolves
 * callbacks to the correct host.
 */
export const authConfig = {
	pages: {
		signIn: "/login",
	},
	callbacks: {
		jwt({ token, user }) {
			if (user) {
				token.id = user.id;
			}
			return token;
		},
		session({ session, token }) {
			if (token.id && typeof token.id === "string") {
				session.user.id = token.id;
			}
			return session;
		},
	},
	providers: [
		Credentials({
			name: "Credentials",
			credentials: {
				username: { label: "Username", type: "text", placeholder: DEMO_USERNAME },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				if (credentials?.username === DEMO_USERNAME && credentials?.password === DEMO_PASSWORD) {
					return { ...DEMO_USER };
				}
				return null;
			},
		}),
	],
} satisfies NextAuthConfig;

export type RiftSession = {
	user: {
		id: string;
		name?: string | null;
		email?: string | null;
	};
	expires: string;
};
