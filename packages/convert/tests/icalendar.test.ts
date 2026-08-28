import "temporal-polyfill-lite/global";
import { describe, expect, test } from "vitest";
import type { OpenEvnt } from "@evnt/types";
import { icalendar } from "../src/formats/icalendar";

const { from, to } = icalendar;
const convertFromICalendar = from!;
const convertToICalendar = to!;

const timedEvent: OpenEvnt = {
	v: "0.1",
	name: { en: "Evening Meetup" },
	venues: [
		{
			id: "venue-1",
			name: { en: "Hezarfen Pub" },
			$type: "directory.evnt.venue.physical",
		},
	],
	instances: [
		{
			venueIds: ["venue-1"],
			start: "2026-09-06T18:00[Europe/Istanbul]",
			end: "2026-09-06T22:00[Europe/Istanbul]",
		},
	],
};

const allDayEvent: OpenEvnt = {
	v: "0.1",
	name: { en: "Weekend Festival" },
	instances: [{ venueIds: [], start: "2026-08-15[UTC]", end: "2026-08-16[UTC]" }],
};

const series: OpenEvnt = {
	v: "0.1",
	name: { en: "Weekly Meetup" },
	status: "planned",
	venues: [
		{ id: "a", name: { en: "Hall A" }, $type: "directory.evnt.venue.unknown" },
		{ id: "b", name: { en: "Hall B" }, $type: "directory.evnt.venue.unknown" },
	],
	instances: [
		{
			id: "week-1",
			venueIds: ["a"],
			start: "2026-06-01T09:00[UTC]",
			end: "2026-06-01T17:00[UTC]",
		},
		{
			id: "week-2",
			venueIds: ["b"],
			status: "cancelled",
			start: "2026-06-08T09:00[UTC]",
			end: "2026-06-08T17:00[UTC]",
		},
		{ venueIds: ["a"], start: "2026-06-15T09:00[UTC]", end: "2026-06-15T17:00[UTC]" },
	],
};

const propertyLine = (ics: string, name: string): string | undefined =>
	ics.split("\r\n").find((line) => line.startsWith(`${name}:`) || line.startsWith(`${name};`));

