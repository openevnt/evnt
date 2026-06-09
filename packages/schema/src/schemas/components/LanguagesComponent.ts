import z from "zod";
import type { LanguagesComponent, LanguageInfo } from "@evnt/types";
import { LanguageCodeSchema } from "../../types/Translations";

export const LanguageInfoSchema = z.object({
	code: LanguageCodeSchema,
}) satisfies z.ZodType<LanguageInfo>;

export const LanguagesComponentSchema = z.object({
	$type: z.literal("directory.evnt.component.languages"),
	languages: LanguageInfoSchema.array(),
}).meta({ id: "LanguagesComponent" }) satisfies z.ZodType<LanguagesComponent>;
