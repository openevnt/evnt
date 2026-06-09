import z from "zod";
import { PartialDateRegex, PartialDateUtil } from "@evnt/partial-date";

export const PartialDateSchema = z.string()
	.refine((val) => PartialDateUtil.isValid(val), { error: "Invalid PartialDate format" })
	.meta({
		id: "PartialDate",
		description: "A date string that can have varying levels of precision (year, month, day, time) with a timezone",
		regex: PartialDateRegex.toString(),
		examples: [
			"2023[Europe/Vilnius]",
			"2023-05[Europe/Vilnius]",
			"2023-05-15[Europe/Vilnius]",
			"2023-05-15T13:45[Europe/Vilnius]",
		],
		defaultSnippets: [
			{
				label: "Current Date & Time",
				body: "${1:${CURRENT_YEAR}-${CURRENT_MONTH}-${CURRENT_DATE}T${CURRENT_HOUR}:${CURRENT_MINUTE}}[$2:UTC]",
			},
		],
	});
