import { EventStatusSchema, type EventStatus } from "@evnt/schema";
import { Group, Select, Stack, Text, type MantineColor, type SelectProps } from "@mantine/core";
import { IconCalendarCheck, IconCalendarOff, IconCalendarPause, IconCalendarQuestion, IconCalendarTime, IconCheck, type TablerIcon } from "@tabler/icons-react";
import { useCallback } from "react";

export const EventStatusPicker = ({
	value,
	onChange,
	...props
}: {
	value: EventStatus;
	onChange: (value: EventStatus) => void;
} & Omit<SelectProps, "value" | "onChange">) => {
	const icons: Record<EventStatus, TablerIcon> = {
		planned: IconCalendarCheck,
		cancelled: IconCalendarOff,
		postponed: IconCalendarTime,
		suspended: IconCalendarPause,
		uncertain: IconCalendarQuestion,
	};

	const colors: Record<EventStatus, MantineColor> = {
		planned: "var(--mantine-color-green-6)",
		cancelled: "var(--mantine-color-red-6)",
		postponed: "var(--mantine-color-yellow-6)",
		suspended: "var(--mantine-color-blue-6)",
		uncertain: "var(--mantine-color-gray-6)",
	};

	const renderOption: SelectProps["renderOption"] = (({ option, checked }) => {
		const Icon = icons[option.value as EventStatus];

		return (
			<Group flex="1" gap="xs" wrap="nowrap">
				<Icon color={colors[option.value as EventStatus]} />
				<Stack gap={4}>
					<Text span inherit inline>
						{option.label[0]?.toUpperCase() + option.label.slice(1)}
					</Text>
					<Text span fz="xs" c="dimmed" inherit inline>
						{EventStatusSchema.options.find(status => status.value === option.value)?.description}
					</Text>
				</Stack>
				{checked && <IconCheck style={{ marginInlineStart: 'auto' }} />}
			</Group>
		);
	});

	const Icon = icons[value];

	return (
		<Select
			value={value}
			onChange={(val) => onChange((val || "planned") as EventStatus)}
			clearable={value !== "planned"}
			data={EventStatusSchema.options.map((status) => ({ value: status.value, label: status.value[0]?.toUpperCase() + status.value.slice(1) }))}
			leftSection={<Icon color={value == "planned" ? undefined : colors[value]} />}
			leftSectionPointerEvents="none"
			renderOption={renderOption}
			comboboxProps={{
				width: "max-content",
			}}
			{...props}
		/>
	);
};
