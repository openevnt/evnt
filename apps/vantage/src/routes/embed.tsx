import { createFileRoute } from "@tanstack/react-router"
import z from "zod";
import { RemoteEventSourceSchema, UtilEventSource } from "../db/models/event-source";
import { zodValidator } from "@tanstack/zod-adapter";
import { useEventQueries } from "../db/useEventQuery";
import { Stack, Text } from "@mantine/core";
import { EventCard } from "../components/content/event/card/EventCard";
import { useQuery } from "@tanstack/react-query";
import { EventEnvelopeProvider } from "../components/content/event/event-envelope-context";
import { EventDataSchema } from "@evnt/schema";
import type { EventEnvelope } from "../db/models/event-envelope";

const SearchParamsSchema = z.object({
	source: RemoteEventSourceSchema.optional(),
	data: EventDataSchema.optional(),
});

export const Route = createFileRoute("/embed")({
	component: EmbedPage,
	validateSearch: zodValidator(SearchParamsSchema),
})

function EmbedPage() {
	const search = Route.useSearch();

	const source = search.source && UtilEventSource.is(search.source, false) ? search.source : null;
	const [sourceResult] = useEventQueries((source && !search.data) ? [source] : []);
	const eventDataParamQuery = useQuery({
		queryKey: ["embed-event-data", search.data],
		enabled: !!search.data,
		queryFn: async () => {
			if (!search.data) throw new Error("No event data parameter provided");
			return {
				data: search.data,
			} as EventEnvelope;
		},
	});

	if (!source && !search.data) return (
		<Stack align="center" justify="center" style={{ height: "100%" }}>
			<Text>Invalid source or event data parameter!</Text>
		</Stack>
	)

	const query = search.data ? eventDataParamQuery : sourceResult?.query;

	return (
		<Stack align="center" justify="center" style={{ height: "100%" }}>
			<EventEnvelopeProvider value={query?.data ?? { data: null }}>
				<EventCard
					loading={query?.isLoading ?? false}
					source={source ?? undefined}
					embed
				/>
			</EventEnvelopeProvider>
			<style children="html, body { height: 100%; margin: 0; }" />
		</Stack>
	)
}
