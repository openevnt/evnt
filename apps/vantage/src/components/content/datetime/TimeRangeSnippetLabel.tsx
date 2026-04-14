import type { SnippetLabelProps } from "@evnt/pretty";
import { Text, VisuallyHidden } from "@mantine/core";
import { TimeSnippetLabel } from "./TimeSnippetLabel";

export const TimeRangeSnippetLabel = ({ value }: SnippetLabelProps<"time-range">) => {
	return (
		<Text
			span
			inline
			inherit
			role="group"
			aria-label={`${value.start} to ${value.end}`}
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
				aria-hidden
			/>
			<TimeSnippetLabel
				value={value.end}
			/>
		</Text>
	)
};
