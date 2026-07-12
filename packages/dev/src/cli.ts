#!/usr/bin/env node
import "temporal-polyfill-lite/global";
import { readFileSync } from "node:fs";
import cac from "cac";
import validateDir from "./commands/validate.js";
import validateFile from "./commands/validate-single.js";
import show from "./commands/show.js";
import convert from "./commands/convert.js";
import build from "./commands/build.js";

const readStdin = (): Promise<string> => {
	if (process.stdin.isTTY) return Promise.resolve("");
	const chunks: Buffer[] = [];
	return new Promise((resolve) => {
		process.stdin.on("data", (c) => chunks.push(Buffer.from(c)));
		process.stdin.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
	});
};

const readFileOrStdin = async (file?: string): Promise<string> => {
	if (!file || file === "-") return readStdin();
	return readFileSync(file, "utf-8");
};

const parseJson = (content: string): unknown => JSON.parse(content);

const cli = cac("openevnt");

cli
	.command("validate [file]", "Validate event file(s) against the schema")
	.action(async (file?: string) => {
		if (file && !file.endsWith(".evnt.json")) {
			await validateDir(file);
		} else {
			const content = await readFileOrStdin(file);
			const json = parseJson(content);
			validateFile(json, content, file || "<stdin>");
		}
	});

cli
	.command("show [file]", "Pretty-print an event")
	.option("--format <type>", "Output format: plain, markdown, discord", { default: "markdown" })
	.option("--lang <code>", "Language for dates and translations", { default: "en" })
	.option("--timezone <tz>", "Timezone for local time display", { default: "" })
	.action(async (file?: string, flags?: { format?: string; lang?: string; timezone?: string }) => {
		const content = await readFileOrStdin(file);
		const json = parseJson(content);
		await show(json, flags || {});
	});

cli
	.command("convert [file]", "Convert an event to another format")
	.option("-f, --format <type>", "Output format (icalendar, activitystreams, schema-org)")
	.action(async (file?: string, flags?: { format?: string; out?: string }) => {
		if (!flags?.format) {
			console.error("Missing format. Use --format <type>");
			process.exit(1);
		}
		const content = await readFileOrStdin(file);
		const json = parseJson(content);
		await convert(json, flags as any);
	});

cli
	.command("build [dir]", "Build a static site from event files")
	.option("--out <dir>", "Output directory", { default: "./dist" })
	.option("--feed <file>", "JSON Feed filename (relative to --out)", { default: "feed.json" })
	.action(async (dir?: string, flags?: { out?: string; feed?: string }) => {
		await build({ dir: dir || ".", out: flags?.out || "./dist", feed: flags?.feed || "feed.json" });
	});

cli.help();
cli.parse();
