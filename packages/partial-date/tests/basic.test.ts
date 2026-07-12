import { expect, test } from "vitest";
import { PartialDateUtil } from "../src/index";

test("parses correctly", () => {
	expect(PartialDateUtil.isValid("2024[UTC]")).toBe(true);
	expect(PartialDateUtil.isValid("2024-05[UTC]")).toBe(true);
	expect(PartialDateUtil.isValid("2024-05-20[UTC]")).toBe(true);
	expect(PartialDateUtil.isValid("2024-05-20T14:30[America/New_York]")).toBe(true);
	expect(PartialDateUtil.isValid("2024-05-20T14:30[Europe/London]")).toBe(true);

	expect(PartialDateUtil.isValid("2024-1")).toBe(false);
	expect(PartialDateUtil.isValid("2024-05-")).toBe(false);
	expect(PartialDateUtil.isValid("2024-05-5")).toBe(false);
	expect(PartialDateUtil.isValid("2024-05T24:00")).toBe(false);
	expect(PartialDateUtil.isValid("2024-05-20T14")).toBe(false);
	expect(PartialDateUtil.isValid("2024-05-20T14:[Invalid/Timezone]")).toBe(false);

	const parsed = PartialDateUtil.parse("2024-05-20T14:30[America/New_York]");
	expect(parsed).toEqual({
		year: 2024,
		month: 5,
		day: 20,
		hour: 14,
		minute: 30,
		timezone: "America/New_York",
		precision: "time",
	});
});
