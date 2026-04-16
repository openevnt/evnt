import type { EventData, EventInstance, Venue } from "@evnt/schema";
import { DeatomOptional, type EditAtom } from "../edit-atom";
import { Button, Stack } from "@mantine/core";
import { useMemo } from "react";
import { focusAtom } from "jotai-optics";
import { EditEventInstance } from "./EditEventInstance";
import { EditVenue } from "./EditVenue";
import { atom, useAtomValue, useSetAtom } from "jotai";

export const EditSimple = ({ data }: { data: EditAtom<EventData> }) => {
	const firstVenueAtom = useMemo(() => focusAtom(data, o => o.prop("venues").valueOr([]).at(0)), [data]);
	const firstInstanceAtom = useMemo(() => focusAtom(data, o => o.prop("instances").valueOr([]).at(0)), [data]);

	const hasFirstVenue = useAtomValue(useMemo(() => atom((get) => !!get(firstVenueAtom)), [firstVenueAtom]));
	const hasFirstInstance = useAtomValue(useMemo(() => atom((get) => !!get(firstInstanceAtom)), [firstInstanceAtom]));

	const addVenue = useSetAtom(useMemo(() => atom(null, (get, set) => {
		const newVenue: Venue = {
			id: "0",
			name: {},
			$type: "directory.evnt.venue.unknown"
		};

		set(data, prev => ({
			...prev,
			instances: prev.instances?.map(instance => ({
				...instance,
				venueIds: [...(instance.venueIds ?? []).filter(id => id !== newVenue.id), newVenue.id],
			})) ?? [],
			venues: [...(prev.venues ?? []), newVenue],
		}));
	}), [data]));

	const addInstance = useSetAtom(useMemo(() => atom(null, (get, set) => {
		const newInstance: EventInstance = {
			venueIds: get(data).venues?.map(venue => venue.id) ?? [],
		};

		set(data, prev => ({
			...prev,
			instances: [...(prev.instances ?? []), newInstance],
		}));
	}), [data, hasFirstVenue, firstVenueAtom]));

	return (
		<Stack>
			{hasFirstInstance ? (
				<EditEventInstance
					data={data}
					instance={firstInstanceAtom as EditAtom<EventInstance>}
					index={0}
					withVenuesControl={false}
				/>
			) : (
				<Button
					onClick={() => addInstance()}
				>
					Add Instance
				</Button>
			)}

			{hasFirstVenue ? (
				<EditVenue
					data={data}
					venue={firstVenueAtom as EditAtom<Venue>}
				/>
			) : (
				<Button
					onClick={() => addVenue()}
				>
					Add Venue
				</Button>
			)}
		</Stack>
	)
};