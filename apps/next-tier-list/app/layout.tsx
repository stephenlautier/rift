import { Header, Providers, ThemeSwitcher, THEME_COOKIE_NAME } from "@rift/next-shared";
import type { ThemeMode } from "@rift/next-shared";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import type { JSX, ReactNode } from "react";
import "./globals.css";

import { auth } from "@/auth";

export const metadata: Metadata = {
	title: { default: "Tier List | Rift", template: "%s | Tier List | Rift" },
};

export default async function TierListLayout({ children }: { children: ReactNode }): Promise<JSX.Element> {
	const [session, cookieStore] = await Promise.all([auth(), cookies()]);
	const rawTheme = cookieStore.get(THEME_COOKIE_NAME)?.value ?? "system";
	const initialTheme: ThemeMode =
		rawTheme === "light" || rawTheme === "dark" || rawTheme === "system" ? rawTheme : "system";

	const shellOrigin = process.env.SHELL_ORIGIN ?? "http://localhost:3000";
	async function signOutAction(): Promise<void> {
		"use server";
		// oxlint-disable-next-line typescript/require-await -- required by next-auth server action interface
		throw new Error(`NEXT_REDIRECT:${shellOrigin}/api/auth/signout`);
	}

	return (
		<html lang="en" suppressHydrationWarning>
			<head />
			<body className="min-h-screen bg-background text-foreground antialiased">
				<Providers initialTheme={initialTheme}>
					<div className="min-h-screen flex flex-col">
						<Header session={session} signOutAction={signOutAction} />
						<div className="flex items-center justify-end px-4 py-1 border-b border-border">
							<ThemeSwitcher />
						</div>
						<main className="flex-1 container mx-auto px-4 py-8">{children}</main>
					</div>
				</Providers>
			</body>
		</html>
	);
}
