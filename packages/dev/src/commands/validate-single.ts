import pc from "picocolors";
import { OpenEvntSchema } from "@evnt/schema";
import { ZodError } from "zod";
import { SchemaValidationError } from "../errors.js";

export default function (json: unknown, raw: string, label: string) {
	const result = OpenEvntSchema.safeParse(json);

	if (result.success) {
		console.log(pc.green("✓") + ` Valid: ${label}`);
	} else {
		const err = new SchemaValidationError(label, result.error as ZodError, raw);
		console.error(pc.red("✗") + ` Invalid: ${label}`);
		console.error(err.getCodeFrames());
		process.exit(1);
	}
}
