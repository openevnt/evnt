import type { OpenEvnt, AnyComponent, EventInstance, PartialDate } from "@evnt/types";
import { PartialDateUtil } from "@evnt/partial-date";
import { TranslationsUtil } from "@evnt/translations";
import type { AnalyzeConfig } from "./analyze-config";
import type {
	AnalyzedEvent,
	AnalyzedStatus,
	ActivitySummary,
	DateEntry,
	DateGroup,
	LinkSummary,
	VenueSummary,
} from "./types";

// == Helpers ==============================================

const hasDay = (pd: PartialDate) => PartialDateUtil.has(pd, "day");
const hasTime = (pd: PartialDate) => PartialDateUtil.has(pd, "time");

const parseFields = (pd: PartialDate): PartialDate.Parsed.Fields =>
	PartialDateUtil.parse(pd) as PartialDate.Parsed.Fields;

const comparePartialDate = (a: PartialDate, b: PartialDate): number => {
	const pa = parseFields(a);
	const pb = parseFields(b);
	if (pa.year !== pb.year) return pa.year - pb.year;
	if (pa.month !== pb.month) return pa.month - pb.month;
	if (pa.day !== pb.day) return pa.day - pb.day;
	if (pa.hour !== pb.hour) return pa.hour - pb.hour;
	return pa.minute - pb.minute;
};

/** True when the instance is a same-day event (start and end on same calendar day). */
const isSameDay = (a?: PartialDate, b?: PartialDate): boolean => {
	if (!a || !b || !hasDay(a) || !hasDay(b)) return false;
	const pa = parseFields(a);
	const pb = parseFields(b);
	return pa.year === pb.year && pa.month === pb.month && pa.day === pb.day;
};

/** True when b is the calendar day immediately after a. */
const isNextDay = (a: PartialDate, b: PartialDate): boolean => {
	if (!hasDay(a) || !hasDay(b)) return false;
	const pa = parseFields(a);
	const pb = parseFields(b);
	const aMs = Date.UTC(pa.year, pa.month - 1, pa.day);
	const bMs = Date.UTC(pb.year, pb.month - 1, pb.day);
	return bMs - aMs === 86_400_000;
};

const getTimeKey = (entry: DateEntry): string => {
	const startTime = entry.start && hasTime(entry.start) ? PartialDateUtil.parse(entry.start).precision === "time" ? entry.start : "" : "";
	const endTime = entry.end && hasTime(entry.end) ? PartialDateUtil.parse(entry.end).precision === "time" ? entry.end : "" : "";
	return `${startTime}|${endTime}`;
};

const roundToDay = (pd: PartialDate): PartialDate => {
	if (!hasDay(pd)) return pd;
	const p = parseFields(pd);
	return PartialDateUtil.format({
		year: p.year,
		month: p.month ?? 1,
		day: p.day ?? 1,
		timezone: p.timezone,
		precision: "day",
	}) as PartialDate;
};

// == Analyzer =============================================

export const analyzeEvent = (event: OpenEvnt, config: AnalyzeConfig): AnalyzedEvent => {
	const name = TranslationsUtil.translate(event.name, [config.language]);
	const label = event.label ? TranslationsUtil.translate(event.label, [config.language]) : undefined;
	const status = event.status ? analyzeStatus(event.status) : undefined;
	const dates = groupDates(event.instances ?? [], config.mergeInstances);
	const venues = (event.venues ?? []).map(v => summarizeVenue(v, config.language));
	const activities = summarizeActivities(event.instances ?? [], config.language);
	const links = summarizeLinks(event.components ?? [], config.language);
	const description = extractDescription(event.components ?? []);

	return { name, label, status, dates, venues, activities, links, description };
};

// == Status ===============================================

const statusTexts: Record<string, string> = {
	planned: "Planned",
	uncertain: "Uncertain",
	postponed: "Postponed",
	cancelled: "Cancelled",
	suspended: "Suspended",
};

const analyzeStatus = (status: string): AnalyzedStatus => ({
	status: status as AnalyzedStatus["status"],
	text: statusTexts[status] ?? status,
});

// == Date grouping ========================================

export const groupDates = (instances: EventInstance[], merge: boolean): DateGroup[] => {
	// Group instances by their venueId signature (sorted JSON).
	const byVenue = new Map<string, EventInstance[]>();
	for (const inst of instances) {
		const key = JSON.stringify([...inst.venueIds].sort());
		const group = byVenue.get(key) ?? [];
		group.push(inst);
		byVenue.set(key, group);
	}

	const groups: DateGroup[] = [];

	for (const [, insts] of byVenue) {
		const entries: DateEntry[] = insts
			.map(i => ({ start: i.start, end: i.end }))
			.filter(e => e.start || e.end)
			.sort((a, b) => {
				if (!a.start && !b.start) return 0;
				if (!a.start) return -1;
				if (!b.start) return 1;
				return comparePartialDate(a.start, b.start);
			});

		if (entries.length === 0) continue;

		if (merge) {
			// Group consecutive days with the same time pattern.
			const consolidated = mergeEntries(entries);
			for (const group of consolidated) {
				groups.push({
					entries: group.entries,
					timeRanges: group.timeRanges,
				});
			}
		} else {
			groups.push({
				entries,
				timeRanges: dedupTimeRanges(entries),
			});
		}
	}

	return groups;
};

