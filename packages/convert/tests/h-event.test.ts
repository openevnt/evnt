import { describe, expect, test } from "vitest";
import { hEvent } from "../src/formats/h-event";

const { from } = hEvent;
const convertFromHEvent = from!;

describe("h-event converter", () => {
	test("converts a basic h-event with name, start, and end", () => {
		const html = `
			<div class="h-event">
				<h1 class="p-name">IndieWeb Summit 2026</h1>
				<time class="dt-start" datetime="2026-06-27T09:00:00-07:00">June 27, 2026 at 9:00am</time>
				<time class="dt-end" datetime="2026-06-28T18:00:00-07:00">June 28, 2026 at 6:00pm</time>
			</div>
		`;

		const event = convertFromHEvent(html);

		expect(event.v).toBe("0.1");
		expect(event.name.en).toBe("IndieWeb Summit 2026");
		expect(event.instances?.[0]?.start).toBeDefined();
		expect(event.instances?.[0]?.end).toBeDefined();
	});

	test("converts h-event with physical venue", () => {
		const html = `
			<article class="h-event">
				<h2 class="p-name">Open Evnt Meetup</h2>
				<time class="dt-start" datetime="2026-07-10T15:30:00Z"></time>
				<p class="p-location">Vilnius Tech Park, Lithuania</p>
				<p class="p-description">A meetup about open event formats.</p>
			</article>
		`;

		const event = convertFromHEvent(html);

		expect(event.name.en).toBe("Open Evnt Meetup");
		expect(event.venues).toHaveLength(1);
		expect(event.venues?.[0]?.$type).toBe("directory.evnt.venue.physical");
		expect(event.venues?.[0]?.name.en).toBe("Vilnius Tech Park, Lithuania");
		expect(event.instances?.[0]?.venueIds).toContain("hevent:venue:0");
	});

	test("converts h-event with online venue (URL in p-location)", () => {
		const html = `
			<div class="h-event">
				<span class="p-name">Virtual Meetup</span>
				<time class="dt-start" datetime="2026-08-01"></time>
				<span class="p-location">https://meet.example.com/virtual</span>
			</div>
		`;

		const event = convertFromHEvent(html);

		expect(event.venues).toHaveLength(1);
		expect(event.venues?.[0]?.$type).toBe("directory.evnt.venue.online");
		expect((event.venues?.[0] as { url?: string } | undefined)?.url).toBe(
			"https://meet.example.com/virtual",
		);
		expect(event.instances?.[0]?.start).toBeDefined();
	});

	test("converts h-event with u-url link", () => {
		const html = `
			<div class="h-event">
				<a class="p-name u-url" href="https://events.example.com/42">Summer Festival</a>
				<time class="dt-start" datetime="2026-07-15T10:00:00Z">July 15, 2026</time>
			</div>
		`;

		const event = convertFromHEvent(html);

		expect(event.name.en).toBe("Summer Festival");
		expect(event.components).toBeDefined();
		expect(event.components).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					$type: "directory.evnt.component.link",
					url: "https://events.example.com/42",
				}),
			]),
		);
	});

	test("converts date-only h-event (no time component)", () => {
		const html = `
			<div class="h-event">
				<span class="p-name">Community Day</span>
				<time class="dt-start" datetime="2026-09-15">September 15, 2026</time>
				<time class="dt-end" datetime="2026-09-15">September 15, 2026</time>
			</div>
		`;

		const event = convertFromHEvent(html);

		expect(event.name.en).toBe("Community Day");
		expect(event.instances?.[0]?.start).toBeDefined();
		expect(event.instances?.[0]?.end).toBeDefined();
		// Date-only should not have time precision — check the partial date
		expect(event.instances?.[0]?.start).toMatch(/^\d{4}-\d{2}-\d{2}/);
	});

	test("converts h-event with p-summary as fallback name", () => {
		const html = `
			<div class="h-event">
				<span class="p-summary">Weekly Hack Night</span>
				<time class="dt-start" datetime="2026-06-01T19:00:00Z"></time>
			</div>
		`;

		const event = convertFromHEvent(html);

		expect(event.name.en).toBe("Weekly Hack Night");
	});

	test("defaults to Untitled Event when no name or summary", () => {
		const html = `
			<div class="h-event">
				<time class="dt-start" datetime="2026-06-01T19:00:00Z"></time>
			</div>
		`;

		const event = convertFromHEvent(html);

		expect(event.name.en).toBe("Untitled Event");
	});

	test("uses specified language for translations", () => {
		const html = `
			<div class="h-event">
				<span class="p-name">Rencontre Tech</span>
				<time class="dt-start" datetime="2026-06-01T19:00:00Z"></time>
			</div>
		`;

		const event = convertFromHEvent(html, { language: "fr" });

		expect(event.name.fr).toBe("Rencontre Tech");
		expect(event.name.en).toBeUndefined();
	});

	test("handles h-event embedded in larger HTML", () => {
		const html = `
			<html>
			<body>
				<header><h1>My Blog</h1></header>
				<main>
					<article class="h-event">
						<h2 class="p-name">Local Workshop</h2>
						<time class="dt-start" datetime="2026-10-05T14:00:00Z">Oct 5</time>
						<p class="p-location">123 Main St, Springfield</p>
						<a class="u-url" href="https://example.com/workshop">Details</a>
						<div class="p-description">Learn about open data formats.</div>
					</article>
				</main>
			</body>
			</html>
		`;

		const event = convertFromHEvent(html);

		expect(event.name.en).toBe("Local Workshop");
		expect(event.venues?.[0]?.$type).toBe("directory.evnt.venue.physical");
		expect(event.venues?.[0]?.name.en).toBe("123 Main St, Springfield");
		expect(event.components).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					$type: "directory.evnt.component.link",
					url: "https://example.com/workshop",
				}),
			]),
		);
		expect(event.components).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					$type: "directory.evnt.richtext.markdown",
					content: "Learn about open data formats.",
				}),
			]),
		);
	});

	test("datetime attribute takes precedence over text content", () => {
		const html = `
			<div class="h-event">
				<span class="p-name">Date Precedence Test</span>
				<time class="dt-start" datetime="2026-12-25T00:00:00Z">Christmas text ignored</time>
			</div>
		`;

		const event = convertFromHEvent(html);

		expect(event.instances?.[0]?.start).toBeDefined();
		// The parsed date should be Dec 25, not the text
		expect(event.instances?.[0]?.start).toContain("2026-12-25");
	});

	test("handles classes appearing in any order on the element", () => {
		const html = `
			<div class="h-event">
				<a class="u-url p-name" href="https://example.com/e1">Multi-Class Event</a>
				<time class="dt-start" datetime="2026-05-01T10:00:00Z">May 1</time>
			</div>
		`;

		const event = convertFromHEvent(html);

		expect(event.name.en).toBe("Multi-Class Event");
		expect(event.components).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					$type: "directory.evnt.component.link",
					url: "https://example.com/e1",
				}),
			]),
		);
	});
});
