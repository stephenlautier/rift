"use client";

import Link from "next/link";
import type { JSX } from "react";

export default function ChampionsError(): JSX.Element {
	return (
		<div className="flex flex-col items-center justify-center py-20 text-center gap-4">
			<p className="text-muted-foreground">Failed to load champions. Please try again later.</p>
			<Link href="/" className="text-sm underline underline-offset-4 hover:text-foreground transition-colors">
				Go home
			</Link>
		</div>
	);
}
