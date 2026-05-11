import type { ChampionRole, Tier } from "@rift/champion";
import { useNavigate } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import type { JSX } from "react";

import type { RoleFilter, TierFilter } from "./parse-filters";

type TierListEntry = {
	id: string;
	tier: Tier;
	role: ChampionRole;
	patch: string;
	winRate: number;
	pickRate: number;
	champion: {
		id: string;
		name: string;
		splashArtUrl: string;
	};
};

type TierListViewProps = {
	entries: TierListEntry[];
	patches: string[];
	initialTier: TierFilter;
	initialRole: RoleFilter;
	initialPatch: string;
	latestPatch: string;
};

const TIER_ORDER: Tier[] = ["S", "A", "B", "C", "D"];
const ROLES: ChampionRole[] = ["Top", "Jungle", "Mid", "ADC", "Support"];

// Badge colours per tier — matches Next.js TierRow
const TIER_BADGE: Record<Tier, string> = {
	S: "text-[#f0b232] bg-[rgba(240,178,50,0.15)] border-[#f0b232]",
	A: "text-[#c45dff] bg-[rgba(196,93,255,0.15)] border-[#c45dff]",
	B: "text-[#4f9eff] bg-[rgba(79,158,255,0.15)] border-[#4f9eff]",
	C: "text-[#5bcf6e] bg-[rgba(91,207,110,0.15)] border-[#5bcf6e]",
	D: "text-[#9ca3af] bg-[rgba(156,163,175,0.15)] border-[#9ca3af]",
};

// Filter button active colours per tier — matches Next.js TierListFilters
const TIER_FILTER_ACTIVE: Record<Tier | "all", string> = {
	all: "border-border bg-muted/50 text-foreground ring-1 ring-current",
	S: "border-amber-400 bg-amber-400/10 text-amber-400 ring-1 ring-current",
	A: "border-purple-400 bg-purple-400/10 text-purple-400 ring-1 ring-current",
	B: "border-blue-400 bg-blue-400/10 text-blue-400 ring-1 ring-current",
	C: "border-green-400 bg-green-400/10 text-green-400 ring-1 ring-current",
	D: "border-gray-400 bg-gray-400/10 text-gray-400 ring-1 ring-current",
};
const TIER_FILTER_INACTIVE = "border-border text-muted-foreground hover:border-current hover:text-foreground";
const ROLE_ACTIVE = "border-primary bg-primary/10 text-primary ring-1 ring-primary";
const ROLE_INACTIVE = "border-border text-muted-foreground hover:border-foreground hover:text-foreground";

