import { PartialDateUtil, type PartialDate } from "@evnt/partial-date";
import { UtilPartialDate } from "~/lib/util/schema-utils";
import { ActionIcon, Badge, Box, Button, CloseButton, Collapse, Group, Input, InputBase, Popover, Stack, Text, TextInput, Tooltip } from "@mantine/core";
import { DatePicker, MonthPicker, TimePicker, YearPicker, type CalendarLevel } from "@mantine/dates";
import { useEffect, useImperativeHandle, useMemo, useRef, useState, type ReactNode } from "react";
import { PartialDateSnippetLabel } from "../../content/datetime/PartialDateSnippetLabel";
import { IconCalendar, IconCalendarQuestion, IconCheck, IconClock, IconClockQuestion, IconX } from "@tabler/icons-react";
import { useLocaleStore } from "../../../stores/useLocaleStore";
import { TimezoneSelect } from "../../app/overlay/settings/TimezoneSelect";

export const usePartialDateInputStates = ({
	value,
	onChange,
	focusOnTimePicker,
}: {
	value: PartialDate;
	onChange: (value: PartialDate) => void;
	focusOnTimePicker?: () => void;
}) => {
	const [calendarCollapsed, setCalendarCollapsed] = useState(PartialDateUtil.has(value, "day"));

	const calendarLevelOf = (v: PartialDate): CalendarLevel => {
		switch (PartialDateUtil.getPrecision(v)) {
			case "time":
			case "day": return "month";
			case "month": return "year";
			case "year": return "decade";
		}
	};

	const pad = (n: number) => String(n).padStart(2, "0");

	const asPartialDateDay = (v: PartialDate) => {
		const p = PartialDateUtil.setPrecision(v, "day", "low");
		const parsed = PartialDateUtil.parse(p);
		return `${parsed.year}-${pad(parsed.month)}-${pad(parsed.day)}`;
	};

	const [calendarLevel, setCalendarLevel] = useState<CalendarLevel>(calendarLevelOf(value));
	const [calendarDate, setCalendarDate] = useState<string>(asPartialDateDay(value));

	const onCalendarDateChange = (v: string | null) => {
		if (!v) return;
		setCalendarLevel((level) => {
			console.log("Date change", level, v);
			return level;
		})
		setCalendarDate(v);
	};

	const onCalendarLevelChange = (newLevel: CalendarLevel) => {
		setCalendarLevel((level) => {
			console.log("Level change to", level, "->", newLevel);

			if (newLevel === "decade") {
				onChange(PartialDateUtil.setPrecision(value, "year"));
				console.log("Level is now DECADE");
				return "decade";
			} else if (newLevel === "year") {
				onChange(PartialDateUtil.setPrecision(value, "month", "low"));
				console.log("Level is now YEAR");
				return "year";
			} else if (newLevel === "month") {
				return "month";
			}

			return level;
		});
	};

	const calendarValueFor = (level: CalendarLevel): string | undefined => {
		const parsed = PartialDateUtil.parse(value);
		switch (true) {
			case level === "decade": return `${parsed.year}`;
			case level === "year" && PartialDateUtil.has(parsed, "month"): return `${parsed.year}-${pad(parsed.month)}`;
			case level === "month" && PartialDateUtil.has(parsed, "day"): return `${parsed.year}-${pad(parsed.month)}-${pad(parsed.day)}`;
			default: return undefined;
		}
	};

	const onCalendarValueChange = (v: string | null) => {
		if (!v) return;

		setCalendarLevel((level) => {
			console.log("Value change", level, v);

			setCalendarDate(v);

			if (level === "decade") {
				onChange(v.slice(0, 4) + "[UTC]" as PartialDate.YearOnly);
				return "year";
			} else if (level === "year") {
				onChange(v.slice(0, 7) + "[UTC]" as PartialDate.YearMonth);
				return "month";
			} else if (level === "month") {
				const parsed = PartialDateUtil.parse(value);
				onChange(v + (parsed.precision == "time" ? `T${pad(parsed.hour)}:${pad(parsed.minute)}` : "") + "[UTC]" as PartialDate.YearMonthDay | PartialDate.YearMonthDayTime);
				setCalendarCollapsed(true);
				setTimeout(() => focusOnTimePicker?.(), 0);
			}

			return level;
		});
	};

	// == Time Picker ==

	const timePickerValue = useMemo(() => {
		const parsed = PartialDateUtil.parse(value);
		if (parsed.precision !== "time") return "";
		return [parsed.hour, parsed.minute].map(pad).join(":");
	}, [value]);

	const onTimePickerChange = (time: string | null) => {
		if (time) {
			const [h, m] = time.split(":").map(Number) as [number, number];
			const step = PartialDateUtil.setPrecision(value, "time", "low");
			const parsed = PartialDateUtil.parse(step) as PartialDate.Parsed.YearMonthDayTime;
			onChange(PartialDateUtil.format({
				...parsed,
				hour: h,
				minute: m,
				precision: "time",
			}));
		} else {
			const step = PartialDateUtil.setPrecision(value, "day", "low");
			onChange(step);
		};
	}

	// == Text Input ==

	const [textInputValue, setTextInputValue] = useState<string>(value);
	useEffect(() => setTextInputValue(value), [value]);

	const onTextInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const v = e.currentTarget.value;
		setTextInputValue(v);
		if (UtilPartialDate.validate(v)) {
			onChange(v as PartialDate);
			setCalendarDate(PartialDateUtil.setPrecision(v, "day", "low"));
			setCalendarLevel(calendarLevelOf(v));
		};
	};

	return {
		calendarCollapsed,
		setCalendarCollapsed,

		calendarLevel,
		calendarDate,
		onCalendarDateChange,
		onCalendarLevelChange,
		calendarValueFor,
		onCalendarValueChange,

		timePickerValue,
		onTimePickerChange,

		textInputValue,
		onTextInputChange,
	};
};

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
	const parsedValue = PartialDateUtil.parse(value);
	const valueTimezone = parsedValue.timezone;

	const timePickerHoursRef = useRef<HTMLInputElement | null>(null);

	const {
		calendarCollapsed,
		setCalendarCollapsed,
		calendarLevel,
		calendarDate,
		onCalendarDateChange,
		onCalendarLevelChange,
		onCalendarValueChange,
		calendarValueFor,

		timePickerValue,
		onTimePickerChange,

		textInputValue,
		onTextInputChange,
	} = usePartialDateInputStates({
		value,
		onChange,
		focusOnTimePicker: () =>
			timePickerHoursRef.current?.focus(),
	});

	const [popupOpened, setPopupOpened] = useState(false);

	const userTimezone = useLocaleStore(store => store.timezone);
	const userLanguage = useLocaleStore(store => store.language);

	// ref forwarding for DeatomOptional
	// open dropdown when value added
	useImperativeHandle(ref, () => ({
		focus: () => setPopupOpened(true),
	}), [setPopupOpened]);

	return (
		<Popover
			position="top"
			withArrow
			opened={popupOpened}
			onChange={setPopupOpened}
			onClose={() => setPopupOpened(false)}
			onDismiss={() => setPopupOpened(false)}
			shadow="xl"
		>
			<Popover.Target>
				<Stack gap={4}>
					<TextInput
						value={textInputValue}
						onChange={onTextInputChange}
						error={textInputValue.length > 0 && !UtilPartialDate.validate(textInputValue) ? "Invalid date format" : undefined}
						label={label}
						onFocus={() => setPopupOpened(true)}
						rightSectionWidth="auto"
						rightSection={(
							<Group gap={4} wrap="nowrap">
								<Tooltip label="Open date picker">
									<ActionIcon
										onClick={() => setPopupOpened((o) => !o)}
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
					<Group grow gap={4}>
						{(["year", "month", "day", "time"] as PartialDate.Precision[]).map((precision) => (
							<Badge
								key={precision}
								variant="light"
								color={PartialDateUtil.has(value, /* Stupid TS */ precision as any) ? "blue" : "gray"}
								size="xs"
							>
								{precision.charAt(0).toUpperCase() + precision.slice(1)}
							</Badge>
						))}
					</Group>

					<Stack gap={0}>
						<Collapse expanded={calendarCollapsed}>
							<InputBase
								miw="260px"
								label="Date"
								component="button"
								onClick={() => setCalendarCollapsed(false)}
								leftSection={PartialDateUtil.has(value, "day") ? <IconCalendar /> : <IconCalendarQuestion />}
								children={PartialDateUtil.has(value, "day") ? PartialDateUtil.asPlainDate(value).toLocaleString(userLanguage, {
									dateStyle: "full",
								}) : "!"}
							/>
						</Collapse>

						<Collapse expanded={!calendarCollapsed}>
							<Box>
								{calendarLevel === "decade" && (
									<YearPicker
										date={calendarDate}
										value={calendarValueFor("decade")}
										onDateChange={onCalendarDateChange}
										onChange={onCalendarValueChange}
									/>
								)}
								{calendarLevel === "year" && (
									<MonthPicker
										date={calendarDate}
										value={calendarValueFor("year")}
										onDateChange={onCalendarDateChange}
										onChange={onCalendarValueChange}
										level="year"
										onLevelChange={onCalendarLevelChange}
									/>
								)}
								{calendarLevel === "month" && (
									<DatePicker
										level="month"
										date={calendarDate}
										value={calendarValueFor("month")}
										highlightToday
										onDateChange={onCalendarDateChange}
										onChange={onCalendarValueChange}
										onLevelChange={onCalendarLevelChange}
									/>
								)}

								<Text c="dimmed" ta="center" size="xs" mt={4}>
									{(UtilPartialDate.hasDay(value) ? null :
										UtilPartialDate.hasMonth(value) ? "Close popup if unknown day" :
											"Close popup if unknown month")}
								</Text>
							</Box>
						</Collapse>
					</Stack>

					{PartialDateUtil.has(value, "day") && (
						<Stack gap={4}>
							<Group justify="space-between">
								<Input.Label>
									Time <Text c="dimmed" inline span inherit>(Local)</Text>
								</Input.Label>
							</Group>
							<TimePicker
								format="24h"
								value={timePickerValue}
								onChange={onTimePickerChange}
								hoursRef={timePickerHoursRef}
								clearable
								style={{ flex: 1 }}
								leftSection={PartialDateUtil.has(value, "time") ? <IconClock /> : <IconClockQuestion />}
							/>
						</Stack>
					)}

					<TimezoneSelect
						label="Timezone"
						value={parsedValue.timezone || "UTC"}
						onChange={(tz) => {
							onChange(PartialDateUtil.withTimezone(value, tz));
						}}
					/>

					{UtilPartialDate.hasDay(value) && !UtilPartialDate.isComplete(value) && (
						<Text c="dimmed" ta="center" size="xs">
							Close popup to keep time unknown
						</Text>
					)}

					<Button
						onClick={() => setPopupOpened(false)}
						color="gray"
						size="xs"
						mt="md"
					>
						Confirm
					</Button>
				</Stack>
			</Popover.Dropdown>
		</Popover>
	);
};
