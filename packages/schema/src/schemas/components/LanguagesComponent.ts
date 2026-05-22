import z from "zod";
import { LanguageCodeSchema } from "../../types/Translations";

export type LanguageInfo = z.infer<typeof LanguageInfoSchema>;
export const LanguageInfoSchema = z.object({
	code: LanguageCodeSchema,
});

export type LanguagesComponent = z.infer<typeof LanguagesComponentSchema>;
export const LanguagesComponentSchema = z.object({
	$type: z.literal("directory.evnt.component.languages"),
	languages: LanguageInfoSchema.array(),
}).meta({ id: "LanguagesComponent" });
