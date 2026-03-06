import z from "zod";

export type TextSpan = z.infer<typeof TextSpanSchema>;
export const TextSpanSchema = z.object({
	type: z.literal("text").optional(),
	text: z.string(),
});

export type LinkSpan = z.infer<typeof LinkSpanSchema>;
export const LinkSpanSchema = z.object({
	type: z.literal("link"),
	url: z.string(),
	text: z.string().optional(),
});

const KnownRichTextSpans = {
	text: TextSpanSchema,
	link: LinkSpanSchema,
} as const;

export type UnknownRichTextSpan = {
	type?: string;
	[key: string]: unknown;
};

export type KnownRichTextSpan = {
	[K in keyof typeof KnownRichTextSpans]: z.infer<(typeof KnownRichTextSpans)[K]>;
}[keyof typeof KnownRichTextSpans];

export type RichTextSpan = KnownRichTextSpan | UnknownRichTextSpan;

export const RichTextSpanSchema = z.looseObject({
	type: z.string().optional(),
}).superRefine((obj, ctx) => {
	if (obj.type === undefined || obj.type in KnownRichTextSpans) {
		const schema = KnownRichTextSpans[(obj.type || "text") as keyof typeof KnownRichTextSpans];
		const result = schema.safeParse(obj.data);
		if (!result.success)
			result.error.issues.forEach((issue) => {
				ctx.addIssue({ ...issue, path: ["data", ...issue.path] });
			});
	}
}).meta({ id: "RichTextSpan" }) as z.ZodType<RichTextSpan>;