describe("icalendar converter", () => {
	test("wraps the event in a VCALENDAR envelope", () => {
		const ics = convertToICalendar(timedEvent);

		expect(ics.startsWith("BEGIN:VCALENDAR")).toBe(true);
		expect(ics.trimEnd().endsWith("END:VCALENDAR")).toBe(true);
		expect(propertyLine(ics, "VERSION")).toBe("VERSION:2.0");
		expect(propertyLine(ics, "PRODID")).toBeDefined();
	});

	test("emits the UID and DTSTAMP every VEVENT is required to carry", () => {
		const ics = convertToICalendar(timedEvent);

		expect(propertyLine(ics, "UID")).toBeDefined();
		expect(propertyLine(ics, "DTSTAMP")).toBeDefined();
	});

	test("derives a UID that is stable across conversions of the same event", () => {
		expect(propertyLine(convertToICalendar(timedEvent), "UID")).toBe(
			propertyLine(convertToICalendar(timedEvent), "UID"),
		);
	});

	test("takes the UID from the options when one is supplied", () => {
		const ics = convertToICalendar(timedEvent, { uid: "at://did:plc:example/event/1" });

		expect(propertyLine(ics, "UID")).toBe("UID:at://did:plc:example/event/1");
	});

	test("resolves a wall time against the zone the PartialDate carries", () => {
		const ics = convertToICalendar(timedEvent);

		// 18:00 in Europe/Istanbul is 15:00 UTC
		expect(propertyLine(ics, "DTSTART")).toBe("DTSTART:20260906T150000Z");
		expect(propertyLine(ics, "DTEND")).toBe("DTEND:20260906T190000Z");
	});

	test("ends an all-day event on the day after its last, since DTEND is exclusive", () => {
		const ics = convertToICalendar(allDayEvent);

		expect(propertyLine(ics, "DTSTART")).toBe("DTSTART;VALUE=DATE:20260815");
		expect(propertyLine(ics, "DTEND")).toBe("DTEND;VALUE=DATE:20260817");
	});

	test("gives a single-day event a full day of elapsed time", () => {
		const ics = convertToICalendar({
			v: "0.1",
			name: { en: "One Day Only" },
			instances: [{ venueIds: [], start: "2026-08-15[UTC]" }],
		});

		expect(propertyLine(ics, "DTSTART")).toBe("DTSTART;VALUE=DATE:20260815");
		expect(propertyLine(ics, "DTEND")).toBe("DTEND;VALUE=DATE:20260816");
	});

	test("round-trips an all-day event without shifting its end", () => {
		const result = convertFromICalendar(convertToICalendar(allDayEvent));

		expect(result.instances?.[0]?.start).toBe("2026-08-15[UTC]");
		expect(result.instances?.[0]?.end).toBe("2026-08-16[UTC]");
	});

	test("round-trips a timed event to the same instant", () => {
		const result = convertFromICalendar(convertToICalendar(timedEvent));

		expect(result.instances?.[0]?.start).toBe("2026-09-06T15:00[UTC]");
		expect(result.instances?.[0]?.end).toBe("2026-09-06T19:00[UTC]");
	});

	test("carries the venue, description and link across", () => {
		const ics = convertToICalendar({
			...timedEvent,
			components: [
				{ $type: "directory.evnt.richtext.markdown", content: "Come along." },
				{ $type: "directory.evnt.component.link", url: "https://example.com/meetup" },
			],
		});

		expect(propertyLine(ics, "LOCATION")).toBe("LOCATION:Hezarfen Pub");
		expect(propertyLine(ics, "DESCRIPTION")).toBe("DESCRIPTION:Come along.");
		expect(propertyLine(ics, "URL")).toBe("URL:https://example.com/meetup");
	});

	test("gives each instance its own VEVENT rather than one covering span", () => {
		const ics = convertToICalendar(series);
		const starts = ics.split("\r\n").filter((line) => line.startsWith("DTSTART"));

		expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(3);
		expect(starts).toEqual([
			"DTSTART:20260601T090000Z",
			"DTSTART:20260608T090000Z",
			"DTSTART:20260615T090000Z",
		]);
	});

	test("gives each instance of a series a distinct UID", () => {
		const uids = convertToICalendar(series)
			.split("\r\n")
			.filter((line) => line.startsWith("UID:"));

		expect(new Set(uids).size).toBe(3);
	});

	test("suffixes a supplied UID with the instance id", () => {
		const uids = convertToICalendar(series, { uid: "at://did:plc:example/event/1" })
			.split("\r\n")
			.filter((line) => line.startsWith("UID:"));

		expect(uids).toEqual([
			"UID:at://did:plc:example/event/1#week-1",
			"UID:at://did:plc:example/event/1#week-2",
			"UID:at://did:plc:example/event/1#2",
		]);
	});

	test("groups the instances of a series with a shared RELATED-TO", () => {
		const related = convertToICalendar(series, { uid: "at://did:plc:example/event/1" })
			.split("\r\n")
			.filter((line) => line.startsWith("RELATED-TO:"));

		expect(related).toEqual([
			"RELATED-TO:at://did:plc:example/event/1",
			"RELATED-TO:at://did:plc:example/event/1",
			"RELATED-TO:at://did:plc:example/event/1",
		]);
	});

	test("leaves a single-instance event ungrouped", () => {
		expect(convertToICalendar(timedEvent)).not.toContain("RELATED-TO");
	});

	test("takes the venue of each instance rather than the first venue of the event", () => {
		const locations = convertToICalendar(series)
			.split("\r\n")
			.filter((line) => line.startsWith("LOCATION:"));

		expect(locations).toEqual(["LOCATION:Hall A", "LOCATION:Hall B", "LOCATION:Hall A"]);
	});

	test("carries the status of an individual instance", () => {
		const statuses = convertToICalendar(series)
			.split("\r\n")
			.filter((line) => line.startsWith("STATUS:"));

		expect(statuses).toEqual(["STATUS:CONFIRMED", "STATUS:CANCELLED", "STATUS:CONFIRMED"]);
	});

	test("round-trips a series back into separate instances", () => {
		const result = convertFromICalendar(convertToICalendar(series));

		expect(result.instances).toHaveLength(3);
		expect(result.instances?.[0]?.start).toBe("2026-06-01T09:00[UTC]");
		expect(result.instances?.[2]?.start).toBe("2026-06-15T09:00[UTC]");
		expect(result.status).toBe("planned");
		expect(result.instances?.[1]?.status).toBe("cancelled");
		expect(result.instances?.[0]?.status).toBeUndefined();
	});

	test("reuses one venue across the instances that share it", () => {
		const result = convertFromICalendar(convertToICalendar(series));

		expect(result.venues).toHaveLength(2);
		expect(result.instances?.[0]?.venueIds).toEqual(result.instances?.[2]?.venueIds);
		expect(result.instances?.[1]?.venueIds).not.toEqual(result.instances?.[0]?.venueIds);
	});

	test("throws when the input holds no VEVENT", () => {
		expect(() => convertFromICalendar("BEGIN:VCALENDAR\r\nVERSION:2.0\r\nEND:VCALENDAR")).toThrow(
			"No VEVENT found",
		);
	});
});
