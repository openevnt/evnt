import { Text, Tooltip } from "@mantine/core";
import { useLocaleStore } from "../../../stores/useLocaleStore";
import type { SnippetLabel, SnippetLabelProps } from "@evnt/pretty";
import { useMemo } from "react";
import { trynull } from "../../../lib/util/trynull";
import { UtilPartialDate } from "~/lib/util/schema-utils";
import { PartialDateUtil, type PartialDate as PartialDateParts } from "@evnt/partial-date";

export const TimeSnippetLabel = ({
	value,
}: SnippetLabelProps<"time">) => {
	const userTimezone = useLocaleStore(store => store.timezone);

	const parsed = PartialDateUtil.parse(value);

	const sameTimezone = parsed.timezone === userTimezone;
	const pdt = PartialDateUtil.parsedAsPlainDateTime(parsed);
	const zdt = PartialDateUtil.parsedAsZonedDateTime(parsed);

	const str = pdt.toLocaleString(undefined, {
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	});

	const str2 = zdt.toInstant().toLocaleString(undefined, {
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
		timeZone: userTimezone,
	});

	return (
		<Tooltip label={`${value} - UTC`}>
			<Text
				component="time"
				dateTime={str ?? undefined}
				aria-label={`${str ?? "Invalid time"}`}
				inline
				inherit
			>
				{str ?? "!"}{!sameTimezone && (str !== str2) && <Text span inline inherit c="dimmed" children={` (${str2})`} />}
			</Text>
		</Tooltip>
	);
};
