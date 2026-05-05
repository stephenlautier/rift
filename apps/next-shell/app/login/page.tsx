import type { Metadata } from "next";
import type { JSX } from "react";

import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
	searchParams,
}: {
	searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}): Promise<JSX.Element> {
	const { callbackUrl, error } = await searchParams;
	return (
		<div className="flex min-h-[60vh] items-center justify-center">
			<div className="w-full max-w-sm space-y-6">
				<div className="space-y-1 text-center">
					<h1 className="text-2xl font-bold">Sign in to Rift</h1>
					<p className="text-sm text-muted-foreground">Demo credentials: rift-demo / demo</p>
				</div>
				<LoginForm callbackUrl={callbackUrl ?? "/"} error={error} />
			</div>
		</div>
	);
}
