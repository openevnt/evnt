import "temporal-polyfill-lite/global";
import { describe, expect, test } from "vitest";
import type { OpenEvnt } from "@evnt/types";
import { jcal } from "../src/formats/jcal";

const { from, to } = jcal;
const convertFromJCal = from!;
const convertToJCal = to!;

describe("jcal converter", () => {
	test("converts jCal VEVENT into OpenEvnt with physical venue", () => {
		const jcalData = [
			"vcalendar",
			[],
			[
				[
					"vevent",
					[
						["summary", {}, "text", "Community Meetup"],
						["dtstart", {}, "date-time", "2026-07-10T15:30:00"],
						["dtend", {}, "date-time", "2026-07-10T18:00:00"],
						["location", {}, "text", "Community Hall, Main St 1"],
						["description", {}, "text", "Weekly gathering for organizers."],
						["url", {}, "uri", "https://example.com/meetup"],
						["status", {}, "text", "CONFIRMED"],
					],
					[],
				],
			],
		];

		const eventData = convertFromJCal(JSON.stringify(jcalData));

		expect(eventData.v).toBe("0.1");
		expect(eventData.name.en).toBe("Community Meetup");
		expect(eventData.instances).toHaveLength(1);
		expect(eventData.instances?.[0]?.start).toBeDefined();
		expect(eventData.instances?.[0]?.end).toBeDefined();
		expect(eventData.venues).toHaveLength(1);
		expect(eventData.venues?.[0]?.$type).toBe("directory.evnt.venue.unknown");
		expect(eventData.venues?.[0]?.name.en).toBe("Community Hall, Main St 1");
		expect(eventData.status).toBe("planned");
		expect(eventData.components?.some((c) => c.$type === "directory.evnt.richtext.markdown")).toBe(
			true,
		);
		expect(eventData.components?.some((c) => c.$type === "directory.evnt.component.link")).toBe(
			true,
		);
	});

	test("reads an exclusive all-day DTEND back as the last day of the event", () => {
		const jcalData = [
			"vcalendar",
			[],
			[
				[
					"vevent",
					[
						["summary", {}, "text", "All Day Festival"],
						["dtstart", {}, "date", "2026-08-15"],
						["dtend", {}, "date", "2026-08-16"],
					],
					[],
				],
			],
		];

		const eventData = convertFromJCal(JSON.stringify(jcalData));

		expect(eventData.name.en).toBe("All Day Festival");
		expect(eventData.instances?.[0]?.start).toBe("2026-08-15[UTC]");
		expect(eventData.instances?.[0]?.end).toBe("2026-08-15[UTC]");
	});

	test("converts jCal with cancelled status", () => {
		const jcalData = [
			"vcalendar",
			[],
			[
				[
					"vevent",
					[
						["summary", {}, "text", "Cancelled Event"],
						["dtstart", {}, "date", "2026-09-01"],
						["status", {}, "text", "CANCELLED"],
					],
					[],
				],
			],
		];

		const eventData = convertFromJCal(JSON.stringify(jcalData));

		expect(eventData.status).toBe("cancelled");
	});

	test("converts jCal with tentative status", () => {
		const jcalData = [
			"vcalendar",
			[],
			[
				[
					"vevent",
					[
						["summary", {}, "text", "Tentative Event"],
						["dtstart", {}, "date", "2026-10-01"],
						["status", {}, "text", "TENTATIVE"],
					],
					[],
				],
			],
		];

		const eventData = convertFromJCal(JSON.stringify(jcalData));

		expect(eventData.status).toBe("uncertain");
	});

	test("throws on invalid jCal input", () => {
		expect(() => convertFromJCal(JSON.stringify({ not: "jcal" }))).toThrow("Invalid jCal input");
	});

	test("throws on jCal without VEVENT", () => {
		expect(() => convertFromJCal(JSON.stringify(["vcalendar", [], []]))).toThrow("No VEVENT found");
	});

	test("converts OpenEvnt to jCal with physical venue", () => {
		const input: OpenEvnt = {
			v: "0.1",
			name: { en: "Tech Conference" },
			venues: [
				{
					id: "venue-1",
					name: { en: "Convention Center" },
					$type: "directory.evnt.venue.physical",
					address: { addr: "123 Main St", countryCode: "US" },
				},
			],
			instances: [
				{
					venueIds: ["venue-1"],
					start: "2026-09-20T09:00[America/New_York]",
					end: "2026-09-20T17:00[America/New_York]",
				},
			],
			components: [
				{ $type: "directory.evnt.richtext.markdown", content: "Annual tech conference." },
				{ $type: "directory.evnt.component.link", url: "https://techconf.example.com" },
			],
		};

		const raw = convertToJCal(input);
		const parsed = JSON.parse(raw);

		expect(parsed[0]).toBe("vcalendar");
		expect(parsed[2]).toHaveLength(1);

		const vevent = parsed[2][0];
		expect(vevent[0]).toBe("vevent");

		const props = vevent[1];
		const summary = props.find((p: unknown[]) => p[0] === "summary");
		expect(summary?.[3]).toBe("Tech Conference");

		const dtstart = props.find((p: unknown[]) => p[0] === "dtstart");
		expect(dtstart).toBeDefined();

		const location = props.find((p: unknown[]) => p[0] === "location");
		expect(location?.[3]).toBe("Convention Center");

		const url = props.find((p: unknown[]) => p[0] === "url");
		expect(url?.[3]).toBe("https://techconf.example.com");

		const description = props.find((p: unknown[]) => p[0] === "description");
		expect(description?.[3]).toBe("Annual tech conference.");
	});

	test("converts OpenEvnt to jCal with online venue", () => {
		const input: OpenEvnt = {
			v: "0.1",
			name: { en: "Virtual Workshop" },
			venues: [
				{
					id: "venue-1",
					name: { en: "Zoom Call" },
					$type: "directory.evnt.venue.online",
					url: "https://zoom.us/j/123456",
				},
			],
			instances: [
				{
					venueIds: ["venue-1"],
					start: "2026-10-05T14:00[UTC]",
				},
			],
		};

		const raw = convertToJCal(input);
		const parsed = JSON.parse(raw);
		const vevent = parsed[2][0];
		const props = vevent[1];

		const location = props.find((p: unknown[]) => p[0] === "location");
		expect(location?.[3]).toBe("Zoom Call");

		const summary = props.find((p: unknown[]) => p[0] === "summary");
		expect(summary?.[3]).toBe("Virtual Workshop");
	});

	test("converts OpenEvnt to jCal with date-only precision", () => {
		const input: OpenEvnt = {
			v: "0.1",
			name: { en: "Summer Camp" },
			instances: [
				{
					venueIds: [],
					start: "2026-07-01[UTC]",
					end: "2026-07-07[UTC]",
				},
			],
		};

		const raw = convertToJCal(input);
		const parsed = JSON.parse(raw);
		const vevent = parsed[2][0];
		const props = vevent[1];

		const dtstart = props.find((p: unknown[]) => p[0] === "dtstart");
		expect(dtstart?.[2]).toBe("date");
	});

	test("converts OpenEvnt to jCal with cancelled status", () => {
		const input: OpenEvnt = {
			v: "0.1",
			name: { en: "Cancelled Show" },
			status: "cancelled",
			instances: [
				{
					venueIds: [],
					start: "2026-12-01[UTC]",
				},
			],
		};

		const raw = convertToJCal(input);
		const parsed = JSON.parse(raw);
		const vevent = parsed[2][0];
		const props = vevent[1];

		const status = props.find((p: unknown[]) => p[0] === "status");
		expect(status?.[3]).toBe("CANCELLED");
	});

	test("round-trips OpenEvnt → jCal → OpenEvnt with physical venue", () => {
		const input: OpenEvnt = {
			v: "0.1",
			name: { en: "Art Exhibition" },
			venues: [
				{
					id: "venue-1",
					name: { en: "City Gallery" },
					$type: "directory.evnt.venue.physical",
				},
			],
			instances: [
				{
					venueIds: ["venue-1"],
					start: "2026-11-15T10:00[Europe/London]",
					end: "2026-11-15T20:00[Europe/London]",
				},
			],
			components: [{ $type: "directory.evnt.richtext.markdown", content: "Modern art showcase." }],
		};

		const jcalStr = convertToJCal(input);
		const output = convertFromJCal(jcalStr);

		expect(output.v).toBe("0.1");
		expect(output.name.en).toBe("Art Exhibition");
		expect(output.instances).toHaveLength(1);
		expect(output.instances?.[0]?.start).toBeDefined();
		expect(output.instances?.[0]?.end).toBeDefined();
		expect(output.venues).toHaveLength(1);
		expect(output.venues?.[0]?.name.en).toBe("City Gallery");
		expect(output.components?.some((c) => c.$type === "directory.evnt.richtext.markdown")).toBe(
			true,
		);
	});

	test("round-trips OpenEvnt → jCal → OpenEvnt with online venue", () => {
		const input: OpenEvnt = {
			v: "0.1",
			name: { en: "Webinar" },
			venues: [
				{
					id: "venue-1",
					name: { en: "YouTube Live" },
					$type: "directory.evnt.venue.online",
					url: "https://youtube.com/live/abc",
				},
			],
			instances: [
				{
					venueIds: ["venue-1"],
					start: "2026-08-20T19:00[UTC]",
				},
			],
		};

		const jcalStr = convertToJCal(input);
		const output = convertFromJCal(jcalStr);

		expect(output.name.en).toBe("Webinar");
		expect(output.venues?.[0]?.name.en).toBe("YouTube Live");
		expect(output.instances?.[0]?.start).toBeDefined();
	});

	test("round-trips date-only event", () => {
		const input: OpenEvnt = {
			v: "0.1",
			name: { en: "Holiday" },
			instances: [
				{
					venueIds: [],
					start: "2026-12-25[UTC]",
				},
			],
		};

		const jcalStr = convertToJCal(input);
		const output = convertFromJCal(jcalStr);

		expect(output.name.en).toBe("Holiday");
		expect(output.instances?.[0]?.start).toBe("2026-12-25[UTC]");
	});

	test("round-trips a multi-instance event as one VEVENT per instance", () => {
		const input: OpenEvnt = {
			v: "0.1",
			name: { en: "Conference Series" },
			instances: [
				{
					venueIds: [],
					start: "2026-06-01T09:00[UTC]",
					end: "2026-06-01T17:00[UTC]",
				},
				{
					venueIds: [],
					start: "2026-06-15T09:00[UTC]",
					end: "2026-06-15T17:00[UTC]",
				},
			],
		};

		const jcalStr = convertToJCal(input);
		const parsed = JSON.parse(jcalStr);
		expect(parsed[2]).toHaveLength(2);

		const dtstartOf = (vevent: unknown[]) =>
			(vevent[1] as unknown[][]).find((p) => p[0] === "dtstart")?.[3];
		expect(dtstartOf(parsed[2][0])).toContain("2026-06-01");
		expect(dtstartOf(parsed[2][1])).toContain("2026-06-15");

		const output = convertFromJCal(jcalStr);
		expect(output.instances).toHaveLength(2);
		expect(output.instances?.[0]?.start).toBe("2026-06-01T09:00[UTC]");
		expect(output.instances?.[1]?.end).toBe("2026-06-15T17:00[UTC]");
	});
});
