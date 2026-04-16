import { Accordion, ActionIcon, Box, CloseButton, Collapse, Group, Paper, Stack, Text } from "@mantine/core";
import { useDisclosure, useId } from "@mantine/hooks";
import type { PropsWithChildren } from "react";
import { useEditorCollapseState } from "./editor-states";

export const CollapsiblePaper = ({
	children,
	onDelete,
	icon,
	title,
	disabled = false,
	id,
}: PropsWithChildren<{
	onDelete?: () => void;
	icon?: React.ReactNode;
	title?: React.ReactNode;
	disabled?: boolean;
	id?: string;
}>) => {
	const hookId = useId();
	const instanceId = id ?? hookId;

	const collapsed = useEditorCollapseState(store => store.collapsed.includes(instanceId));

	const toggleCollapse = () => useEditorCollapseState.setState(state => ({
		collapsed: state.collapsed.includes(instanceId)
			? state.collapsed.filter(id => id !== instanceId)
			: [...state.collapsed, instanceId],
	}));

	return (
		<Paper withBorder p="xs">
			<Stack gap={0}>
				<Group justify="space-between" gap={4} align="start" wrap="nowrap">
					<Group gap={4} align="start" c="dimmed" wrap="nowrap">
						{!disabled && (
							<ActionIcon onClick={toggleCollapse} size="md" variant="subtle" color="gray">
								<Accordion.Chevron style={{
									transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)",
									transition: "transform 150ms ease",
								}} />
							</ActionIcon>
						)}
						{icon}
						<Text inherit span fw="bold">
							{title}
						</Text>
					</Group>
					<CloseButton
						onClick={onDelete}
					/>
				</Group>

				<Collapse expanded={!collapsed}>
					<Stack p="xs">
						{children}
					</Stack>
				</Collapse>
			</Stack>
		</Paper>
	);
};
