import { UtilPartialDate, UtilPartialDateRange } from "@evnt/schema/utils";
import { useEventEnvelope } from "../event-envelope-context";
import type { PartialDate } from "@evnt/schema";
import { Badge, type BoxProps } from "@mantine/core";
import { IconCalendarDown, IconHistory, IconHourglass } from "@tabler/icons-react";

export const EventTimeframeBadge = (props: BoxProps) => {
	const { data } = useEventEnvelope();
	const now = UtilPartialDate.now();

	const status = data?.status ?? "planned";
	if (status !== "planned" && status !== "uncertain") return null;

	if (!data) return null;

	const allDays: PartialDate.Day[] = data
		.instances
		?.flatMap(instance => UtilPartialDateRange.getIncludedDates(instance))
		?? [];

	const today: PartialDate.Day = UtilPartialDate.asDay(now);

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
				UtilPartialDate.toHighDate(UtilPartialDate.asDay(instance.start as PartialDate.Day | PartialDate.Full))
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
