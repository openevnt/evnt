import pc from "picocolors";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import type { OpenEvnt } from "@evnt/types";

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
	let total = 0;

	for (const file of files) {
		try {
			const content = readFileSync(file, "utf-8");
			const event = JSON.parse(content) as OpenEvnt;
			if (!event.v || !event.name) continue;

			const { default: check } = await import("./check-single");
			check(event, file);
			total++;
		} catch {
			// skip unparseable files
		}
	}

	if (total === 0) console.log(pc.yellow("!") + " No event files found");
}
