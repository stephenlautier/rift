import { Fragment } from "react";
import type { JSX, ReactNode } from "react";

import type { NavZone } from "../nav-links";
import { NAV_LINKS } from "../nav-links";
import { ThemeSwitcher } from "../theme/ThemeSwitcher";

export type RenderLinkProps = {
	href: string;
	zone: NavZone;
	children: ReactNode;
	className?: string;
	ariaCurrent?: "page";
};

export type RenderLinkFn = (props: RenderLinkProps) => ReactNode;

type NavProps = {
	currentZone: NavZone;
	renderLink: RenderLinkFn;
};

/**
 * Zone-aware navigation bar.
 *
 * Each zone passes its own `renderLink` function:
 * - Same-zone href → TanStack Router <Link> (SPA, no reload)
 * - Cross-zone href → plain <a href> (full-page reload at zone boundary)
 *
 * Active state is determined by `currentZone`, not URL introspection, so it
 * works correctly on first SSR render across zones.
 */
export function Nav({ currentZone, renderLink }: NavProps): JSX.Element {
	return (
		<nav className="flex items-center gap-6 text-sm">
			{/* oxlint-disable-next-line react-perf/jsx-no-new-function-as-prop, promise-function-async -- renderLink returns ReactNode (not a Promise), false positive from ReactNode including Promise<ReactNode> in React 19 */}
			{NAV_LINKS.filter(({ zone }) => zone !== "shell").map(({ href, label, zone }) => {
				const isActive = zone === currentZone;
				const className = isActive
					? "text-foreground font-semibold relative after:absolute after:-bottom-0.5 after:left-0 after:h-0.5 after:w-full after:bg-primary after:rounded-full"
					: "text-muted-foreground transition-colors hover:text-foreground";
				return (
					<Fragment key={href}>
						{renderLink({ href, zone, children: label, className, ariaCurrent: isActive ? "page" : undefined })}
					</Fragment>
				);
			})}
		</nav>
	);
}

type HeaderProps = {
	currentZone: NavZone;
	renderLink: RenderLinkFn;
	/** Authenticated user display name, or null if unauthenticated. */
	userName?: string | null;
	/** Called when sign-out is triggered. Each zone provides its own handler. */
	onSignOut?: () => void;
};

/**
 * Shared header rendered at the top of every zone.
 *
 * Does NOT import from @tanstack/react-router — it accepts a `renderLink`
 * callback so each zone can supply its own <Link> for intra-zone navigation
 * and fall back to <a> for cross-zone links.
 */
export function Header({ currentZone, renderLink, userName, onSignOut }: HeaderProps): JSX.Element {
	return (
		<header className="border-b border-border bg-background sticky top-0 z-10">
			<div className="container mx-auto px-4 h-14 flex items-center justify-between">
				{renderLink({
					href: "/",
					zone: "shell",
					children: <span className="font-semibold text-foreground">Rift</span>,
				})}
				<Nav currentZone={currentZone} renderLink={renderLink} />
				<div className="flex items-center gap-4 text-sm">
					<ThemeSwitcher />
					{userName ? (
						<span className="flex items-center gap-2">
							<span>{userName}</span>
							<span className="text-muted-foreground">·</span>
							{onSignOut ? (
								<button
									type="button"
									onClick={onSignOut}
									className="text-muted-foreground hover:text-foreground transition-colors">
									Sign out
								</button>
							) : null}
						</span>
					) : (
						renderLink({
							href: "/login",
							zone: "shell",
							children: "Sign in",
							className: "text-muted-foreground hover:text-foreground transition-colors",
						})
					)}
				</div>
			</div>
		</header>
	);
}
