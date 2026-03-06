import type { EventData, Venue, VenueType } from "@evnt/schema";
import { Deatom, type EditAtom } from "../edit-atom";
import { Button, CloseButton, Group, Input, Paper, SegmentedControl, SimpleGrid, Stack, Text, type SegmentedControlProps } from "@mantine/core";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { useMemo, type ComponentType, type ReactNode } from "react";
import { IconGlobe, IconMapPin, IconQuestionMark, IconWorld } from "@tabler/icons-react";
import { TranslationsInput } from "../../base/input/TranslationsInput";
import { focusAtom } from "jotai-optics";
import { EditVenuePhysical } from "./EditVenuePhysical";
import { EditVenueOnline } from "./EditVenueOnline";
import { Snippet } from "../../content/Snippet";
import { snippetVenue } from "@evnt/pretty";
import { CollapsiblePaper } from "./CollapsiblePaper";

export const EditVenue = ({
	venue,
	data,
}: {
	data: EditAtom<EventData>;
	venue: EditAtom<Venue>;
}) => {
	const venueId = useAtomValue(useMemo(() => atom((get) => get(venue).id), [venue]));
	const venueType = useAtomValue(useMemo(() => atom((get) => get(venue).type), [venue]));

	// atomically change a venue id across all instances and itself
	// return false if the newVenueId already exists
	const changeVenueId = useSetAtom(useMemo(() => atom(null, (get, set, { fromVenueId, toVenueId }: { fromVenueId: string; toVenueId: string }): boolean => {
		if (get(data).venues?.some((v, i) => v.id === toVenueId)) {
			return false;
		}

		set(data, prev => {
			return {
				...prev,
				venues: prev.venues?.map((v) => v.id === fromVenueId ? { ...v, id: toVenueId } : v),
				instances: prev.instances?.map(instance => ({
					...instance,
					venueIds: instance.venueIds?.map(venueId => venueId === fromVenueId ? toVenueId : venueId),
				})) ?? [],
			};
		});

		return true;
	}), [data]));

	// write-only atom to change the venueType
	// helper for if in the future we want logic or required fields
	const setVenueType = useSetAtom(useMemo(() => atom(null, (get, set, newType: VenueType) => {
		set(venue, prev => ({
			...prev,
			type: newType,
		}));
	}), [venue]));

	const onDelete = useSetAtom(useMemo(() => atom(null, (get, set) => {
		set(data, prev => ({
			...prev,
			venues: prev.venues?.filter((venue) => venue.id !== venueId),
			instances: prev.instances?.map(instance => ({
				...instance,
				venueIds: instance.venueIds?.filter((venueId) => venueId !== venueId),
			})) ?? [],
		}));
	}), [data]));

	return (
		<CollapsiblePaper
			title={(
				<VenueAtomDisplay venue={venue} />
			)}
			onDelete={onDelete}
		>
			<Deatom
				component={TranslationsInput}
				atom={focusAtom(venue, o => o.prop("name"))}
				label="Venue Name"
				description="Place name, URL description, etc."
			/>

			<Group gap={4} justify="space-between">
				<Stack gap={0}>
					<Input.Label>Venue Type</Input.Label>
					<Input.Description>
						For hybrid events, create multiple venues
					</Input.Description>
				</Stack>
				<VenueTypePicker
					value={venueType}
					onChange={setVenueType}
				/>
			</Group>

			<Group gap={4} justify="space-between">
				<Text fw="bold">Venue ID: {venueId}</Text>
				<Button size="xs"
					onClick={() => {
						const newVenueId = prompt("Enter new Venue ID", venueId);
						if (newVenueId && newVenueId !== venueId) {
							const success = changeVenueId({ fromVenueId: venueId, toVenueId: newVenueId });
							if (!success) {
								alert("Venue ID already exists. Please choose a different one.");
							}
						}
					}}
				>
					Change Venue ID
				</Button>
			</Group>

			{venueType === "physical" && (
				<EditVenuePhysical data={venue as EditAtom<Venue & { type: "physical" }>} />
			)}

			{venueType === "online" && (
				<EditVenueOnline data={venue as EditAtom<Venue & { type: "online" }>} />
			)}
		</CollapsiblePaper>
	);
};

export const VenueTypePicker = ({
	value,
	onChange,
	...props
}: Omit<SegmentedControlProps, "value" | "onChange" | "data"> & {
	value: VenueType;
	onChange: (value: VenueType) => void;
}) => {
	const label = (Icon: ComponentType<{ size: number }>, label: string) => (
		<Group gap={4} wrap="nowrap" py={4}>
			{/* @ts-ignore */}
			<Icon size={16} />
			<Text inline inherit>{label}</Text>
		</Group>
	);

	return (
		<SegmentedControl
			data={[
				{ label: label(IconQuestionMark, "Unknown"), value: "unknown" },
				{ label: label(IconMapPin, "Physical"), value: "physical" },
				{ label: label(IconWorld, "Online"), value: "online" },
			]}
			style={{}}
			value={value}
			onChange={onChange as any}
			{...props}
		/>
	);
};

export const VenueAtomDisplay = ({
	venue,
	noSublabel,
}: {
	venue: EditAtom<Venue>;
	noSublabel?: boolean;
}) => {
	const snippet = useAtomValue(useMemo(() => atom((get) => {
		return snippetVenue(get(venue));
	}), [venue]));

	return (
		<Snippet snippet={{
			...snippet,
			sublabel: undefined,
		}} noSublabel={noSublabel} />
	);
};
