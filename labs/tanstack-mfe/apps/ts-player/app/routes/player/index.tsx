import { fetchPlayerMe, fetchPlayerChampions, fetchPlayerMatches, fetchChampions } from "@rift/data-access";
// Stencil React output-target wrappers
import { LolChampionCard } from "@rift/ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import type { JSX } from "react";

const API_URL = process.env.API_URL ?? "http://localhost:3100";

/**
 * Fetches all player profile data in one server function.
 * Forwarding the Cookie header ensures the API can identify the session.
 */
const fetchPlayerProfile = createServerFn().handler(async () => {
	const request = getRequest();
	const cookie = request.headers.get("cookie") ?? "";

	const [me, allChampions] = await Promise.all([fetchPlayerMe(cookie, API_URL), fetchChampions(API_URL)]);

	const [playerChampions, matches] = await Promise.all([
		fetchPlayerChampions(cookie, API_URL),
		fetchPlayerMatches(cookie, API_URL),
	]);

	const byId = new Map(allChampions.map(c => [c.id, c]));

	const topMastery = [...playerChampions]
		.toSorted((a, b) => b.masteryPoints - a.masteryPoints)
		.slice(0, 3)
		.map(pc => ({ ...pc, champion: byId.get(pc.championId) }));

	const ownedChampions = playerChampions
		.filter(pc => pc.owned)
		.map(pc => ({ ...pc, champion: byId.get(pc.championId) }));

	const enrichedMatches = matches.map(m => ({
		...m,
		champion: byId.get(m.championId),
	}));

	return { me, topMastery, ownedChampions, matches: enrichedMatches };
});

export const Route = createFileRoute("/player/")({
	head: () => ({ meta: [{ title: "Player Profile" }] }),
	loader: () => fetchPlayerProfile(),
	component: PlayerPage,
});

function PlayerPage(): JSX.Element {
	const { me, topMastery, ownedChampions, matches } = Route.useLoaderData();

	return (
		<div className="space-y-10">
			{/* Profile header */}
			<div className="flex items-center gap-6">
				<div className="h-16 w-16 rounded-full bg-accent flex items-center justify-center text-2xl font-bold">
					{me.summonerName.slice(0, 2).toUpperCase()}
				</div>
				<div>
					<h1 className="text-2xl font-bold">{me.summonerName}</h1>
					<p className="text-muted-foreground">Level {me.summonerLevel}</p>
				</div>
			</div>

			{/* Top 3 champions by mastery */}
			<section>
				<h2 className="text-lg font-semibold mb-4">Top Champions</h2>
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
					{topMastery.map(pc =>
						pc.champion ? (
							<LolChampionCard key={pc.championId} name={pc.champion.name} roles={pc.champion.roles.join(", ")}>
								<img
									slot="splash"
									className="h-full w-full object-cover object-top"
									src={pc.champion.splashArtUrl}
									alt={pc.champion.name}
								/>
							</LolChampionCard>
						) : null,
					)}
				</div>
			</section>

			{/* Owned champions */}
			<section>
				<h2 className="text-lg font-semibold mb-4">Owned Champions</h2>
				<div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
					{ownedChampions.map(pc =>
						pc.champion ? (
							<a
								key={pc.championId}
								href={`/champions/${pc.champion.id}`}
								className="block rounded-lg overflow-hidden border border-border hover:border-primary transition-colors">
								<img
									src={pc.champion.splashArtUrl}
									alt={pc.champion.name}
									className="w-full aspect-square object-cover object-top"
								/>
								<p className="text-xs text-center py-1 px-2 truncate">{pc.champion.name}</p>
							</a>
						) : null,
					)}
				</div>
			</section>

			{/* Match history */}
			<section>
				<h2 className="text-lg font-semibold mb-4">Match History</h2>
				<div className="space-y-2">
					{matches.map(m => (
						<div
							key={m.id}
							className={`flex items-center gap-4 rounded-lg border p-3 ${
								m.win ? "border-green-500/30 bg-green-500/5" : "border-red-500/30 bg-red-500/5"
							}`}>
							<span className={`text-xs font-bold ${m.win ? "text-green-500" : "text-red-500"}`}>
								{m.win ? "WIN" : "LOSS"}
							</span>
							{m.champion && (
								<img
									src={m.champion.splashArtUrl}
									alt={m.champion.name}
									className="h-8 w-8 rounded-full object-cover object-top"
								/>
							)}
							<span className="text-sm font-medium">{m.champion?.name ?? m.championId}</span>
							<span className="text-xs text-muted-foreground">{m.role}</span>
							<span className="text-sm font-mono">
								{m.kills}/{m.deaths}/{m.assists}
							</span>
							<span className="text-xs text-muted-foreground ml-auto">{Math.floor(m.gameDuration / 60)}m</span>
						</div>
					))}
				</div>
			</section>
		</div>
	);
}
