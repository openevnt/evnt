import { atom, useAtomValue, useSetAtom } from "jotai";
import { useMemo } from "react";
import type { EditAtom } from "../edit-atom";
import type { EventComponent, EventData } from "@evnt/schema";
import { Button, Group, Input, Menu, Paper, Stack, Text, Title } from "@mantine/core";
import { IconChevronDown } from "@tabler/icons-react";
import { EditComponent } from "./EditComponent";
import { focusAtom } from "jotai-optics";
import { EventComponentRegistry } from "./event-components";
import { Trans } from "../../content/Trans";

export const EditComponentsList = ({ data }: { data: EditAtom<EventData> }) => {
	const indexes = useAtomValue(useMemo(() => atom((get) => {
		return (get(data).components ?? []).map((_, i) => i);
	}), [data]));

	const addComponent = useSetAtom(useMemo(() => atom(null, (get, set, component: EventComponent) => {
		set(data, prev => ({
			...prev,
			components: [...(prev.components ?? []), component],
		}));
	}), [data]));

	const children = useMemo(() => {
		return indexes.map((i) => (
			<EditComponent
				key={i}
				index={i}
				data={data}
				component={focusAtom(data, o => o.prop("components").valueOr([]).at(i)) as EditAtom<EventComponent>}
			/>
		));
	}, [indexes, data]);

	return (
		<Stack gap={4}>
			<Group gap={4} justify="space-between">
				<Title order={4}>
					Components ({indexes.length})
				</Title>
				<Menu>
					<Menu.Target>
						<Button rightSection={<IconChevronDown size={18} />}>
							Add
						</Button>
					</Menu.Target>
					<Menu.Dropdown maw="400px">
						<Menu.Label>Add component with type...</Menu.Label>
						{Object.entries(EventComponentRegistry).map(([type, entry]) => {
							const { icon: Icon, label, desc, createData } = entry;
							return (
							<Menu.Item
								key={type}
								leftSection={<Icon size={18} />}
								onClick={() => createData && addComponent(createData)}
							>
								<Stack gap={0}>
									<Input.Label><Trans t={label} /></Input.Label>
									{desc && <Input.Description><Trans t={desc} /></Input.Description>}
								</Stack>
							</Menu.Item>
							);
						})}
					</Menu.Dropdown>
				</Menu>
			</Group>
			{indexes.length === 0 && (
				<Paper bg="dark" p="md" py="xl" ta="center">
					<Stack h="100%" align="center" justify="center">
						<Text c="dimmed">
							No components added yet!
						</Text>
						<Text c="dimmed" fz="xs">
							Components define additional content or metadata of the event, such as links, images, or custom sections.
						</Text>
					</Stack>
				</Paper>
			)}
			{children}
		</Stack >
	);
};
