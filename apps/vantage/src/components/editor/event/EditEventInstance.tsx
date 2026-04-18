import type { EventData, EventInstance, PartialDate, Venue } from "@evnt/schema";
import { Box, Button, CloseButton, Combobox, Group, Input, Paper, SimpleGrid, Stack, Text, useCombobox } from "@mantine/core";
import { Deatom, DeatomOptional, type EditAtom } from "../edit-atom";
import { PartialDateInput } from "../../base/input/PartialDateInput";
import { focusAtom } from "jotai-optics";
import { IconCalendar, type ReactNode } from "@tabler/icons-react";
import { useMemo } from "react";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { Snippet } from "../../content/Snippet";
import { snippetInstance, snippetVenue } from "@evnt/pretty";
import { VenueAtomDisplay } from "./EditVenue";
import { CollapsiblePaper } from "../CollapsiblePaper";
import { useLocaleStore } from "../../../stores/useLocaleStore";
import { PartialDateUtil } from "@evnt/partial-date";

export const EditEventInstance = ({
	data,
	instance,
	index,
	withVenuesControl = true,
}: {
	data: EditAtom<EventData>;
	instance: EditAtom<EventInstance>;
	index: number;
	withVenuesControl?: boolean;
}) => {
	const userTimezone = useLocaleStore(store => store.timezone);

	const getInstanceData = useSetAtom(useMemo(() => atom(null, (get) => {
		return get(instance);
	}), []));

	const onDelete = useSetAtom(useMemo(() => atom(null, (get, set) => {
		console.log("Deleting instance with index", index);
		set(data, prev => ({
			...prev,
			instances: prev.instances?.map((instance, i) => i === index ? null : instance).filter((x): x is EventInstance => !!x) ?? [],
		}));
	}), [data, index]));

	const startAtom = useMemo(() => focusAtom(instance, o => o.prop("start")), [instance]);
	const endAtom = useMemo(() => focusAtom(instance, o => o.prop("end")), [instance]);

	return (
		<CollapsiblePaper
			onDelete={onDelete}
			id={`instance::${index}`}
			title={<InstanceAtomDisplay instance={instance} />}
		>
			{withVenuesControl && (
				<EditEventInstanceVenues
					data={data}
					instance={instance}
				/>
			)}

			<SimpleGrid type="container" cols={{ base: 1, "450px": 2 }}>
				{(["start", "end"] as const).map((field) => (
					<Stack gap={4} key={field}>
						<Deatom
							atom={field === "start" ? startAtom : endAtom}
							component={PartialDateInput}
							label={field == "start" ? "Start Date & Time" : "End Date & Time"}
							getInsertValue={() => {
								if (field == "start") return PartialDateUtil.lowerPrecision(PartialDateUtil.now(userTimezone), "month");
								const instance = getInstanceData();
								if (!instance.start) return PartialDateUtil.lowerPrecision(PartialDateUtil.now(userTimezone), "month");
								if (PartialDateUtil.has(instance.start, "day"))
									return PartialDateUtil.lowerPrecision(/* Stupid TS */ instance.start as any, "day");
								return instance.start;
							}}
						/>
					</Stack>
				))}
			</SimpleGrid>
		</CollapsiblePaper>
	);
};

export const EditEventInstanceVenues = ({
	data,
	instance,
}: {
	data: EditAtom<EventData>;
	instance: EditAtom<EventInstance>;
}) => {
	const venueIdsAtom = useMemo(() => focusAtom(instance, o => o.prop("venueIds")), [instance]);
	const venueIds = useAtomValue(venueIdsAtom);

	const removeVenueId = useSetAtom(useMemo(() => atom(null, (get, set, venueId: string) => {
		set(venueIdsAtom, (prev) => prev?.filter((id) => id !== venueId) ?? []);
	}), [venueIdsAtom]));

	const addVenueId = useSetAtom(useMemo(() => atom(null, (get, set, venueId: string) => {
		const venueIds = get(venueIdsAtom) ?? [];
		if (venueIds.includes(venueId)) return;
		set(venueIdsAtom, [...venueIds, venueId]);
	}), [venueIdsAtom]));

	return (
		<Stack gap={4}>
			<Text fw="bold">Venues ({venueIds.length})</Text>
			<Stack gap={4}>
				{venueIds.map((venueId) => (
					<Group
						key={venueId}
						gap={4}
					>
						<CloseButton
							onClick={() => removeVenueId(venueId)}
						/>
						<Box flex="1">
							<VenueAtomDisplay
								venue={focusAtom(data, o => o.prop("venues").valueOr([]).find((v) => v.id === venueId)) as EditAtom<Venue>}
								noSublabel
							/>
						</Box>
					</Group>
				))}
			</Stack>
			<Group>
				<VenueIdPicker
					data={data}
					filter={(venue) => !venueIds.includes(venue.id)}
					label="Add"
					onSelect={(venueId) => addVenueId(venueId)}
				/>
			</Group>
		</Stack>
	);
};

export const VenueIdPicker = ({
	data,
	filter = () => true,
	onSelect,
	label,
}: {
	data: EditAtom<EventData>;
	filter?: (venue: Venue, data: EventData) => boolean;
	onSelect?: (venueId: string) => void;
	label?: ReactNode;
}) => {
	const venues = useAtomValue(useMemo(() => atom((get) => {
		const snap = get(data);
		return (snap.venues ?? [])
			.filter((venue) => filter(venue, snap));
	}), [data, filter]));

	const combobox = useCombobox();

	const options = venues.map((venue) => (
		<Combobox.Option
			key={venue.id}
			value={venue.id}
		>
			<Snippet snippet={snippetVenue(venue)} />
		</Combobox.Option>
	));

	return (
		<Combobox
			store={combobox}
			onOptionSubmit={onSelect}
			width="max-content"
		>
			<Combobox.Target>
				<Button
					onClick={() => combobox.toggleDropdown()}
				>
					{label}
				</Button>
			</Combobox.Target>
			<Combobox.Dropdown>
				{options}
			</Combobox.Dropdown>
		</Combobox>
	);
};

export const InstanceAtomDisplay = ({ instance }: { instance: EditAtom<EventInstance> }) => {
	const snippets = useAtomValue(useMemo(() => atom((get) => {
		return snippetInstance(get(instance));
	}), [instance]));

	return (
		<Group gap={4}>
			{snippets.length == 0 && (
				<Snippet
					snippet={{
						icon: "calendar",
						label: { type: "text", value: "Unknown Date" },
					}}
				/>
			)}
			{snippets.map((snippet, i) => (
				<Snippet key={i} snippet={snippet} />
			))}
		</Group>
	);
};
