import { createFileRoute, useRouter } from "@tanstack/react-router";
import type { ChangeEvent, JSX } from "react";
import { useCallback, useState } from "react";

export const Route = createFileRoute("/login")({
	component: LoginPage,
});

function LoginPage(): JSX.Element {
	const router = useRouter();
	const { callbackUrl } = Route.useSearch<{ callbackUrl?: string }>();
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [pending, setPending] = useState(false);

	const handleUsernameChange = useCallback((e: ChangeEvent<HTMLInputElement>): void => {
		setUsername(e.target.value);
	}, []);

	const handlePasswordChange = useCallback((e: ChangeEvent<HTMLInputElement>): void => {
		setPassword(e.target.value);
	}, []);

	const handleSubmit = useCallback(
		async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
			e.preventDefault();
			setPending(true);
			setError(null);

			try {
				// Fetch CSRF token from Auth.js
				const csrfRes = await fetch("/api/auth/csrf");
				const { csrfToken } = (await csrfRes.json()) as Record<string, string>;

				// POST credentials to Auth.js callback
				const body = new URLSearchParams({ username, password, csrfToken });
				const res = await fetch("/api/auth/callback/credentials", {
					method: "POST",
					headers: { "Content-Type": "application/x-www-form-urlencoded" },
					body: body.toString(),
					redirect: "manual",
				});

				if (res.ok || res.type === "opaqueredirect" || res.status === 302) {
					await router.invalidate();
					globalThis.location.href = callbackUrl ?? "/";
				} else {
					setError("Invalid username or password.");
				}
			} catch {
				setError("Sign in failed. Please try again.");
			} finally {
				setPending(false);
			}
		},
		[username, password, router, callbackUrl],
	);

	return (
		<div className="flex min-h-[60vh] items-center justify-center">
			<div className="w-full max-w-sm space-y-6">
				<div className="space-y-1 text-center">
					<h1 className="text-2xl font-bold">Sign in to Rift</h1>
					<p className="text-sm text-muted-foreground">Demo credentials: rift-demo / demo</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-1">
						<label htmlFor="username" className="text-sm font-medium">
							Username
						</label>
						<input
							id="username"
							name="username"
							type="text"
							autoComplete="username"
							required
							value={username}
							onChange={handleUsernameChange}
							className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
							placeholder="rift-demo"
						/>
					</div>

					<div className="space-y-1">
						<label htmlFor="password" className="text-sm font-medium">
							Password
						</label>
						<input
							id="password"
							name="password"
							type="password"
							autoComplete="current-password"
							required
							value={password}
							onChange={handlePasswordChange}
							className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
							placeholder="demo"
						/>
					</div>

					{error ? <p className="text-sm text-destructive">{error}</p> : null}

					<button
						type="submit"
						disabled={pending}
						className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors">
						{pending ? "Signing in…" : "Sign in"}
					</button>
				</form>
			</div>
		</div>
	);
}
