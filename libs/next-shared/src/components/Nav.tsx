"use client";

import { usePathname } from "next/navigation";
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
	const pathname = usePathname();
	return (
		<nav className="flex items-center gap-6 text-sm">
			{NAV_LINKS.map(({ href, label }) => {
				const isActive = pathname === href || pathname.startsWith(`${href}/`);
				return (
					<a
						key={href}
						href={href}
						className={
							isActive
								? "text-foreground font-semibold relative after:absolute after:-bottom-0.5 after:left-0 after:h-0.5 after:w-full after:bg-primary after:rounded-full"
								: "text-muted-foreground transition-colors hover:text-foreground"
						}>
						{label}
					</a>
				);
			})}
		</nav>
	);
}
