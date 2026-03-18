import z from "zod";
import { TextSpanSchema } from "./RichTextSpan";

export type TextBlock = z.infer<typeof TextBlockSchema>;
export const TextBlockSchema = z.object({
	type: z.literal("text").optional(),
	spans: TextSpanSchema.array(),
}).meta({ id: "TextBlock" });


const KnownRichTextBlocks = {
	text: TextBlockSchema,
} as const;

export type UnknownRichTextSpan = {
	type?: string;
	[key: string]: unknown;
};

export type KnownRichTextSpan = {
	[K in keyof typeof KnownRichTextBlocks]: z.infer<(typeof KnownRichTextBlocks)[K]>;
}[keyof typeof KnownRichTextBlocks];

export type RichTextSpan = KnownRichTextSpan | UnknownRichTextSpan;

export const RichTextSpanSchema = z.looseObject({
	type: z.string().optional(),
}).superRefine((obj, ctx) => {
	if (obj.type === undefined || obj.type in KnownRichTextBlocks) {
		const schema = KnownRichTextBlocks[(obj.type || "text") as keyof typeof KnownRichTextBlocks];
		const result = schema.safeParse(obj.data);
		if (!result.success)
			result.error.issues.forEach((issue) => {
				ctx.addIssue({ ...issue, path: ["data", ...issue.path] });
			});
	}
}).meta({ id: "RichTextSpan" }) as z.ZodType<RichTextSpan>;
