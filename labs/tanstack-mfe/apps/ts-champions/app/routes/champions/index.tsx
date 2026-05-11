import { fetchChampions } from "@rift/data-access";
import { LolChampionCard } from "@rift/ui/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import type { JSX } from "react";

const API_URL = process.env.API_URL ?? "http://localhost:3100";

/**
 * Server function that fetches the full champion list from the Hono API.
 * Runs on the server during SSR and as an RPC call on client-side navigation.
 */
const fetchChampionList = createServerFn().handler(() => fetchChampions(API_URL));

export const Route = createFileRoute("/champions/")({
	head: () => ({ meta: [{ title: "Champions" }] }),
	loader: () => fetchChampionList(),
	component: ChampionsListPage,
});

function ChampionsListPage(): JSX.Element {
	const champions = Route.useLoaderData();
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
					/**
					 * Intra-zone: /champions/$id is owned by this zone → use <Link>
					 * for SPA navigation (no page reload).
					 */
					<Link
						key={champion.id}
						to="/champions/$id"
						params={{ id: champion.id }}
						className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg">
						<LolChampionCard name={champion.name} roles={champion.roles.join(",")} difficulty={champion.difficulty}>
							<img
								slot="splash"
								className="h-full w-full object-cover object-top"
								src={champion.splashArtUrl}
								alt={champion.name}
							/>
						</LolChampionCard>
					</Link>
				))}
			</div>
		</div>
	);
}