export function TierListView({
	entries,
	patches,
	initialTier,
	initialRole,
	initialPatch,
	latestPatch,
}: TierListViewProps): JSX.Element {
	const navigate = useNavigate({ from: "/tier-list/" });
	const [tier, setTier] = useState<TierFilter>(initialTier);
	const [role, setRole] = useState<RoleFilter>(initialRole);
	const [patch, setPatch] = useState(initialPatch);

	const applyFilters = useCallback(
		(nextTier: TierFilter, nextRole: RoleFilter, nextPatch: string) => {
			void navigate({
				search: {
					tier: nextTier === "all" ? undefined : nextTier,
					role: nextRole === "all" ? undefined : nextRole,
					patch: nextPatch === "latest" ? undefined : nextPatch,
				},
			});
		},
		[navigate],
	);

	const handleTier = (value: TierFilter) => {
		setTier(value);
		applyFilters(value, role, patch);
	};

	const handleRole = (value: RoleFilter) => {
		setRole(value);
		applyFilters(tier, value, patch);
	};

	const handlePatch = (value: string) => {
		setPatch(value);
		applyFilters(tier, role, value);
	};

	// Group entries by tier
	const byTier = new Map<Tier, TierListEntry[]>();
	for (const t of TIER_ORDER) {
		byTier.set(t, []);
	}
	for (const entry of entries) {
		byTier.get(entry.tier)?.push(entry);
	}

	const displayPatch = patch === "latest" ? latestPatch : patch;
	const firstNonEmptyTier = TIER_ORDER.find(t => (byTier.get(t)?.length ?? 0) > 0);

	return (
		<div>
			{/* Page heading */}
			<div className="mb-6">
				<h1 className="text-3xl font-bold tracking-tight">Tier List</h1>
				<p className="mt-1 text-muted-foreground">
					Patch {displayPatch} — {entries.length} champion/role combinations
				</p>
			</div>

			{/* Filter panel */}
			<div className="space-y-3 mb-8 p-4 rounded-xl border border-border bg-card">
				<div>
					<p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Tier</p>
					<div className="flex flex-wrap gap-2">
						{(["all", ...TIER_ORDER] as const).map(t => (
							<button
								key={t}
								type="button"
								aria-pressed={tier === t}
								onClick={() => handleTier(t)}
								className={`px-3 py-1 rounded-md text-sm font-semibold border transition-colors ${
									tier === t ? TIER_FILTER_ACTIVE[t] : TIER_FILTER_INACTIVE
								}`}>
								{t === "all" ? "All Tiers" : t}
							</button>
						))}
					</div>
				</div>

				<div>
					<p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Role</p>
					<div className="flex flex-wrap gap-2">
						{(["all", ...ROLES] as const).map(r => (
							<button
								key={r}
								type="button"
								aria-pressed={role === r}
								onClick={() => handleRole(r)}
								className={`px-3 py-1 rounded-md text-sm font-medium border transition-colors ${
									role === r ? ROLE_ACTIVE : ROLE_INACTIVE
								}`}>
								{r === "all" ? "All Roles" : r}
							</button>
						))}
					</div>
				</div>

				{patches.length > 1 && (
					<div>
						<p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Patch</p>
						<div className="flex flex-wrap gap-2">
							<button
								type="button"
								aria-pressed={patch === "latest"}
								onClick={() => handlePatch("latest")}
								className={`px-3 py-1 rounded-md text-sm font-medium border transition-colors ${
									patch === "latest" ? ROLE_ACTIVE : ROLE_INACTIVE
								}`}>
								Latest
							</button>
							{patches.map(p => (
								<button
									key={p}
									type="button"
									aria-pressed={patch === p}
									onClick={() => handlePatch(p)}
									className={`px-3 py-1 rounded-md text-sm font-medium border transition-colors ${
										patch === p ? ROLE_ACTIVE : ROLE_INACTIVE
									}`}>
									{p}
								</button>
							))}
						</div>
					</div>
				)}
			</div>

			{/* Tier rows */}
			{entries.length === 0 ? (
				<p className="text-center text-muted-foreground py-16">No champions match these filters.</p>
			) : (
				<div className="space-y-6">
					{TIER_ORDER.map(t => {
						const tierEntries = byTier.get(t) ?? [];
						if (tierEntries.length === 0) {
							return null;
						}
						return (
							<div key={t} className="flex gap-4 items-start">
								{/* Tier badge */}
								<div className="shrink-0 w-12 flex flex-col items-center pt-3">
									<span
										aria-label={`Tier ${t}`}
										className={`w-9 h-9 flex items-center justify-center rounded-md border-2 text-[1.1rem] font-extrabold tracking-tight ${TIER_BADGE[t]}`}>
										{t}
									</span>
								</div>

								{/* Champion cards */}
								<div className="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
									{tierEntries.map((entry, index) => (
										<a
											key={entry.id}
											href={`/champions/${entry.champion.id}`}
											className="group rounded-lg border border-border bg-card hover:border-primary/50 transition-colors overflow-hidden">
											<div className="relative aspect-video overflow-hidden">
												<img
													src={entry.champion.splashArtUrl}
													alt={entry.champion.name}
													// oxlint-disable-next-line react/no-unknown-property -- fetchpriority is valid HTML
													fetchPriority={t === firstNonEmptyTier && index < 6 ? "high" : "auto"}
													className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
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
					})}
				</div>
			)}
		</div>
	);
}
