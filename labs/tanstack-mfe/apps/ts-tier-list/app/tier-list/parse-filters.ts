import type { ChampionRole, Tier } from "@rift/champion";

export type TierFilter = Tier | "all";
export type RoleFilter = ChampionRole | "all";

export function parseTier(value: string | undefined): TierFilter {
	const valid: Tier[] = ["S", "A", "B", "C", "D"];
	return valid.includes(value as Tier) ? (value as Tier) : "all";
}

export function parseRole(value: string | undefined): RoleFilter {
	const valid: ChampionRole[] = ["Top", "Jungle", "Mid", "ADC", "Support"];
	return valid.includes(value as ChampionRole) ? (value as ChampionRole) : "all";
}
