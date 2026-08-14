import {
	existsSync,
	mkdirSync,
	readFileSync,
	readdirSync,
	statSync,
	writeFileSync,
	rmSync,
} from "node:fs";
import { join, relative, resolve } from "node:path";
import { OpenEvntSchema } from "@evnt/schema";
import { PlainTextFormatter } from "@evnt/pretty";
import { SchemaValidationError } from "../errors.js";
import { ZodError } from "zod";

const findEvntFiles = (dir: string): string[] => {
	const results: string[] = [];
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const full = join(dir, entry.name);
		if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
		if (entry.isDirectory()) results.push(...findEvntFiles(full));
		else if (entry.name.endsWith(".evnt.json")) results.push(full);
	}
	return results;
};

const titleOf = (event: { name?: Record<string, string> }): string => {
	if (!event.name) return "unnamed";
	return event.name.en ?? Object.values(event.name)[0] ?? "unnamed";
};

export default async function (opts: { dir: string; out: string; feed?: string }) {
	const { dir, out: rawOut, feed = "feed.json" } = opts;
	const out = resolve(rawOut);

	if (!existsSync(dir)) {
		console.error(`Directory not found: ${dir}`);
		process.exit(1);
	}

	if (existsSync(out)) rmSync(out, { recursive: true });
	mkdirSync(out, { recursive: true });

	const files = findEvntFiles(dir);
	const items: {
		id: string;
		url: string;
		title: string;
		content_text: string;
		date_modified: string;
	}[] = [];
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

		const event = result.data;
		const relPath = relative(dir, file);
		const outPath = join(out, relPath);
		mkdirSync(outPath.replace(/\/[^/]+$/, ""), { recursive: true });
		writeFileSync(outPath, JSON.stringify(event, null, "\t"), "utf-8");

		const contentText = new PlainTextFormatter({
			...PlainTextFormatter.defaultOptions,
			language: "en",
			timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
		}).formatEvent(event as any);

		items.push({
			id: relPath,
			url: relPath,
			title: titleOf(event),
			content_text: contentText,
			date_modified: new Date(statSync(file).mtimeMs).toISOString(),
		});

		console.log(`Valid: ${relPath} (${titleOf(event)})`);
		valid++;
	}

	items.sort((a, b) => b.date_modified.localeCompare(a.date_modified));

	const feedDoc = {
		version: "https://jsonfeed.org/version/1.1",
		title: "OpenEvnt Events",
		feed_url: feed,
		items,
	};
	writeFileSync(join(out, feed), JSON.stringify(feedDoc, null, "\t"), "utf-8");

	console.log(
		`\nBuilt ${valid} events to ${out}${invalid ? `, ${invalid} skipped` : ""}; wrote ${feed}`,
	);
	if (invalid > 0) process.exit(1);
}
