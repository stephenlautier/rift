import type { ChampionRole, Tier } from "@rift/champion";

export type TierFilter = Tier | "all";
export type RoleFilter = ChampionRole | "all";

const VALID_TIERS: ReadonlySet<Tier> = new Set<Tier>(["S", "A", "B", "C", "D"]);
const VALID_ROLES: ReadonlySet<ChampionRole> = new Set<ChampionRole>(["Top", "Jungle", "Mid", "ADC", "Support"]);

export function parseTier(value: string | undefined): TierFilter {
	if (value && VALID_TIERS.has(value as Tier)) {
		return value as Tier;
	}
	return "all";
}

export function parseRole(value: string | undefined): RoleFilter {
	if (value && VALID_ROLES.has(value as ChampionRole)) {
		return value as ChampionRole;
	}
	return "all";
}
