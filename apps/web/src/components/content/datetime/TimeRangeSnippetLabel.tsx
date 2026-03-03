import type { SnippetLabelProps } from "@evnt/pretty";
import { Text } from "@mantine/core";
import { TimeSnippetLabel } from "./TimeSnippetLabel";

export const TimeRangeSnippetLabel = ({ value }: SnippetLabelProps<"time-range">) => {
	return (
		<Text span inline inherit>
			<TimeSnippetLabel
				value={value.start.value}
				day={value.start.day}
			/>
			<Text
				span
				inline
				inherit
				c="dimmed"
				children=" – "
			/>
			<TimeSnippetLabel
				value={value.end.value}
				day={value.end.day}
			/>
		</Text>
	)
};
