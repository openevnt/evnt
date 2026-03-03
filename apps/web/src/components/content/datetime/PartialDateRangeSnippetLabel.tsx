import type { Range } from "@evnt/pretty";
import type { PartialDate } from "@evnt/schema";
import { UtilPartialDate, UtilPartialDateRange } from "@evnt/schema/utils";
import { Text, Tooltip } from "@mantine/core";
import { useLocaleStore } from "../../../stores/useLocaleStore";
import { useMemo } from "react";

export const PartialDateRangeSnippetLabel = ({ value }: { value: Range<PartialDate> }) => {
	const language = useLocaleStore(store => store.language);
	const timeZone = useLocaleStore(store => store.timezone);

	const parts = useMemo(() => {
		const isSameYear = UtilPartialDate.asYear(value.start) === UtilPartialDate.asYear(value.end);
		const isSameMonth = isSameYear
			&& UtilPartialDate.hasMonth(value.start)
			&& UtilPartialDate.hasMonth(value.end)
			&& UtilPartialDate.asMonth(value.start) === UtilPartialDate.asMonth(value.end);
		const isSameDay = isSameMonth
			&& UtilPartialDate.hasDay(value.start)
			&& UtilPartialDate.hasDay(value.end)
			&& UtilPartialDate.asDay(value.start) === UtilPartialDate.asDay(value.end);
		const isSameTime = UtilPartialDateRange.isSameTime(value);

		const fmt = new Intl.DateTimeFormat(language, {
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: UtilPartialDate.hasTime(value.start) ? "numeric" : undefined,
			minute: UtilPartialDate.hasTime(value.start) ? "numeric" : undefined,
			hour12: false,
			timeZone,
		});

		const startDate = UtilPartialDate.toLowDate(value.start);
		const endDate = UtilPartialDate.toLowDate(value.end);
		if (!UtilPartialDate.hasTime(value.end)) endDate.setHours(0, 0, 0, 0);
		const parts = fmt.formatRangeToParts(startDate, endDate);
		// console.log(parts);
		return parts;
	}, [language, timeZone, value]);

	return (
		<Tooltip label={`meow`}>
			<Text span inline inherit>
				{parts.map((p, i) => (
					<Text key={i} span inline inherit c={(p.type === "literal" && p.value.trim() !== ":") ? "dimmed" : undefined}>
						{p.value}
					</Text>
				))}
			</Text>
		</Tooltip>
	)
};
