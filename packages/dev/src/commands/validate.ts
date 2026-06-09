import pc from "picocolors";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { OpenEvntSchema } from "@evnt/schema";
import { ZodError } from "zod";
import { SchemaValidationError } from "../errors";

const findJsonFiles = (dir: string): string[] => {
	const results: string[] = [];
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const full = join(dir, entry.name);
		if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
		if (entry.isDirectory()) results.push(...findJsonFiles(full));
		else if (entry.name.endsWith(".json")) results.push(full);
	}
	return results;
};

export default async function (dir: string) {
	const files = findJsonFiles(dir);
	let valid = 0;
	let invalid = 0;

	for (const file of files) {
		let content: string;
		try {
			content = readFileSync(file, "utf-8");
		} catch {
			console.error(pc.red("✗") + ` Cannot read: ${file}`);
			invalid++;
			continue;
		}

		let json: unknown;
		try {
			json = JSON.parse(content);
		} catch (e) {
			console.error(pc.red("✗") + ` Invalid JSON: ${file}`);
			console.error(`  ${(e as SyntaxError).message}`);
			invalid++;
			continue;
		}

		const result = OpenEvntSchema.safeParse(json);
		if (result.success) {
			console.log(pc.green("✓") + ` ${file}`);
			valid++;
		} else {
			const err = new SchemaValidationError(file, result.error as ZodError, content);
			console.error(pc.red("✗") + ` ${file}`);
			console.error(err.getCodeFrames());
			invalid++;
		}
	}

	console.log(`\n${pc.green(String(valid))} valid, ${invalid > 0 ? pc.red(String(invalid)) : String(invalid)} invalid`);
	if (invalid > 0) process.exit(1);
}
