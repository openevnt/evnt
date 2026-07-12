import "temporal-polyfill-lite/global";
import { describe, expect, test } from "vitest";
import { PartialDateUtil } from "../src/index";

describe("PartialDate precision and shape helpers", () => {
	test("getPrecision and has detect available precision", () => {
		expect(PartialDateUtil.getPrecision("2024[UTC]")).toBe("year");
		expect(PartialDateUtil.getPrecision("2024-05[UTC]")).toBe("month");
		expect(PartialDateUtil.getPrecision("2024-05-20[UTC]")).toBe("day");
		expect(PartialDateUtil.getPrecision("2024-05-20T14:30[UTC]")).toBe("time");

		expect(PartialDateUtil.has("2024[UTC]", "month")).toBe(false);
		expect(PartialDateUtil.has("2024-05[UTC]", "month")).toBe(true);
		expect(PartialDateUtil.has("2024-05-20[UTC]", "day")).toBe(true);
		expect(PartialDateUtil.has("2024-05-20T14:30[UTC]", "time")).toBe(true);
	});

	test("lowerPrecision removes less significant fields", () => {
		expect(PartialDateUtil.lowerPrecision("2024-05-20T14:30[UTC]", "day")).toBe("2024-05-20[UTC]");
		expect(PartialDateUtil.lowerPrecision("2024-05-20T14:30[UTC]", "month")).toBe("2024-05[UTC]");
		expect(PartialDateUtil.lowerPrecision("2024-05-20[UTC]", "year")).toBe("2024[UTC]");
	});

	test("setPrecision supports low and high fill values", () => {
		expect(PartialDateUtil.setPrecision("2024[UTC]", "month", "low")).toBe("2024-01[UTC]");
		expect(PartialDateUtil.setPrecision("2024[UTC]", "month", "high")).toBe("2024-12[UTC]");
		expect(PartialDateUtil.setPrecision("2024-02[UTC]", "day", "low")).toBe("2024-02-01[UTC]");
		expect(PartialDateUtil.setPrecision("2024-02[UTC]", "day", "high")).toBe("2024-02-29[UTC]");
		expect(PartialDateUtil.setPrecision("2024-05-20[UTC]", "time", "low")).toBe(
			"2024-05-20T00:00[UTC]",
		);
		expect(PartialDateUtil.setPrecision("2024-05-20[UTC]", "time", "high")).toBe(
			"2024-05-20T23:59[UTC]",
		);
	});

	test("withTimezone rewrites timezone without changing local fields", () => {
		expect(PartialDateUtil.withTimezone("2024-05-20T14:30[UTC]", "Europe/Berlin")).toBe(
			"2024-05-20T14:30[Europe/Berlin]",
		);
		expect(PartialDateUtil.withTimezone("2024-05[UTC]", "America/New_York")).toBe(
			"2024-05[America/New_York]",
		);
	});
});
