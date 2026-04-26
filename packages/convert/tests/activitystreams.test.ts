import { describe, expect, test } from "vitest";
import type { EventData } from "@evnt/schema";
import { convertFromActivityStreamsEvent, convertToActivityStreamsEvent } from "../src/vendor/activitystreams";

describe("activitystreams converter", () => {
	test("converts ActivityStreams Event into EventData", () => {
		const eventData = convertFromActivityStreamsEvent({
			type: "Event",
			name: "Open Evnt Meetup",
			startTime: "2026-07-10T18:30:00+03:00",
			endTime: "2026-07-10T21:00:00+03:00",
			location: {
				type: "Place",
				name: "Community Hall",
				address: {
					streetAddress: "Main St 1",
					addressCountry: "lt",
				},
			},
			url: [
				"https://example.com/events/open-evnt-meetup",
			],
			content: "Weekly gathering for local organizers.",
		});

		expect(eventData.v).toBe("0.1");
		expect(eventData.name.en).toBe("Open Evnt Meetup");
		expect(eventData.instances?.[0]?.start).toBe("2026-07-10T15:30[UTC]");
		expect(eventData.instances?.[0]?.end).toBe("2026-07-10T18:00[UTC]");
		expect(eventData.venues?.[0]?.$type).toBe("directory.evnt.venue.physical");
		expect((eventData.venues?.[0] as EventData["venues"][number] & { address?: { countryCode?: string } })?.address?.countryCode).toBe("LT");
		expect(eventData.components?.some((component) => component.$type === "directory.evnt.component.link")).toBe(true);
		expect(eventData.components?.some((component) => component.$type === "directory.evnt.richtext.markdown")).toBe(true);
	});

	test("maps online locations and date-only startTime", () => {
		const eventData = convertFromActivityStreamsEvent({
			type: "Event",
			name: "Livestream",
			startTime: "2026-08-01",
			location: {
				type: "Link",
				name: "YouTube",
				href: "https://youtube.com/live/abc",
			},
		});

		expect(eventData.instances?.[0]?.start).toBe("2026-08-01[UTC]");
		expect(eventData.venues?.[0]).toMatchObject({
			$type: "directory.evnt.venue.online",
			url: "https://youtube.com/live/abc",
		});
	});

	test("embeds canonical EventData when converting to ActivityStreams", () => {
		const input: EventData = {
			v: "0.1",
			name: { en: "Conference" },
			instances: [{
				venueIds: [],
				start: "2026-09-20[Europe/Vilnius]",
			}],
		};

		const asEvent = convertToActivityStreamsEvent(input);

		expect(asEvent.type).toBe("Event");
		expect(asEvent.name).toBe("Conference");
		expect(asEvent.startTime).toBeUndefined();
		expect(asEvent.evntPartialStart).toBe("2026-09-20[Europe/Vilnius]");
		expect(asEvent.evntData).toEqual(input);
	});

	test("uses embedded evntData when present and valid", () => {
		const embedded: EventData = {
			v: "0.1",
			name: { en: "Embedded" },
			components: [{
				$type: "com.example.component",
				foo: "bar",
			}],
		};

		const fromAs = convertFromActivityStreamsEvent({
			type: "Event",
			name: "Ignored name",
			evntData: embedded,
		});

		expect(fromAs).toEqual(embedded);
	});
});
