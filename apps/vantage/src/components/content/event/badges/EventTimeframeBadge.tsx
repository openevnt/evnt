import type { PartialDate } from "@evnt/schema";
import { useResolvedEvent } from "../event-envelope-context";
import { PartialDateUtil } from "@evnt/partial-date";
import { Badge, type BoxProps } from "@mantine/core";
import { IconCalendarDown, IconHistory, IconHourglass } from "@tabler/icons-react";

const getDayBounds = (start: PartialDate, end?: PartialDate) => ({
	low: PartialDateUtil.setPrecision(start, "day", "low"),
	high: end ? PartialDateUtil.setPrecision(end, "day", "high") : PartialDateUtil.setPrecision(start, "day", "high"),
});

const getActiveBounds = (start: PartialDate, end?: PartialDate) => ({
	low: PartialDateUtil.setPrecision(start, "time", "low"),
	high: end ? PartialDateUtil.setPrecision(end, "time", "high") : PartialDateUtil.setPrecision(start, "day", "high"),
});

export const EventTimeframeBadge = (props: BoxProps) => {
	const { data } = useResolvedEvent();
	const now = PartialDateUtil.now();
	const today = PartialDateUtil.lowerPrecision(now, "day");

	const status = data?.status ?? "planned";
	if (status !== "planned" && status !== "uncertain") return null;

	if (!data) return null;

	const ranges = data.instances?.filter(instance => !!instance.start && PartialDateUtil.has(instance.start as PartialDate, "day")) ?? [];

	const someOngoing = ranges.some(instance => {
		const bounds = getActiveBounds(instance.start as PartialDate, instance.end as PartialDate | undefined);
		return !PartialDateUtil.isAfter(bounds.low, now) && !PartialDateUtil.isBefore(bounds.high, now);
	});

	const hasToday = ranges.some(instance => {
		const bounds = getDayBounds(instance.start as PartialDate, instance.end as PartialDate | undefined);
		return !PartialDateUtil.isAfter(bounds.low, today) && !PartialDateUtil.isBefore(bounds.high, today);
	});

	const allPast = ranges.every(instance => {
		const bounds = getActiveBounds(instance.start as PartialDate, instance.end as PartialDate | undefined);
		return PartialDateUtil.isBefore(bounds.high, now);
	});

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
