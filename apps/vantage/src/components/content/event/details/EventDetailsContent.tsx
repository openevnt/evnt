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
							</Stack>
						</Grid.Col>
						<Grid.Col
							span={{ base: 12, md: 4 }}
							order={{ base: 2, md: 1 }}
						>
							<Stack>
								<EventDetailsLinks />
								<EventDetailsSource source={source} />
								<EventDetailsAlternatives source={source} />
							</Stack>
						</Grid.Col>
					</Grid>
				</Container>
			</Stack>
		</EventDetailsContext>
	);
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
