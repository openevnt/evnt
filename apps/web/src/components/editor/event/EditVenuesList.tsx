import type { EventData, Venue } from "@evnt/schema";
import type { EditAtom } from "../edit-atom";
import { Button, Center, Group, Paper, Stack, Text, Title } from "@mantine/core";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { useMemo, type ReactNode } from "react";
import { EditVenue } from "./EditVenue";
import { focusAtom } from "jotai-optics";

export const EditVenuesList = ({
	data,
	filter,
	onAddUpdate,
	addLabel = "Add Venue",
	buttons,
}: {
	data: EditAtom<EventData>,
	filter?: (venue: Venue, data: EventData) => boolean;
	onAddUpdate?: (v: EventData, newVenue: Venue) => EventData;
	addLabel?: ReactNode;
	buttons?: ReactNode;
}) => {
	const indexes = useAtomValue(useMemo(() => atom((get) => {
		const snap = get(data)
		return (snap.venues ?? []).map((venue, i) => [venue, i] as const).filter(([venue, i]) => {
			if (filter && !filter(venue, snap)) return false;
			return true;
		}).map(([_, i]) => i);
	}), [data]));

	const addVenue = useSetAtom(useMemo(() => atom(null, (get, set) => {
		let id = get(data).venues?.length ?? 0;
		const existingVenueIds = new Set(get(data).venues?.map(v => v.id));
		while (existingVenueIds.has(id.toString())) id++;

		const newVenue: Venue = {
			id: id.toString(),
			type: "unknown",
			name: {},
		};

		set(data, (prev) => {
			let next: EventData = {
				...prev,
				venues: [...(prev.venues ?? []), newVenue],
			};
			if (onAddUpdate) next = onAddUpdate(next, newVenue);
			return next;
		});
	}), [data, onAddUpdate]));

	return (
		<Stack gap={4}>
			<Group gap={4} justify="space-between">
				<Title order={4}>
					Venues ({indexes.length})
				</Title>
				<Button
					onClick={addVenue}
				>
					{addLabel}
				</Button>
			</Group>
			{indexes.length === 0 && (
				<Paper bg="dark" p="md" py="xl" ta="center">
					<Stack h="100%" align="center" justify="center">
						<Text c="dimmed">
							No venues added yet!
						</Text>
						<Text c="dimmed" fz="xs">
							Venues define where the event takes place; physical or online. You can add multiple venues for different locations.
						</Text>
					</Stack>
				</Paper>
			)}
			<Stack>
				{indexes.map((i) => (
					<EditVenue
						key={i}
						data={data}
						venue={focusAtom(data, o => o.prop("venues").valueOr([]).at(i)) as EditAtom<Venue>}
					/>
				))}
			</Stack>
		</Stack>
	);
};
