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
};

const TIERS: Tier[] = ["S", "A", "B", "C", "D"];
const ROLES: ChampionRole[] = ["Top", "Jungle", "Mid", "ADC", "Support"];

const TIER_COLORS: Record<Tier, string> = {
	S: "bg-yellow-500 text-yellow-950",
	A: "bg-green-500 text-green-950",
	B: "bg-blue-500 text-blue-950",
	C: "bg-orange-500 text-orange-950",
	D: "bg-red-500 text-red-950",
};

export function TierListView({
	entries,
	patches,
	initialTier,
	initialRole,
	initialPatch,
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

	return (
		<div className="space-y-6">
			{/* Filters */}
			<div className="flex flex-wrap gap-4">
				<div className="flex items-center gap-2">
					<span className="text-sm font-medium text-muted-foreground">Tier:</span>
					{(["all", ...TIERS] as const).map(t => (
						<button
							key={t}
							type="button"
							onClick={() => handleTier(t)}
							className={`rounded px-2.5 py-1 text-sm font-semibold transition-colors ${tier === t ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>
							{t === "all" ? "All" : t}
						</button>
					))}
				</div>

				<div className="flex items-center gap-2">
					<span className="text-sm font-medium text-muted-foreground">Role:</span>
					{(["all", ...ROLES] as const).map(r => (
						<button
							key={r}
							type="button"
							onClick={() => handleRole(r)}
							className={`rounded px-2.5 py-1 text-sm font-semibold transition-colors ${role === r ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>
							{r === "all" ? "All" : r}
						</button>
					))}
				</div>

				{patches.length > 0 && (
					<div className="flex items-center gap-2">
						<span className="text-sm font-medium text-muted-foreground">Patch:</span>
						{["latest", ...patches].map(p => (
							<button
								key={p}
								type="button"
								onClick={() => handlePatch(p)}
								className={`rounded px-2.5 py-1 text-sm transition-colors ${patch === p ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>
								{p}
							</button>
						))}
					</div>
				)}
			</div>

			{/* Table */}
			{entries.length === 0 ? (
				<p className="text-muted-foreground">No champions match the selected filters.</p>
			) : (
				<div className="rounded-md border">
					<table className="w-full text-sm">
						<thead>
							<tr className="border-b bg-muted/50">
								<th className="px-4 py-3 text-left font-medium">Champion</th>
								<th className="px-4 py-3 text-left font-medium">Tier</th>
								<th className="px-4 py-3 text-left font-medium">Role</th>
								<th className="px-4 py-3 text-right font-medium">Win Rate</th>
								<th className="px-4 py-3 text-right font-medium">Pick Rate</th>
							</tr>
						</thead>
						<tbody>
							{entries.map(entry => (
								<tr key={entry.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
									<td className="px-4 py-3">
										<div className="flex items-center gap-3">
											<img
												src={entry.champion.splashArtUrl}
												alt={entry.champion.name}
												className="h-8 w-8 rounded-full object-cover"
											/>
											<span className="font-medium">{entry.champion.name}</span>
										</div>
									</td>
									<td className="px-4 py-3">
										<span
											className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${TIER_COLORS[entry.tier]}`}>
											{entry.tier}
										</span>
									</td>
									<td className="px-4 py-3 text-muted-foreground">{entry.role}</td>
									<td className="px-4 py-3 text-right tabular-nums">{(entry.winRate * 100).toFixed(1)}%</td>
									<td className="px-4 py-3 text-right tabular-nums">{(entry.pickRate * 100).toFixed(1)}%</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}
