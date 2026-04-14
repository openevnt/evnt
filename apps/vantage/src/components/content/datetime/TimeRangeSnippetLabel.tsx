import type { SnippetLabelProps } from "@evnt/pretty";
import { Text } from "@mantine/core";
import { TimeSnippetLabel } from "./TimeSnippetLabel";

export const TimeRangeSnippetLabel = ({ value }: SnippetLabelProps<"time-range">) => {
	return (
		<Text
			span
			inline
			inherit
			role="group"
			aria-roledescription="Time range"
		>
			<TimeSnippetLabel
				value={value.start}
			/>
			<Text
				span
				inline
				inherit
				c="dimmed"
				children=" – "
				aria-label="to"
			/>
			<TimeSnippetLabel
				value={value.end}
			/>
		</Text>
	)
};
