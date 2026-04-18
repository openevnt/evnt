import type { EventData, EventInstance } from "@evnt/schema";
import { Box, Collapse, Combobox, Group, Input, Pill, PillsInput, SimpleGrid, Stack, useCombobox } from "@mantine/core";
import { Deatom, type EditAtom } from "../edit-atom";
import { PartialDateInput } from "../../base/input/PartialDateInput";
import { focusAtom } from "jotai-optics";
import { IconCheck } from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { Snippet } from "../../content/Snippet";
import { snippetInstance, snippetVenue } from "@evnt/pretty";
import { CollapsiblePaper } from "../CollapsiblePaper";
import { useLocaleStore } from "../../../stores/useLocaleStore";
import { PartialDateUtil } from "@evnt/partial-date";
import { TranslationsUtil } from "@evnt/translations";

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
	const allVenues = useAtomValue(useMemo(() => atom((get) => {
		const snap = get(data);
		return snap.venues ?? [];
	}), [data]));

	const venueIdsAtom = useMemo(() => focusAtom(instance, o => o.prop("venueIds")), [instance]);
	const venueIds = useAtomValue(venueIdsAtom);

	const removeVenueId = useSetAtom(useMemo(() => atom(null, (get, set, venueId: string) => {
		set(venueIdsAtom, (prev) => prev?.filter((id) => id !== venueId) ?? []);
	}), [venueIdsAtom]));

	const toggleVenueId = useSetAtom(useMemo(() => atom(null, (get, set, venueId: string) => {
		const venueIds = get(venueIdsAtom) ?? [];
		if (venueIds.includes(venueId)) {
			set(venueIdsAtom, venueIds.filter((id) => id !== venueId));
		} else {
			set(venueIdsAtom, [...venueIds, venueId]);
		}
	}), [venueIdsAtom]));

	const [search, setSearch] = useState("");

	const combobox = useCombobox({
		onDropdownClose: () => combobox.resetSelectedOption(),
		onDropdownOpen: () => combobox.updateSelectedOptionIndex("active"),
	});

	const pills = venueIds.map((venueId) => {
		const venue = allVenues.find((v) => v.id === venueId);
		if (!venue) return null;

		const snippet = snippetVenue(venue);

		return (
			<Pill
				key={venueId}
				withRemoveButton
				onRemove={() => removeVenueId(venueId)}
			>
				<Group gap={4} align="center" h="100%" wrap="nowrap">
					<Snippet.Icon icon={snippet.icon} props={{ size: 16 }} />
					<Snippet.Label label={snippet.label} />
				</Group>
			</Pill>
		);
	});

	const options = allVenues
		.filter((venue) => TranslationsUtil.search(venue.name, search))
		.map((venue) => (
			<Combobox.Option value={venue.id} key={venue.id} active={venueIds.includes(venue.id)}>
				<Group gap={4}>
					<Box w={24}>
						{venueIds.includes(venue.id) ? <IconCheck style={{ verticalAlign: "middle" }} /> : null}
					</Box>
					<Snippet snippet={snippetVenue(venue)} />
				</Group>
			</Combobox.Option>
		));

	return (
		<Stack gap={4}>
			<Combobox store={combobox} onOptionSubmit={toggleVenueId}>
				<Combobox.DropdownTarget>
					<Stack gap={4}>
						<PillsInput
							label="Venues"
							onClick={() => combobox.openDropdown()}
						>
							<Pill.Group>
								{pills}

								<Combobox.EventsTarget>
									<PillsInput.Field
										onFocus={() => combobox.openDropdown()}
										onBlur={() => combobox.closeDropdown()}
										value={search}
										placeholder="Search venues..."
										onChange={(event) => {
											combobox.updateSelectedOptionIndex();
											setSearch(event.currentTarget.value);
										}}
										onKeyDown={(event) => {
											if (event.key === 'Backspace' && search.length === 0 && venueIds.length > 0) {
												event.preventDefault();
												removeVenueId(venueIds[venueIds.length - 1]!);
											}
										}}
									/>
								</Combobox.EventsTarget>
							</Pill.Group>
						</PillsInput>

						<Collapse expanded={!venueIds.length}>
							<Input.Description>
								Location marked as unknown
							</Input.Description>
						</Collapse>
					</Stack>
				</Combobox.DropdownTarget>

				<Combobox.Dropdown>
					<Combobox.Options>
						{options.length > 0 ? options : <Combobox.Empty>Nothing found...</Combobox.Empty>}
					</Combobox.Options>
				</Combobox.Dropdown>
			</Combobox>
		</Stack>
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
