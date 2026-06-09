import pc from "picocolors";
import type { OpenEvnt } from "@evnt/types";
import { PartialDateUtil } from "@evnt/partial-date";

export default function (json: unknown, label: string) {
	const event = json as OpenEvnt;
	if (!event.v || !event.name) return;

	const issues: string[] = [];

	if (!event.name.en) issues.push("Missing English (en) name translation");

	const venueIds = new Set(event.venues?.map((v) => v.id) ?? []);
	const seenVenueIds = new Set<string>();
	for (const venue of event.venues ?? []) {
		if (seenVenueIds.has(venue.id)) issues.push(`Duplicate venue ID: ${venue.id}`);
		seenVenueIds.add(venue.id);
	}

	for (const [i, inst] of (event.instances ?? []).entries()) {
		const il = `instance[${i}]`;

		if (!inst.start && !inst.end) {
			issues.push(`${il}: no start or end date`);
		}

		if (inst.start && inst.end) {
			try {
				const pa = PartialDateUtil.parse(inst.start as any);
				const pb = PartialDateUtil.parse(inst.end as any);
				const fa = pa as any, fb = pb as any;
				const cmp = (fa.year - fb.year) || ((fa.month ?? 1) - (fb.month ?? 1)) || ((fa.day ?? 1) - (fb.day ?? 1)) || ((fa.hour ?? 0) - (fb.hour ?? 0)) || ((fa.minute ?? 0) - (fb.minute ?? 0));
				if (cmp > 0) issues.push(`${il}: start is after end`);
			} catch {
				issues.push(`${il}: invalid date format`);
			}
		} else if (inst.start) {
			issues.push(`${il}: has start but no end`);
		} else if (inst.end) {
			issues.push(`${il}: has end but no start`);
		}

		if (!inst.venueIds || inst.venueIds.length === 0) {
			issues.push(`${il}: no venueIds`);
		} else {
			for (const vid of inst.venueIds) {
				if (!venueIds.has(vid)) issues.push(`${il}: references unknown venue ID "${vid}"`);
			}
		}
	}

	if (issues.length > 0) {
		console.log(pc.yellow("!") + ` ${label}:`);
		for (const issue of issues) console.log(`  ${pc.yellow("!")} ${issue}`);
	} else {
		console.log(pc.green("✓") + ` No issues: ${label}`);
	}
}
