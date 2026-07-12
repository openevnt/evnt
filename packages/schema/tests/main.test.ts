import { describe, expect, test } from "vitest";
import { OpenEvntSchema } from "../src/schemas/OpenEvnt";

test("basic parsing", () => {
	expect(() => OpenEvntSchema.parse({})).toThrow();

	expect(() => OpenEvntSchema.parse({ v: "0.1", name: {} })).not.toThrow();
});

test("venueIds reference", () => {
	expect(() =>
		OpenEvntSchema.parse({
			v: "0.1",
			name: {},
			venues: [{ id: "venue1", $type: "directory.evnt.venue.physical", name: {} }],
			instances: [{ venueIds: ["venue1"] }],
		}),
	).not.toThrow();

	expect(() =>
		OpenEvntSchema.parse({
			v: "0.1",
			name: {},
			venues: [{ id: "venue1", $type: "directory.evnt.venue.physical", name: {} }],
			instances: [{ venueIds: ["venue2"] }],
		}),
	).toThrow();
});

describe("components", () => {
	test("known link component validated", () => {
		expect(() =>
			OpenEvntSchema.parse({
				v: "0.1",
				name: {},
				components: [{ $type: "directory.evnt.component.link", missing: "url field" }],
			}),
		).toThrow();

		expect(() =>
			OpenEvntSchema.parse({
				v: "0.1",
				name: {},
				components: [{ $type: "directory.evnt.component.link", url: "https://example.com" }],
			}),
		).not.toThrow();
	});

	test("unknown components", () => {
		expect(() =>
			OpenEvntSchema.parse({
				v: "0.1",
				name: {},
				components: [{ $type: "test-component", some: "data" }],
			}),
		).not.toThrow();
	});
});

describe("v0 compatibility", () => {
	test("parsing v0.1 data", () => {
		expect(() =>
			OpenEvntSchema.parse({
				v: 0,
				name: {},
				venues: [{ id: "venue1", type: "physical", name: {} }],
				instances: [{ venueIds: ["venue1"] }],
				components: [{ type: "link", data: { url: "https://example.com" } }],
			}),
		).not.toThrow();

		const parsed = OpenEvntSchema.parse({
			v: 0,
			name: {},
			venues: [{ id: "venue1", type: "physical", name: {} }],
			instances: [{ venueIds: ["venue1"] }],
			components: [{ type: "link", data: { url: "https://example.com" } }],
		});

		expect(parsed.venues![0].$type).toBe("directory.evnt.venue.physical");
		expect(parsed.components![0].$type).toBe("directory.evnt.component.link");
		expect((parsed.components![0] as any).url).toBe("https://example.com");
	});
});
