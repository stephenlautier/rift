import { Header, Providers, ThemeSwitcher, ThemeScript, THEME_COOKIE_NAME } from "@rift/next-shared";
import type { ThemeMode } from "@rift/next-shared";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import type { JSX, ReactNode } from "react";
import "./globals.css";

import { auth, signOut } from "@/auth";
import { AUTH_URL } from "@/env";

export const metadata: Metadata = {
	title: { default: "My Profile | Rift", template: "%s | Player | Rift" },
};

export default async function PlayerLayout({ children }: { children: ReactNode }): Promise<JSX.Element> {
	const [session, cookieStore] = await Promise.all([auth(), cookies()]);
	const rawTheme = cookieStore.get(THEME_COOKIE_NAME)?.value ?? "system";
	const initialTheme: ThemeMode =
		rawTheme === "light" || rawTheme === "dark" || rawTheme === "system" ? rawTheme : "system";

	async function signOutAction(): Promise<void> {
		"use server";
		await signOut({ redirectTo: AUTH_URL });
	}

	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<ThemeScript />
			</head>
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
