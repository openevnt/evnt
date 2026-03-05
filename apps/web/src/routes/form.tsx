import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { EditAtom } from "../components/editor/edit-atom";
import { EventDataSchema, type EventData } from "@evnt/schema";
import { Button, Container, Group, Stack, Text, Title } from "@mantine/core";
import { CenteredLoader } from "../components/content/base/CenteredLoader";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { EventEditor } from "../components/editor/event/EventEditor";
import { RemoteEventSourceSchema, UtilEventSource } from "../db/models/event-source";
import { EventResolver } from "../db/event-resolver";
import { zodValidator } from "@tanstack/zod-adapter";
import z from "zod";

const SearchParamsSchema = z.object({
	"source": RemoteEventSourceSchema.optional(),
	"data": EventDataSchema.optional(),
	"redirect-to": z.url().optional(),
	"title": z.string().optional(),
	"desc": z.string().optional(),
	"continue-text": z.string().optional(),
});

export const Route = createFileRoute("/form")({
	component: FormPage,
	validateSearch: zodValidator(SearchParamsSchema),
	staticData: {
		hasEventForm: true,
	},
});

function FormPage() {
	const {
		"source": sourceParam,
		data: dataParam,
		"redirect-to": redirectToParam = "/",
		title: titleParam = "Form",
		desc: descParam = "",
		"continue-text": continueTextParam = "Continue",
	} = Route.useSearch();

	const dataAtom = useMemo(() => atom<EventData | null>(null), []);

	const [loading, setLoading] = useState(false);
	const save = useSetAtom(useMemo(() => atom(null, async (get, set) => {
		const data = get(dataAtom);
		if (!data) return;
		setLoading(true);

		let url = new URL(redirectToParam);
		url.searchParams.set("data", JSON.stringify(data));
		window.location.href = url.toString();
	}), [dataAtom, redirectToParam, setLoading]));

	const fetchData = useSetAtom(useMemo(() => atom(null, async (get, set) => {
		if (dataParam) {
			set(dataAtom, dataParam);
		} else if (sourceParam) {
			setLoading(true);
			try {
				const source = UtilEventSource.is(sourceParam, false) ? sourceParam : null;
				if (!source) throw new Error("Invalid event source");
				const resolved = await EventResolver.resolve(source);
				if (!resolved.data) throw new Error("Failed to resolve event data");
				set(dataAtom, resolved.data);
			} catch (e) {
				console.error("Failed to fetch event data from source", e);
			} finally {
				setLoading(false);
			}
		} else {
			set(dataAtom, { name: {}, v: 0 });
		}
	}), [sourceParam, dataParam, setLoading]));

	useEffect(() => {
		fetchData();
	}, [sourceParam, dataParam]);

	return (
		<Container p="xs">
			<FormPageTemplate
				title={titleParam}
				desc={descParam}
				continueText={continueTextParam}
				onContinue={save}
				loading={loading}
				data={dataAtom}
			/>
		</Container>
	)
}

export const FormPageTemplate = ({
	title,
	desc,
	error,
	continueText,
	onContinue,
	button,
	loading,
	notice,
	data,
}: {
	title: ReactNode;
	desc?: ReactNode;
	error?: ReactNode;
	loading?: boolean;
	notice?: ReactNode;
	continueText?: string;
	onContinue?: () => void;
	data: EditAtom<EventData | null>;
	button?: ReactNode;
}) => {
	return (
		<Container p={0}>
			<Stack gap={0}>
				<Group justify="space-between" align="start" wrap="nowrap">
					<Stack gap={0}>
						<Title order={4}>
							{title}
						</Title>
						<Text fz="xs" c="dimmed">
							{desc}
						</Text>
					</Stack>
				</Group>
				<Text c="red">
					{error}
				</Text>
				{notice}
				{loading && <CenteredLoader />}
				<EditEventPageWrapper
					data={data}
					button={button ?? (
						<Button
							color="green"
							onClick={onContinue}
							loading={loading}
						>
							{continueText}
						</Button>
					)}
				/>
			</Stack>
		</Container>
	)
};

export const EditEventPageWrapper = ({
	data,
	button,
}: {
	data: EditAtom<EventData | null>;
	button?: ReactNode;
}) => {
	const isNull = useAtomValue(useMemo(() => atom(get => get(data) === null), [data]));
	if (isNull) return null;
	return (
		<EventEditor data={data as EditAtom<EventData>} button={button} />
	)
};

