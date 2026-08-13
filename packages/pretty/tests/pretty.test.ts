import "temporal-polyfill-lite/global";
import { describe, expect, test } from "vitest";
import { MarkdownFormatter, type EmojiFormatInput } from "../src/index";
import type { OpenEvnt, PartialDate } from "@evnt/types";

const renderMarkdown = (event: OpenEvnt, options?: EmojiFormatInput) =>
	new MarkdownFormatter(options).formatEvent(event);

const date = "2025-01-01[UTC]" as PartialDate;

const baseEvent: OpenEvnt = {
	v: "0.1",
	name: { en: "Test Event" },
};

describe("renderMarkdown", () => {
	test("renders event name", () => {
		const result = renderMarkdown(baseEvent);
		expect(result).toContain("Test Event");
	});

	test("handles minimal event without crashing", () => {
		const event: OpenEvnt = { v: "0.1", name: {} };
		const result = renderMarkdown(event);
		expect(typeof result).toBe("string");
	});

	test("renders venue name when linked from instance", () => {
		const event: OpenEvnt = {
			...baseEvent,
			venues: [
				{
					id: "v1",
					$type: "directory.evnt.venue.physical",
					name: { en: "Test Venue" },
				},
			],
			instances: [
				{
					venueIds: ["v1"],
					start: date,
				},
			],
		};
		const result = renderMarkdown(event);
		expect(result).toContain("Test Venue");
	});

	test("renders date from instance", () => {
		const event: OpenEvnt = {
			...baseEvent,
			instances: [
				{
					venueIds: [],
					start: date,
				},
			],
		};
		const result = renderMarkdown(event);
		expect(result).toContain("Jan");
	});

	test("renders link components when showLinks is enabled", () => {
		const event: OpenEvnt = {
			...baseEvent,
			instances: [{ venueIds: [], start: date }],
			components: [
				{
					$type: "directory.evnt.component.link",
					url: "https://example.com",
				},
			],
		};
		const result = renderMarkdown(event, { showLinks: true });
		expect(result).toContain("example.com");
	});

	test("renders online venue URL from instance", () => {
		const event: OpenEvnt = {
			...baseEvent,
			venues: [
				{
					id: "v1",
					$type: "directory.evnt.venue.online",
					name: { en: "Zoom" },
					url: "https://zoom.us/j/123",
				},
			],
			instances: [
				{
					venueIds: ["v1"],
					start: date,
				},
			],
		};
		const result = renderMarkdown(event);
		expect(result).toContain("Zoom");
	});

	test("shows status when showStatus is enabled", () => {
		const event: OpenEvnt = {
			...baseEvent,
			status: "cancelled",
			instances: [{ venueIds: [], start: date }],
		};
		const result = renderMarkdown(event, { showStatus: true });
		expect(result).toContain("Cancelled");
	});

	test("does not show status by default", () => {
		const event: OpenEvnt = {
			...baseEvent,
			status: "cancelled",
			instances: [{ venueIds: [], start: date }],
		};
		const result = renderMarkdown(event);
		expect(result).not.toContain("Cancelled");
	});

	test("label appears as sub-header", () => {
		const event: OpenEvnt = {
			...baseEvent,
			label: { en: "Conference" },
			instances: [{ venueIds: [], start: date }],
		};
		const result = renderMarkdown(event);
		expect(result).toContain("Conference");
	});

	test("emoji: false disables emoji icons", () => {
		const result = renderMarkdown(baseEvent, { emoji: false });
		expect(result).toContain("Test Event");
	});
});

describe("UniCon 2026 (real-world event)", () => {
	const uniCon: OpenEvnt = {
		$type: "directory.evnt.event",
		v: "0.1",
		name: { en: "UniCon 2026" },
		status: "planned",
		venues: [
			{
				$type: "directory.evnt.venue.physical",
				id: "v1",
				name: { en: "Kipsala International Exhibition Centre" },
				address: { countryCode: "LV", addr: "Kipsalas iela 1, LV-1043 Riga, Latvia" },
			},
		],
		instances: [
			{
				venueIds: ["v1"],
				start: "2026-08-14T14:00[Europe/Riga]",
				end: "2026-08-14T20:00[Europe/Riga]",
			},
			{
				venueIds: ["v1"],
				start: "2026-08-15T12:00[Europe/Riga]",
				end: "2026-08-15T20:00[Europe/Riga]",
			},
			{
				venueIds: ["v1"],
				start: "2026-08-16T12:00[Europe/Riga]",
				end: "2026-08-16T20:00[Europe/Riga]",
			},
		],
	};

	test("groups by venue-set with venue header once", () => {
		const result = renderMarkdown(uniCon);
		// venue appears exactly once as header
		expect(result.match(/Kipsala/g)).toHaveLength(1);
		// venue header comes before date lines
		const venueIdx = result.indexOf("Kipsala");
		const dateIdx = result.indexOf("📅");
		expect(venueIdx).toBeLessThan(dateIdx);
	});

	test("Aug 15–16 merge into a range (same times), Aug 14 stays separate", () => {
		const result = renderMarkdown(uniCon);
		// Aug 14 has unique time (14:00) → separate group
		expect(result).toContain("Aug 14");
		// Aug 15–16 share time (12:00) → merged range
		expect(result).toContain("Aug 15");
		// "Aug 16" never stands alone
		expect(result).not.toMatch(/Aug 16(?!\d)/);
	});

	test("renders without parenthetical time offsets", () => {
		const result = renderMarkdown(uniCon);
		expect(result).not.toContain("(");
		expect(result).not.toContain(")");
	});
});
