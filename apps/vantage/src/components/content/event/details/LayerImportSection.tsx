import { Button, Stack, Text } from "@mantine/core";
import { useLayersStore } from "../../../../db/useLayersStore";
import { type EventSource } from "../../../../db/models/event-source";
import { EventActions } from "../../../../lib/actions/event-actions";
import { AsyncAction } from "../../../data/AsyncAction";

export const LayerImportSection = ({ source }: { source: EventSource }) => {
	const layerDefaultSources = useLayersStore((store) => store.layers.default?.data.events);

	const isOnDefault = layerDefaultSources?.includes(source);

	if (isOnDefault) return null;

	return (
		<Stack>
			<AsyncAction action={async () => {
				await EventActions.createEventFromSource(source);
			}}>
				{({ loading, onClick }) => (
					<Button
						fullWidth
						onClick={onClick}
						loading={loading}
						color="green"
						h="auto"
					>
						<Stack gap={4} py={4}>
							<Text span inherit>
								Add to My Events
							</Text>
							<Text size="xs" fw="normal" span inherit>
								offline accessible and shown in your list
							</Text>
						</Stack>
					</Button>
				)}
			</AsyncAction>
		</Stack>
	);
};
