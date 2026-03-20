import { Box, Paper, Stack } from "@mantine/core";
import { EventInstanceList } from "../EventInstanceList";
import { type EventSource } from "../../../../db/models/event-source";
import { EventCardBottom } from "./EventCardBottom";
import { EventCardTitle } from "./EventCardTitle";
import { EventCardBackground } from "./EventCardBackground";
import { EventCardContext } from "./event-card-context";
import classes from "./event-card.module.css";
import { EventTimeframeBadge } from "../badges/EventTimeframeBadge";
import { EventStatusBadge } from "../badges/EventStatusBadge";

export interface EventCardProps {
	variant?: "horizontal" | "card" | "inline";
	source?: EventSource;
	menu?: React.ReactNode;
	loading?: boolean;
	embed?: boolean;
	fullHeight?: boolean;
};

export const EventCard = (props: EventCardProps) => {
	return (
		<Paper
			p={props.variant == "inline" ? 0 : "xs"}
			px={props.variant == "inline" ? 1 : undefined}
			withBorder
			w="100%"
			h={props.fullHeight ? "100%" : props.variant === "card" ? "100%" : undefined}
			shadow="xs"
			pos="relative"
			style={{ overflow: "hidden" }}
			className={classes.card}
		>
			<EventCardContext value={props}>
				<EventCardBackground />
				<Box pos="relative" style={{ zIndex: 1 }} h="100%">
					<Stack gap={4} h="100%" justify="space-between">
						<Stack>
							<Stack gap={0}>
								<EventCardTitle />

								{props.variant === "card" && (
									<>
										<EventStatusBadge />
										<EventTimeframeBadge />
									</>
								)}
							</Stack>

							{props.variant === "card" && (
								<EventInstanceList />
							)}
						</Stack>

						{props.variant === "card" && (
							<EventCardBottom />
						)}
					</Stack>
				</Box>
			</EventCardContext>
		</Paper>
	);
};


