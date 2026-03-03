import { Box, Center, Divider, Group, ScrollArea, Stack, Text, Title } from "@mantine/core";
import { useEventQueries } from "../../../../db/useEventQuery";
import { useShallow } from "zustand/react/shallow";
import { UtilPartialDate } from "@evnt/schema/utils";
import { useCacheEventsStore } from "../../../../lib/cache/useCacheEventsStore";
import { EventEnvelopeProvider } from "../../../content/event/event-envelope-context";
import { EventCard } from "../../../content/event/card/EventCard";
import { EventContextMenu } from "../../../content/event/EventContextMenu";

export const WidgetUpcomingEvents = () => {
	const today = UtilPartialDate.today();
	const firstFiveUpcomingEvents = useCacheEventsStore(
		useShallow(state => {
			return Array.from(new Set(
				Object.entries(state.cache.byDay)
					.filter(([day]) => day >= today)
					.sort(([a], [b]) => a.localeCompare(b))
					.flatMap(([_, sources]) => sources)
			)).slice(0, 5);
		})
	);
	const queries = useEventQueries(firstFiveUpcomingEvents);

	return (
		<Stack gap={4}>
			<Divider
				labelPosition="left"
				variant="dashed"
				label={(
					<Title order={4}>
						Upcoming Events
					</Title>
				)}
			/>
			{queries.length === 0 && (
				<Center ta="center" w="100%">
					<Text
						c="dimmed"
						my="xs"
					>
						No upcoming events
					</Text>
				</Center>
			)}
			<ScrollArea.Autosize maw="100%" scrollbars="x" offsetScrollbars p={4}>
				<Group
					wrap="nowrap"
					mih={300}
					align="stretch"
				>
					{queries.map(({ query, source }, index) => (
						<Box
							key={index}
							miw={300}
							bg="dark"
						>
							<EventEnvelopeProvider
								value={query.data ?? { data: null }}
							>
								<EventCard
									variant="card"
									source={source}
									loading={query.isFetching}
									menu={<EventContextMenu source={source} />}
								/>
							</EventEnvelopeProvider>
						</Box>
					))}
				</Group>
			</ScrollArea.Autosize>
		</Stack>
	);
};
