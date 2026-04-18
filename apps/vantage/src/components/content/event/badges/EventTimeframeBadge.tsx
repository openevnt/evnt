import { UtilPartialDate, UtilPartialDateRange } from "~/lib/util/schema-utils";
import { useResolvedEvent } from "../event-envelope-context";
import { PartialDateUtil, type PartialDate as PartialDateParts } from "@evnt/partial-date";
import { Badge, type BoxProps } from "@mantine/core";
import { IconCalendarDown, IconHistory, IconHourglass } from "@tabler/icons-react";

export const EventTimeframeBadge = (props: BoxProps) => {
	const { data } = useResolvedEvent();
	const now = UtilPartialDate.now();

	const status = data?.status ?? "planned";
	if (status !== "planned" && status !== "uncertain") return null;

	if (!data) return null;

	const allDays: PartialDateParts.YearMonthDay[] = data
		.instances
		?.flatMap(instance => UtilPartialDateRange.getIncludedDates(instance))
		?? [];

	const today = PartialDateUtil.lowerPrecision(PartialDateUtil.now(), "day");

	const hasToday = allDays?.some(day => today === day);

	const dateObjRanges: {
		low: Date;
		high: Date;
	}[] = data
		.instances
		?.filter(instance => !!instance.start && UtilPartialDate.hasDay(instance.start))
		?.map(instance => ({
			low: UtilPartialDate.toLowDate(instance.start!),
			high: instance.end ? UtilPartialDate.toHighDate(instance.end) : (
				UtilPartialDate.toHighDate(UtilPartialDate.asDay(instance.start as PartialDateParts.YearMonthDay | PartialDateParts.YearMonthDayTime))
			),
		}))
		?? [];

	const currentDateObj = UtilPartialDate.toLowDate(now);
	const allPast = dateObjRanges.every(({ high }) => high < currentDateObj);
	const allFuture = dateObjRanges.every(({ low }) => low > currentDateObj);
	const somePast = dateObjRanges.some(({ high }) => high < currentDateObj);
	const someFuture = dateObjRanges.some(({ low }) => low > currentDateObj);
	const someOngoing = dateObjRanges.some(({ low, high }) => low <= currentDateObj && high >= currentDateObj);

	if (someOngoing) return (
		<Badge
			{...props}
			variant="light"
			color="green"
			leftSection={<IconHourglass size={18} />}
		>
			Ongoing
		</Badge>
	);

	if (hasToday) return (
		<Badge
			{...props}
			variant="light"
			color="green"
			leftSection={<IconCalendarDown size={18} />}
		>
			Today
		</Badge>
	);

	if (allPast) return (
		<Badge
			{...props}
			variant="light"
			color="gray"
			leftSection={<IconHistory size={18} />}
		>
			Past
		</Badge>
	);

	return null;
};
