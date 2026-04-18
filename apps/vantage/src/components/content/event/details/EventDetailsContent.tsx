import { ActionIcon, Box, Button, Code, Container, CopyButton, Grid, Group, Stack, Text, Tooltip } from "@mantine/core";
import { type EventSource } from "../../../../db/models/event-source";
import { LayerImportSection } from "./LayerImportSection";
import { IconCheck, IconReload, IconShare } from "@tabler/icons-react";
import { useEventQuery } from "../../../../db/useEventQuery";
import { AsyncAction } from "../../../data/AsyncAction";
import { EventResolver } from "../../../../db/event-resolver";
import { EventDetailsContext } from "./event-details-context";
import { EventDetailsBanner } from "./EventDetailsBanner";
import { EventDetailsInstanceList } from "./EventDetailsInstanceList";
import { EventDetailsLinks } from "./EventDetailsLinks";
import { EnvelopeErrorAlert } from "../envelope/EnvelopeErrorAlert";
import { EventDetailsSource } from "./EventDetailsSource";
import { EventActions } from "../../../../lib/actions/event-actions";
import { EventDetailsAlternatives } from "./EventDetailsAlternatives";
import { useResolvedEvent } from "../event-envelope-context";
import { RichTextRenderer } from "./RichTextRenderer";
import type { Facet } from "@atcute/bluesky-richtext-segmenter";

export interface EventDetailsContentProps {
	source?: EventSource;
	loading?: boolean;
	withModalCloseButton?: boolean;
}

export const EventDetailsContent = (props: EventDetailsContentProps) => {
	const { source } = props;

	return (
		<EventDetailsContext value={props}>
			<Stack gap="xs">
				<EventDetailsBanner />
				<Container w="100%">
					<Stack>
						<EnvelopeErrorAlert my="xs" />
					</Stack>

					<Grid>
						<Grid.Col
							span={{ base: 12, md: "auto" }}
							order={{ base: 1, md: 2 }}
						>
							<Stack>
								{source && (
									<Group gap="xs" justify="end">
										<EventRefetchButton source={source} />
										<EventShareButton source={source} />
									</Group>
								)}

								{source && <LayerImportSection source={source} />}

								<EventDetailsInstanceList />

								<EventDetailsDescriptionList />
							</Stack>
						</Grid.Col>
						<Grid.Col
							span={{ base: 12, md: 4 }}
							order={{ base: 2, md: 1 }}
						>
							<Stack>
								<EventDetailsLinks />
								<EventDetailsAlternatives source={source} />
								<EventDetailsSource source={source} />
							</Stack>
						</Grid.Col>
					</Grid>
				</Container>
			</Stack>
		</EventDetailsContext>
	);
};

export const EventDetailsDescriptionList = () => {
	const { data } = useResolvedEvent();

	const bskyRichTextComp = data?.components?.find((x): x is { $type: "app.bsky.richtext"; text: string; facets?: Facet[] } =>
		x.$type === "app.bsky.richtext" && typeof (x as { text?: unknown }).text === "string");

	if (!bskyRichTextComp) return null;

	return (
		<RichTextRenderer content={bskyRichTextComp.text} facets={bskyRichTextComp.facets ?? []} />
	)
};

export const EventRefetchButton = ({ source }: { source: EventSource }) => {
	const { isFetching } = useEventQuery(source);

	return (
		<Tooltip label={"Refetch"} withArrow>
			<AsyncAction action={() => EventResolver.update(source)}>
				{({ loading, onClick }) => (
					<Button
						size="compact-sm"
						color="gray"
						onClick={onClick}
						leftSection={<IconReload />}
						loading={loading || isFetching}
					>
						Refetch
					</Button>
				)}
			</AsyncAction>
		</Tooltip>
	);
};

export const EventShareButton = ({ source }: { source: EventSource }) => {
	return (
		<CopyButton value={EventActions.getShareLink(source)}>
			{({ copied, copy }) => (
				<Button
					size="compact-sm"
					color={copied ? "green" : "gray"}
					onClick={copy}
					leftSection={copied ? <IconCheck /> : <IconShare />}
				>
					{copied ? "Copied!" : "Share"}
				</Button>
			)}
		</CopyButton>
	);
};
