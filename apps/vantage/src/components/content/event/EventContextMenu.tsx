import { ActionIcon, Menu } from "@mantine/core";
import { IconDotsVertical } from "@tabler/icons-react";
import { type EventSource } from "../../../db/models/event-source";
import { useMediaQuery } from "@mantine/hooks";
import { useNavigate } from "@tanstack/react-router";
import { EventActionFactory } from "../../../hooks/actions/useProvideEventActions";
import type { Action } from "../../app/overlay/spotlight/useActionsStore";

export const EventContextMenu = ({ source }: { source: EventSource }) => {
	const noHover = useMediaQuery("(hover: none)");

	const navigate = useNavigate();

	const actions: Action[] = EventActionFactory.All({
		source,
		navigate,
	});

	return (
		<Menu>
			<Menu.Target>
				<ActionIcon
					variant="subtle"
					color="gray"
					size="sm"
				>
					<IconDotsVertical />
				</ActionIcon>
			</Menu.Target>
			<Menu.Dropdown>
				{actions.filter(x => !x.disabled).map((action, i) => (
					<Menu.Item
						key={i}
						leftSection={action.icon}
						onClick={action.execute}
						color={action.special?.color}
					>
						{action.label}
					</Menu.Item>
				))}
			</Menu.Dropdown>
		</Menu>
	);
};
