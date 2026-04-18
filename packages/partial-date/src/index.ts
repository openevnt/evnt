export type PlainDateString = `${number}-${number}-${number}`;
export type PlainTimeString = `${number}:${number}`;

export namespace PartialDate {
	type TimezoneIdentifier = string;
	export type YearOnly = `${number}[${TimezoneIdentifier}]`;
	export type YearMonth = `${number}-${number}[${TimezoneIdentifier}]`;
	export type YearMonthDay = `${number}-${number}-${number}[${TimezoneIdentifier}]`;
	export type YearMonthDayTime = `${number}-${number}-${number}T${number}:${number}[${TimezoneIdentifier}]`;

	export type Precision = "year" | "month" | "day" | "time";

	export type Parsed = Parsed.YearOnly | Parsed.YearMonth | Parsed.YearMonthDay | Parsed.YearMonthDayTime;
	export namespace Parsed {
		export type Fields = {
			timezone: TimezoneIdentifier;
			year: number;
			month: number;
			day: number;
			hour: number;
			minute: number;
		};
		export type YearOnly = Pick<Fields, "year" | "timezone"> & { precision: "year" };
		export type YearMonth = Pick<Fields, "year" | "month" | "timezone"> & { precision: "month" };
		export type YearMonthDay = Pick<Fields, "year" | "month" | "day" | "timezone"> & { precision: "day" };
		export type YearMonthDayTime = Fields & { precision: "time" };
	}
}

export type PartialDate = PartialDate.YearOnly | PartialDate.YearMonth | PartialDate.YearMonthDay | PartialDate.YearMonthDayTime;

export const PartialDateRegex = /^(?<year>\d{4})(?:-(?<month>\d{2})(?:-(?<day>\d{2})(?:T(?<time>(?<hour>\d{2}):(?<minute>\d{2}))?)?)?)?(?:\[(?<timezone>[\w\/]+)\])?$/;

export class PartialDateUtil {
	// == Validation methods ==

	/** Checks if a string is a valid PartialDate */
	static isValid(pd: string): pd is PartialDate {
		return PartialDateRegex.test(pd);
	}

	// == Parsing and formatting methods ==

	/**
	 * Parses a PartialDate string into a structured object
	 * @param pd A PartialDate string to parse into a structured object
	 * @returns Parsed representation of the PartialDate
	 */
	static parse(pd: PartialDate.YearOnly): PartialDate.Parsed.YearOnly;
	static parse(pd: PartialDate.YearMonth): PartialDate.Parsed.YearMonth;
	static parse(pd: PartialDate.YearMonthDay): PartialDate.Parsed.YearMonthDay;
	static parse(pd: PartialDate.YearMonthDayTime): PartialDate.Parsed.YearMonthDayTime;
	static parse(pd: PartialDate): PartialDate.Parsed;
	static parse(pd: PartialDate): PartialDate.Parsed {
		const match = PartialDateRegex.exec(pd);
		if (!match || !match.groups) {
			throw new Error(`Invalid partial date format: ${pd}`);
		}

		const { year, month, day, hour, minute, timezone } = match.groups;
		const parsed: PartialDate.Parsed.Fields = {
			timezone: timezone ? timezone : "UTC",
			year: parseInt(year!, 10),
			month: month ? parseInt(month, 10) : 1,
			day: day ? parseInt(day, 10) : 1,
			hour: hour ? parseInt(hour, 10) : 0,
			minute: minute ? parseInt(minute, 10) : 0,
		};

		if (hour && minute) {
			return { ...parsed, precision: "time" };
		} else if (day) {
			return { ...parsed, precision: "day" };
		} else if (month) {
			return { ...parsed, precision: "month" };
		} else {
			return { ...parsed, precision: "year" };
		}
	}

	static format(parsed: PartialDate.Parsed.YearOnly): PartialDate.YearOnly;
	static format(parsed: PartialDate.Parsed.YearMonth): PartialDate.YearMonth;
	static format(parsed: PartialDate.Parsed.YearMonthDay): PartialDate.YearMonthDay;
	static format(parsed: PartialDate.Parsed.YearMonthDayTime): PartialDate.YearMonthDayTime;
	static format(parsed: PartialDate.Parsed): PartialDate;
	static format(parsed: PartialDate.Parsed): PartialDate {
		let str = parsed.year.toString();
		if (this.has(parsed, "month")) str += `-${String(parsed.month).padStart(2, "0")}`;
		if (this.has(parsed, "day")) str += `-${String(parsed.day).padStart(2, "0")}`;
		if (this.has(parsed, "time")) str += `T${String(parsed.hour).padStart(2, "0")}:${String(parsed.minute).padStart(2, "0")}`;
		str += `[${parsed.timezone}]`;
		return str as PartialDate;
	}

