/**
 * Date conversion helpers shared across format converters.
 */
import { PartialDateUtil } from "@evnt/partial-date";
import type { PartialDate } from "@evnt/types";

/** Guess whether a time value represents midnight (for precision inference). */
export const isMidnight = (hour: number, minute: number): boolean =>
	hour === 0 && minute === 0;

/** Build a PartialDate string from a Date and a timezone ID. */
export const dateToPartialDate = (
	date: Date,
	timezone: string,
): PartialDate => {
	const hour = date.getUTCHours();
	const minute = date.getUTCMinutes();
	const precision: "day" | "time" = isMidnight(hour, minute) ? "day" : "time";

	return PartialDateUtil.format({
		year: date.getUTCFullYear(),
		month: date.getUTCMonth() + 1,
		day: date.getUTCDate(),
		hour,
		minute,
		timezone,
		precision,
	} as PartialDate.Parsed);
};

/** Try to parse an ISO‑8601 / JS‑style date string into a PartialDate. */
export const parseDateString = (value: string): PartialDate | undefined => {
	// Already a valid PartialDate with timezone — use as-is
	if (PartialDateUtil.isValid(value as any)) {
		return value as PartialDate;
	}

	// Try parsing as a JS Date, then format as PartialDate with UTC timezone
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return undefined;

	const isMidnightUTC = date.getUTCHours() === 0 && date.getUTCMinutes() === 0;
	return PartialDateUtil.format({
		year: date.getUTCFullYear(),
		month: date.getUTCMonth() + 1,
		day: date.getUTCDate(),
		hour: date.getUTCHours(),
		minute: date.getUTCMinutes(),
		timezone: "UTC",
		precision: isMidnightUTC ? "day" : "time",
	} as PartialDate.Parsed);
};

/** Format a PartialDate as an ISO instant string (only for time-precision dates). */
export const partialDateToIso = (value: PartialDate): string | undefined => {
	const parsed = PartialDateUtil.parse(value);
	if (parsed.precision !== "time") return undefined;
	return PartialDateUtil.asZonedDateTime(parsed).toInstant().toString();
};

/** Fix common date string quirks (e.g. WordPress "2024-05-01T9:00+3:00") */
export const normalizeDateString = (dateStr: string): string =>
	dateStr.replace(/([+-])(\d:)/g, "$10$2");
