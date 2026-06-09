import { z } from "zod";
import type { Translations } from "@evnt/types";

export type LanguageCode = z.infer<typeof LanguageCodeSchema>;
export const LanguageCodeSchema = z.string().meta({
	description: "BCP47 language code",
});

export const TranslationsSchema = z.record(LanguageCodeSchema, z.string())
	.meta({
		id: "Translations",
		description: "A multilingual string",
		default: {
			en: ""
		},
		examples: [
			{ en: "Example", tr: "Örnek", lt: "Pavyzdys" },
		],
		defaultSnippets: [
			{
				label: "Add English",
				body: { en: "$1" },
			},
			{
				label: "Add other language",
				body: { "$1": "$2" },
			}
		]
	}) satisfies z.ZodType<Translations>;
