"use client";

import type { JSX } from "react";
import { useCallback, useState } from "react";

type SignOutButtonProps = {
	/** Server action from the zone's own `signOut` (wraps NextAuth signOut). */
	action: () => Promise<void>;
};

/**
 * Sign-out button. Calls the zone-provided server action which invokes
 * NextAuth's `signOut`. Shared `AUTH_SECRET` means any zone can clear the JWT.
 */
export function SignOutButton({ action }: SignOutButtonProps): JSX.Element {
	const [pending, setPending] = useState(false);

	const handleSubmit = useCallback((): void => {
		setPending(true);
	}, []);

	return (
		<form action={action} onSubmit={handleSubmit}>
			<button
				type="submit"
				disabled={pending}
				className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50">
				{pending ? "Signing out…" : "Sign out"}
			</button>
		</form>
	);
}
