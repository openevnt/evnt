import type { PartialDate } from "@evnt/schema";
import { Text } from "@mantine/core";
import { useLocaleStore } from "../../../stores/useLocaleStore";
import { PartialDateUtil } from "@evnt/partial-date";
import { useMemo } from "react";
import { trynull } from "../../../lib/util/trynull";

export const PartialDateSnippetLabel = ({
	value,
	language,
}: {
	value: PartialDate | undefined;
	language?: string;
}) => {
	const userLanguage = useLocaleStore(store => store.language);
	const userTimezone = useLocaleStore(store => store.timezone);

	const str = useMemo(() => trynull(() => {
		if (!value) return "";

		const parsed = PartialDateUtil.parse(value);

		const fmt = new Intl.DateTimeFormat(language || userLanguage, {
			year: "numeric",
			month: PartialDateUtil.has(parsed, "month") ? "long" : undefined,
			day: PartialDateUtil.has(parsed, "day") ? "numeric" : undefined,
			hour: PartialDateUtil.has(parsed, "time") ? "numeric" : undefined,
			minute: PartialDateUtil.has(parsed, "time") ? "numeric" : undefined,
			calendar: "iso8601",
			hour12: false,
			timeZone: parsed.timezone,
		});

		let temporal = PartialDateUtil.asFormattableTemporal(parsed);
		let str = fmt.format(temporal);

		if (parsed.precision === "time" && parsed.timezone !== userTimezone) {
			const localizedFmt = new Intl.DateTimeFormat(language || userLanguage, {
				hour: "numeric",
				minute: "numeric",
				hour12: false,
				timeZone: userTimezone,
			});
			const localizedParts = localizedFmt.format(PartialDateUtil.asZonedDateTime(parsed).toInstant());
			str += ` (${localizedParts})`;
		}

		return str;
	}), [value, userLanguage, userTimezone]) ?? "Error";

	return (
		<Text
			component="time"
			dateTime={value}
			aria-label={str}
			inline
			inherit
			c={str ? undefined : "dimmed"}
		>
			{str || "<unknown>"}
		</Text>
	)
};
