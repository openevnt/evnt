import { describe, expect, test } from "vitest";
import { EventBuilder } from "../src/index";
import type { PartialDate } from "@evnt/types";

const date = "2025-01-01[UTC]" as PartialDate;

describe("EventBuilder", () => {
	test("creates empty event with default version", () => {
		const event = new EventBuilder().build();
		expect(event.v).toBe("0.1");
		expect(event.name).toEqual({});
	});

	test("setName sets a translation", () => {
		const event = new EventBuilder().setName("My Event", "en").build();
		expect(event.name).toEqual({ en: "My Event" });
	});

	test("setLabel sets a label translation", () => {
		const event = new EventBuilder().setLabel("Conference", "en").build();
		expect(event.label).toEqual({ en: "Conference" });
	});

	test("setStatus sets event status", () => {
		const event = new EventBuilder().setStatus("planned").build();
		expect(event.status).toBe("planned");
	});

	test("addInstance creates an instance with defaults", () => {
		const event = new EventBuilder().addInstance((i) => i).build();
		expect(event.instances).toHaveLength(1);
	});

	test("addInstance with start date", () => {
		const event = new EventBuilder().addInstance((i) => i.setStart(date)).build();
		expect(event.instances![0]!.start).toBe(date);
	});

	test("addPhysicalVenue creates a physical venue", () => {
		const event = new EventBuilder().addPhysicalVenue((v) => v.setName("Hall A", "en")).build();
		expect(event.venues).toHaveLength(1);
		expect(event.venues![0]!.name).toEqual({ en: "Hall A" });
		expect(event.venues![0]!.$type).toBe("directory.evnt.venue.physical");
	});

	test("addOnlineVenue creates an online venue with URL", () => {
		const event = new EventBuilder()
			.addOnlineVenue((v) => v.setUrl("https://stream.example.com"))
			.build();
		expect(event.venues).toHaveLength(1);
		expect(event.venues![0]!.$type).toBe("directory.evnt.venue.online");
	});

	test("addUnknownVenue creates an unknown venue", () => {
		const event = new EventBuilder().addUnknownVenue((v) => v.setName("TBD", "en")).build();
		expect(event.venues).toHaveLength(1);
		expect(event.venues![0]!.$type).toBe("directory.evnt.venue.unknown");
	});

	test("addLink creates a link component from string URL", () => {
		const event = new EventBuilder().addLink("https://example.com").build();
		expect(event.components).toHaveLength(1);
		expect(event.components![0]).toMatchObject({
			$type: "directory.evnt.component.link",
			url: "https://example.com",
		});
	});

	test("addLink from builder callback", () => {
		const event = new EventBuilder()
			.addLink((l) => l.setUrl("https://example.com").setName("Example", "en"))
			.build();
		expect(event.components![0]).toMatchObject({
			$type: "directory.evnt.component.link",
			url: "https://example.com",
			name: { en: "Example" },
		});
	});

	test("addCustomComponent adds an arbitrary component", () => {
		const event = new EventBuilder()
			.addCustomComponent({ $type: "custom.type", foo: "bar" })
			.build();
		expect(event.components).toHaveLength(1);
		expect(event.components![0]).toEqual({ $type: "custom.type", foo: "bar" });
	});

	test("methods are chainable (return EventBuilder)", () => {
		const builder = new EventBuilder();
		expect(builder.setName("Test", "en")).toBe(builder);
		expect(builder.setStatus("planned")).toBe(builder);
	});

	test("getInstance returns an InstanceBuilder for existing index", () => {
		const builder = new EventBuilder().addInstance((i) => i.setStart(date));
		const instance = builder.getInstance(0);
		expect(instance.build().start).toBe(date);
	});

	test("getInstance throws for out-of-bounds index", () => {
		expect(() => new EventBuilder().getInstance(0)).toThrow();
	});

	test("getVenueWithId returns a VenueBuilder", () => {
		const builder = new EventBuilder().addPhysicalVenue((v) => v.setId("venue-1"));
		const venue = builder.getVenueWithId("venue-1");
		expect(venue.build().id).toBe("venue-1");
	});

	test("getVenueWithId throws for unknown ID", () => {
		expect(() => new EventBuilder().getVenueWithId("nope")).toThrow();
	});

	test("instance with venueIds links venues", () => {
		const event = new EventBuilder()
			.addPhysicalVenue((v) => v.setId("v1"))
			.addInstance((i) => i.setStart(date).addAllVenues())
			.build();
		expect(event.instances![0]!.venueIds).toEqual(["v1"]);
	});
});
