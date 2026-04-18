import type { Range } from "@evnt/pretty";
import type { PartialDate } from "@evnt/schema";
import { Text, Tooltip } from "@mantine/core";
import { useLocaleStore } from "../../../stores/useLocaleStore";
import { useMemo } from "react";
import { PartialDateUtil } from "@evnt/partial-date";
import { trynull } from "../../../lib/util/trynull";

export const PartialDateRangeSnippetLabel = ({ value }: { value: Range<PartialDate> }) => {
	const language = useLocaleStore(store => store.language);
	const timeZone = useLocaleStore(store => store.timezone);

	const str = useMemo(() => trynull((): string => {
		let equalPrecision = PartialDateUtil.getPrecisionEquality(value.start, value.end);

		const fmt = new Intl.DateTimeFormat(language, {
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: PartialDateUtil.has(value.start, "time") ? "numeric" : undefined,
			minute: PartialDateUtil.has(value.start, "time") ? "numeric" : undefined,
			hour12: false,
			timeZone,
		});

		const startTemporal = PartialDateUtil.asFormattableTemporal(value.start);
		const endTemporal = PartialDateUtil.asFormattableTemporal(value.end);
		return fmt.formatRange(startTemporal, endTemporal);
	}), [language, timeZone, value]) ?? "Error";

	return (
		<Tooltip label={`meow`}>
			<Text
				component="time"
				role="group"
				aria-label={str}
				inline
				inherit
			>
				{str}
			</Text>
		</Tooltip>
	)
};
