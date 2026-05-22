import z from "zod";

export type MarkdownComponent = z.infer<typeof MarkdownComponentSchema>;
export const MarkdownComponentSchema = z.object({
	$type: z.literal("directory.evnt.component.markdown"),
	content: z.string().meta({ description: "The markdown content" }),
	flavor: (z.string() as z.ZodType<"commonmark" | "gfm" | (string & {})>).optional().meta({ description: "The flavor of markdown used in the content" }),
	version: z.string().optional().meta({ description: "The version of the flavor" }),
}).meta({ id: "MarkdownComponent" });
