import { fetchChampions } from "@rift/data-access";
import { LolChampionCard } from "@rift/ui/react";
import type { Metadata } from "next";
import Link from "next/link";
import type { JSX } from "react";

import { API_URL } from "@/env";

export const metadata: Metadata = { title: "All Champions" };

export default async function ChampionsPage(): Promise<JSX.Element> {
	const champions = await fetchChampions(API_URL);

	return (
		<div>
			<div className="mb-8">
				<h1 className="text-3xl font-bold tracking-tight">Champions</h1>
				<p className="mt-1 text-muted-foreground">
					{champions.length} champions — browse and discover abilities, skins and lore.
				</p>
			</div>

			<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
				{champions.map(champion => (
					<Link
						key={champion.id}
						href={`/champions/${champion.id}`}
						className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg">
						<LolChampionCard
							name={champion.name}
							splashArtUrl={champion.splashArtUrl}
							roles={champion.roles.join(",")}
							difficulty={champion.difficulty}
						/>
					</Link>
				))}
			</div>
		</div>
	);
}
