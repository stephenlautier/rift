import { createFileRoute, Link } from "@tanstack/react-router";
import type { JSX } from "react";

export const Route = createFileRoute("/")({
	component: HomePage,
});

function HomePage(): JSX.Element {
	const { session } = Route.useRouteContext();
	return (
		<div className="space-y-8">
			<section className="space-y-2">
				<h1 className="text-4xl font-bold tracking-tight">Welcome to Rift</h1>
				<p className="text-muted-foreground text-lg">
					League of Legends champion browser, tier list, and player profile — powered by TanStack Start multi-zone.
				</p>
			</section>

			{session ? (
				<p className="text-sm text-muted-foreground">
					Signed in as <span className="font-medium text-foreground">{session.user?.name}</span>
				</p>
			) : (
				<p className="text-sm text-muted-foreground">
					<Link to="/login" className="underline hover:text-foreground transition-colors">
						Sign in
					</Link>{" "}
					to access your player profile.
				</p>
			)}

			<nav className="grid grid-cols-1 sm:grid-cols-3 gap-4">
				{(
					[
						{ href: "/champions", title: "Champions", desc: "Browse all champions and their abilities." },
						{ href: "/tier-list", title: "Tier List", desc: "Current patch rankings by role and tier." },
						{ href: "/player", title: "My Profile", desc: "Your mastery, owned champions, and match history." },
					] as const
				).map(({ href, title, desc }) => (
					<a
						key={href}
						href={href}
						className="block rounded-lg border border-border p-6 hover:bg-accent transition-colors">
						<h2 className="font-semibold mb-1">{title}</h2>
						<p className="text-sm text-muted-foreground">{desc}</p>
					</a>
				))}
			</nav>
		</div>
	);
}
