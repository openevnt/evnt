import { PartialDateUtil } from "@evnt/partial-date";
import type { PartialDate, EventStatus } from "@evnt/types";
import type { AnalyzedEvent, DateGroup, VenueSummary, ActivitySummary, LinkSummary } from "../types";
import type { FormatConfig } from "../format-config";

// == Helpers ==============================================

const hasDay = (pd: PartialDate) => PartialDateUtil.has(pd, "day");
const hasTime = (pd: PartialDate) => PartialDateUtil.has(pd, "time");
const hasMonth = (pd: PartialDate) => PartialDateUtil.has(pd, "month");

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
	constructor(protected config: FormatConfig) {}

	// == Top-level =======================================

	/** Render a full event summary. */
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
		const icon = this.config.statusIcons[status] ?? "";
		return [icon, text].filter(Boolean).join(" ");
	}

	// == Date groups =====================================

	protected formatDateGroup(group: DateGroup): string {
		const dateStr = this.formatDateEntries(group.entries);
		const timeStr = group.timeRanges.map(tr => this.formatTimeRange(tr.start, tr.end)).filter(Boolean).join(", ");

		const parts = [
			this.config.emoji.calendar,
			dateStr,
		];

		if (timeStr) {
			const firstTime = group.timeRanges[0]?.start ?? group.timeRanges[0]?.end;
			const clockIcon = firstTime && hasTime(firstTime) ? this.clockEmoji(firstTime as PartialDate) : this.config.emoji.clock;
			parts.push("·", clockIcon ?? this.config.emoji.clock ?? "🕐", timeStr);
		}

		return parts.filter(Boolean).join(" ");
	}

	/** Map a time-precision PartialDate to a clock face emoji. */
	protected clockEmoji(pd: PartialDate): string {
		const parsed = PartialDateUtil.parse(pd);
		if (parsed.precision !== "time") return this.config.emoji.clock ?? "🕐";
		const hour12 = (parsed.hour % 12) || 12;
		const base = parsed.minute >= 30 ? 0x1F55C : 0x1F550;
		return String.fromCodePoint(base + hour12 - 1);
	}

	protected formatDateEntries(entries: { start?: PartialDate; end?: PartialDate }[]): string {
		if (entries.length === 0) return "";

		// Single date
		if (entries.length === 1) {
			const e = entries[0]!;
			if (e.start && e.end && isSameDay(e.start, e.end)) {
				return this.formatDate(e.start);
			}
			if (e.start && e.end) {
				return this.formatDateRange(e.start, e.end);
			}
			if (e.start) return this.formatDate(e.start);
			if (e.end) return this.formatDate(e.end);
			return "";
		}

		// Consecutive range: start of first → end of last
		const allDays: PartialDate[] = [];
		for (const e of entries) {
			if (e.start && hasDay(e.start)) {
				allDays.push(asDay(e.start));
			}
		}

		if (allDays.length >= 2 && this.isConsecutiveRange(allDays)) {
			return this.formatDateRange(allDays[0]!, allDays[allDays.length - 1]!);
		}

		// Non-consecutive list
		return allDays.map(d => this.formatDate(d)).join(", ");
	}

	/** True when all days in the sorted list are consecutive (no gaps). */
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

		// Timezone hint when different from user's timezone
		if (parsed.timezone !== this.config.timezone) {
			const withTime = pd as PartialDate.YearMonthDayTime;
			const instant = PartialDateUtil.asZonedDateTime(withTime).toInstant();
			const localTime = instant.toLocaleString(this.config.language, {
				hour: "2-digit",
				minute: "2-digit",
				hour12: false,
				timeZone: this.config.timezone,
			});
			if (time !== localTime) {
				return `${time} (${localTime})`;
			}
		}

		return time;
	}

	// == Venues ==========================================

	protected formatVenue(venue: VenueSummary): string {
		const icon = this.config.emoji[venue.type] ?? "";
		const parts = [icon, venue.name].filter(Boolean);

		if (venue.detail) {
			parts.push("·", venue.detail);
		}

		return parts.join(" ");
	}

	// == Activities ======================================

	protected formatActivity(activity: ActivitySummary): string {
		const icon = this.config.emoji.activity ?? "";
		const parts: string[] = [icon, activity.name].filter(Boolean);

		if (activity.time) {
			const timeStr = activity.duration
				? `${activity.time}–${addDuration(activity.time, activity.duration)}`
				: activity.time;
			parts.push("·", timeStr);
		}

		if (activity.day) {
			parts.push(`(Day ${activity.day})`);
		}

		return parts.join(" ");
	}

	// == Links ===========================================

	protected formatLink(link: LinkSummary): string {
		const icon = this.config.emoji.link ?? "";
		const text = link.name ?? link.url;
		return [icon, text].filter(Boolean).join(" ");
	}

	// == Description =====================================

	protected formatDescription(text: string): string {
		// Shorten to first paragraph / first few lines
		const firstPara = text.split("\n\n")[0] ?? text;
		const truncated = firstPara.length > 200
			? firstPara.slice(0, 200) + "…"
			: firstPara;
		return truncated;
	}
}

// == Helpers ==============================================

const addDuration = (time: string, duration: string): string => {
	const [th, tm] = time.split(":").map(Number);
	const [dh, dm] = duration.split(":").map(Number);
	const totalMinutes = (th ?? 0) * 60 + (tm ?? 0) + (dh ?? 0) * 60 + (dm ?? 0);
	const h = Math.floor(totalMinutes / 60);
	const m = totalMinutes % 60;
	return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

export { addDuration };
