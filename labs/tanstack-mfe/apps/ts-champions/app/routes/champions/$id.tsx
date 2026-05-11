import { fetchChampionDetail } from "@rift/data-access";
import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import type { JSX } from "react";

const API_URL = process.env.API_URL ?? "http://localhost:3100";

const SLOT_ORDER = ["P", "Q", "W", "E", "R"] as const;
const SLOT_LABEL: Record<string, string> = {
	P: "Passive",
	Q: "Q",
	W: "W",
	E: "E",
	R: "Ultimate",
};

const fetchDetail = createServerFn()
	.inputValidator((id: string) => id)
	.handler(({ data: id }) => fetchChampionDetail(id, API_URL));

export const Route = createFileRoute("/champions/$id")({
	head: ({ loaderData }) => ({ meta: [{ title: loaderData ? loaderData.name : "Champion" }] }),
	loader: ({ params }) => fetchDetail({ data: params.id }),
	component: ChampionDetailPage,
});

function ChampionDetailPage(): JSX.Element {
	const champion = Route.useLoaderData();

	const abilities = [...champion.abilities].toSorted(
		(a, b) =>
			SLOT_ORDER.indexOf(a.slot as (typeof SLOT_ORDER)[number]) -
			SLOT_ORDER.indexOf(b.slot as (typeof SLOT_ORDER)[number]),
	);
	const statEntries = Object.entries(champion.stats);

	return (
		<div>
			{/* Breadcrumb */}
			<nav className="mb-6 text-sm text-muted-foreground">
				<Link to="/champions" className="hover:text-foreground transition-colors">
					Champions
				</Link>
				<span className="mx-2">/</span>
				<span className="text-foreground font-medium">{champion.name}</span>
			</nav>

			{/* Hero — full-width splash with gradient overlay */}
			<section className="relative h-80 overflow-hidden rounded-xl mb-10">
				<img
					src={champion.splashArtUrl}
					alt={champion.name}
					className="absolute inset-0 w-full h-full object-cover object-top"
				/>
				<div className="absolute inset-0 bg-linear-to-t from-background via-background/60 to-transparent" />
				<div className="absolute bottom-0 left-0 p-6">
					<div className="flex flex-wrap gap-2 mb-2">
						{champion.roles.map(role => (
							<span
								key={role}
								className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border border-amber-500/50 bg-amber-500/10 text-amber-400">
								{role}
							</span>
						))}
					</div>
					<h1 className="text-4xl font-bold tracking-tight">{champion.name}</h1>
					<div className="flex items-center gap-2 mt-2">
						<span className="text-xs text-muted-foreground">Difficulty</span>
						<div className="flex gap-1">
							{Array.from({ length: 10 }, (_, i) => (
								<span
									key={i}
									className={`w-3 h-1.5 rounded-sm ${i < champion.difficulty ? "bg-amber-400" : "bg-muted"}`}
								/>
							))}
						</div>
						<span className="text-xs text-muted-foreground">{champion.difficulty}/10</span>
					</div>
				</div>
			</section>

			{/* Lore */}
			{champion.lore ? (
				<section className="mb-10">
					<h2 className="text-xl font-semibold mb-3">Lore</h2>
					<p className="text-muted-foreground leading-relaxed max-w-3xl">{champion.lore}</p>
				</section>
			) : null}

			{/* Abilities */}
			{abilities.length > 0 ? (
				<section className="mb-10">
					<h2 className="text-xl font-semibold mb-4">Abilities</h2>
					<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
						{abilities.map(ability => (
							<div key={ability.id} className="rounded-lg border border-border bg-card p-4">
								<div className="flex items-center gap-2 mb-2">
									<span className="inline-flex items-center justify-center whitespace-nowrap rounded bg-muted px-2 py-1 text-xs font-bold text-muted-foreground">
										{SLOT_LABEL[ability.slot] ?? ability.slot}
									</span>
									<span className="font-semibold text-sm">{ability.name}</span>
									{ability.cooldown !== null && ability.cooldown !== undefined && (
										<span className="ml-auto text-xs text-muted-foreground">{ability.cooldown}s CD</span>
									)}
								</div>
								<p className="text-xs text-muted-foreground leading-relaxed">{ability.description}</p>
							</div>
						))}
					</div>
				</section>
			) : null}

			{/* Skins */}
			{champion.skins.length > 0 ? (
				<section className="mb-10">
					<h2 className="text-xl font-semibold mb-4">Skins</h2>
					<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
						{champion.skins.map(skin => (
							<div key={skin.id} className="rounded-lg overflow-hidden border border-border group">
								<div className="relative aspect-video overflow-hidden">
									<img
										src={skin.splashArtUrl}
										alt={skin.name}
										className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
									/>
								</div>
								<div className="p-2">
									<p className="text-xs font-medium truncate">{skin.name}</p>
									<div className="flex items-center justify-between mt-1">
										<span className="text-xs capitalize text-muted-foreground">{skin.rarity}</span>
										{skin.rpPrice > 0 && (
											<span className="text-xs font-semibold text-amber-400">{skin.rpPrice} RP</span>
										)}
									</div>
								</div>
							</div>
						))}
					</div>
				</section>
			) : null}

			{/* Base Stats */}
			{statEntries.length > 0 ? (
				<section className="mb-10">
					<h2 className="text-xl font-semibold mb-4">Base Stats</h2>
					<div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 max-w-2xl">
						{statEntries.map(([key, value]) => (
							<div key={key} className="rounded-lg border border-border bg-card px-3 py-2">
								<p className="text-xs text-muted-foreground capitalize">{key.replaceAll(/([A-Z])/g, " $1")}</p>
								<p className="text-sm font-semibold">{String(value)}</p>
							</div>
						))}
					</div>
				</section>
			) : null}
		</div>
	);
}
