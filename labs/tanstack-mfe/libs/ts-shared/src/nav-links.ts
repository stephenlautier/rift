/**
 * Zone identifiers — one per deployable unit.
 * Used by Header's renderLink to decide <Link> vs <a>.
 */
export type NavZone = "shell" | "champions" | "tier-list" | "player";

export type NavLink = {
	readonly href: string;
	readonly label: string;
	readonly zone: NavZone;
};

/**
 * Top-level navigation links with their owning zone.
 * Shell uses these to render the nav; each zone uses them to decide which
 * links are intra-zone (TanStack Router <Link>) vs cross-zone (<a href>).
 */
export const NAV_LINKS = [
	{ href: "/", label: "Home", zone: "shell" },
	{ href: "/champions", label: "Champions", zone: "champions" },
	{ href: "/tier-list", label: "Tier List", zone: "tier-list" },
	{ href: "/player", label: "My Profile", zone: "player" },
] as const satisfies readonly NavLink[];
