import { createFileRoute } from "@tanstack/react-router"
import z from "zod";
import { EventSourceSchema } from "../../db/models/event-source";
import { useEventQuery } from "../../db/useEventQuery";
import { Container, Stack, Text } from "@mantine/core";
import { EventDetailsContent } from "../../components/content/event/details/EventDetailsContent";
import { EventEnvelopeProvider } from "../../components/content/event/event-envelope-context";
import { useProvideEventActions } from "../../hooks/actions/useProvideEventActions";

const SearchParamsSchema = z.object({
	source: EventSourceSchema,
});

export const Route = createFileRoute("/_layout/event")({
	component: EventPage,
	validateSearch: SearchParamsSchema,
	staticData: {
		spaceless: true,
	},
});

function EventPage() {
	const { source } = Route.useSearch();
	const query = useEventQuery(source);

	useProvideEventActions({
		source,
	});

	return (
		<Stack
			w="100%"
			align="center"
		>
			<Container
				size="md"
				p={0}
				w="100%"
				mih="100dvh"
				style={{
					boxShadow: "0 0 50px rgba(0,0,0,0.2)",
				}}
			>
				<Stack>
					<EventEnvelopeProvider value={query.data ?? { data: null }}>
						<EventDetailsContent
							source={source}
						/>
					</EventEnvelopeProvider>
				</Stack>
			</Container>
		</Stack>
	)
}
