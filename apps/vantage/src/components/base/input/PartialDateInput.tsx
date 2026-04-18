import { PartialDateUtil, type PartialDate } from "@evnt/partial-date";
import { ActionIcon, Badge, Box, Button, CloseButton, Collapse, Group, Input, InputBase, Modal, Paper, Stack, Text, TextInput, Tooltip } from "@mantine/core";
import { DatePicker, MonthPicker, TimePicker, YearPicker, type CalendarLevel } from "@mantine/dates";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { PartialDateSnippetLabel } from "../../content/datetime/PartialDateSnippetLabel";
import { IconCalendar, IconCalendarQuestion, IconCheck, IconClock, IconClockQuestion, IconPencil, IconWorld, IconX } from "@tabler/icons-react";
import { useLocaleStore } from "../../../stores/useLocaleStore";
import { TimezoneSelect } from "../../app/overlay/settings/TimezoneSelect";

export const usePartialDateInputStates = ({
	value,
	onChange,
	focusOnTimePicker,
}: {
	value: PartialDate | undefined;
	onChange: (value: PartialDate | undefined) => void;
	focusOnTimePicker?: () => void;
}) => {
	const [calendarCollapsed, setCalendarCollapsed] = useState(!!value && PartialDateUtil.has(value, "day"));

	const calendarLevelOf = (v: PartialDate | undefined): CalendarLevel => {
		if (!v) return "decade";
		switch (PartialDateUtil.getPrecision(v)) {
			case "time":
			case "day": return "month";
			case "month": return "year";
			case "year": return "decade";
		}
	};

	const pad = (n: number) => String(n).padStart(2, "0");

	const partialDateAsCalendarDate = (v: PartialDate | undefined) => {
		if (!v) return new Date().toISOString().slice(0, 10);
		const p = PartialDateUtil.setPrecision(v, "day", "low");
		const parsed = PartialDateUtil.parse(p);
		return `${parsed.year}-${pad(parsed.month)}-${pad(parsed.day)}`;
	};

	const [calendarLevel, setCalendarLevel] = useState<CalendarLevel>(calendarLevelOf(value));
	const [calendarDate, setCalendarDate] = useState<string>(partialDateAsCalendarDate(value));

	const onCalendarDateChange = (v: string | null) => {
		if (!v) return;
		setCalendarLevel((level) => {
			console.log("Date change", level, v);
			return level;
		})
		setCalendarDate(v);
	};

	const onCalendarLevelChange = (newLevel: CalendarLevel) => {
		if (!value) return;

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
		if (!value) return undefined;

		const parsed = PartialDateUtil.parse(value);
		switch (true) {
			case level === "decade": return `${parsed.year}`;
			case level === "year" && PartialDateUtil.has(parsed, "month"): return `${parsed.year}-${pad(parsed.month)}`;
			case level === "month" && PartialDateUtil.has(parsed, "day"): return `${parsed.year}-${pad(parsed.month)}-${pad(parsed.day)}`;
			default: return undefined;
		}
	};

	const onCalendarValueChange = (v: string | null) => {
		if (!v || !value) return;

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
		if (!value) return "";
		const parsed = PartialDateUtil.parse(value);
		if (parsed.precision !== "time") return "";
		return [parsed.hour, parsed.minute].map(pad).join(":");
	}, [value]);

	const onTimePickerChange = (time: string | null) => {
		if (!value) return;

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

	const [textInputValue, setTextInputValue] = useState<string>(value ?? "");
	useEffect(() => setTextInputValue(value ?? ""), [value]);

	const onTextInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const v = e.currentTarget.value;
		setTextInputValue(v);
		if (PartialDateUtil.isValid(v)) {
			onChange(v as PartialDate);
			setCalendarDate(partialDateAsCalendarDate(v));
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
	getInsertValue,
	label,
}: {
	value: PartialDate | undefined;
	onChange: (value: PartialDate | undefined) => void;
	getInsertValue?: () => PartialDate;
	label?: ReactNode;
}) => {
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

	const [modalOpened, setModalOpened] = useState(false);
	const [editingRaw, setEditingRaw] = useState(false);

	const userLanguage = useLocaleStore(store => store.language);

	const handleSet = useCallback(() => {
		const newValue: PartialDate = getInsertValue?.() ?? PartialDateUtil.format(PartialDateUtil.parsedFromTemporal(Temporal.Now.plainDateTimeISO()));
		onChange(newValue);
	}, [getInsertValue, onChange]);

	return (
		<Box>
			<Stack gap={4}>
				{value === undefined ? (
					<InputBase
						component="button"
						pointer
						onClick={handleSet}
						onMouseDown={handleSet}
						label={label}
						color="gray"
					>
						<Text c="dimmed" inherit inline span>
							Click to Set
						</Text>
					</InputBase>
				) : (
					editingRaw ? (
						<TextInput
							value={textInputValue}
							onChange={onTextInputChange}
							rightSection={(
								<Group gap={4} wrap="nowrap" >
									<Tooltip label="Done">
										<ActionIcon
											onClick={() => setEditingRaw(false)}
											disabled={!PartialDateUtil.isValid(textInputValue)}
											variant="subtle"
											color="green"
										>
											<IconCheck stroke={1.2} />
										</ActionIcon>
									</Tooltip>
								</Group>
							)}
							error={textInputValue && !PartialDateUtil.isValid(textInputValue) ? "Invalid PartialDate string" : undefined}
							autoFocus
							onKeyDown={(e) => {
								if ((e.key === "Enter" && PartialDateUtil.isValid(textInputValue)) || e.key === "Escape")
									setEditingRaw(false);
							}}
							label={label}
							placeholder="Enter raw PartialDate string"
						/>
					) : (
						<InputBase
							component="button"
							label={label}
							onClick={() => setModalOpened(true)}
							pointer
							rightSectionWidth="auto"
							rightSection={(
								<Group gap={4} wrap="nowrap" >
									<Tooltip label="Edit raw PartialDate string">
										<ActionIcon
											onClick={() => setEditingRaw(true)}
											variant="subtle"
											color="gray"
										>
											<IconPencil stroke={1.2} />
										</ActionIcon>
									</Tooltip>
									<Tooltip label="Remove date">
										<CloseButton
											onClick={() => onChange(undefined)}
										/>
									</Tooltip>
								</Group>
							)}
						>
							<PartialDateSnippetLabel value={value} />
						</InputBase>
					))}
				<Input.Description>
					{editingRaw ? (
						<PartialDateSnippetLabel value={value} />
					) : value}
				</Input.Description>
			</Stack>
			<Modal
				opened={modalOpened}
				onClose={() => setModalOpened(false)}
				withCloseButton={false}
				size="auto"
			>
				<Stack gap="md">
					<Stack gap={4}>
						<Group justify="center">
							<Input.Label>
								{label}
							</Input.Label>
						</Group>
						<Group justify="center" gap={4}>
							<IconCalendar />
							<PartialDateSnippetLabel value={value} />
						</Group>
						<Group grow gap={4} my={4}>
							{(["year", "month", "day", "time"] as PartialDate.Precision[]).map((precision) => (
								<Badge
									key={precision}
									variant="light"
									color={(!!value && PartialDateUtil.has(value, /* Stupid TS */ precision as any)) ? "blue" : "gray"}
									size="xs"
								>
									{precision.charAt(0).toUpperCase() + precision.slice(1)}
								</Badge>
							))}
						</Group>
					</Stack>

					<Stack gap={4}>
						<Input.Label>
							Date <Text c="dimmed" inline span inherit>(Local)</Text>
						</Input.Label>

						<Collapse expanded={calendarCollapsed}>
							<InputBase
								miw="260px"
								w="100%"
								component="button"
								onClick={() => setCalendarCollapsed(false)}
								leftSection={value && PartialDateUtil.has(value, "day") ? <IconCalendar /> : <IconCalendarQuestion />}
								children={value && PartialDateUtil.has(value, "day") ? PartialDateUtil.asPlainDate(value).toLocaleString(userLanguage, {
									dateStyle: "full",
								}) : "!"}
							/>
						</Collapse>

						<Collapse expanded={!calendarCollapsed}>
							<Paper withBorder bg="dark.6">
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

							</Paper>
						</Collapse>

						<Collapse expanded={!!value && PartialDateUtil.getPrecision(value) === "year"}>
							<Input.Description>
								Month, day and time marked as unknown
							</Input.Description>
						</Collapse>

						<Collapse expanded={!!value && PartialDateUtil.getPrecision(value) === "month"}>
							<Input.Description>
								Day and time marked as unknown
							</Input.Description>
						</Collapse>
					</Stack>

					<Collapse expanded={!!value && PartialDateUtil.has(value, "day")}>
						<Stack gap={4}>
							<Input.Label>
								Time <Text c="dimmed" inline span inherit>(Local)</Text>
							</Input.Label>
							<TimePicker
								format="24h"
								value={timePickerValue}
								onChange={onTimePickerChange}
								hoursRef={timePickerHoursRef}
								clearable
								style={{ flex: 1 }}
								leftSection={!!value && PartialDateUtil.has(value, "time") ? <IconClock /> : <IconClockQuestion />}
							/>
							<Collapse expanded={!!value && !PartialDateUtil.has(value, "time")}>
								<Input.Description>
									Time marked as unknown
								</Input.Description>
							</Collapse>
						</Stack>
					</Collapse>

					<TimezoneSelect
						label="Timezone"
						value={(value ? PartialDateUtil.parse(value).timezone : null) ?? "UTC"}
						leftSection={<IconWorld />}
						onChange={(tz) => {
							if (!value) return;
							onChange(PartialDateUtil.withTimezone(value, tz));
						}}
					/>

					<Group>
						<Button
							onClick={() => setModalOpened(false)}
							color="green"
							mt="md"
							fullWidth
						>
							Done
						</Button>
					</Group>
				</Stack>
			</Modal>
		</Box >
	);
};
