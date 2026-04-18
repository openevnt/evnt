import type { EventInstance, PartialDate as SchemaPartialDate } from "@evnt/schema";
import { PartialDateUtil, type PartialDate as PartialDateParts } from "@evnt/partial-date";
import { TranslationsUtil as UtilTranslations } from "@evnt/translations";

const DEFAULT_TZ = "UTC";

const parse = (value: SchemaPartialDate) => PartialDateUtil.parse(value);

const daysInMonth = (year: number, month: number) => new Date(Date.UTC(year, month, 0)).getUTCDate();

const toDate = (value: SchemaPartialDate, mode: "low" | "high"): Date => {
	const parsed = parse(value);
	const year = parsed.year;

	let month = 1;
	let day = 1;
	let hour = 0;
	let minute = 0;
	let second = 0;
	let millisecond = 0;

	if (parsed.precision === "year") {
		if (mode === "high") {
			month = 12;
			day = 31;
			hour = 23;
			minute = 59;
			second = 59;
			millisecond = 999;
		}
	}

	if (parsed.precision === "month") {
		month = parsed.month;
		if (mode === "high") {
			day = daysInMonth(year, month);
			hour = 23;
			minute = 59;
			second = 59;
			millisecond = 999;
		}
	}

	if (parsed.precision === "day") {
		month = parsed.month;
		day = parsed.day;
		if (mode === "high") {
			hour = 23;
			minute = 59;
			second = 59;
			millisecond = 999;
		}
	}

	if (parsed.precision === "time") {
		month = parsed.month;
		day = parsed.day;
		hour = parsed.hour;
		minute = parsed.minute;
		if (mode === "high") {
			second = 59;
			millisecond = 999;
		}
	}

	return new Date(Date.UTC(year, month - 1, day, hour, minute, second, millisecond));
};

const formatFrom = (
	value: SchemaPartialDate,
	precision: PartialDateParts.Parsed["precision"],
): SchemaPartialDate => {
	const p = parse(value);
	const timezone = p.timezone ?? DEFAULT_TZ;
	if (precision === "year")
		return PartialDateUtil.format({ year: p.year, timezone, precision: "year" });
	if (precision === "month")
		return PartialDateUtil.format({ year: p.year, month: "month" in p ? p.month : 1, timezone, precision: "month" });
	if (precision === "day")
		return PartialDateUtil.format({
			year: p.year,
			month: "month" in p ? p.month : 1,
			day: "day" in p ? p.day : 1,
			timezone,
			precision: "day",
		});
	return PartialDateUtil.format({
		year: p.year,
		month: "month" in p ? p.month : 1,
		day: "day" in p ? p.day : 1,
		hour: "hour" in p ? p.hour : 0,
		minute: "minute" in p ? p.minute : 0,
		timezone,
		precision: "time",
	});
};

export class UtilPartialDate {
	static hasDay(value: SchemaPartialDate): boolean {
		return PartialDateUtil.has(value, "day");
	}

	static hasTime(value: SchemaPartialDate): boolean {
		return PartialDateUtil.has(value, "time");
	}

	static asMonth(value: SchemaPartialDate): PartialDateParts.YearMonth {
		return formatFrom(value, "month") as PartialDateParts.YearMonth;
	}

	static asDay(value: SchemaPartialDate): PartialDateParts.YearMonthDay {
		return formatFrom(value, "day") as PartialDateParts.YearMonthDay;
	}

	static getDatePart(value: SchemaPartialDate): PartialDateParts.YearMonthDay {
		return this.asDay(value);
	}

	static getTimePart(value: SchemaPartialDate): string | undefined {
		const p = parse(value);
		if (p.precision !== "time") return undefined;
		return `${p.hour.toString().padStart(2, "0")}:${p.minute.toString().padStart(2, "0")}`;
	}

	static toLowDate(value: SchemaPartialDate): Date {
		return toDate(value, "low");
	}

	static toHighDate(value: SchemaPartialDate): Date {
		return toDate(value, "high");
	}

	static now(timeZone?: string): PartialDateParts.YearMonthDayTime {
		return PartialDateUtil.now(timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone || DEFAULT_TZ) as PartialDateParts.YearMonthDayTime;
	}

	static today(timeZone?: string): PartialDateParts.YearMonthDay {
		return this.asDay(this.now(timeZone));
	}
}

export type PartialDateRange = {
	start: SchemaPartialDate;
	end: SchemaPartialDate;
};

export class UtilPartialDateRange {
	static isSameDay(range: PartialDateRange | EventInstance): boolean {
		return !!range.start && !!range.end && UtilPartialDate.hasDay(range.start) && UtilPartialDate.hasDay(range.end) && UtilPartialDate.asDay(range.start) === UtilPartialDate.asDay(range.end);
	}

	static getIncludedDates(range: PartialDateRange | EventInstance): PartialDateParts.YearMonthDay[] {
		if (!range.start) return [];
		if (!range.end) return UtilPartialDate.hasDay(range.start) ? [UtilPartialDate.asDay(range.start)] : [];

		const start = UtilPartialDate.toLowDate(range.start);
		const end = UtilPartialDate.toLowDate(range.end);
		const dates: PartialDateParts.YearMonthDay[] = [];
		for (let current = new Date(start); current.getTime() <= end.getTime(); current.setDate(current.getDate() + 1)) {
			dates.push(current.toISOString().slice(0, 10) + "[UTC]" as PartialDateParts.YearMonthDay);
		}
		return dates;
	}
}

export { UtilTranslations };