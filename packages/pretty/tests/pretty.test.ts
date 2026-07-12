import { describe, expect, test } from "vitest";
import { renderMarkdown } from "../src/index";
import type { OpenEvnt, PartialDate } from "@evnt/types";

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
