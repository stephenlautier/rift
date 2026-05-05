import { fetchChampions } from "@rift/data-access";
import type { Metadata } from "next";
import type { JSX } from "react";

export const metadata: Metadata = { title: "All Champions" };

export default async function ChampionsPage(): Promise<JSX.Element> {
	const apiUrl = process.env.API_URL ?? "http://localhost:3100";
	const champions = await fetchChampions(`${apiUrl}/api`);

	return (
		<div className="space-y-6">
			<h1 className="text-3xl font-bold tracking-tight">Champions</h1>
			<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
				{champions.map(champion => (
					<a
						key={champion.id}
						href={`/champions/${champion.id}`}
						className="group block rounded-lg border border-border overflow-hidden hover:border-primary transition-colors">
						{champion.splashArtUrl ? (
							// oxlint-disable-next-line nextjs/no-img-element -- splash art from known CDN, image optimization overkill here
							<img
								src={champion.splashArtUrl}
								alt={champion.name}
								className="w-full aspect-square object-cover object-top group-hover:scale-105 transition-transform"
							/>
						) : (
							<div className="w-full aspect-square bg-muted flex items-center justify-center">
								<span className="text-muted-foreground text-xs">No image</span>
							</div>
						)}
						<div className="p-2">
							<p className="font-medium text-sm truncate">{champion.name}</p>
							<p className="text-xs text-muted-foreground truncate">{champion.roles.join(", ")}</p>
						</div>
					</a>
				))}
			</div>
		</div>
	);
}
