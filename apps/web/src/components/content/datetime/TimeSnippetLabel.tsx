import { Text, Tooltip } from "@mantine/core";
import { useLocaleStore } from "../../../stores/useLocaleStore";
import type { SnippetLabel, SnippetLabelProps } from "@evnt/pretty";
import { useMemo } from "react";
import { trynull } from "../../../lib/util/trynull";
import { UtilPartialDate } from "@evnt/schema/utils";
import type { PartialDate } from "@evnt/schema";

export const TimeSnippetLabel = ({
	value,
	day,
}: SnippetLabelProps<"time">) => {
	const timezone = useLocaleStore(store => store.timezone);

	const str = useMemo(() => {
		return trynull(() => {
			const dateObj = UtilPartialDate.toLowDate(((day ?? UtilPartialDate.today()) + "T" + value) as PartialDate.Full);

			return new Intl.DateTimeFormat(undefined, {
				hour: "numeric",
				minute: "numeric",
				hour12: false,
				timeZone: timezone,
			}).format(dateObj);
		});
	}, [value, day]);

	return (
		<Tooltip label={`${value} - UTC`}>
			<Text span inline inherit>
				{str ?? "Invalid"}
			</Text>
		</Tooltip>
	);
};
