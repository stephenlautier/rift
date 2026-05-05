import type { Session } from "next-auth";
import type { JSX } from "react";

import { Nav } from "./Nav";
import { SignOutButton } from "./SignOutButton";

type HeaderProps = {
	session: Session | null;
	/** Server action that signs the user out. Passed by each zone's layout. */
	signOutAction: () => Promise<void>;
};

/**
 * Async Server Component — header rendered on every zone.
 * Uses `<a>` for ALL cross-zone navigation links (hard navigations cross
 * the zone boundary; Next.js `<Link>` only handles intra-zone prefetching).
 */
export function Header({ session, signOutAction }: HeaderProps): JSX.Element {
	const displayName = session?.user?.name ?? null;

	return (
		<header className="border-b border-border bg-background sticky top-0 z-10">
			<div className="container mx-auto px-4 h-14 flex items-center justify-between">
				<a href="/" className="font-semibold text-foreground hover:text-primary transition-colors">
					Rift
				</a>
				<Nav />
				<div className="flex items-center gap-4 text-sm">
					{displayName ? (
						<span className="flex items-center gap-2">
							<span className="text-foreground">{displayName}</span>
							<span className="text-muted-foreground">·</span>
							<SignOutButton action={signOutAction} />
						</span>
					) : (
						<a href="/login" className="text-muted-foreground hover:text-foreground transition-colors">
							Sign in
						</a>
					)}
				</div>
			</div>
		</header>
	);
}
