import type { EventData, EventInstance, PartialDate, Venue } from "@evnt/schema";
import type { Range, SnippetLabel, TSnippet } from "./snippet";
import { TranslationsUtil } from "@evnt/translations";
import { PartialDateUtil } from "@evnt/partial-date";

const twoDigits = (value: number): string => String(value).padStart(2, "0");
const hasDay = (pd: PartialDate): boolean => PartialDateUtil.has(pd, "day");
const hasTime = (pd: PartialDate): boolean => PartialDateUtil.has(pd, "time");
const parseFields = (pd: PartialDate): PartialDate.Parsed.Fields => {
	const parsed = PartialDateUtil.parse(pd);
	return {
		year: parsed.year,
		month: "month" in parsed ? parsed.month : 1,
		day: "day" in parsed ? parsed.day : 1,
		hour: "hour" in parsed ? parsed.hour : 0,
		minute: "minute" in parsed ? parsed.minute : 0,
		timezone: parsed.timezone,
	};
};
const getTimePart = (pd: PartialDate): string | undefined => {
	const parsed = PartialDateUtil.parse(pd);
	if (parsed.precision !== "time") return undefined;
	return `${twoDigits(parsed.hour)}:${twoDigits(parsed.minute)}`;
};
const getDatePart = (pd: PartialDate): PartialDate.YearMonthDay => {
	const parsed = parseFields(pd);
	return PartialDateUtil.format({
		year: parsed.year,
		month: parsed.month,
		day: parsed.day,
		timezone: parsed.timezone,
		precision: "day",
	}) as PartialDate.YearMonthDay;
};
const asDay = (pd: PartialDate.YearMonthDayTime): PartialDate.YearMonthDay => getDatePart(pd);
const comparePartialDate = (a: PartialDate, b: PartialDate): number => {
	const pa = parseFields(a);
	const pb = parseFields(b);
	if (pa.year !== pb.year) return pa.year - pb.year;
	if (pa.month !== pb.month) return pa.month - pb.month;
	if (pa.day !== pb.day) return pa.day - pb.day;
	if (pa.hour !== pb.hour) return pa.hour - pb.hour;
	return pa.minute - pb.minute;
};
const isSameDayRange = (instance: EventInstance): boolean => {
	if (!instance.start || !instance.end || !hasDay(instance.start) || !hasDay(instance.end)) return false;
	const start = parseFields(instance.start);
	const end = parseFields(instance.end);
	return start.year === end.year && start.month === end.month && start.day === end.day;
};
const isNextDay = ({ start, end }: Range<PartialDate.YearMonthDay>): boolean => {
	const startParsed = parseFields(start);
	const endParsed = parseFields(end);
	const startMs = Date.UTC(startParsed.year, startParsed.month - 1, startParsed.day);
	const endMs = Date.UTC(endParsed.year, endParsed.month - 1, endParsed.day);
	return endMs - startMs === 24 * 60 * 60 * 1000;
};

export const snippetEvent = (data: EventData, opts?: {
	maxVenues?: number;
	maxInstances?: number;
	maxGroups?: number;
	venueDetails?: boolean;
}): TSnippet[] => {
	const snippets: TSnippet[] = [];

	let groupedInstances = data.instances?.reduce((acc, instance) => {
		const key = JSON.stringify(instance.venueIds.sort());
		acc[key] = acc[key] || [];
		acc[key].push(instance);
		return acc;
	}, {} as Record<string, EventInstance[]>);

	const snippetVenueAmount = (venueIds: string[]): TSnippet => {
		let hasPhysical = false;
		let hasOnline = false;
		for (let venueId of venueIds) {
			const venue = data.venues?.find(v => v.id === venueId);
			if (!venue) continue;
			if (venue.$type === "directory.evnt.venue.physical") hasPhysical = true;
			if (venue.$type === "directory.evnt.venue.online") hasOnline = true;
		};

		return {
			icon: hasPhysical && hasOnline ? "venue-mixed" : hasPhysical ? "venue-physical" : (hasOnline ? "venue-online" : "venue-unknown"),
			label: {
				type: "translations",
				value: {
					en: `${venueIds.length} locations`,
				},
			},
		};
	};

	if (Object.keys(groupedInstances || {}).length > (opts?.maxGroups ?? Infinity)) {
		let key = JSON.stringify(data.venues?.map(v => v.id).sort() ?? []);
		groupedInstances = {
			[key]: data.instances ?? [],
		};
	}

	for (const [venueIdsJson, instances] of Object.entries(groupedInstances ?? {})) {
		const venueIds = JSON.parse(venueIdsJson) as string[];

		if (venueIds.length > (opts?.maxVenues ?? Infinity)) {
			snippets.push(snippetVenueAmount(venueIds));
		} else {
			for (const venueId of venueIds) {
				const venue = data.venues?.find(v => v.id === venueId);
				if (!venue) continue;
				snippets.push(snippetVenue(venue, opts?.venueDetails));
			}
		}

		snippets.push(...snippetInstances(instances, opts?.maxInstances));
	}

	return snippets;
};

