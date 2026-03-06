import type { PartialDate } from "@evnt/schema";
import { UtilPartialDate } from "@evnt/schema/utils";
import { ActionIcon, Box, Button, CloseButton, Collapse, Group, Input, Popover, SegmentedControl, Stack, Text, TextInput, Tooltip } from "@mantine/core";
import { DatePicker, MonthPicker, TimePicker, YearPicker, type CalendarLevel } from "@mantine/dates";
import { useEffect, useImperativeHandle, useRef, useState, type ReactNode } from "react";
import { PartialDateSnippetLabel } from "../../content/datetime/PartialDateSnippetLabel";
import { IconCalendar } from "@tabler/icons-react";
import { useLocaleStore } from "../../../stores/useLocaleStore";

export const PartialDateInput = ({
	value,
	onChange,
	onDelete,
	label,
	ref,
}: {
	value: PartialDate;
	onChange: (value: PartialDate) => void;
	onDelete?: () => void;
	label?: ReactNode;
	// Specifically for DeatomOptional lol
	ref?: React.Ref<{ focus: () => void }>;
}) => {
	const levelOf = (v: PartialDate): CalendarLevel => UtilPartialDate.hasDay(v) ? "month" : UtilPartialDate.hasMonth(v) ? "year" : "decade";
	const asPartialDateDay = (v: PartialDate): PartialDate.Day => UtilPartialDate.toLowDate(value).toISOString().slice(0, 10) as PartialDate.Day;
	const [level, setLevel] = useState<CalendarLevel>(levelOf(value));
	const [date, setDate] = useState<string>(asPartialDateDay(value));
	const [opened, setOpened] = useState(false);
	const [calendarCollapsed, setCalendarCollapsed] = useState(UtilPartialDate.hasDay(value));
	const timePickerHoursRef = useRef<HTMLInputElement | null>(null);
	const [timePickerMode, setTimePickerMode] = useState<"utc" | "local">("utc");
	const userTimezone = useLocaleStore(store => store.timezone);

	const [inputValue, setInputValue] = useState<string>(value);
	useEffect(() => {
		setInputValue(value);
	}, [value]);

	const onInputChange = (v: string) => {
		setInputValue(v);
		if (UtilPartialDate.validate(v)) {
			onChange(v);
			setDate(asPartialDateDay(v));
			setLevel(levelOf(v));
		};
	};

	const onDateChange = (v: string | null) => {
		if (!v) return;
		setLevel((level) => {
			console.log("Date change", level, v);
			return level;
		})
		setDate(v);
	};

	const onValueChange = (v: string | null) => {
		if (!v) return;

		setLevel((level) => {
			console.log("Value change", level, v);

			setDate(v);

			if (level === "decade") {
				onChange(v.slice(0, 4) as PartialDate.Year);
				return "year";
			} else if (level === "year") {
				onChange(v.slice(0, 7) as PartialDate.Month);
				return "month";
			} else if (level === "month") {
				onChange(v as PartialDate.Day);
				setCalendarCollapsed(true);
				setTimeout(() => {
					if (timePickerHoursRef.current)
						timePickerHoursRef.current.focus();
				}, 0);
			}

			return level;
		});
	};

	const onLevelChange = (newLevel: CalendarLevel) => {
		setLevel((level) => {
			console.log("Level change to", level, "->", newLevel);

			if (newLevel === "decade") {
				onChange(value.slice(0, 4) as PartialDate.Year);
				console.log("Level is now DECADE");
				return "decade";
			} else if (newLevel === "year") {
				onChange(value.slice(0, 7) as PartialDate.Month);
				console.log("Level is now YEAR");
				return "year";
			} else if (newLevel === "month") {
				return "month";
			}

			return level;
		});
	};

	// ref forwarding for DeatomOptional
	// open dropdown when value added
	useImperativeHandle(ref, () => ({
		focus: () => setOpened(true),
	}), [setOpened]);

	return (
		<Popover
			position="top"
			withArrow
			opened={opened}
			onChange={setOpened}
			onClose={() => setOpened(false)}
			onDismiss={() => setOpened(false)}
			shadow="xl"
		>
			<Popover.Target>
				<Stack gap={4}>
					<TextInput
						value={inputValue}
						onChange={(e) => onInputChange(e.currentTarget.value)}
						error={inputValue.length > 0 && !UtilPartialDate.validate(inputValue) ? "Invalid date format" : undefined}
						label={label}
						onFocus={() => setOpened(true)}
						rightSectionWidth="auto"
						rightSection={(
							<Group gap={4} wrap="nowrap">
								<Tooltip label="Open date picker">
									<ActionIcon
										onClick={() => setOpened((o) => !o)}
										variant="subtle"
										color="gray"
									>
										<IconCalendar stroke={1.2} />
									</ActionIcon>
								</Tooltip>
								{onDelete && (
									<Tooltip label="Remove date">
										<CloseButton
											onClick={onDelete}
										/>
									</Tooltip>
								)}
							</Group>
						)}
					/>
					<Input.Description>
						<PartialDateSnippetLabel
							value={value}
						/>
						{` (${userTimezone ?? "UTC"})`}
					</Input.Description>
					{!!userTimezone && userTimezone !== "UTC" && (
						<Input.Description>
							<PartialDateSnippetLabel
								timezone="UTC"
								value={value}
							/>
							{` (UTC)`}
						</Input.Description>
					)}
				</Stack>
			</Popover.Target>
			<Popover.Dropdown>
				<Stack gap={4}>
					<Text c="dimmed" ta="center" size="xs">
						{(
							!UtilPartialDate.hasMonth(value) ? "Enter Partial Date" :
								!UtilPartialDate.hasDay(value) ? "Known month, Unknown day" :
									!UtilPartialDate.hasTime(value) ? "Known day, Unknown time" :
										"Complete date and time"
						)}
					</Text>

					<Collapse expanded={calendarCollapsed}>
						<Button
							onClick={() => setCalendarCollapsed(false)}
							miw="260px"
							color="gray"
							variant="light"
							h="auto"
							py={4}
							style={{ overflow: "visible" }}
						>
							<Stack gap={0}>
								<Text inline inherit fz="xs">Change Date</Text>
								<Text size="sm">
									{UtilPartialDate.toIntlDateString(value)}
								</Text>
							</Stack>
						</Button>
					</Collapse>

					<Collapse expanded={!calendarCollapsed}>
						<Box>
							{level === "decade" && (
								<YearPicker
									date={date}
									value={value}
									onDateChange={onDateChange}
									onChange={onValueChange}
								/>
							)}
							{level === "year" && (
								<MonthPicker
									date={date}
									value={UtilPartialDate.hasMonth(value) ? value : undefined}
									onDateChange={onDateChange}
									onChange={onValueChange}
									level="year"
									onLevelChange={onLevelChange}
								/>
							)}
							{level === "month" && (
								<DatePicker
									level="month"
									date={date}
									value={UtilPartialDate.hasDay(value) ? value : undefined}
									highlightToday
									onDateChange={onDateChange}
									onChange={onValueChange}
									onLevelChange={onLevelChange}
								/>
							)}

							<Text c="dimmed" ta="center" size="xs" mt={4}>
								{(UtilPartialDate.hasDay(value) ? null :
									UtilPartialDate.hasMonth(value) ? "Close popup if unknown day" :
										"Close popup if unknown month")}
							</Text>
						</Box>
					</Collapse>

					{UtilPartialDate.hasDay(value) && (
						<Stack gap={4} mt="md">
							<Group justify="space-between">
								<Input.Label>
									Time
								</Input.Label>
								<SegmentedControl<"utc" | "local">
									data={[
										{ label: "UTC", value: "utc" },
										{ label: "Local", value: "local", disabled: true },
									]}
									value={timePickerMode}
									onChange={setTimePickerMode}
									size="xs"
								/>
							</Group>
							<TimePicker
								format="24h"
								value={UtilPartialDate.getTimePart(value) || ""}
								clearable
								onChange={(time) => {
									onChange(UtilPartialDate.getDatePart(value) + (time ? `T${time}` : "") as PartialDate.Full | PartialDate.Day);
								}}
								style={{ flex: 1 }}
								hoursRef={timePickerHoursRef}
							/>
						</Stack>
					)}

					{UtilPartialDate.hasDay(value) && !UtilPartialDate.isComplete(value) && (
						<Text c="dimmed" ta="center" size="xs">
							Close popup to keep time unknown
						</Text>
					)}

					<Button
						onClick={() => setOpened(false)}
						color="gray"
						size="xs"
						mt="md"
					>
						Close
					</Button>
				</Stack>
			</Popover.Dropdown>
		</Popover>
	);
};
