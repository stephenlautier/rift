import { fetchChampionDetail } from "@rift/data-access";
import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import type { JSX } from "react";

const API_URL = process.env.API_URL ?? "http://localhost:3100";

const fetchDetail = createServerFn()
	.validator((id: string) => id)
	.handler(({ data: id }) => fetchChampionDetail(id, API_URL));

export const Route = createFileRoute("/champions/$id")({
	head: ({ loaderData }) => ({ meta: [{ title: loaderData ? loaderData.name : "Champion" }] }),
	loader: ({ params }) => fetchDetail({ data: params.id }),
	component: ChampionDetailPage,
});

function ChampionDetailPage(): JSX.Element {
	const champion = Route.useLoaderData();
	return (
		<div className="space-y-8">
			<Link to="/champions/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
				← Back to champions
			</Link>

			{/* Splash art hero */}
			<div className="relative h-64 sm:h-80 rounded-xl overflow-hidden">
				<img src={champion.splashArtUrl} alt={champion.name} className="w-full h-full object-cover object-top" />
				<div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
				<div className="absolute bottom-4 left-4">
					<h1 className="text-4xl font-bold text-white drop-shadow">{champion.name}</h1>
					<p className="text-sm text-white/80 mt-1">{champion.roles.join(" · ")}</p>
				</div>
			</div>

			{/* Lore */}
			{champion.lore ? <p className="text-muted-foreground leading-relaxed">{champion.lore}</p> : null}

			{/* Abilities */}
			{champion.abilities.length > 0 ? (
				<section className="space-y-3">
					<h2 className="text-xl font-semibold">Abilities</h2>
					<div className="space-y-3">
						{champion.abilities.map(ability => (
							<div key={ability.id} className="rounded-lg border border-border p-4 space-y-1">
								<div className="flex items-center gap-2">
									<span className="text-xs font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded">
										{ability.slot}
									</span>
									<span className="font-medium">{ability.name}</span>
									{ability.cooldown ? (
										<span className="text-xs text-muted-foreground ml-auto">{ability.cooldown}s cooldown</span>
									) : null}
								</div>
								<p className="text-sm text-muted-foreground">{ability.description}</p>
							</div>
						))}
					</div>
				</section>
			) : null}

			{/* Skins */}
			{champion.skins.length > 0 ? (
				<section className="space-y-3">
					<h2 className="text-xl font-semibold">Skins</h2>
					<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
						{champion.skins.map(skin => (
							<div key={skin.id} className="rounded-lg overflow-hidden border border-border">
								<img src={skin.splashArtUrl} alt={skin.name} className="w-full h-28 object-cover object-top" />
								<div className="p-2 space-y-0.5">
									<p className="text-sm font-medium truncate">{skin.name}</p>
									<p className="text-xs text-muted-foreground">
										{skin.rpPrice} RP · {skin.rarity}
									</p>
								</div>
							</div>
						))}
					</div>
				</section>
			) : null}
		</div>
	);
}
