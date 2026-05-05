import { TierSchema, ChampionRoleSchema } from "@rift/champion";
import { fetchTierList } from "@rift/data-access";
import type { Metadata } from "next";
import type { JSX } from "react";
import * as v from "valibot";

import { TierListFilters } from "@/tier-list/TierListFilters";

export const metadata: Metadata = { title: "Tier List" };

const TIER_COLORS: Record<string, string> = {
	S: "text-amber-400 font-bold",
	A: "text-purple-400 font-bold",
	B: "text-blue-400 font-bold",
	C: "text-green-400 font-bold",
	D: "text-gray-400 font-bold",
};

function parseTier(value: unknown) {
	const result = v.safeParse(TierSchema, value);
	return result.success ? result.output : undefined;
}

function parseRole(value: unknown) {
	const result = v.safeParse(ChampionRoleSchema, value);
	return result.success ? result.output : undefined;
}

type TierListPageProps = {
	searchParams: Promise<{ tier?: string; role?: string; patch?: string }>;
};

export default async function TierListPage({ searchParams }: TierListPageProps): Promise<JSX.Element> {
	const { tier, role, patch } = await searchParams;
	const apiUrl = process.env.API_URL ?? "http://localhost:3100";

	const filters = {
		tier: parseTier(tier),
		role: parseRole(role),
		patch: patch === "latest" ? undefined : patch,
	};

	const tierList = await fetchTierList(filters, `${apiUrl}/api`);

	// Extract unique patches from data for the filter control
	const patches = [...new Set(tierList.map(entry => entry.patch))].toSorted((a, b) => b.localeCompare(a));

	return (
		<div className="space-y-6">
			<h1 className="text-3xl font-bold tracking-tight">Tier List</h1>

			{/* Client filter UI — reads/writes Jotai atoms */}
			<TierListFilters patches={patches} />

			{/* Server-rendered rows */}
			<div className="rounded-xl border border-border overflow-hidden">
				<table className="w-full text-sm">
					<thead>
						<tr className="border-b border-border bg-muted/50">
							<th className="text-left px-4 py-3 font-medium text-muted-foreground">Tier</th>
							<th className="text-left px-4 py-3 font-medium text-muted-foreground">Champion</th>
							<th className="text-left px-4 py-3 font-medium text-muted-foreground">Role</th>
							<th className="text-right px-4 py-3 font-medium text-muted-foreground">Win%</th>
							<th className="text-right px-4 py-3 font-medium text-muted-foreground">Pick%</th>
							<th className="text-right px-4 py-3 font-medium text-muted-foreground">Patch</th>
						</tr>
					</thead>
					<tbody>
						{tierList.length === 0 ? (
							<tr>
								<td colSpan={6} className="text-center py-12 text-muted-foreground">
									No data for the selected filters.
								</td>
							</tr>
						) : (
							tierList.map(entry => (
								<tr key={entry.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
									<td className={`px-4 py-3 ${TIER_COLORS[entry.tier] ?? ""}`}>{entry.tier}</td>
									<td className="px-4 py-3">
										<a href={`/champions/${entry.championId}`} className="hover:underline text-foreground">
											{entry.championId}
										</a>
									</td>
									<td className="px-4 py-3 text-muted-foreground">{entry.role}</td>
									<td className="px-4 py-3 text-right tabular-nums">{(entry.winRate * 100).toFixed(1)}%</td>
									<td className="px-4 py-3 text-right tabular-nums">{(entry.pickRate * 100).toFixed(1)}%</td>
									<td className="px-4 py-3 text-right text-muted-foreground">{entry.patch}</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}
