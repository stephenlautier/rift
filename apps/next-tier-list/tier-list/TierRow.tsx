import type { Tier } from "@rift/champion";
import type { ReactElement } from "react";

import type { EnrichedTierEntry } from "./types";

// Matches the LolTierBadge Stencil CSS exactly
const TIER_CLASSES: Record<Tier, string> = {
	S: "text-[#f0b232] bg-[rgba(240,178,50,0.15)] border-[#f0b232]",
	A: "text-[#c45dff] bg-[rgba(196,93,255,0.15)] border-[#c45dff]",
	B: "text-[#4f9eff] bg-[rgba(79,158,255,0.15)] border-[#4f9eff]",
	C: "text-[#5bcf6e] bg-[rgba(91,207,110,0.15)] border-[#5bcf6e]",
	D: "text-[#9ca3af] bg-[rgba(156,163,175,0.15)] border-[#9ca3af]",
};

type Props = {
	tier: Tier;
	entries: EnrichedTierEntry[];
};

export function TierRow({ tier, entries }: Props): ReactElement | null {
	if (entries.length === 0) {
		return null;
	}

	return (
		<div className="flex gap-4 items-start">
			{/* Tier badge column — matches LolTierBadge Stencil component */}
			<div className="shrink-0 w-12 flex flex-col items-center pt-3">
				<span
					aria-label={`Tier ${tier}`}
					className={`w-9 h-9 flex items-center justify-center rounded-md border-2 text-[1.1rem] font-extrabold tracking-tight ${TIER_CLASSES[tier]}`}>
					{tier}
				</span>
			</div>

			{/* Champion cards */}
			<div className="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
				{entries.map(entry => (
					<a
						key={entry.id}
						href={`/champions/${entry.champion.id}`}
						className="group rounded-lg border border-border bg-card hover:border-primary/50 transition-colors overflow-hidden">
						<div className="aspect-video overflow-hidden">
							{/* oxlint-disable-next-line nextjs/no-img-element -- splash art from known CDN, image optimization overkill here */}
							<img
								src={entry.champion.splashArtUrl}
								alt={entry.champion.name}
								className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
							/>
						</div>
						<div className="p-2">
							<p className="text-xs font-semibold truncate">{entry.champion.name}</p>
							<p className="text-xs text-muted-foreground">{entry.role}</p>
							<div className="flex justify-between mt-1">
								<span className="text-xs text-green-400">{entry.winRate.toFixed(1)}% WR</span>
								<span className="text-xs text-muted-foreground">{entry.pickRate.toFixed(1)}% PR</span>
							</div>
						</div>
					</a>
				))}
			</div>
		</div>
	);
}
