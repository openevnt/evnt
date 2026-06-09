import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync, rmSync } from "node:fs";
import { join, relative } from "node:path";
import { OpenEvntSchema } from "@evnt/schema";
import { SchemaValidationError, JSONParseError } from "../errors";
import { ZodError } from "zod";

const help = `Build a static site from OpenEvnt event files.

Usage: evnt build <dir> [--out <dir>]

Scans <dir> for .json files, validates each, and copies them to the output directory.
Also generates an index.json listing all events.`;

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

export default async function (opts: { dir: string; out: string }) {
	const { dir, out: rawOut } = opts;
	const out = join(process.cwd(), rawOut);

	if (!existsSync(dir)) {
		console.error(`Directory not found: ${dir}`);
		process.exit(1);
	}

	if (existsSync(out)) rmSync(out, { recursive: true });
	mkdirSync(out, { recursive: true });

	const files = findJsonFiles(dir);
	const entries: { path: string; lastModified?: number }[] = [];
	let valid = 0;
	let invalid = 0;

	for (const file of files) {
		let content: string;
		try {
			content = readFileSync(file, "utf-8");
		} catch {
			console.error(`Cannot read ${file}`);
			invalid++;
			continue;
		}

		let json: unknown;
		try {
			json = JSON.parse(content);
		} catch (e) {
			console.error(`Invalid JSON: ${file} — ${(e as SyntaxError).message}`);
			invalid++;
			continue;
		}

		const result = OpenEvntSchema.safeParse(json);
		if (!result.success) {
			const err = new SchemaValidationError(file, result.error as ZodError, content);
			console.error(err.getCodeFrames());
			invalid++;
			continue;
		}

		// Copy to output, preserving directory structure
		const relPath = relative(dir, file);
		const outPath = join(out, relPath);
		mkdirSync(outPath.replace(/\/[^/]+$/, ""), { recursive: true });
		writeFileSync(outPath, JSON.stringify(result.data, null, "\t"), "utf-8");

		entries.push({
			path: relPath,
			lastModified: statSync(file).mtimeMs,
		});

		const name = result.data.name?.en ?? Object.values(result.data.name ?? {})[0] ?? "unnamed";
		console.log(`Valid: ${relPath} (${name})`);
		valid++;
	}

	// Generate index
	writeFileSync(join(out, "index.json"), JSON.stringify({ events: entries }, null, "\t"), "utf-8");

	console.log(`\nBuilt ${valid} events to ${out}${invalid ? `, ${invalid} skipped` : ""}`);
	if (invalid > 0) process.exit(1);
}
