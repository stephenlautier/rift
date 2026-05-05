"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import type { JSX, SubmitEvent } from "react";
import { useCallback, useState } from "react";

const ERROR_MESSAGES: Record<string, string> = {
	CredentialsSignin: "Invalid username or password.",
	Configuration: "The auth provider is misconfigured — check server logs.",
};

type LoginFormProps = {
	callbackUrl: string;
	error?: string | undefined;
};

export function LoginForm({ callbackUrl, error: initialError }: LoginFormProps): JSX.Element {
	const router = useRouter();
	const [pending, setPending] = useState(false);
	const [loginError, setLoginError] = useState(initialError ? (ERROR_MESSAGES[initialError] ?? initialError) : null);

	const handleSubmit = useCallback(
		(event: SubmitEvent<HTMLFormElement>): void => {
			event.preventDefault();
			setLoginError(null);
			setPending(true);
			const form = new FormData(event.currentTarget);
			const username = form.get("username");
			const password = form.get("password");
			if (typeof username !== "string" || typeof password !== "string") {
				setPending(false);
				return;
			}
			void signIn("credentials", { username, password, redirect: false })
				.then(result => {
					if (result?.error) {
						setLoginError(ERROR_MESSAGES[result.error] ?? "Sign-in failed. Please try again.");
					} else {
						router.push(callbackUrl);
						router.refresh();
					}
				})
				.catch((error: unknown) => {
					setLoginError(error instanceof Error ? error.message : "Sign-in failed. Please try again.");
				})
				.finally(() => {
					setPending(false);
				});
		},
		[callbackUrl, router],
	);

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			{loginError && (
				<div role="alert" className="rounded-md bg-destructive/10 text-destructive px-4 py-3 text-sm">
					{loginError}
				</div>
			)}
			<div className="space-y-2">
				<label htmlFor="username" className="text-sm font-medium">
					Username
				</label>
				<input
					id="username"
					name="username"
					type="text"
					autoComplete="username"
					required
					defaultValue="rift-demo"
					className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
				/>
			</div>
			<div className="space-y-2">
				<label htmlFor="password" className="text-sm font-medium">
					Password
				</label>
				<input
					id="password"
					name="password"
					type="password"
					autoComplete="current-password"
					required
					className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
				/>
			</div>
			<button
				type="submit"
				disabled={pending}
				className="w-full rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
				{pending ? "Signing in\u2026" : "Sign in"}
			</button>
		</form>
	);
}
