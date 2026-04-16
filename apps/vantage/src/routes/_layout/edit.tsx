import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { FormPageTemplate } from "../form";
import { Alert, Stack } from "@mantine/core";
import { EventSourceSchema, UtilEventSource, type EventSource } from "../../db/models/event-source";
import { useATProtoAuthStore } from "../../lib/atproto/useATProtoStore";
import { useSetAtom } from "jotai";
import { atom } from "jotai";
import type { EventData } from "@evnt/schema";
import { useEffect, useMemo } from "react";
import { useEventQuery } from "../../db/useEventQuery";
import { useMutation } from "@tanstack/react-query";
import { EventMutator } from "../../db/event-mutator";
import z from "zod";
import { useEditorCollapseState } from "../../components/editor/editor-states";

const RouteSearchSchema = z.object({
	source: EventSourceSchema,
});

export const Route = createFileRoute("/_layout/edit")({
	component: EditPage,
	validateSearch: RouteSearchSchema,
	staticData: {
		hasEventForm: true,
	},
})

function EditPage() {
	const { source } = Route.useSearch();
	const signedInDid = useATProtoAuthStore(store => store.agent?.sub);

	const dataAtom = useMemo(() => atom<EventData | null>(null), []);
	const setDataAtom = useSetAtom(dataAtom);

	const query = useEventQuery(source);

	useEffect(() => {
		if (!query?.data) return;
		setDataAtom(prev => prev ?? query.data?.data ?? null);
		if (query.data?.data) {
			useEditorCollapseState.setState({
				collapsed: [
					...query.data.data.venues?.map(venue => `venue::${venue.id}`) ?? [],
					...query.data.data.instances?.map((_, i) => `instance::${i}`) ?? [],
					...query.data.data.components?.map((_, i) => `component::${i}`) ?? [],
				],
			});
		}
	}, [query?.data ?? null]);

	useEffect(() => () => useEditorCollapseState.setState({ collapsed: [] }), []);

	const navigate = useNavigate();

	const mutation = useMutation({
		mutationFn: async ({ data, source }: { data: EventData, source: EventSource }) => {
			console.log("Updating event", { source, data });
			await EventMutator.update(source, data);
		},
		onSuccess: async (data, { source }) => {
			navigate({
				to: "/event",
				search: {
					source,
				},
			})
		}
	});

	const save = useSetAtom(useMemo(() => atom(null, async (get, set) => {
		const data = get(dataAtom);
		if (!source || !data) return;
		console.log("Saving data", { source, data });
		mutation.mutate({ data, source });
	}), [dataAtom, source, mutation]));

	const loading = (mutation.isPending || query?.isLoading);

	return (
		<FormPageTemplate
			title="Edit Event"
			desc="Edit an existing event saved locally"
			continueText="Save"
			onContinue={save}
			loading={loading}
			data={dataAtom}
			notice={(
				<Stack>
					{source && UtilEventSource.isAt(source) && !signedInDid && (
						<Alert
							title="Not signed in"
							color="yellow"
							my="md"
						>
							<Stack gap={4}>
								You are not signed in to ATProto!
							</Stack>
						</Alert>
					)}
				</Stack>
			)}
		/>
	)
}