	// == Introspection methods ==

	static getPrecision(pd: PartialDate): PartialDate.Precision {
		const parsed = this.parse(pd);
		return parsed.precision;
	}

	static has(pd: PartialDate | PartialDate.Parsed, field: "year"): true;
	static has(pd: PartialDate.Parsed, field: "time"): pd is PartialDate.Parsed.YearMonthDayTime;
	static has(pd: PartialDate.Parsed, field: "day"): pd is PartialDate.Parsed.YearMonthDay | PartialDate.Parsed.YearMonthDayTime;
	static has(pd: PartialDate.Parsed, field: "month"): pd is PartialDate.Parsed.YearMonth | PartialDate.Parsed.YearMonthDay | PartialDate.Parsed.YearMonthDayTime;
	static has(pd: PartialDate, field: "time"): pd is PartialDate.YearMonthDayTime;
	static has(pd: PartialDate, field: "day"): pd is PartialDate.YearMonthDay | PartialDate.YearMonthDayTime;
	static has(pd: PartialDate, field: "month"): pd is PartialDate.YearMonth | PartialDate.YearMonthDay | PartialDate.YearMonthDayTime;
	static has(pd: PartialDate | PartialDate.Parsed, field: PartialDate.Precision): boolean {
		if (field === "year") return true;
		const parsed = typeof pd === "string" ? this.parse(pd) : pd;
		switch (field) {
			case "time": return parsed.precision === "time";
			case "day": return parsed.precision === "day" || parsed.precision === "time";
			case "month": return parsed.precision === "month" || parsed.precision === "day" || parsed.precision === "time";
			default: return false;
		}
	}

	/**
	 * Determines the highest level of precision that two PartialDates have in common.
	 * For example, if both PartialDates have the same year and month, but different days, this method would return "month".
	 * If they have different years, it would return "none".
	 */
	static getPrecisionEquality(a: PartialDate, b: PartialDate): PartialDate.Precision | "none" {
		const start = this.parse(a) as PartialDate.Parsed.Fields;
		const end = this.parse(b) as PartialDate.Parsed.Fields;

		let equalPrecision: PartialDate.Precision | "none" = "none";
		if (start.year === end.year) equalPrecision = "year";
		if (equalPrecision === "year" && start.month === end.month) equalPrecision = "month";
		if (equalPrecision === "month" && start.day === end.day) equalPrecision = "day";
		if (equalPrecision === "day" && start.hour === end.hour && start.minute === end.minute) equalPrecision = "time";
		return equalPrecision;
	}

	// == Modification methods ==

	static lowerPrecision(pd: PartialDate.YearMonthDayTime | PartialDate.YearMonthDay, to: "day"): PartialDate.YearMonthDay;
	static lowerPrecision(pd: PartialDate.YearMonthDayTime | PartialDate.YearMonthDay | PartialDate.YearMonth, to: "month"): PartialDate.YearMonth;
	static lowerPrecision(pd: PartialDate.YearMonthDayTime | PartialDate.YearMonthDay | PartialDate.YearMonth | PartialDate.YearOnly, to: "year"): PartialDate.YearOnly;
	static lowerPrecision(pd: PartialDate, to: Exclude<PartialDate.Precision, "time">): PartialDate {
		const { year, month, day, timezone } = this.parse(pd) as PartialDate.Parsed.Fields;
		switch (to) {
			case "day": return this.format({ year, month, day, timezone, precision: "day" });
			case "month": return this.format({ year, month, timezone, precision: "month" });
			case "year": return this.format({ year, timezone, precision: "year" });
		}
	}

