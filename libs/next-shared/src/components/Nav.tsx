import type { JSX } from "react";

const NAV_LINKS = [
	{ href: "/champions", label: "Champions" },
	{ href: "/tier-list", label: "Tier List" },
	{ href: "/player", label: "My Profile" },
] as const;

/**
 * Cross-zone navigation. Uses `<a>` (hard nav) for ALL links — clicking a
 * link from the champions zone to the tier-list zone crosses a zone boundary
 * and must be a full page navigation. Next.js `<Link>` only prefetches within
 * the same zone.
 */
export function Nav(): JSX.Element {
	return (
		<nav className="flex items-center gap-6 text-sm">
			{NAV_LINKS.map(({ href, label }) => (
				<a key={href} href={href} className="text-muted-foreground hover:text-foreground transition-colors">
					{label}
				</a>
			))}
		</nav>
	);
}
