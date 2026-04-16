import { Box, Button, CloseButton, Group, InputBase, type ButtonProps } from "@mantine/core";
import { useAtom, type WritableAtom } from "jotai";
import type React from "react";
import { useCallback, useEffect, useRef, type ReactNode } from "react";

export type EditAtom<T> = WritableAtom<T, [T | ((prev: T) => T)], void>;

export const Deatom = <Data, Props,>({
	atom,
	component: Component,
	...props
}: Omit<Props, "value" | "onChange"> & {
	component: React.ComponentType<Props & { value: Data; onChange: (value: Data | React.ChangeEvent<HTMLInputElement>) => void }>;
	atom: EditAtom<Data>;
}) => {
	const [value, onChange] = useAtom(atom);
	const handleChange = useCallback((v: Data | React.ChangeEvent<HTMLInputElement>) => {
		if (v && typeof v === "object" && "currentTarget" in v) onChange((v as React.ChangeEvent<HTMLInputElement>).currentTarget.value as unknown as Data);
		else onChange(v as Data);
	}, [onChange]);
	// @ts-ignore
	return <Component {...(props as Props)} value={value} onChange={handleChange} />;
};

export interface DeatomableComponentProps<Data> {
	value: Data;
	onChange: (value: Data) => void;
	onDelete: () => void;
};

export const DeatomOptional = <Data, Props>({
	atom,
	component: Component,
	set,
	setLabel = "Click to Set",
	withDeleteButton = false,
	...props
}: Omit<Props, keyof DeatomableComponentProps<Data> | "set"> & {
	component: React.ComponentType<Props & DeatomableComponentProps<Data> & { ref?: React.Ref<any> }>;
	atom: EditAtom<Data | undefined>;
	set: Data | (() => Data);
	setLabel?: ReactNode;
	withDeleteButton?: boolean;
}) => {
	const [value, onChange] = useAtom(atom);
	const ref = useRef<any>(null);

	const prevValue = useRef<Data | undefined>(value);
	useEffect(() => {
		if (prevValue.current === undefined && value !== undefined && ref.current && "focus" in ref.current && typeof ref.current.focus === "function") {
			(ref.current.focus as () => void)();
		}
		prevValue.current = value;
	}, [value]);

	const handleSet = () => onChange(typeof set === "function" ? (set as () => Data)() : set);

	if (value === undefined) {
		return (
			<InputBase
				component="button"
				onClick={handleSet}
				onMouseDown={handleSet}
				color="gray"
			>
				<Box c="dimmed">{setLabel}</Box>
			</InputBase>
		);
	}

	return (
		<Group flex="1" gap={4}>
			<Box flex="1">
				{/* @ts-ignore */}
				<Component {...(props as unknown as Props)} value={value} onChange={onChange} onDelete={() => onChange(undefined as Data)} ref={ref} />
			</Box>
			{withDeleteButton && <CloseButton onClick={() => onChange(undefined as Data)} />}
		</Group>
	);
};