	static setPrecision(pd: PartialDate | PartialDate.Parsed, precision: "year"): PartialDate.YearOnly;
	static setPrecision(pd: PartialDate | PartialDate.Parsed, precision: "month", mode: "low" | "high"): PartialDate.YearMonth;
	static setPrecision(pd: PartialDate | PartialDate.Parsed, precision: "day", mode: "low" | "high"): PartialDate.YearMonthDay;
	static setPrecision(pd: PartialDate | PartialDate.Parsed, precision: "time", mode: "low" | "high"): PartialDate.YearMonthDayTime;
	static setPrecision(pd: PartialDate | PartialDate.Parsed, precision: PartialDate.Precision, mode?: "low" | "high"): PartialDate {
		const parsed = (typeof pd === "string" ? this.parse(pd) : pd) as PartialDate.Parsed;
		let { year, month, day, hour, minute, timezone } = parsed as PartialDate.Parsed.Fields;

		if (mode) {
			if (parsed.precision === "year")
				month = mode === "low" ? 1 : 12;
			if (parsed.precision === "year" || parsed.precision === "month")
				day = mode === "low" ? 1 : new Temporal.PlainYearMonth(year, month).daysInMonth;

			if (parsed.precision !== "time") {
				hour = mode === "low" ? 0 : 23;
				minute = mode === "low" ? 0 : 59;
			}
		}

		switch (precision) {
			case "year": return this.format({ year, timezone, precision: "year" });
			case "month": return this.format({ year, month, timezone, precision: "month" });
			case "day": return this.format({ year, month, day, timezone, precision: "day" });
			case "time": return this.format({ year, month, day, hour, minute, timezone, precision: "time" });
		}
	}

	static withTimezone(pd: PartialDate | PartialDate.Parsed, timezone: string): PartialDate {
		const parsed = typeof pd === "string" ? this.parse(pd) : { ...pd };
		parsed.timezone = timezone;
		return this.format(parsed);
	}

	// == Conversions from Temporal types ==

	static parsedFromTemporal(obj: Temporal.PlainYearMonth): PartialDate.Parsed.YearMonth;
	static parsedFromTemporal(obj: Temporal.PlainDate): PartialDate.Parsed.YearMonthDay;
	static parsedFromTemporal(obj: Temporal.PlainDateTime): PartialDate.Parsed.YearMonthDayTime;
	static parsedFromTemporal(obj: Temporal.ZonedDateTime): PartialDate.Parsed.YearMonthDayTime;
	static parsedFromTemporal(obj: Temporal.ZonedDateTime | Temporal.PlainDateTime | Temporal.PlainDate | Temporal.PlainYearMonth): PartialDate.Parsed {
		return {
			precision: ("hour" in obj && "minute" in obj) ? "time" : ("day" in obj ? "day" : "month"),
			year: obj.year,
			month: obj.month,
			day: "day" in obj ? obj.day : undefined,
			hour: "hour" in obj ? obj.hour : undefined,
			minute: "minute" in obj ? obj.minute : undefined,
			timezone: "timeZoneId" in obj ? obj.timeZoneId : "UTC",
		} as PartialDate.Parsed;
	}

	// == Factory methods ==

	static now(timeZone?: Temporal.TimeZoneLike): PartialDate.YearMonthDayTime {
		const now = Temporal.Now.zonedDateTimeISO(timeZone);
		return this.format(this.parsedFromTemporal(now));
	}

	// == Conversions to Temporal types ==

	static asPlainYearMonth(pd: PartialDate.YearMonth | PartialDate.YearMonthDay | PartialDate.YearMonthDayTime | PartialDate.Parsed.YearMonth | PartialDate.Parsed.YearMonthDay | PartialDate.Parsed.YearMonthDayTime): Temporal.PlainYearMonth {
		const parsed = typeof pd === "string" ? this.parse(pd) as Exclude<PartialDate.Parsed, PartialDate.Parsed.YearOnly> : pd;
		return new Temporal.PlainYearMonth(parsed.year, parsed.month, "iso8601");
	}

	static asPlainDate(pd: PartialDate.YearMonthDay | PartialDate.YearMonthDayTime | PartialDate.Parsed.YearMonthDay | PartialDate.Parsed.YearMonthDayTime): Temporal.PlainDate {
		const parsed = typeof pd === "string" ? this.parse(pd) as Exclude<PartialDate.Parsed, PartialDate.Parsed.YearOnly | PartialDate.Parsed.YearMonth> : pd;
		return new Temporal.PlainDate(parsed.year, parsed.month, parsed.day, "iso8601");
	}

	static asPlainDateTime(pd: PartialDate.YearMonthDayTime | PartialDate.Parsed.YearMonthDayTime): Temporal.PlainDateTime {
		const parsed = typeof pd === "string" ? this.parse(pd) as PartialDate.Parsed.YearMonthDayTime : pd;
		return new Temporal.PlainDateTime(parsed.year, parsed.month, parsed.day, parsed.hour, parsed.minute).withCalendar("iso8601");
	}

