import { PartialDateUtil } from "@evnt/partial-date";
import type { EventStatus, PartialDate } from "@evnt/types";
import type { AnalyzedEvent, DateGroup, VenueSummary, ActivitySummary, LinkSummary } from "../types";

// == Config ==============================================

export type TimestampStyle = "off" | "both" | "only";

export interface FormatConfig {
	language: string;
	timezone: string;
	showStatus: boolean;
	showActivities: boolean;
	showLinks: boolean;
	showDescription: boolean;
	compactDates: boolean;
	emoji: Record<string, string>;
	statusIcons: Record<EventStatus, string>;
}

// == Helpers ==============================================

const hasDay = (pd: PartialDate) => PartialDateUtil.has(pd, "day");
const hasTime = (pd: PartialDate) => PartialDateUtil.has(pd, "time");

const parseFields = (pd: PartialDate): PartialDate.Parsed.Fields =>
	PartialDateUtil.parse(pd) as PartialDate.Parsed.Fields;

const asDay = (pd: PartialDate): PartialDate => {
	const p = parseFields(pd);
	return PartialDateUtil.format({
		year: p.year,
		month: p.month ?? 1,
		day: p.day ?? 1,
		timezone: p.timezone,
		precision: "day",
	}) as PartialDate;
};

const isSameDay = (a: PartialDate, b: PartialDate): boolean => {
	const pa = parseFields(a);
	const pb = parseFields(b);
	return pa.year === pb.year && pa.month === pb.month && pa.day === pb.day;
};

// == Base formatter =======================================

export class PlainTextFormatter {
	static defaults: FormatConfig = {
		language: "en",
		timezone: "UTC",
		showStatus: false,
		showActivities: false,
		showLinks: false,
		showDescription: false,
		compactDates: true,
		emoji: {
			calendar: "📅",
			clock: "🕐",
			online: "🌐",
			physical: "📍",
			unknown: "📍",
			link: "🔗",
			activity: "🎭",
		},
		statusIcons: {
			planned: "",
			uncertain: "🟡",
			postponed: "🟡",
			cancelled: "🔴",
			suspended: "🟠",
		},
	};

	constructor(protected config: FormatConfig) {}

	// == Top-level =======================================

	formatEvent(event: AnalyzedEvent): string {
		const lines: string[] = [];

		lines.push(this.formatHeader(event.name));

		if (event.label) {
			lines.push(this.formatSubHeader(event.label));
		}

		if (this.config.showStatus && event.status) {
			lines.push(this.formatStatus(event.status.status, event.status.text));
		}

		for (const dg of event.dates) {
			lines.push(this.formatDateGroup(dg));
		}

		for (const venue of event.venues) {
			lines.push(this.formatVenue(venue));
		}

		if (this.config.showActivities) {
			for (const act of event.activities) {
				lines.push(this.formatActivity(act));
			}
		}

		if (this.config.showLinks) {
			for (const link of event.links) {
				lines.push(this.formatLink(link));
			}
		}

		if (this.config.showDescription && event.description) {
			lines.push(this.formatDescription(event.description));
		}

		return lines.filter(Boolean).join("\n");
	}

	// == Sections ========================================

	protected formatHeader(text: string): string {
		return text;
	}

	protected formatSubHeader(text: string): string {
		return text;
	}

	formatStatus(status: EventStatus, text: string): string {
		return text;
	}

	// == Date groups =====================================

	protected formatDateGroup(group: DateGroup): string {
		const dateStr = this.formatDateEntries(group.entries);
		const timeStr = group.timeRanges.map(tr => this.formatTimeRange(tr.start, tr.end)).filter(Boolean).join(", ");
		return [dateStr, timeStr].filter(Boolean).join(" · ");
	}

	protected formatDateEntries(entries: { start?: PartialDate; end?: PartialDate }[]): string {
		if (entries.length === 0) return "";

		if (entries.length === 1) {
			const e = entries[0]!;
			if (e.start && e.end && isSameDay(e.start, e.end)) return this.formatDate(e.start);
			if (e.start && e.end) return this.formatDateRange(e.start, e.end);
			if (e.start) return this.formatDate(e.start);
			if (e.end) return this.formatDate(e.end);
			return "";
		}

		const allDays: PartialDate[] = [];
		for (const e of entries) {
			if (e.start && hasDay(e.start)) allDays.push(asDay(e.start));
		}

		if (allDays.length >= 2 && this.isConsecutiveRange(allDays)) {
			return this.formatDateRange(allDays[0]!, allDays[allDays.length - 1]!);
		}

		return allDays.map(d => this.formatDate(d)).join(", ");
	}

