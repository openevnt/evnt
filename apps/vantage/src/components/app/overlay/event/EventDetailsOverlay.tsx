import { useEventDetailsModal } from "../../../../hooks/app/useEventDetailsModal";
import { BaseOverlay } from "../base/BaseOverlay";
import { EventDetailsContent } from "../../../content/event/details/EventDetailsContent";
import { useEventQuery } from "../../../../db/useEventQuery";
import { UtilEventSource, type EventSource } from "../../../../db/models/event-source";
import { Affix, Button, Code, Space, Stack, Text, Transition } from "@mantine/core";
import { RQResult } from "../../../data/RQResult";
import { EventEnvelopeProvider } from "../../../content/event/event-envelope-context";
import { useProvideEventActions } from "../../../../hooks/actions/useProvideEventActions";
import { Link } from "@tanstack/react-router";
import { IconArrowNarrowRight } from "@tabler/icons-react";

export const EventDetailsOverlay = () => {
	const { close, useValue } = useEventDetailsModal();
	const source = useValue();

	return (
		<BaseOverlay
			opened={!!source}
			onClose={close}
			modalBodyProps={{ p: 0 }}
		>
			{source && UtilEventSource.is(source, true) ? (
				<EventDetailsOverlayHandler source={source} />
			) : (
				<Stack align="center" justify="center" h="100%" ta="center">
					<Text>
						Invalid event source: <Code>{source}</Code>
					</Text>
				</Stack>
			)}

			<Space h="10rem" />

			<Transition mounted={!!source}>
				{(styles) => (
					<Affix
						position={{ bottom: "sm", right: "50%" }}
						pos="fixed"
						style={styles}
					>
						{!!source && (
							<Button
								variant="filled"
								color="gray"
								miw="10rem"
								rightSection={<IconArrowNarrowRight />}
								style={{ transform: "translateX(50%)" }}
								renderRoot={(props) => (
									<Link
										to="/event"
										search={{ source }}
										{...props}
									/>
								)}
							>
								View
							</Button>
						)}
					</Affix>
				)}
			</Transition>
		</BaseOverlay>
	);
};

export const EventDetailsOverlayHandler = ({ source }: { source: EventSource }) => {
	const query = useEventQuery(source);

	useProvideEventActions({
		source,
	});

	return (
		<RQResult query={query}>
			{(envelope) => (
				<EventEnvelopeProvider value={envelope}>
					<EventDetailsContent
						source={source}
						loading={query.isFetching}
						withModalCloseButton
					/>
				</EventEnvelopeProvider>
			)}
		</RQResult>
	);
};
