import { Badge } from "@mantine/core";
import { useEventEnvelope } from "../event-envelope-context";
import { IconCalendarOff, IconCalendarPause, IconCalendarQuestion, IconCalendarTime } from "@tabler/icons-react";

export const EventStatusBadge = () => {
	const { data } = useEventEnvelope();
	const status = data?.status ?? "planned";
	
	if (status === "cancelled") return (
		<Badge
			variant="light"
			color="red"
			leftSection={<IconCalendarOff size={18} />}
		>
			Cancelled
		</Badge>
	);

	if (status === "postponed") return (
		<Badge
			variant="light"
			color="yellow"
			leftSection={<IconCalendarTime size={18} />}
		>
			Postponed
		</Badge>
	);

	if (status === "suspended") return (
		<Badge
			variant="light"
			color="blue"
			leftSection={<IconCalendarPause size={18} />}
		>
			Suspended
		</Badge>
	);

	if (status === "uncertain") return (
		<Badge
			variant="light"
			color="gray"
			leftSection={<IconCalendarQuestion size={18} />}
		>
			Uncertain
		</Badge>
	);

	return null;
};