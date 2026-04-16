import type { EventData, EventInstance, Venue } from "@evnt/schema";
import { Button, Group, Paper, Stack, Text, Title } from "@mantine/core";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { EditEventInstance } from "./EditEventInstance";
import { focusAtom } from "jotai-optics";
import type { EditAtom } from "../edit-atom";
import { useMemo } from "react";

export const EditEventInstanceList = ({ data }: { data: EditAtom<EventData> }) => {
	const lengthAtom = useMemo(() => atom((get) => get(data).instances?.length ?? 0), [data]);
	const length = useAtomValue(lengthAtom);
	const setData = useSetAtom(data);

	const children = new Array(length).fill(0).map((_, i) => (
		<EditEventInstance
			key={i}
			index={i}
			data={data}
			instance={focusAtom(data, o => o.prop("instances").valueOr([]).at(i)) as EditAtom<EventInstance>}
		/>
	));

	return (
		<Stack gap={4}>
			<Group gap={4} justify="space-between">
				<Title order={4}>
					Instances ({length})
				</Title>
				<Button
					onClick={() => {
						const newInstance: EventInstance = {
							venueIds: [],
						};

						setData((prev) => ({
							...prev,
							instances: [...(prev.instances ?? []), newInstance],
						}));
					}}
				>
					Add Instance
				</Button>
			</Group>

			{length === 0 && (
				<Paper bg="dark" p="md" py="xl" ta="center">
					<Stack h="100%" align="center" justify="center">
						<Text c="dimmed">
							No instances added yet!
						</Text>
						<Text c="dimmed" fz="xs">
							Instances represent different occurrences of the event. You can assign different venues to each instance.
						</Text>
					</Stack>
				</Paper>
			)}

			<Stack>
				{children}
			</Stack>
		</Stack>
	);
};

// venues={(
// 	<EditVenuesList
// 		title={() => null}
// 		onAddUpdate={(d, newVenue) => ({
// 			...d,
// 			instances: d.instances?.map((instance, index) => (
// 				index === i ? ({
// 					...instance,
// 					venueIds: [...(instance.venueIds ?? []), newVenue.venueId],
// 				}) : instance
// 			)),
// 		})}
// 		data={data}
// 		filter={(venue, data) => (
// 			// filter by venues that are in this instance and are not in any other instance
// 			(data.instances?.filter(instance => instance.venueIds?.includes(venue.venueId)).length ?? 0) === 1 &&
// 			data.instances![i]!.venueIds?.includes(venue.venueId)
// 		)}
// 		buttons={(
// 			<EditEventInstanceListAddExistingVenueButton
// 				data={data}
// 				instance={focusAtom(data, o => o.prop("instances").valueOr([]).at(i)) as EditAtom<EventInstance>}
// 			/>
// 		)}
// 	/>
// )}

// holy hell long name
// export const EditEventInstanceListAddExistingVenueButton = ({
// 	data,
// 	instance,
// }: {
// 	data: EditAtom<EventData>;
// 	instance: EditAtom<EventInstance>;
// }) => {
// 	const venues = useAtomValue(useMemo(() => atom((get) => {
// 		const snap = get(data);
// 		const inst = get(instance);
// 		return (snap.venues ?? [])
// 			.filter((venue) => {
// 				return !inst.venueIds?.includes(venue.venueId)
// 			});
// 	}), [data, instance]));

// 	const addVenueIdToInstance = useSetAtom(useMemo(() => atom(null, (get, set, venueId: string) => {
// 		const instanceIndex = get(data).instances?.findIndex(inst => inst === get(instance));
// 		if (instanceIndex === undefined || instanceIndex === -1) return;
// 		set(data, prev => ({
// 			...prev,
// 			instances: prev.instances?.map((inst, i) => i === instanceIndex ? {
// 				...inst,
// 				venueIds: [...(inst.venueIds ?? []), venueId],
// 			} : inst),
// 		}))
// 	}), [instance]));

// 	const combobox = useCombobox();

// 	const options = venues.map((venue) => (
// 		<Combobox.Option
// 			key={venue.venueId}
// 			value={venue.venueId}
// 		>
// 			<Snippet snippet={snippetVenue(venue)} />
// 		</Combobox.Option>
// 	));

// 	return (
// 		<Combobox
// 			store={combobox}
// 			onOptionSubmit={(venueId) => {
// 				addVenueIdToInstance(venueId);
// 			}}
// 		>
// 			<Combobox.Target>
// 				<Button
// 					onClick={() => combobox.toggleDropdown()}
// 				>
// 					Add Existing Venue
// 				</Button>
// 			</Combobox.Target>
// 			<Combobox.Dropdown>
// 				{options}
// 			</Combobox.Dropdown>
// 		</Combobox>
// 	);
// };
