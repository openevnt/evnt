import { writeFileSync } from "node:fs";
import { OpenEvntSchema } from "@evnt/schema";

export const genJsonSchema = async (dest: string | URL) => {
	const jsonSchema = OpenEvntSchema.toJSONSchema({
		override(ctx) {
			// Remove examples/defaultSnippets/default from TranslationsSchema to reduce size
			if (!!ctx.jsonSchema.$ref) {
				ctx.jsonSchema.examples = undefined;
				ctx.jsonSchema.defaultSnippets = undefined;
				ctx.jsonSchema.default = undefined;
			}
		},
	});

	writeFileSync(dest, JSON.stringify(jsonSchema, null, 2));
	return jsonSchema;
};
