"use client";

import Link from "next/link";

export default function ChampionDetailError() {
	return (
		<div className="flex flex-col items-center justify-center py-20 text-center gap-4">
			<p className="text-muted-foreground">Failed to load champion data. Please try again later.</p>
			<Link href="/champions" className="text-sm underline underline-offset-4 hover:text-foreground transition-colors">
				Back to Champions
			</Link>
		</div>
	);
}
