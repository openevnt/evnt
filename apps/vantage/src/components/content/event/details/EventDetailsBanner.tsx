import { ActionIcon, Box, Collapse, Group, Loader, Menu, Modal, Stack, Title } from "@mantine/core";
import { useEventDetailsContext } from "./event-details-context";
import { Trans } from "../Trans";
import { EnvelopeErrorBadge } from "../envelope/EnvelopeErrorBadge";
import type { KnownEventComponent } from "@evnt/schema";
import { OverLayer } from "../../../base/layout/OverLayer";
import classes from "../card/event-card.module.css";
import { EvntMedia } from "../../../base/media/EvntMedia";
import { useEventEnvelope } from "../event-envelope-context";
import { IconDotsVertical } from "@tabler/icons-react";
import { useActionsStore } from "../../../app/overlay/spotlight/useActionsStore";
import { useShallow } from "zustand/shallow";
import { EventTimeframeBadge } from "../badges/EventTimeframeBadge";
import { EventStatusBadge } from "../badges/EventStatusBadge";

export const EventDetailsBanner = () => {
	const { data, err } = useEventEnvelope();
	const { loading, withModalCloseButton } = useEventDetailsContext();
	const actions = useActionsStore(
		useShallow(state => Object.values(state.actions).filter(a => a.category === "Event"))
	);

	const splashMediaComponents = data?.components
		?.filter((c): c is KnownEventComponent & { type: "splashMedia" } =>
			c.type === "splashMedia") ?? [];

	const bannerMedia = splashMediaComponents.find(x => x.data.roles.includes("banner"))?.data?.media
		?? splashMediaComponents.find(x => x.data.roles.includes("background"))?.data?.media;

	return (
		<Stack>
			<Box
				pos="relative"
				style={{ overflow: "hidden" }}
			>
				<OverLayer>
					{bannerMedia && (
						<OverLayer>
							<EvntMedia media={bannerMedia} objectFit="cover" />
						</OverLayer>
					)}
					<OverLayer
						className={classes.dim}
						style={{ "--dim": !bannerMedia ? 0 : undefined }}
					/>
				</OverLayer>
				<Stack pos="relative" h="100%" p="xs" justify="stretch">
					<Group
						w="100%"
						h="100%"
						wrap="nowrap"
						align="stretch"
						gap={4}
					>
						<Stack
							h="100%"
							flex="1"
							mt={bannerMedia ? "4rem" : undefined}
						>
							<Group flex="1" gap={4} align="end">
								<Collapse expanded={!!loading} orientation="horizontal">
									<Loader size="sm" />
								</Collapse>
								<Title order={3}>
									<Trans t={data?.name} />
								</Title>
								<EventTimeframeBadge />
								<EventStatusBadge />
								<EnvelopeErrorBadge />
							</Group>
						</Stack>
						<Stack h="100%" justify="start" align="start">
							<Group>
								<Menu>
									<Menu.Target>
										<ActionIcon
											size="input-md"
											color="gray"
											variant="subtle"
										>
											<IconDotsVertical />
										</ActionIcon>
									</Menu.Target>
									<Menu.Dropdown>
										{actions.map((action, i) => (
											<Menu.Item
												key={i}
												leftSection={action.icon}
												onClick={action.execute}
											>
												{action.label}
											</Menu.Item>
										))}
									</Menu.Dropdown>
								</Menu>
								{withModalCloseButton && <Modal.CloseButton />}
							</Group>
						</Stack>
					</Group>
				</Stack>
			</Box>
		</Stack >
	);
};
