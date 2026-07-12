import { writeFileSync } from "node:fs";
import { OpenEvntSchema } from "@evnt/schema";

const OUTPUT = new URL("../../docs/public/openevnt.schema.json", import.meta.url);

const jsonSchema = OpenEvntSchema.toJSONSchema({
	override(ctx) {
		// Remove examples/defaultSnippets/default from TranslationsSchema to reduce size
		if (ctx.jsonSchema.$ref) {
			ctx.jsonSchema.examples = undefined;
			ctx.jsonSchema.defaultSnippets = undefined;
			ctx.jsonSchema.default = undefined;
		}
	},
});

writeFileSync(OUTPUT, JSON.stringify(jsonSchema, null, "\t"));
