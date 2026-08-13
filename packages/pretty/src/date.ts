import { PartialDateUtil } from "@evnt/partial-date";
import type { PartialDate } from "@evnt/types";
import type { FormatOptions } from "./formatters/base.js";

const hasDay = (pd: PartialDate) => PartialDateUtil.has(pd, "day");
const hasTime = (pd: PartialDate) => PartialDateUtil.has(pd, "time");

/** Format a PartialDate as a locale-aware string. */
export function formatDate(
	pd: PartialDate,
	config: Pick<FormatOptions, "language" | "compactDates">,
): string {
	const parsed = PartialDateUtil.parse(pd);

	if (config.compactDates) {
		switch (parsed.precision) {
			case "year":
				return parsed.year.toString();
			case "month":
				return PartialDateUtil.asPlainYearMonth(parsed).toLocaleString(config.language, {
					year: "numeric",
					month: "short",
				});
			case "day":
			case "time":
				return PartialDateUtil.asPlainDate(parsed).toLocaleString(config.language, {
					month: "short",
					day: "numeric",
				});
			default:
				return "";
		}
	}

	const temporal = PartialDateUtil.asFormattableTemporal(parsed);
	return new Intl.DateTimeFormat(config.language, {
		year: "numeric",
		month: "long",
		day: hasDay(pd) ? "numeric" : undefined,
		hour: hasTime(pd) ? "numeric" : undefined,
		minute: hasTime(pd) ? "numeric" : undefined,
		calendar: "iso8601",
		hour12: false,
		timeZone: parsed.timezone,
	}).format(temporal);
}

export function formatDateRange(
	start: PartialDate,
	end: PartialDate,
	config: Pick<FormatOptions, "language" | "compactDates">,
): string {
	const startParsed = PartialDateUtil.parse(start);
	const endParsed = PartialDateUtil.parse(end);

	if (startParsed.precision !== "day" && startParsed.precision !== "time") {
		return `${formatDate(start, config)}–${formatDate(end, config)}`;
	}

	if (startParsed.precision !== endParsed.precision) {
		return `${formatDate(start, config)}–${formatDate(end, config)}`;
	}

	if (config.compactDates) {
		const from = PartialDateUtil.asPlainDate(startParsed);
		const to = PartialDateUtil.asPlainDate(endParsed);
		return new Intl.DateTimeFormat(config.language, {
			month: "short",
			day: "numeric",
			timeZone: "UTC",
		}).formatRange(from, to);
	}

	const temporalStart = PartialDateUtil.asFormattableTemporal(startParsed);
	const temporalEnd = PartialDateUtil.asFormattableTemporal(endParsed);
	return new Intl.DateTimeFormat(config.language, {
		year: "numeric",
		month: "long",
		day: hasDay(start) ? "numeric" : undefined,
		hour: hasTime(start) ? "numeric" : undefined,
		minute: hasTime(start) ? "numeric" : undefined,
		calendar: "iso8601",
		hour12: false,
		timeZone: startParsed.timezone,
	}).formatRange(temporalStart, temporalEnd);
}

/** Format a time-only PartialDate as "14:00". */
export function formatTime(pd: PartialDate, config: Pick<FormatOptions, "language">): string {
	const parsed = PartialDateUtil.parse(pd);
	if (parsed.precision !== "time") return "";

	const local = PartialDateUtil.asPlainDateTime(parsed);
	return local.toLocaleString(config.language, {
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	});
}

/** Format a time range as "14:00–16:00". */
export function formatTimeRange(
	start: PartialDate | undefined,
	end: PartialDate | undefined,
	config: Pick<FormatOptions, "language">,
): string {
	if (!start && !end) return "";
	if (start && end && hasTime(start) && hasTime(end)) {
		return `${formatTime(start, config)} – ${formatTime(end, config)}`;
	}
	if (start && hasTime(start)) return formatTime(start, config);
	return "";
}
