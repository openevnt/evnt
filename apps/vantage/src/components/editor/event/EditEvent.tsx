import { Group, Input, SegmentedControl, Stack, Text } from "@mantine/core";
import { EditEventDetails } from "./EditEventDetails";
import { EditEventInstanceList } from "./EditEventInstanceList";
import type { EventData } from "../../../../../../packages/schema/src/schemas/EventData";
import type { EditAtom } from "../edit-atom";
import { EditVenuesList } from "./EditVenuesList";
import { EditComponentsList } from "./EditComponentsList";
import { useMemo, useState } from "react";
import { atom, useAtomValue } from "jotai";
import { EditSimple } from "./EditSimple";

export const EditEvent = ({ data }: { data: EditAtom<EventData> }) => {
	const isForcedToBeComplex = useAtomValue(useMemo(() => atom((get) => {
		const event = get(data);
		if (!event.instances || event.instances.length === 0) return false;
		if (event.instances.length === 1 && event.instances[0]!.venueIds.length <= 1) return false;
		return true;
	}), [data]));

	const [editingMode, setEditingMode] = useState<"simple" | "complex">(isForcedToBeComplex ? "complex" : "simple");

	return (
		<Stack gap="xl">
			<EditEventDetails data={data} />

			{!isForcedToBeComplex && (
				<Group justify="space-between" align="center" wrap="nowrap" gap="xs">
					<Stack gap={0}>
						<Input.Label>Editing mode:</Input.Label>
						<Input.Description>
							Editor only.
						</Input.Description>
					</Stack>
					<SegmentedControl<"simple" | "complex">
						data={[
							{ value: "simple", label: "Simple" },
							{ value: "complex", label: "Complex" }
						]}
						value={editingMode}
						onChange={(value) => setEditingMode(value)}
					/>
				</Group>
			)}

			{editingMode === "simple" && !isForcedToBeComplex ? (
				<>
					<EditSimple data={data} />
				</>
			) : (
				<>
					<EditEventInstanceList data={data} />
					<EditVenuesList data={data} />
				</>
			)}

			<EditComponentsList data={data} />
		</Stack>
	);
};
