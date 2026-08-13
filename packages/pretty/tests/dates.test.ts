import "temporal-polyfill-lite/global";
import { describe, expect, test } from "vitest";
import { MarkdownFormatter, groupDates, type EmojiFormatInput } from "../src/index";
import type { OpenEvnt } from "@evnt/types";

const renderMarkdown = (event: OpenEvnt, options?: EmojiFormatInput) =>
	new MarkdownFormatter(options).formatEvent(event);

// Three instances across Dec 20–22 2024 in Europe/Istanbul, supplied out of
// order. Dec 21 and Dec 22 share a 14:00 start; Dec 20 is uniquely 17:00.
const istanbulEvent: OpenEvnt = {
	v: "0.1",
	name: { en: "Comiket-style" },
	instances: [
		{ venueIds: ["0"], start: "2024-12-22T14:00[Europe/Istanbul]" },
		{ venueIds: ["0"], start: "2024-12-20T17:00[Europe/Istanbul]" },
		{ venueIds: ["0"], start: "2024-12-21T14:00[Europe/Istanbul]" },
	],
};

// Three consecutive days (May 22–24 2026) at the same venue in Europe/Vilnius,
// each with the same start+end time range.
const litExpoEvent: OpenEvnt = {
	v: "0.1",
	name: { en: "LitExpo" },
	venues: [{ id: "litexpo", $type: "directory.evnt.venue.physical", name: { en: "LITEXPO" } }],
	instances: [
		{
			venueIds: ["litexpo"],
			start: "2026-05-22T13:00[Europe/Vilnius]",
			end: "2026-05-22T21:00[Europe/Vilnius]",
		},
		{
			venueIds: ["litexpo"],
			start: "2026-05-23T13:00[Europe/Vilnius]",
			end: "2026-05-23T21:00[Europe/Vilnius]",
		},
		{
			venueIds: ["litexpo"],
			start: "2026-05-24T13:00[Europe/Vilnius]",
			end: "2026-05-24T21:00[Europe/Vilnius]",
		},
	],
};

// Two venues on separate days -> should produce two venue-grouped blocks.
const twoVenueEvent: OpenEvnt = {
	v: "0.1",
	name: { en: "Split" },
	venues: [
		{ id: "a", $type: "directory.evnt.venue.physical", name: { en: "Hall A" } },
		{ id: "b", $type: "directory.evnt.venue.physical", name: { en: "Hall B" } },
	],
	instances: [
		{ venueIds: ["a"], start: "2026-05-22[Europe/Vilnius]" },
		{ venueIds: ["b"], start: "2026-05-25[Europe/Vilnius]" },
	],
};

describe("groupDates (structure)", () => {
	test("sorts instances chronologically", () => {
		const venueGroups = groupDates(istanbulEvent.instances ?? [], true);
		// All instances share venueIds ["0"] → one venue group.
		expect(venueGroups).toHaveLength(1);
		const groups = venueGroups[0]!.groups;
		expect(groups[0]!.times[0]!.start).toBe("2024-12-20T17:00[Europe/Istanbul]");
		expect(groups[1]!.dates.type).toBe("range");
	});

	test("groups instances by venue", () => {
		const venueGroups = groupDates(twoVenueEvent.instances ?? [], true);
		expect(venueGroups).toHaveLength(2);
		const venues = venueGroups.map((vg) => vg.venueIds[0]);
		expect(venues).toContain("a");
		expect(venues).toContain("b");
	});

	test("default (true) merges consecutive same-time days into one range", () => {
		const venueGroups = groupDates(litExpoEvent.instances ?? [], true);
		expect(venueGroups).toHaveLength(1);
		expect(venueGroups[0]!.venueIds).toEqual(["litexpo"]);
		const groups = venueGroups[0]!.groups;
		expect(groups).toHaveLength(1);
		expect(groups[0]!.dates.type).toBe("range");
		expect(groups[0]!.times[0]).toEqual({
			start: "2026-05-22T13:00[Europe/Vilnius]",
			end: "2026-05-22T21:00[Europe/Vilnius]",
		});
	});

	test("true keeps a uniquely-timed day separate from the shared-time range", () => {
		const venueGroups = groupDates(istanbulEvent.instances ?? [], true);
		expect(venueGroups).toHaveLength(1);
		const groups = venueGroups[0]!.groups;
		expect(groups).toHaveLength(2);
		expect(groups[0]!.dates.type).toBe("single");
		expect(groups[1]!.dates.type).toBe("range");
	});

	test("false renders every instance as its own group", () => {
		const litGroups = groupDates(litExpoEvent.instances ?? [], false);
		expect(litGroups).toHaveLength(1);
		expect(litGroups[0]!.groups).toHaveLength(3);

		const istGroups = groupDates(istanbulEvent.instances ?? [], false);
		expect(istGroups).toHaveLength(1);
		expect(istGroups[0]!.groups).toHaveLength(3);
	});
});

describe("renderMarkdown (formatting)", () => {
	describe("layout", () => {
		test("puts venue header then date and time on their own lines", () => {
			const result = renderMarkdown(litExpoEvent);
			expect(result).toContain("📍 LITEXPO");
			expect(result).toContain("📅 May 22");
			expect(result).toContain("🕐 13:00 – 21:00");
			// venue appears exactly once (as header, not repeated per group)
			expect(result.match(/LITEXPO/g)).toHaveLength(1);
		});

		test("collapses the date range (one month, not 'May 22–May 24')", () => {
			const result = renderMarkdown(litExpoEvent);
			expect(result.match(/May/g)).toHaveLength(1);
		});

		test("separates multiple date groups with a blank line", () => {
			const result = renderMarkdown(istanbulEvent);
			expect(result).toContain("📅 Dec 20\n🕔 17:00\n\n📅 Dec 21");
			// the Dec 21–22 range is collapsed, so "Dec 22" never stands alone
			expect(result).not.toContain("Dec 22");
		});
	});

	describe("localization", () => {
		test("applies the requested language to the date range", () => {
			const en = renderMarkdown(litExpoEvent);
			const tr = renderMarkdown(litExpoEvent, { language: "tr" });
			// both collapsed to a single month mention
			expect(en.match(/May/g)).toHaveLength(1);
			expect(tr.match(/May/g)).toHaveLength(1);
			expect(tr).toContain("22");
			expect(tr).toContain("LITEXPO");
			// time ranges are locale-independent (no parenthetical)
			expect(tr).toContain("13:00 – 21:00");
			expect(tr).not.toBe(en);
		});
	});

	describe("compactDates", () => {
		test("compactDates:false includes the full year", () => {
			const result = renderMarkdown(litExpoEvent, { compactDates: false });
			expect(result).toContain("2026");
		});
	});
});
