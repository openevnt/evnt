#!/usr/bin/env node
import cac from "cac";

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
	const { readFileSync } = await import("node:fs");
	return readFileSync(file, "utf-8");
};

const parseJson = (content: string): unknown => JSON.parse(content);

const cli = cac("openevnt");

cli
	.command("validate [file]", "Validate event file(s) against the schema")
	.action(async (file?: string) => {
		if (file && !file.endsWith(".json")) {
			const { default: validateDir } = await import("./commands/validate");
			await validateDir(file);
		} else {
			const { default: validateFile } = await import("./commands/validate-single");
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
		const { default: show } = await import("./commands/show");
		const content = await readFileOrStdin(file);
		const json = parseJson(content);
		await show(json, flags || {});
	});

cli
	.command("convert [file]", "Convert an event to another format")
	.option("-f, --format <type>", "Output format (icalendar, activitystreams, schema-org)")
	.action(async (file?: string, flags?: { format?: string; out?: string }) => {
		const { default: convert } = await import("./commands/convert");
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
	.action(async (dir?: string, flags?: { out?: string }) => {
		const { default: build } = await import("./commands/build");
		await build({ dir: dir || ".", out: flags?.out || "./dist" });
	});

cli.command("check [file]", "Lint event file(s)").action(async (file?: string) => {
	if (file && !file.endsWith(".json")) {
		const { default: checkDir } = await import("./commands/check");
		await checkDir(file);
	} else {
		const { default: checkSingle } = await import("./commands/check-single");
		const content = await readFileOrStdin(file);
		const json = parseJson(content);
		checkSingle(json, file || "<stdin>");
	}
});

cli
	.command("new", "Interactively create a new event file")
	.option("--out <file>", "Output file", { default: "event.json" })
	.action(async (flags?: { out?: string }) => {
		const { default: createNew } = await import("./commands/new");
		await createNew(flags?.out);
	});

cli.help();
cli.parse();