export const snippetVenue = (venue: Venue, detailed?: boolean): TSnippet => {
	let sublabel: SnippetLabel | undefined = undefined;

	if (detailed) {
		if (venue.$type === "directory.evnt.venue.physical" && venue.address) {
			sublabel = { type: "address", value: venue.address };
		} else if (venue.$type === "directory.evnt.venue.online" && venue.url) {
			sublabel = { type: "external-link", url: venue.url };
		} else if (venue.$type === "directory.evnt.venue.unknown") {
			sublabel = undefined;
		}
	}

	return {
		icon: venue.$type === "directory.evnt.venue.physical" ? "venue-physical" : venue.$type === "directory.evnt.venue.online" ? "venue-online" : "venue-unknown",
		label: TranslationsUtil.isEmpty(venue.name) ? { type: "placeholder", hint: "unnamed" } : { type: "translations", value: venue.name },
		sublabel,
	};
};

export const venueGoogleMapsLink = (venue: Venue): string | null => {
	if (venue.$type !== "directory.evnt.venue.physical") return null;
	// if (venue.googleMapsPlaceId) return `https://www.google.com/maps/place/?${new URLSearchParams({ q: `place_id:${venue.googleMapsPlaceId}` }).toString()}`;
	if (venue.coordinates) return `https://www.google.com/maps/search/?${new URLSearchParams({ api: "1", query: `${venue.coordinates.lat},${venue.coordinates.lng}` }).toString()}`;
	if (venue.address?.addr) return `https://www.google.com/maps/search/?${new URLSearchParams({ api: "1", query: venue.address.addr }).toString()}`;
	return null;
}

export const venueOpenStreetMapsLink = (venue: Venue): string | null => {
	if (venue.$type !== "directory.evnt.venue.physical") return null;
	if (venue.coordinates) return `https://www.openstreetmap.org/?mlat=${venue.coordinates.lat}&mlon=${venue.coordinates.lng}#map=18/${venue.coordinates.lat}/${venue.coordinates.lng}`;
	if (venue.address?.addr) return `https://www.openstreetmap.org/search?${new URLSearchParams({ query: venue.address.addr }).toString()}`;
	return null;
}

