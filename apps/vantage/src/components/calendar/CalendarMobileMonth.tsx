import { ScrollArea, Stack } from "@mantine/core";
import { DatePicker, MonthLevel, MonthPicker } from "@mantine/dates";

export interface CalendarMobileMonthProps {
	month: `${number}-${number}`;
	setMonth: (month: `${number}-${number}`) => void;
	day: `${number}-${number}-${number}`;
	setDay: (day: `${number}-${number}-${number}`) => void;
	renderDay: (props: { day: `${number}-${number}-${number}` }) => React.ReactNode;
	renderDayButton?: (props: { day: `${number}-${number}-${number}` }) => React.ReactNode;
}

export const CalendarMobileMonth = ({
	month,
	setMonth,
	day,
	setDay,
	renderDay,
	renderDayButton,
}: CalendarMobileMonthProps) => {
	return (
		<Stack w="100%" h="100%" gap={0} align="center">
			<DatePicker
				date={month}
				value={day}
				onDateChange={(date) => setMonth(date.slice(0, 7) as `${number}-${number}`)}
				onChange={(date) => setDay(date as `${number}-${number}-${number}`)}
				renderDay={(day) => renderDayButton?.({ day: day as `${number}-${number}-${number}` }) ?? null}
				level="month"
			/>
			<ScrollArea w="100%">
				<Stack w="100%" h="100%" gap={0}>
					{renderDay({ day })}
				</Stack>
			</ScrollArea>
		</Stack>
	);
};
