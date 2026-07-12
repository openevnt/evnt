import z from "zod";
import type { LinkComponent } from "@evnt/types";
import { PartialDateSchema } from "../../types/PartialDate.js";
import { TranslationsSchema } from "../../types/Translations.js";

export const LinkComponentSchema = z
	.object({
		$type: z
			.literal("directory.evnt.component.link")
			.meta({ description: "The type of the component" }),
		url: z.string().meta({ description: "The URL of the link" }),
		name: TranslationsSchema.optional().meta({ description: "The name of the link" }),
		disabled: z.boolean().optional().meta({ description: "Whether the link is disabled" }),
		opensAt: PartialDateSchema.optional().meta({
			description: "The date and/or time when the link becomes active",
		}),
		closesAt: PartialDateSchema.optional().meta({
			description: "The date and/or time when the link becomes inactive",
		}),
	})
	.meta({ id: "directory.evnt.component.link" }) satisfies z.ZodType<LinkComponent>;
