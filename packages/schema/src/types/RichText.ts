import z from "zod";
import { LanguageKeySchema } from "./Translations";

export type RichText = z.infer<typeof RichTextSchema>;
export const RichTextSchema = z.object({

}).meta({
	id: "RichText",
	description: "Rich text content",
});

export type RichTextTranslations = z.infer<typeof RichTextTranslationsSchema>;
export const RichTextTranslationsSchema = z.record(LanguageKeySchema, RichTextSchema.optional())
	.meta({
		id: "RichTextTranslations",
		description: "A multilingual rich text content",
		default: {},
	})
