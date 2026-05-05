import type { ChampionRole } from "@rift/champion";
import { fetchChampion, fetchChampionAbilities, fetchChampionSkins } from "@rift/data-access";
import type { Metadata } from "next";
import type { JSX } from "react";

type ChampionPageProps = {
	params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: ChampionPageProps): Promise<Metadata> {
	const { id } = await params;
	const apiUrl = process.env.API_URL ?? "http://localhost:3100";
	try {
		const champion = await fetchChampion(id, `${apiUrl}/api`);
		return { title: champion.name };
	} catch {
		return { title: "Champion" };
	}
}

export default async function ChampionDetailPage({ params }: ChampionPageProps): Promise<JSX.Element> {
	const { id } = await params;
	const apiUrl = process.env.API_URL ?? "http://localhost:3100";

	const [champion, abilities, skins] = await Promise.all([
		fetchChampion(id, `${apiUrl}/api`),
		fetchChampionAbilities(id, `${apiUrl}/api`),
		fetchChampionSkins(id, `${apiUrl}/api`),
	]);

	return (
		<div className="space-y-8">
			{/* Hero */}
			<div className="flex gap-6 items-start">
				{champion.splashArtUrl && (
					// oxlint-disable-next-line nextjs/no-img-element -- splash art from external CDN, no Next Image needed
					<img
						src={champion.splashArtUrl}
						alt={champion.name}
						className="w-32 h-32 rounded-lg object-cover object-top shrink-0"
					/>
				)}
				<div className="space-y-2">
					<div className="flex items-center gap-3">
						<h1 className="text-3xl font-bold">{champion.name}</h1>
						<div className="flex gap-1">
							{champion.roles.map((role: ChampionRole) => (
								<span key={role} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
									{role}
								</span>
							))}
						</div>
					</div>
					<p className="text-muted-foreground text-sm">Difficulty: {champion.difficulty}/10</p>
					{champion.lore && <p className="text-sm max-w-2xl">{champion.lore}</p>}
				</div>
			</div>

			{/* Abilities */}
			{abilities.length > 0 && (
				<section className="space-y-3">
					<h2 className="text-xl font-semibold">Abilities</h2>
					<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
						{abilities.map(ability => (
							<div key={ability.id} className="rounded-lg border border-border p-4 space-y-1">
								<div className="flex items-center gap-2">
									<span className="text-xs font-mono bg-primary text-primary-foreground px-1.5 py-0.5 rounded">
										{ability.slot}
									</span>
									<span className="font-medium text-sm">{ability.name}</span>
								</div>
								<p className="text-xs text-muted-foreground">{ability.description}</p>
								{ability.cooldown !== null && ability.cooldown !== undefined && (
									<p className="text-xs text-muted-foreground">CD: {ability.cooldown}s</p>
								)}
							</div>
						))}
					</div>
				</section>
			)}

			{/* Skins */}
			{skins.length > 0 && (
				<section className="space-y-3">
					<h2 className="text-xl font-semibold">Skins</h2>
					<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
						{skins.map(skin => (
							<div key={skin.id} className="rounded-lg border border-border overflow-hidden">
								{skin.splashArtUrl ? (
									// oxlint-disable-next-line nextjs/no-img-element -- skin splash art, no optimization needed
									<img src={skin.splashArtUrl} alt={skin.name} className="w-full aspect-[4/3] object-cover" />
								) : (
									<div className="w-full aspect-[4/3] bg-muted" />
								)}
								<div className="p-2">
									<p className="text-sm font-medium truncate">{skin.name}</p>
									{skin.rpPrice !== null && skin.rpPrice !== undefined && (
										<p className="text-xs text-muted-foreground">{skin.rpPrice} RP</p>
									)}
								</div>
							</div>
						))}
					</div>
				</section>
			)}
		</div>
	);
}
