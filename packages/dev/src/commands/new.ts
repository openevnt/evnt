import { createInterface } from "node:readline/promises";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import type { OpenEvnt, Venue, EventInstance } from "@evnt/types";

const rl = createInterface({
	input: process.stdin,
	output: process.stdout,
});

const prompt = async (question: string, defaultValue?: string): Promise<string> => {
	const suffix = defaultValue ? ` [${defaultValue}]` : "";
	const answer = await rl.question(`${question}${suffix}: `);
	return answer.trim() || defaultValue || "";
};

const confirm = async (question: string, defaultYes = true): Promise<boolean> => {
	const hint = defaultYes ? "Y/n" : "y/N";
	const answer = await rl.question(`${question} (${hint}): `);
	const a = answer.trim().toLowerCase();
	if (!a) return defaultYes;
	return a === "y" || a === "yes";
};

const collectLanguages = async (field: string): Promise<Record<string, string>> => {
	const translations: Record<string, string> = {};
	while (true) {
		const lang = await prompt(`${field} language (or blank to finish)`);
		if (!lang) break;
		const value = await prompt(`  ${field} (${lang})`);
		if (value) translations[lang] = value;
	}
	return translations;
};

export default async function (outFile?: string) {
	const out = outFile ? resolve(process.cwd(), outFile) : resolve(process.cwd(), "event.json");

	console.log("Creating a new OpenEvnt event. Leave fields blank to skip.\n");

	const name = await collectLanguages("Name");

	if (Object.keys(name).length === 0) {
		console.error("At least one name translation is required.");
		rl.close();
		process.exit(1);
	}

	const event: OpenEvnt = {
		v: "0.1",
		name,
	};

	const statusVal = await prompt("Status", "planned");
	if (["planned", "uncertain", "postponed", "cancelled", "suspended"].includes(statusVal)) {
		event.status = statusVal as OpenEvnt["status"];
	}

	const venues: Venue[] = [];
	while (await confirm("Add a venue", venues.length === 0)) {
		const type = (await prompt("Venue type", "physical")) as "physical" | "online";
		const vName = await collectLanguages("Venue name");
		if (Object.keys(vName).length === 0) continue;

		const id = await prompt("Venue ID", `v${venues.length + 1}`);
		const addr = await prompt("Address (optional)");
		const countryCode = await prompt("Country code (optional)");
		const url = await prompt("URL (optional)");

		const venue: Record<string, unknown> = {
			id,
			name: vName,
			$type: `directory.evnt.venue.${type}`,
		};
		if (addr || countryCode)
			venue.address = { addr: addr || undefined, countryCode: countryCode || undefined };
		if (url) venue.url = url;
		venues.push(venue as unknown as Venue);
	}

	if (venues.length > 0) event.venues = venues;

	const instances: EventInstance[] = [];
	while (await confirm("Add an instance", instances.length === 0)) {
		const start = await prompt("Start date (e.g. 2026-06-15T18:00[Europe/London])");
		const end = await prompt("End date (e.g. 2026-06-15T21:00[Europe/London])");
		if (!start && !end) continue;

		const venueIds: string[] = [];
		if (venues.length > 0) {
			while (await confirm("Link a venue", venueIds.length === 0)) {
				const vid = await prompt(
					`Venue ID (${venues.map((v) => v.id).join(", ")})`,
					venues[venueIds.length]?.id,
				);
				if (venues.some((v) => v.id === vid)) venueIds.push(vid);
			}
		}

		instances.push({ start: start || undefined, end: end || undefined, venueIds } as EventInstance);
	}

	if (instances.length > 0) event.instances = instances;

	const links: { url: string; name?: Record<string, string> }[] = [];
	while (await confirm("Add a link", false)) {
		const url = await prompt("URL");
		if (!url) continue;
		const linkName = await collectLanguages("Link name");
		links.push({ url, name: Object.keys(linkName).length > 0 ? linkName : undefined });
	}

	if (links.length > 0) {
		event.components = links.map((l) => ({ $type: "directory.evnt.component.link", ...l }));
	}

	rl.close();

	writeFileSync(out, JSON.stringify(event, null, "\t"), "utf-8");
	console.log(`\nWrote event to ${out}`);
}