	static asZonedDateTime(pd: PartialDate.YearMonthDayTime | PartialDate.Parsed.YearMonthDayTime): Temporal.ZonedDateTime {
		const parsed = typeof pd === "string" ? this.parse(pd) as PartialDate.Parsed.YearMonthDayTime : pd;
		return this.asPlainDateTime(parsed).toZonedDateTime(parsed.timezone);
	}

	static asFormattableTemporal(pd: PartialDate | PartialDate.Parsed): Intl.FormattableTemporalObject {
		const parsed = typeof pd === "string" ? this.parse(pd) : pd;
		let temporal: Intl.FormattableTemporalObject;
		switch (parsed.precision) {
			case "year": temporal = new Temporal.PlainYearMonth(parsed.year, 1); break;
			case "month": temporal = PartialDateUtil.asPlainYearMonth(parsed); break;
			case "day": temporal = PartialDateUtil.asPlainDate(parsed); break;
			case "time": temporal = PartialDateUtil.asZonedDateTime(parsed).toInstant(); break;
		}
		return temporal;
	}

	// == Temporal.Instant conversions ==

	static toInstant(pd: PartialDate | PartialDate.Parsed, mode: "low" | "high"): Temporal.Instant {
		const full = this.setPrecision(pd, "time", mode);
		return this.asZonedDateTime(full).toInstant();
	}

	// == Comparision methods ==

	/**
	 * Checks if PartialDate {@link a} is strictly before PartialDate {@link b}.
	 * This is true if the latest possible time represented by {@link a} is before the earliest possible time represented by {@link b}.
	 */
	static isBefore(a: PartialDate | PartialDate.Parsed, b: PartialDate | PartialDate.Parsed): boolean {
		return Temporal.Instant.compare(this.toInstant(a, "high"), this.toInstant(b, "low")) < 0;
	}

	/**
	 * Checks if PartialDate {@link a} is strictly after PartialDate {@link b}
	 * This is true if the earliest possible time represented by {@link a} is after the latest possible time represented by {@link b}
	 */
	static isAfter(a: PartialDate | PartialDate.Parsed, b: PartialDate | PartialDate.Parsed): boolean {
		return Temporal.Instant.compare(this.toInstant(a, "low"), this.toInstant(b, "high")) > 0;
	}

	/**
	 * Checks if PartialDate {@link inner} is contained within PartialDate {@link outer}
	 * This is true if both:
	 * - The earliest possible time represented by {@link inner} is after the earliest possible time represented by {@link outer}
	 * - And the latest possible time represented by {@link inner} is before the latest possible time represented by {@link outer}
	 * inner ----==----
	 * outer --======--
	 */
	static isContainedIn(inner: PartialDate | PartialDate.Parsed, outer: PartialDate | PartialDate.Parsed): boolean {
		return Temporal.Instant.compare(this.toInstant(inner, "low"), this.toInstant(outer, "low")) >= 0 && Temporal.Instant.compare(this.toInstant(inner, "high"), this.toInstant(outer, "high")) <= 0;
	}

	/**
	 * Checks if PartialDate {@link a} intersects with PartialDate {@link b}
	 * This is true if either:
	 * - The earliest possible time represented by {@link a} is before the latest possible time represented by {@link b}
	 * - And the latest possible time represented by {@link a} is after the earliest possible time represented by {@link b}
	 * a --==---
	 * b ---==--
	 */
	static intersects(a: PartialDate | PartialDate.Parsed, b: PartialDate | PartialDate.Parsed): boolean {
		return Temporal.Instant.compare(this.toInstant(a, "low"), this.toInstant(b, "high")) < 0 && Temporal.Instant.compare(this.toInstant(a, "high"), this.toInstant(b, "low")) > 0;
	}

	// == Humanization methods ==

	static toLocaleString(pd: PartialDate | PartialDate.Parsed, locales: string[] = ["en"]): string {
		const parsed = typeof pd === "string" ? this.parse(pd) : pd;
		switch (parsed.precision) {
			case "year": return parsed.year.toString();
			case "month": return this.asPlainYearMonth(parsed).toLocaleString(locales, { year: "numeric", month: "long" });
			case "day": return this.asPlainDate(parsed).toLocaleString(locales, { year: "numeric", month: "long", day: "numeric" });
			case "time": return this.asZonedDateTime(parsed).toInstant().toLocaleString(locales, { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });
		}
	}
}

