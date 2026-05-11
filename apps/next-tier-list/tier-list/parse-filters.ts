import type { ChampionRole, Tier } from "@rift/champion";

const VALID_TIERS: readonly (Tier | "all")[] = ["all", "S", "A", "B", "C", "D"];
const VALID_ROLES: readonly (ChampionRole | "all")[] = ["all", "Top", "Jungle", "Mid", "ADC", "Support"];

export function parseTier(value: string | undefined): Tier | "all" {
	return VALID_TIERS.find(t => t === value) ?? "all";
}

export function parseRole(value: string | undefined): ChampionRole | "all" {
	return VALID_ROLES.find(r => r === value) ?? "all";
}
