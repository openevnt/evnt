import { ActionIcon, Box, Group, Paper, ScrollArea, SimpleGrid, Stack, Text, Tooltip } from "@mantine/core";
import { useLocaleStore } from "../../stores/useLocaleStore";
import { getMonthDays } from "@mantine/dates";
import type { PartialDate } from "@evnt/schema";
import { UtilPartialDate } from "@evnt/schema/utils";
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";
import type { PropsWithChildren } from "react";

export interface CalendarMonthProps {
	month: PartialDate.Month;
	setMonth: (month: PartialDate.Month) => void;
	renderDay: (props: { day: PartialDate.Day }) => React.ReactNode;
}

export const CalendarMonth = ({
	month,
	setMonth,
	renderDay,
}: CalendarMonthProps) => {
	const userLanguage = useLocaleStore(store => store.language);

	const dates = getMonthDays({
		month,
		firstDayOfWeek: 1,
		consistentWeeks: true,
	}) as PartialDate.Day[][];

	return (
		<Stack w="100%" h="100%" gap={0}>
			<Paper p="xs" withBorder w="100%" radius={0}>
				<Group justify="space-between">
					<Stack gap={0}>
						<Text>
							{new Date(month).toLocaleString("default", { month: "long", year: "numeric" })}
						</Text>
						<Text fz="xs" c="dimmed">
							{month}
						</Text>
					</Stack>
					<Group gap={4}>
						{[-1, +1].map(dir => (
							<Tooltip label={dir === -1 ? "Previous month" : "Next month"} key={dir}>
								<ActionIcon
									size="input-sm"
									color="gray"
									onClick={() => {
										let [p1, p2] = month.split("-").map(Number) as [year: number, month: number];
										p2 += dir;
										if (p2 < 1) {
											p2 = 12;
											p1 -= 1;
										} else if (p2 > 12) {
											p2 = 1;
											p1 += 1;
										};
										setMonth(`${p1.toString()}-${p2.toString().padStart(2, "0")}` as PartialDate.Month);
									}}
								>
									{dir === -1 ? <IconArrowLeft /> : <IconArrowRight />}
								</ActionIcon>
							</Tooltip>
						))}
					</Group>
				</Group>
			</Paper>

			<SimpleGrid cols={7} spacing={0}>
				{[...Array(7).keys()].map((d) => (
					<Paper withBorder radius={0} key={d}>
						<Text ta="center" fw={500} c="dimmed">
							{new Intl.DateTimeFormat(userLanguage, { weekday: "short" }).format(new Date(2021, 0, d + 4))}
						</Text>
					</Paper>
				))}
			</SimpleGrid>

			<SimpleGrid
				cols={7}
				spacing={0}
				verticalSpacing={0}
				w="100%"
				style={{
					flex: 1,
					display: "grid",
					gridTemplateRows: "repeat(6, 1fr)",
					minHeight: 0,
				}}
			>
				{dates.map(row => (
					row.map(day => (
						<Paper
							withBorder
							key={day}
							radius={0}
							w="100%"
							style={{
								overflow: "clip",
								minHeight: 0,
								display: "flex",
							}}
							pos="relative"
						>
							<CalendarMonthDay
								day={day}
								isCurrentMonth={UtilPartialDate.asMonth(day) === month}
							>
								{renderDay({ day })}
							</CalendarMonthDay>
						</Paper>
					))
				))}
			</SimpleGrid>
		</Stack>
	)
};

export const CalendarMonthDay = ({
	day,
	children,
	isCurrentMonth,
}: PropsWithChildren<{
	day: PartialDate.Day;
	isCurrentMonth: boolean;
}>) => {
	const isToday = UtilPartialDate.today() === day;

	return (
		<Stack gap={0} w="100%" h="100%" align="center">
			<Text
				ta="center"
				c={isCurrentMonth ? (isToday ? "blue" : undefined) : "dimmed"}
				fz="xs"
				fw="bold"
				span
			>
				{day.slice(-2)}
			</Text>
			<ScrollArea h="100%" mah="100%" w="100%" scrollbars="y">
				{children}
			</ScrollArea>
		</Stack>
	);
};

