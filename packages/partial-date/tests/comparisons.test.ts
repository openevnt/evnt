import "temporal-polyfill-lite/global";
import { describe, expect, test } from "vitest";
import { PartialDateUtil } from "../src/index";

describe("PartialDate comparisons", () => {
	test("isBefore uses latest(a) < earliest(b)", () => {
		expect(PartialDateUtil.isBefore("2024[UTC]", "2025[UTC]")).toBe(true);
		expect(PartialDateUtil.isBefore("2024[UTC]", "2024[UTC]")).toBe(false);
		expect(PartialDateUtil.isBefore("2024-05[UTC]", "2024-06[UTC]")).toBe(true);
		expect(PartialDateUtil.isBefore("2024-05[UTC]", "2024-05-01[UTC]")).toBe(false);
		expect(PartialDateUtil.isBefore("2024-05-20T10:00[UTC]", "2024-05-20T10:01[UTC]")).toBe(true);
	});

	test("isAfter uses earliest(a) > latest(b)", () => {
		expect(PartialDateUtil.isAfter("2026[UTC]", "2025[UTC]")).toBe(true);
		expect(PartialDateUtil.isAfter("2024[UTC]", "2024[UTC]")).toBe(false);
		expect(PartialDateUtil.isAfter("2024-06[UTC]", "2024-05[UTC]")).toBe(true);
		expect(PartialDateUtil.isAfter("2024-05-01[UTC]", "2024-05[UTC]")).toBe(false);
		expect(PartialDateUtil.isAfter("2024-05-20T10:01[UTC]", "2024-05-20T10:00[UTC]")).toBe(true);
	});

	test("isContainedIn checks full interval containment", () => {
		expect(PartialDateUtil.isContainedIn("2024-05[UTC]", "2024[UTC]")).toBe(true);
		expect(PartialDateUtil.isContainedIn("2024-05-20[UTC]", "2024-05[UTC]")).toBe(true);
		expect(PartialDateUtil.isContainedIn("2024[UTC]", "2024-05[UTC]")).toBe(false);
		expect(PartialDateUtil.isContainedIn("2024-05[UTC]", "2024-05[UTC]")).toBe(true);
	});

	test("intersects is true only when intervals overlap strictly", () => {
		expect(PartialDateUtil.intersects("2024-05[UTC]", "2024[UTC]")).toBe(true);
		expect(PartialDateUtil.intersects("2024-05[UTC]", "2024-05[UTC]")).toBe(true);
		expect(PartialDateUtil.intersects("2024-05[UTC]", "2024-06[UTC]")).toBe(false);

		// Adjacent boundaries do not intersect because comparisons are strict.
		expect(PartialDateUtil.intersects("2024-05-01T10:00[UTC]", "2024-05-01T10:00[UTC]")).toBe(false);
		expect(PartialDateUtil.intersects("2024-05-01T10:00[UTC]", "2024-05-01T10:01[UTC]")).toBe(false);
	});
});