interface MergedEntryGroup {
	entries: DateEntry[];
	timeRanges: { start?: PartialDate; end?: PartialDate }[];
}

/** Merge consecutive-day entries that share the same time pattern. */
const mergeEntries = (entries: DateEntry[]): MergedEntryGroup[] => {
	const groups: MergedEntryGroup[] = [];

	for (const entry of entries) {
		const timeKey = getTimeKey(entry);
		const last = groups[groups.length - 1];

		if (last && last.entries.length > 0) {
			const lastEntry = last.entries[last.entries.length - 1]!;
			const lastStart = lastEntry.start;
			const thisStart = entry.start;

			// Check consecutive: last day's calendar date → this day
			const isConsecutive = lastStart && thisStart && hasDay(lastStart) && hasDay(thisStart)
				? isNextDay(roundToDay(lastStart), roundToDay(thisStart))
				: false;

			// Check same time pattern: all entries in this group share the same timeKey
			const samePattern = last.entries.every(e => getTimeKey(e) === timeKey);

			if (isConsecutive && samePattern) {
				last.entries.push(entry);
				continue;
			}

			// Same time pattern but non-consecutive? Still add to same group if compact
			// (this handles "Jul 1, 8, 15" pattern)
			if (samePattern) {
				last.entries.push(entry);
				continue;
			}
		}

		groups.push({
			entries: [entry],
			timeRanges: dedupTimeRanges([entry]),
		});
	}

	// Recompute timeRanges for merged groups (they all share the same pattern by construction).
	for (const group of groups) {
		group.timeRanges = dedupTimeRanges(group.entries);
	}

	return groups;
};

const dedupTimeRanges = (entries: DateEntry[]): { start?: PartialDate; end?: PartialDate }[] => {
	const seen = new Set<string>();
	const ranges: { start?: PartialDate; end?: PartialDate }[] = [];

	for (const entry of entries) {
		const key = getTimeKey(entry);
		if (seen.has(key)) continue;
		seen.add(key);

		const range: { start?: PartialDate; end?: PartialDate } = {};
		if (entry.start && hasTime(entry.start)) range.start = entry.start;
		if (entry.end && hasTime(entry.end)) range.end = entry.end;
		if (range.start || range.end) ranges.push(range);
	}

	return ranges;
};

// == Venue summary ========================================

const summarizeVenue = (venue: import("@evnt/types").Venue, language: string): VenueSummary => {
	const name = TranslationsUtil.translate(venue.name, [language]);

	switch (venue.$type) {
		case "directory.evnt.venue.physical": {
			const detail = venue.address
				? [venue.address.addr, venue.address.countryCode].filter(Boolean).join(", ")
				: undefined;
			return { id: venue.id, name, type: "physical", detail };
		}
		case "directory.evnt.venue.online":
			return { id: venue.id, name, type: "online", detail: venue.url };
		default:
			return { id: venue.id, name, type: "unknown" };
	}
};

// == Activities ===========================================

const summarizeActivities = (instances: EventInstance[], language: string): ActivitySummary[] => {
	const activities: ActivitySummary[] = [];
	for (const inst of instances) {
		for (const act of inst.activities ?? []) {
			activities.push({
				name: TranslationsUtil.translate(act.name, [language]),
				day: act.slot?.day,
				time: act.slot?.time,
				duration: act.slot?.duration,
			});
		}
	}
	return activities;
};

// == Links ================================================

const summarizeLinks = (components: AnyComponent[], language: string): LinkSummary[] => {
	const links: LinkSummary[] = [];
	for (const comp of components) {
		if (comp.$type === "directory.evnt.component.link" || comp.$type === "directory.evnt.component.source") {
			const c = comp as { url: string; name?: Record<string, string> };
			links.push({
				url: c.url,
				name: c.name ? TranslationsUtil.translate(c.name, [language]) : undefined,
			});
		}
	}
	return links;
};

// == Description ==========================================

const extractDescription = (components: AnyComponent[]): string | undefined => {
	for (const comp of components) {
		if (comp.$type === "directory.evnt.component.markdown") {
			return (comp as { content: string }).content;
		}
		if (comp.$type === "app.bsky.richtext") {
			return (comp as { text: string }).text;
		}
	}
	return undefined;
};