	protected isConsecutiveRange(days: PartialDate[]): boolean {
		for (let i = 1; i < days.length; i++) {
			const prev = parseFields(days[i - 1]!);
			const curr = parseFields(days[i]!);
			const prevMs = Date.UTC(prev.year, prev.month - 1, prev.day);
			const currMs = Date.UTC(curr.year, curr.month - 1, curr.day);
			if (currMs - prevMs !== 86_400_000) return false;
		}
		return true;
	}

	// == Dates & times ===================================

	protected formatDate(pd: PartialDate): string {
		const parsed = PartialDateUtil.parse(pd);

		if (this.config.compactDates) {
			switch (parsed.precision) {
				case "year":
					return parsed.year.toString();
				case "month": {
					const dt = new Date(Date.UTC(parsed.year, parsed.month - 1));
					return dt.toLocaleDateString(this.config.language, { year: "numeric", month: "short", timeZone: "UTC" });
				}
				case "day":
				case "time": {
					const dt = new Date(Date.UTC(parsed.year, parsed.month - 1, parsed.day));
					return dt.toLocaleDateString(this.config.language, {
						month: "short",
						day: "numeric",
						timeZone: "UTC",
					});
				}
			}
		} else {
			const temporal = PartialDateUtil.asFormattableTemporal(parsed);
			return new Intl.DateTimeFormat(this.config.language, {
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

		return "";
	}

	protected formatDateRange(start: PartialDate, end: PartialDate): string {
		return `${this.formatDate(start)}–${this.formatDate(end)}`;
	}

	protected formatTimeRange(start?: PartialDate, end?: PartialDate): string {
		if (!start && !end) return "";
		if (start && end && hasTime(start) && hasTime(end)) {
			return `${this.formatTime(start)}–${this.formatTime(end)}`;
		}
		if (start && hasTime(start)) return this.formatTime(start);
		return "";
	}

	protected formatTime(pd: PartialDate): string {
		const parsed = PartialDateUtil.parse(pd);
		if (parsed.precision !== "time") return "";

		const local = PartialDateUtil.asPlainDateTime(parsed);
		const time = local.toLocaleString(this.config.language, {
			hour: "2-digit",
			minute: "2-digit",
			hour12: false,
		});

		if (parsed.timezone !== this.config.timezone) {
			const withTime = pd as PartialDate.YearMonthDayTime;
			const instant = PartialDateUtil.asZonedDateTime(withTime).toInstant();
			const localTime = instant.toLocaleString(this.config.language, {
				hour: "2-digit",
				minute: "2-digit",
				hour12: false,
				timeZone: this.config.timezone,
			});
			if (time !== localTime) return `${time} (${localTime})`;
		}

		return time;
	}

	// == Venues ==========================================

	protected formatVenue(venue: VenueSummary): string {
		return [venue.name, venue.detail].filter(Boolean).join(" · ");
	}

	// == Activities ======================================

	protected formatActivity(activity: ActivitySummary): string {
		const parts: string[] = [activity.name];

		if (activity.time) {
			const timeStr = activity.duration
				? `${activity.time}–${addDuration(activity.time, activity.duration)}`
				: activity.time;
			parts.push("·", timeStr);
		}

		if (activity.day) parts.push(`(Day ${activity.day})`);

		return parts.join(" ");
	}

	// == Links ===========================================

	protected formatLink(link: LinkSummary): string {
		return link.name ?? link.url;
	}

	// == Description =====================================

	protected formatDescription(text: string): string {
		const firstPara = text.split("\n\n")[0] ?? text;
		return firstPara.length > 200 ? firstPara.slice(0, 200) + "…" : firstPara;
	}
}

// == Shared helpers =======================================

const addDuration = (time: string, duration: string): string => {
	const [th, tm] = time.split(":").map(Number);
	const [dh, dm] = duration.split(":").map(Number);
	const totalMinutes = (th ?? 0) * 60 + (tm ?? 0) + (dh ?? 0) * 60 + (dm ?? 0);
	const h = Math.floor(totalMinutes / 60);
	const m = totalMinutes % 60;
	return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

export { addDuration };
