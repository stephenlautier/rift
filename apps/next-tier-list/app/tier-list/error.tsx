"use client";

import type { JSX } from "react";

export default function TierListError(): JSX.Element {
	return (
		<div className="flex flex-col items-center justify-center py-20 text-center gap-4">
			<p className="text-muted-foreground">Failed to load tier list data. Please try again later.</p>
		</div>
	);
}
