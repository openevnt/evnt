import { Text, Tooltip } from "@mantine/core";
import { useLocaleStore } from "../../../stores/useLocaleStore";
import type { SnippetLabelProps } from "@evnt/pretty";
import { PartialDateUtil } from "@evnt/partial-date";
import { useMemo } from "react";
import { trynull } from "../../../lib/util/trynull";

export const TimeSnippetLabel = ({
	value,
}: SnippetLabelProps<"time">) => {
	const userTimezone = useLocaleStore(store => store.timezone);

	const parsed = PartialDateUtil.parse(value);

	const sameTimezone = parsed.timezone === userTimezone;

	const time = useMemo(() => trynull(() => PartialDateUtil.asPlainDateTime(parsed).toLocaleString(undefined, {
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	})), [value]) ?? "!";

	const localizedTime = useMemo(() => trynull(() => PartialDateUtil.asZonedDateTime(parsed).toInstant().toLocaleString(undefined, {
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
		timeZone: userTimezone,
	})), [value, userTimezone]) ?? "!";

	return (
		<Tooltip label={`${value} - UTC`}>
			<Text
				component="time"
				dateTime={time ?? undefined}
				aria-label={`${time ?? "Invalid time"}`}
				inline
				inherit
			>
				{time ?? "!"}{!sameTimezone && (time !== localizedTime) && <Text span inline inherit c="dimmed" fw="unset" children={` (${localizedTime})`} />}
			</Text>
		</Tooltip>
	);
};
