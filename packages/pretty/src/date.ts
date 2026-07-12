import { PartialDateUtil } from "@evnt/partial-date";
import type { PartialDate } from "@evnt/types";
import type { FormatConfig } from "./formatters/base.js";

// == Helpers ==============================================

const hasDay = (pd: PartialDate) => PartialDateUtil.has(pd, "day");
const hasTime = (pd: PartialDate) => PartialDateUtil.has(pd, "time");

// == Formatting ==========================================

/** Format a PartialDate as a locale-aware string. */
export function formatDate(
	pd: PartialDate,
	config: Pick<FormatConfig, "language" | "compactDates" | "timezone">,
): string {
	const parsed = PartialDateUtil.parse(pd);

	if (config.compactDates) {
		switch (parsed.precision) {
			case "year":
				return parsed.year.toString();
			case "month": {
				const dt = new Date(Date.UTC(parsed.year, parsed.month - 1));
				return dt.toLocaleDateString(config.language, {
					year: "numeric",
					month: "short",
					timeZone: "UTC",
				});
			}
			case "day":
			case "time": {
				const dt = new Date(Date.UTC(parsed.year, parsed.month - 1, parsed.day));
				return dt.toLocaleDateString(config.language, {
					month: "short",
					day: "numeric",
					timeZone: "UTC",
				});
			}
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
	config: Pick<FormatConfig, "language" | "compactDates" | "timezone">,
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

/** Format a time-only PartialDate as "14:00". Shows local time offset when timezone differs. */
export function formatTime(
	pd: PartialDate,
	config: Pick<FormatConfig, "language" | "timezone">,
): string {
	const parsed = PartialDateUtil.parse(pd);
	if (parsed.precision !== "time") return "";

	const local = PartialDateUtil.asPlainDateTime(parsed);
	const time = local.toLocaleString(config.language, {
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	});

	if (parsed.timezone !== config.timezone) {
		const withTime = pd as PartialDate.YearMonthDayTime;
		const instant = PartialDateUtil.asZonedDateTime(withTime).toInstant();
		const localTime = instant.toLocaleString(config.language, {
			hour: "2-digit",
			minute: "2-digit",
			hour12: false,
			timeZone: config.timezone,
		});
		if (time !== localTime) return `${time} (${localTime})`;
	}

	return time;
}

/** Format a time range as "14:00–16:00". */
export function formatTimeRange(
	start: PartialDate | undefined,
	end: PartialDate | undefined,
	config: Pick<FormatConfig, "language" | "timezone">,
): string {
	if (!start && !end) return "";
	if (start && end && hasTime(start) && hasTime(end)) {
		return `${formatTime(start, config)} – ${formatTime(end, config)}`;
	}
	if (start && hasTime(start)) return formatTime(start, config);
	return "";
}
