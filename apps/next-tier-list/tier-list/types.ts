import type { ChampionTier } from "@rift/champion";

export type EnrichedTierEntry = ChampionTier & {
	champion: {
		id: string;
		name: string;
		splashArtUrl: string;
		roles: string[];
	};
};
