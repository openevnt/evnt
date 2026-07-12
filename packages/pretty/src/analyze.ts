import type { EventInstance, PartialDate } from "@evnt/types";
import { PartialDateUtil } from "@evnt/partial-date";
import type { DateGroup, DateList, DateRange, SingleDate, TimeSlot } from "./types.js";

// == Helpers ==============================================

const hasDay = (pd: PartialDate) => PartialDateUtil.has(pd, "day");
const hasTime = (pd: PartialDate) => PartialDateUtil.has(pd, "time");

const parseFields = (pd: PartialDate): PartialDate.Parsed.Fields =>
	PartialDateUtil.parse(pd) as PartialDate.Parsed.Fields;

const isSameDay = (a?: PartialDate, b?: PartialDate): boolean => {
	if (!a || !b || !hasDay(a) || !hasDay(b)) return false;
	const pa = parseFields(a);
	const pb = parseFields(b);
	return pa.year === pb.year && pa.month === pb.month && pa.day === pb.day;
};

const isNextDay = (a: PartialDate, b: PartialDate): boolean => {
	if (!hasDay(a) || !hasDay(b)) return false;
	const pa = parseFields(a);
	const pb = parseFields(b);
	const aMs = Date.UTC(pa.year, pa.month - 1, pa.day);
	const bMs = Date.UTC(pb.year, pb.month - 1, pb.day);
	return bMs - aMs === 86_400_000;
};

const comparePartialDate = (a: PartialDate, b: PartialDate): number => {
	const pa = parseFields(a);
	const pb = parseFields(b);
	if (pa.year !== pb.year) return pa.year - pb.year;
	if (pa.month !== pb.month) return pa.month - pb.month;
	if (pa.day !== pb.day) return pa.day - pb.day;
	if (pa.hour !== pb.hour) return pa.hour - pb.hour;
	return pa.minute - pb.minute;
};

interface DateEntry {
	start?: PartialDate;
	end?: PartialDate;
}

const timePart = (pd?: PartialDate): string => {
	if (!pd || !hasTime(pd)) return "";
	const parsed = PartialDateUtil.parse(pd);
	return parsed.precision === "time" ? `${parsed.hour}:${parsed.minute}` : "";
};

const getTimeKey = (entry: DateEntry): string => `${timePart(entry.start)}|${timePart(entry.end)}`;

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

const isConsecutiveRange = (days: PartialDate[]): boolean => {
	for (let i = 1; i < days.length; i++) {
		const prev = parseFields(days[i - 1]!);
		const curr = parseFields(days[i]!);
		const prevMs = Date.UTC(prev.year, prev.month - 1, prev.day);
		const currMs = Date.UTC(curr.year, curr.month - 1, curr.day);
		if (currMs - prevMs !== 86_400_000) return false;
	}
	return true;
};

interface MergedEntryGroup {
	entries: DateEntry[];
}

const mergeEntries = (entries: DateEntry[]): MergedEntryGroup[] => {
	const groups: MergedEntryGroup[] = [];

	for (const entry of entries) {
		const timeKey = getTimeKey(entry);
		const last = groups[groups.length - 1];

		if (last && last.entries.length > 0) {
			const lastEntry = last.entries[last.entries.length - 1]!;
			const lastStart = lastEntry.start;
			const thisStart = entry.start;

			const isConsecutive =
				lastStart && thisStart && hasDay(lastStart) && hasDay(thisStart)
					? isNextDay(roundToDay(lastStart), roundToDay(thisStart))
					: false;

			const samePattern = last.entries.every((e) => getTimeKey(e) === timeKey);

			if (isConsecutive && samePattern) {
				last.entries.push(entry);
				continue;
			}

			if (samePattern) {
				last.entries.push(entry);
				continue;
			}
		}

		groups.push({ entries: [entry] });
	}

	return groups;
};

const toDateShape = (entries: DateEntry[]): SingleDate | DateRange | DateList => {
	if (entries.length === 1) {
		const e = entries[0]!;
		if (e.start && e.end && !isSameDay(e.start, e.end)) {
			return { type: "range", from: e.start, to: e.end };
		}
		return { type: "single", date: e.start ?? e.end! };
	}

	const allDays: PartialDate[] = [];
	for (const e of entries) {
		if (e.start && hasDay(e.start)) allDays.push(roundToDay(e.start));
	}

	if (allDays.length >= 2 && isConsecutiveRange(allDays)) {
		return { type: "range", from: allDays[0]!, to: allDays[allDays.length - 1]! };
	}

	return { type: "list", dates: allDays };
};

const dedupTimeRanges = (entries: DateEntry[]): TimeSlot[] => {
	const seen = new Set<string>();
	const ranges: TimeSlot[] = [];

	for (const entry of entries) {
		const key = getTimeKey(entry);
		if (seen.has(key)) continue;
		seen.add(key);

		const range: TimeSlot = {};
		if (entry.start && hasTime(entry.start)) range.start = entry.start;
		if (entry.end && hasTime(entry.end)) range.end = entry.end;
		if (range.start || range.end) ranges.push(range);
	}

	return ranges;
};

// == Grouping =============================================

export const groupDates = (instances: EventInstance[], group: boolean): DateGroup[] => {
	const byVenue = new Map<string, EventInstance[]>();
	for (const inst of instances) {
		const key = JSON.stringify([...inst.venueIds].sort());
		const group = byVenue.get(key) ?? [];
		group.push(inst);
		byVenue.set(key, group);
	}

	const groups: DateGroup[] = [];

	for (const [, insts] of byVenue) {
		// All instances in this group share the same venueIds.
		const venueIds = [...(insts[0]?.venueIds ?? [])].sort();

		const entries: DateEntry[] = insts
			.map((i) => ({ start: i.start, end: i.end }))
			.filter((e) => e.start || e.end)
			.sort((a, b) => {
				if (!a.start && !b.start) return 0;
				if (!a.start) return -1;
				if (!b.start) return 1;
				return comparePartialDate(a.start, b.start);
			});

		if (entries.length === 0) continue;

		if (group) {
			const consolidated = mergeEntries(entries);
			for (const g of consolidated) {
				groups.push({
					dates: toDateShape(g.entries),
					times: dedupTimeRanges(g.entries),
					venueIds,
				});
			}
		} else {
			// No grouping: render every instance as its own date line.
			for (const e of entries) {
				groups.push({
					dates: toDateShape([e]),
					times: dedupTimeRanges([e]),
					venueIds,
				});
			}
		}
	}

	return groups;
};
