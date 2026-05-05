import { fetchPlayerChampions, fetchPlayerMatches, fetchPlayerMe } from "@rift/data-access";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { JSX } from "react";

export const metadata: Metadata = { title: "My Profile" };

function formatKda(kills: number, deaths: number, assists: number): string {
	const kda = deaths === 0 ? kills + assists : (kills + assists) / deaths;
	return `${kda.toFixed(2)} KDA`;
}

function formatDuration(sec: number): string {
	const m = Math.floor(sec / 60);
	const s = sec % 60;
	return `${m}:${String(s).padStart(2, "0")}`;
}

export default async function PlayerDashboardPage(): Promise<JSX.Element> {
	const apiUrl = process.env.API_URL ?? "http://localhost:3100";
	const cookieStore = await cookies();
	const cookieHeader = cookieStore.toString();

	try {
		const [player, playerChampions, matches] = await Promise.all([
			fetchPlayerMe(cookieHeader, `${apiUrl}/api`),
			fetchPlayerChampions(cookieHeader, `${apiUrl}/api`),
			fetchPlayerMatches(cookieHeader, `${apiUrl}/api`),
		]);

		const topMastery = [...playerChampions].toSorted((a, b) => b.masteryPoints - a.masteryPoints).slice(0, 3);

		const recentMatches = matches.slice(0, 10);

		return (
			<div className="space-y-8">
				{/* Profile header */}
				<div className="space-y-1">
					<h1 className="text-3xl font-bold">{player.summonerName}</h1>
					<p className="text-muted-foreground text-sm">Level {player.summonerLevel}</p>
				</div>

				{/* Top mastery */}
				<section className="space-y-3">
					<h2 className="text-xl font-semibold">Top Champions</h2>
					<div className="grid grid-cols-3 gap-4">
						{topMastery.map((pc, i) => (
							<a
								key={pc.championId}
								href={`/champions/${pc.championId}`}
								className="rounded-lg border border-border p-4 hover:bg-accent transition-colors text-center">
								<div className="text-2xl font-bold text-muted-foreground mb-1">#{i + 1}</div>
								<div className="font-medium">{pc.championId}</div>
								<div className="text-xs text-muted-foreground">
									Mastery {pc.masteryLevel} · {pc.masteryPoints.toLocaleString()} pts
								</div>
							</a>
						))}
					</div>
				</section>

				{/* Match history */}
				<section className="space-y-3">
					<h2 className="text-xl font-semibold">Recent Matches</h2>
					<div className="rounded-xl border border-border overflow-hidden">
						<table className="w-full text-sm">
							<thead>
								<tr className="border-b border-border bg-muted/50">
									<th className="text-left px-4 py-3 font-medium text-muted-foreground">Champion</th>
									<th className="text-left px-4 py-3 font-medium text-muted-foreground">Role</th>
									<th className="text-right px-4 py-3 font-medium text-muted-foreground">K/D/A</th>
									<th className="text-right px-4 py-3 font-medium text-muted-foreground">Duration</th>
									<th className="text-right px-4 py-3 font-medium text-muted-foreground">Result</th>
								</tr>
							</thead>
							<tbody>
								{recentMatches.map(match => (
									<tr
										key={match.id}
										className={`border-b border-border last:border-0 ${match.win ? "bg-green-500/5" : "bg-red-500/5"}`}>
										<td className="px-4 py-3">
											<a href={`/champions/${match.championId}`} className="hover:underline">
												{match.championId}
											</a>
										</td>
										<td className="px-4 py-3 text-muted-foreground">{match.role}</td>
										<td className="px-4 py-3 text-right tabular-nums">
											{match.kills}/{match.deaths}/{match.assists}
											<span className="text-muted-foreground ml-1 text-xs">
												{formatKda(match.kills, match.deaths, match.assists)}
											</span>
										</td>
										<td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
											{formatDuration(match.gameDuration)}
										</td>
										<td className={`px-4 py-3 text-right font-medium ${match.win ? "text-green-500" : "text-red-500"}`}>
											{match.win ? "Win" : "Loss"}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</section>
			</div>
		);
	} catch {
		notFound();
		// notFound() throws a NEXT_NOT_FOUND error internally — but TypeScript
		// can't infer that, so we provide an explicit return to satisfy consistent-return
		return <></>;
	}
}
