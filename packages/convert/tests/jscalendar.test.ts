import "temporal-polyfill-lite/global";
import { describe, expect, test } from "vitest";
import type { OpenEvnt } from "@evnt/types";
import { jscalendar } from "../src/formats/jscalendar";

const { from, to } = jscalendar;
const convertFromJscalendar = from!;
const convertToJscalendar = to!;

describe("jscalendar converter", () => {
	test("converts JSCalendar Event into OpenEvnt", () => {
		const eventData = convertFromJscalendar(
			JSON.stringify({
				"@type": "Event",
				uid: "evt-001@example.com",
				title: "Open Evnt Meetup",
				start: "2026-07-10T18:30:00+03:00",
				end: "2026-07-10T21:00:00+03:00",
				timeZone: "Europe/Vilnius",
				status: "confirmed",
				description: "Weekly gathering for local organizers.",
				descriptionContentType: "text/markdown",
				locations: {
					"loc-1": {
						"@type": "Location",
						name: "Community Hall",
						type: "physical",
						description: "Main St 1, Vilnius",
					},
				},
				links: {
					"link-1": {
						"@type": "Link",
						href: "https://example.com/events/open-evnt-meetup",
						title: "Event page",
					},
				},
			}),
		);

		expect(eventData.v).toBe("0.1");
		expect(eventData.name.en).toBe("Open Evnt Meetup");
		expect(eventData.status).toBe("planned");
		expect(eventData.instances?.[0]?.start).toBeDefined();
		expect(eventData.instances?.[0]?.end).toBeDefined();
		expect(eventData.venues?.[0]?.$type).toBe("directory.evnt.venue.physical");
		expect(eventData.venues?.[0]?.name.en).toBe("Community Hall");
		expect(eventData.components?.some((c) => c.$type === "directory.evnt.richtext.markdown")).toBe(
			true,
		);
		expect(eventData.components?.some((c) => c.$type === "directory.evnt.component.link")).toBe(
			true,
		);
	});

	test("maps virtual locations to online venues", () => {
		const eventData = convertFromJscalendar(
			JSON.stringify({
				"@type": "Event",
				uid: "evt-002@example.com",
				title: "Livestream",
				start: "2026-08-01T12:00:00Z",
				locations: {
					"loc-1": {
						"@type": "Location",
						name: "YouTube Live",
						type: "virtual",
						links: {
							stream: {
								"@type": "Link",
								href: "https://youtube.com/live/abc",
							},
						},
					},
				},
			}),
		);

		expect(eventData.venues?.[0]).toMatchObject({
			$type: "directory.evnt.venue.online",
			url: "https://youtube.com/live/abc",
		});
	});

	test("handles cancelled and tentative statuses", () => {
		const cancelled = convertFromJscalendar(
			JSON.stringify({
				"@type": "Event",
				uid: "evt-003@example.com",
				title: "Cancelled Event",
				start: "2026-09-01T10:00:00Z",
				status: "cancelled",
			}),
		);
		expect(cancelled.status).toBe("cancelled");

		const tentative = convertFromJscalendar(
			JSON.stringify({
				"@type": "Event",
				uid: "evt-004@example.com",
				title: "Tentative Event",
				start: "2026-09-01T10:00:00Z",
				status: "tentative",
			}),
		);
		expect(tentative.status).toBe("uncertain");
	});

	test("computes end from duration when end is absent", () => {
		const eventData = convertFromJscalendar(
			JSON.stringify({
				"@type": "Event",
				uid: "evt-005@example.com",
				title: "Workshop",
				start: "2026-10-01T09:00:00Z",
				duration: "PT2H30M",
			}),
		);

		expect(eventData.instances?.[0]?.start).toBeDefined();
		expect(eventData.instances?.[0]?.end).toBeDefined();
	});

	test("handles showWithoutTime for day-precision events", () => {
		const eventData = convertFromJscalendar(
			JSON.stringify({
				"@type": "Event",
				uid: "evt-006@example.com",
				title: "All Day Festival",
				start: "2026-07-15",
				showWithoutTime: true,
			}),
		);

		expect(eventData.instances?.[0]?.start).toBeDefined();
	});

	test("converts OpenEvnt to JSCalendar", () => {
		const input: OpenEvnt = {
			v: "0.1",
			name: { en: "Tech Conference" },
			status: "planned",
			instances: [
				{
					venueIds: ["v1"],
					start: "2026-09-20T10:00[Europe/Vilnius]",
					end: "2026-09-20T18:00[Europe/Vilnius]",
				},
			],
			venues: [
				{
					id: "v1",
					$type: "directory.evnt.venue.physical",
					name: { en: "Conference Center" },
					address: { addr: "Konstitucijos pr. 1, Vilnius" },
				},
			],
			components: [
				{
					$type: "directory.evnt.richtext.markdown",
					content: "Annual technology conference.",
					language: "en",
				},
				{
					$type: "directory.evnt.component.link",
					url: "https://techconf.example.com",
				},
			],
		};

		const raw = convertToJscalendar(input);
		const jsc = JSON.parse(raw);

		expect(jsc["@type"]).toBe("Event");
		expect(jsc.title).toBe("Tech Conference");
		expect(jsc.uid).toBeDefined();
		expect(jsc.start).toBeDefined();
		expect(jsc.duration).toBeDefined();
		expect(jsc.status).toBe("confirmed");
		expect(jsc.description).toBe("Annual technology conference.");
		expect(jsc.descriptionContentType).toBe("text/markdown");
		expect(jsc.locations).toBeDefined();
		expect(Object.keys(jsc.locations).length).toBe(1);
		const loc = Object.values(jsc.locations)[0] as Record<string, unknown>;
		expect(loc.name).toBe("Conference Center");
		expect(loc.type).toBe("physical");
		expect(jsc.links).toBeDefined();
		expect(Object.keys(jsc.links).length).toBe(1);
	});

	test("converts OpenEvnt online venue to JSCalendar virtual location", () => {
		const input: OpenEvnt = {
			v: "0.1",
			name: { en: "Webinar" },
			instances: [
				{
					venueIds: ["v1"],
					start: "2026-11-01T14:00[UTC]",
				},
			],
			venues: [
				{
					id: "v1",
					$type: "directory.evnt.venue.online",
					name: { en: "Zoom Meeting" },
					url: "https://zoom.us/j/123456",
				},
			],
		};

		const raw = convertToJscalendar(input);
		const jsc = JSON.parse(raw);

		const loc = Object.values(jsc.locations)[0] as Record<string, unknown>;
		expect(loc.type).toBe("virtual");
		expect((loc.links as Record<string, Record<string, unknown>>)["link-0"].href).toBe(
			"https://zoom.us/j/123456",
		);
	});

	test("round-trips a minimal event", () => {
		const input: OpenEvnt = {
			v: "0.1",
			name: { en: "Minimal Event" },
			instances: [
				{
					venueIds: [],
					start: "2026-12-25[UTC]",
				},
			],
		};

		const raw = convertToJscalendar(input);
		const roundTripped = convertFromJscalendar(raw);

		expect(roundTripped.v).toBe("0.1");
		expect(roundTripped.name.en).toBe("Minimal Event");
		expect(roundTripped.instances?.[0]?.start).toBeDefined();
	});

	test("round-trips an event with venues and components", () => {
		const input: OpenEvnt = {
			v: "0.1",
			name: { en: "Full Event", de: "Vollständige Veranstaltung" },
			status: "planned",
			instances: [
				{
					venueIds: ["v1", "v2"],
					start: "2026-06-15T09:00[Europe/Berlin]",
					end: "2026-06-15T17:00[Europe/Berlin]",
				},
			],
			venues: [
				{
					id: "v1",
					$type: "directory.evnt.venue.physical",
					name: { en: "Main Hall", de: "Haupthalle" },
					address: { addr: "Alexanderplatz 1, Berlin" },
				},
				{
					id: "v2",
					$type: "directory.evnt.venue.online",
					name: { en: "Stream" },
					url: "https://stream.example.com/live",
				},
			],
			components: [
				{
					$type: "directory.evnt.richtext.markdown",
					content: "# Welcome\n\nJoin us for a great event.",
					language: "en",
				},
				{
					$type: "directory.evnt.component.link",
					url: "https://example.com/register",
					name: { en: "Register here" },
				},
				{
					$type: "directory.evnt.component.source",
					url: "https://example.com/source",
				},
			],
		};

		const raw = convertToJscalendar(input);
		const jsc = JSON.parse(raw);

		expect(jsc["@type"]).toBe("Event");
		expect(jsc.title).toBe("Full Event");
		expect(jsc.status).toBe("confirmed");
		expect(jsc.start).toBeDefined();
		expect(jsc.duration).toBeDefined();
		expect(Object.keys(jsc.locations).length).toBe(2);

		const roundTripped = convertFromJscalendar(raw);

		expect(roundTripped.v).toBe("0.1");
		expect(roundTripped.name.en).toBe("Full Event");
		expect(roundTripped.status).toBe("planned");
		expect(roundTripped.venues?.length).toBe(2);
		expect(roundTripped.instances?.[0]?.start).toBeDefined();
		expect(roundTripped.instances?.[0]?.end).toBeDefined();
		expect(
			roundTripped.components?.some((c) => c.$type === "directory.evnt.richtext.markdown"),
		).toBe(true);
		expect(roundTripped.components?.some((c) => c.$type === "directory.evnt.component.link")).toBe(
			true,
		);
	});

	test("handles missing title gracefully", () => {
		const eventData = convertFromJscalendar(
			JSON.stringify({
				"@type": "Event",
				uid: "evt-007@example.com",
				start: "2026-10-10T10:00:00Z",
			}),
		);

		expect(eventData.name.en).toBe("Untitled Event");
	});

	test("handles multiple locations", () => {
		const eventData = convertFromJscalendar(
			JSON.stringify({
				"@type": "Event",
				uid: "evt-008@example.com",
				title: "Multi-venue Event",
				start: "2026-10-10T10:00:00Z",
				locations: {
					"loc-1": {
						"@type": "Location",
						name: "Main Stage",
						type: "physical",
					},
					"loc-2": {
						"@type": "Location",
						name: "Online Stream",
						type: "virtual",
						links: {
							stream: {
								"@type": "Link",
								href: "https://stream.example.com",
							},
						},
					},
				},
			}),
		);

		expect(eventData.venues?.length).toBe(2);
		expect(eventData.venues?.[0]?.$type).toBe("directory.evnt.venue.physical");
		expect(eventData.venues?.[1]?.$type).toBe("directory.evnt.venue.online");
	});

	test("handles unknown location type", () => {
		const eventData = convertFromJscalendar(
			JSON.stringify({
				"@type": "Event",
				uid: "evt-009@example.com",
				title: "Unknown Venue Event",
				start: "2026-10-10T10:00:00Z",
				locations: {
					"loc-1": {
						"@type": "Location",
						name: "Somewhere",
					},
				},
			}),
		);

		expect(eventData.venues?.[0]?.$type).toBe("directory.evnt.venue.unknown");
	});

	test("uses language option for translations", () => {
		const eventData = convertFromJscalendar(
			JSON.stringify({
				"@type": "Event",
				uid: "evt-010@example.com",
				title: "Veranstaltung",
				start: "2026-10-10T10:00:00Z",
			}),
			{ language: "de" },
		);

		expect(eventData.name.de).toBe("Veranstaltung");
		expect(eventData.name.en).toBeUndefined();
	});

	test("prefers locale over language option", () => {
		const eventData = convertFromJscalendar(
			JSON.stringify({
				"@type": "Event",
				uid: "evt-011@example.com",
				title: "Événement",
				start: "2026-10-10T10:00:00Z",
				locale: "fr",
			}),
			{ language: "en" },
		);

		expect(eventData.name.fr).toBe("Événement");
		expect(eventData.name.en).toBeUndefined();
	});

	test("emits a zoneless LocalDateTime with the zone the PartialDate carries", () => {
		const jsc = JSON.parse(
			convertToJscalendar({
				v: "0.1",
				name: { en: "Evening Meetup" },
				instances: [
					{
						venueIds: [],
						start: "2026-09-06T18:00[Europe/Istanbul]",
						end: "2026-09-06T22:00[Europe/Istanbul]",
					},
				],
			}),
		);

		expect(jsc.start).toBe("2026-09-06T18:00:00");
		expect(jsc.timeZone).toBe("Europe/Istanbul");
		expect(jsc.duration).toBe("PT4H");
		expect(jsc.end).toBeUndefined();
	});

	test("marks a dateless event with showWithoutTime and whole days", () => {
		const jsc = JSON.parse(
			convertToJscalendar({
				v: "0.1",
				name: { en: "Weekend Festival" },
				instances: [{ venueIds: [], start: "2026-08-15[UTC]", end: "2026-08-16[UTC]" }],
			}),
		);

		expect(jsc.start).toBe("2026-08-15T00:00:00");
		expect(jsc.showWithoutTime).toBe(true);
		expect(jsc.duration).toBe("P2D");
		expect(jsc.timeZone).toBeUndefined();
	});

	test("round-trips a dateless event without shifting its end", () => {
		const input: OpenEvnt = {
			v: "0.1",
			name: { en: "Weekend Festival" },
			instances: [{ venueIds: [], start: "2026-08-15[UTC]", end: "2026-08-16[UTC]" }],
		};

		const result = convertFromJscalendar(convertToJscalendar(input));

		expect(result.instances?.[0]?.start).toBe("2026-08-15[UTC]");
		expect(result.instances?.[0]?.end).toBe("2026-08-16[UTC]");
	});

	test("round-trips a timed event in its own zone", () => {
		const result = convertFromJscalendar(
			convertToJscalendar({
				v: "0.1",
				name: { en: "Evening Meetup" },
				instances: [
					{
						venueIds: [],
						start: "2026-09-06T18:00[Europe/Istanbul]",
						end: "2026-09-06T22:00[Europe/Istanbul]",
					},
				],
			}),
		);

		expect(result.instances?.[0]?.start).toBe("2026-09-06T18:00[Europe/Istanbul]");
		expect(result.instances?.[0]?.end).toBe("2026-09-06T22:00[Europe/Istanbul]");
	});

	test("keeps every instance of a series by emitting a Group", () => {
		const jsc = JSON.parse(
			convertToJscalendar({
				v: "0.1",
				name: { en: "Weekly Meetup" },
				instances: [
					{ venueIds: [], start: "2026-06-01T09:00[UTC]", end: "2026-06-01T17:00[UTC]" },
					{ venueIds: [], start: "2026-06-08T09:00[UTC]", end: "2026-06-08T17:00[UTC]" },
				],
			}),
		);

		expect(jsc["@type"]).toBe("Group");
		expect(jsc.entries).toHaveLength(2);
		expect(jsc.entries[0].start).toBe("2026-06-01T09:00:00");
		expect(jsc.entries[1].start).toBe("2026-06-08T09:00:00");
	});
});
