"use client";

import { useCallback } from "react";
import type { ReactNode } from "react";

type Props<T> = {
	value: T;
	active: boolean;
	onSelect: (value: T) => void;
	className: string;
	children: ReactNode;
};

export function FilterButton<T>({ value, active, onSelect, className, children }: Props<T>): ReactNode {
	const handleClick = useCallback(() => {
		onSelect(value);
	}, [onSelect, value]);

	return (
		<button type="button" onClick={handleClick} className={className} aria-pressed={active}>
			{children}
		</button>
	);
}