export const snippetInstances = (instances: EventInstance[], maxInstances?: number): TSnippet[] => {
	let snippets: TSnippet[] = [];

	// Group instances by date (the ones that have the same time will be grouped together)
	// Consecutive days will also be grouped together if they have the same times-per-day
	// - event that starts at 9am and ends at 5pm each day
	// - event that occurs between 11-14 and 16-18 on 3 days in a row -> will be grouped together as 3 consecutive days with 2 time ranges per day

	const isSameDay = (instance: EventInstance): boolean => {
		const a = PartialDateUtil.parse(instance.start!);
		const b = PartialDateUtil.parse(instance.end!);
		return (a.precision === "day" || a.precision === "time") && (b.precision === "day" || b.precision === "time") && a.year === b.year && a.month === b.month && a.day === b.day;
	}

	const groupedByDate: Record<PartialDate.YearMonthDay, EventInstance[]> = {};
	const ungroupedByDate: EventInstance[] = [];
	for (const instance of instances) {
		if (instance.start && PartialDateUtil.has(instance.start, "day") && (!instance.end || isSameDay(instance))) {
			const { year, month, day } = PartialDateUtil.parse(instance.start) as PartialDate.Parsed.YearMonthDay | PartialDate.Parsed.YearMonthDayTime;
			const dayValue = PartialDateUtil.format({ year, month, day, timezone: "UTC", precision: "day" }) as PartialDate.YearMonthDay; // !
			groupedByDate[dayValue] ||= [];
			groupedByDate[dayValue].push(instance);
		} else {
			ungroupedByDate.push(instance);
		}
	}

	// Check for consecutive days with same time and group them together
	const groupedByConsecutiveDays: {
		range: Range<PartialDate.YearMonthDay>;
		instances: EventInstance[];
	}[] = [];

	const hashTimes = (instances: EventInstance[]) => instances.map(i => [
		i.start,
		i.end,
	].filter((s): s is PartialDate.YearMonthDayTime => !!s && hasTime(s)).map(s => getTimePart(s)).join("-"))
		.sort()
		.reduce((acc, time) => acc.includes(time) ? acc : [...acc, time], [] as string[])
		.join("|");

	for (const [day, instances] of Object.entries(groupedByDate) as [PartialDate.YearMonthDay, EventInstance[]][]) {
		// Try to find an existing group that this day can be added to
		let addedToGroup = false;
		for (const group of groupedByConsecutiveDays) {
			if (
				isNextDay({ start: group.range.end, end: day })
				&& (hashTimes(instances) === hashTimes(group.instances))
			) {
				group.range.end = day;
				group.instances.push(...instances);
				addedToGroup = true;
			}
		}

		// If it wasn't added to an existing group, create a new group
		if (!addedToGroup) {
			groupedByConsecutiveDays.push({
				range: { start: day, end: day },
				instances,
			});
		}
	}


	// Create snippets for grouped consecutive days
	for (const group of groupedByConsecutiveDays) {
		if (group.instances.length === 0) continue;
		const deduplicatedTimeRanges = Array.from(new Set(group.instances.map(i => {
			const hasStartTime = i.start && hasTime(i.start);
			const hasEndTime = i.end && hasTime(i.end);
			if (hasStartTime && hasEndTime) {
				return `range:${(i.start as PartialDate.YearMonthDayTime)}|${(i.end as PartialDate.YearMonthDayTime)}`;
			} else if (hasStartTime) {
				return `time:${(i.start as PartialDate.YearMonthDayTime)}`;
			}
			return "none";
		}))).map(tr => {
			if (tr.startsWith("range:")) {
				const [startTime, endTime] = tr.replace("range:", "").split("|") as [PartialDate.YearMonthDayTime, PartialDate.YearMonthDayTime];
				return {
					type: "time-range",
					value: {
						start: startTime,
						end: endTime,
					},
				} as SnippetLabel;
			} else if (tr.startsWith("time:")) {
				const time = tr.replace("time:", "");
				return {
					type: "time",
					value: time,
				} as SnippetLabel;
			}
			return null;
		}).filter((tr): tr is SnippetLabel => !!tr);

		snippets.push({
			icon: "calendar",
			label: {
				type: "date-time-range",
				value: {
					start: group.range.start,
					end: group.range.end
				},
			},
		});

		for (const timeRange of deduplicatedTimeRanges) {
			snippets.push({
				icon: "clock",
				label: timeRange,
			});
		}
	}

	// Rest of em
	for (const instance of ungroupedByDate) {
		snippets.push(...snippetInstance(instance));
	}

	if (maxInstances && snippets.length > maxInstances) {
		const dates = instances.flatMap(i => [i.start, i.end]).filter((d): d is PartialDate => !!d).sort((a, b) => comparePartialDate(a, b));
		const earliest = dates[0];
		const latest = dates[dates.length - 1];

		if (earliest) snippets = [
			{
				icon: "calendar",
				label: {
					type: "date-time-range",
					value: {
						start: earliest,
						end: latest ?? earliest,
					}
				}
			}
		];
	}

	return snippets;
};

export const snippetInstance = (instance: EventInstance): TSnippet[] => {
	const snippets: TSnippet[] = [];

	if (instance.start && instance.end) {
		const startHasDay = hasDay(instance.start);
		const endHasDay = hasDay(instance.end);
		const startHasTime = hasTime(instance.start);
		const endHasTime = hasTime(instance.end);

		const singleDay = startHasDay && endHasDay && isSameDayRange(instance);
		const bothSameTime = startHasTime && endHasTime && getTimePart(instance.start) === getTimePart(instance.end);

		if (singleDay && bothSameTime) {
			snippets.push({
				icon: "calendar",
				label: { type: "date-time", value: instance.start },
			})
		} else if (singleDay && startHasTime && endHasTime) {
			snippets.push({
				icon: "calendar",
				label: { type: "date-time", value: getDatePart(instance.start) },
			});
			snippets.push({
				icon: "clock",
				label: {
					type: "time-range", value: {
						start: instance.start as PartialDate.YearMonthDayTime,
						end: instance.end as PartialDate.YearMonthDayTime,
					}
				},
			});
		} else if (singleDay && startHasTime && !endHasTime) {
			snippets.push({
				icon: "calendar",
				label: { type: "date-time", value: getDatePart(instance.start) },
			});
			snippets.push({
				icon: "clock",
				label: {
					type: "time",
					value: instance.start as PartialDate.YearMonthDayTime,
				},
			});
		} else {
			snippets.push({
				icon: "calendar",
				label: { type: "date-time-range", value: { start: instance.start, end: instance.end } },
			});
		}
	} else if (instance.start) {
		snippets.push({
			icon: "calendar",
			label: { type: "date-time", value: instance.start },
		});
	} else {

	}

	return snippets;
};
