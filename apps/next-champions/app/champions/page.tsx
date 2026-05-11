import { fetchChampions } from "@rift/data-access";
import { LolChampionCard } from "@rift/ui/react";
import type { Metadata } from "next";
import Image from "next/image";
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
						<LolChampionCard name={champion.name} roles={champion.roles.join(",")} difficulty={champion.difficulty}>
							<Image
								slot="splash"
								className="h-full w-full object-cover object-top"
								src={champion.splashArtUrl}
								alt={champion.name}
								width={308}
								height={411}
								priority={index < 5}
							/>
						</LolChampionCard>
					</Link>
				))}
			</div>
		</div>
	);
}
