import { fetchChampions } from "@rift/data-access";
import { LolChampionCard } from "@rift/ui/react";
import type { Metadata } from "next";
import Link from "next/link";
import type { JSX } from "react";

import { API_URL } from "@/env";

export const metadata: Metadata = { title: "All Champions" };

// ISR — champion data is patch-stable; cache each render for 5 minutes.
export const revalidate = 300;

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
				{champions.map((champion, index) => (
					<Link
						key={champion.id}
						href={`/champions/${champion.id}`}
						className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg">
						<LolChampionCard
							name={champion.name}
							splashArtUrl={champion.splashArtUrl}
							roles={champion.roles.join(",")}
							difficulty={champion.difficulty}
							// First row (5 cols on lg+): load eagerly — these are the LCP candidates.
							// fetchpriority is forwarded as a host attribute; Stencil passes it to
							// the browser which uses it as a resource priority hint.
							loading={index < 5 ? "eager" : "lazy"}
							fetchpriority={index === 0 ? "high" : "auto"}
						/>
					</Link>
				))}
			</div>
		</div>
	);
}
