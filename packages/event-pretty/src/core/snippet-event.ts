import type { EventData, EventInstance, PartialDate, Venue } from "@evnt/schema";
import type { Range, SnippetLabel, TSnippet } from "./snippet";
import { UtilPartialDate, UtilPartialDateRange, UtilTranslations } from "@evnt/schema/utils";

export const snippetEvent = (data: EventData, opts?: {
	maxVenues?: number;
	venueDetails?: boolean;
}): TSnippet[] => {
	const snippets: TSnippet[] = [];

	const groupedInstances = data.instances?.reduce((acc, instance) => {
		const key = JSON.stringify(instance.venueIds.sort());
		acc[key] = acc[key] || [];
		acc[key].push(instance);
		return acc;
	}, {} as Record<string, EventInstance[]>);

	for (const [venueIdsJson, instances] of Object.entries(groupedInstances ?? {})) {
		const venueIds = JSON.parse(venueIdsJson) as string[];

		if (venueIds.length > (opts?.maxVenues ?? Infinity)) {
			let hasPhysical = false;
			let hasOnline = false;
			for (let venueId of venueIds) {
				const venue = data.venues?.find(v => v.id === venueId);
				if (!venue) continue;
				if (venue.type === "physical") hasPhysical = true;
				if (venue.type === "online") hasOnline = true;
			};

			snippets.push({
				icon: hasPhysical && hasOnline ? "venue-mixed" : hasPhysical ? "venue-physical" : (hasOnline ? "venue-online" : "venue-unknown"),
				label: {
					type: "translations",
					value: {
						en: `${venueIds.length} venues`,
					},
				},
			});
		} else {
			for (const venueId of venueIds) {
				const venue = data.venues?.find(v => v.id === venueId);
				if (!venue) continue;
				snippets.push(snippetVenue(venue, opts?.venueDetails));
			}
		}


		snippets.push(...snippetInstances(instances));
	}

	return snippets;
};

export const snippetVenue = (venue: Venue, detailed?: boolean): TSnippet => {
	let sublabel: SnippetLabel | undefined = undefined;

	if (detailed) {
		if (venue.type === "physical" && venue.address) {
			sublabel = { type: "address", value: venue.address };
		} else if (venue.type === "online" && venue.url) {
			sublabel = { type: "external-link", url: venue.url };
		} else if (venue.type === "unknown") {
			sublabel = undefined;
		}
	}

	return {
		icon: venue.type === "physical" ? "venue-physical" : venue.type === "online" ? "venue-online" : "venue-unknown",
		label: UtilTranslations.isEmpty(venue.name) ? { type: "placeholder", hint: "unnamed" } : { type: "translations", value: venue.name },
		sublabel,
	};
};

export const venueGoogleMapsLink = (venue: Venue): string | null => {
	if (venue.type !== "physical") return null;
	if (venue.googleMapsPlaceId) return `https://www.google.com/maps/place/?${new URLSearchParams({ q: `place_id:${venue.googleMapsPlaceId}` }).toString()}`;
	if (venue.coordinates) return `https://www.google.com/maps/search/?${new URLSearchParams({ api: "1", query: `${venue.coordinates.lat},${venue.coordinates.lng}` }).toString()}`;
	if (venue.address?.addr) return `https://www.google.com/maps/search/?${new URLSearchParams({ api: "1", query: venue.address.addr }).toString()}`;
	return null;
}

export const venueOpenStreetMapsLink = (venue: Venue): string | null => {
	if (venue.type !== "physical") return null;
	if (venue.coordinates) return `https://www.openstreetmap.org/?mlat=${venue.coordinates.lat}&mlon=${venue.coordinates.lng}#map=18/${venue.coordinates.lat}/${venue.coordinates.lng}`;
	if (venue.address?.addr) return `https://www.openstreetmap.org/search?${new URLSearchParams({ query: venue.address.addr }).toString()}`;
	return null;
}

export const snippetInstances = (instances: EventInstance[]): TSnippet[] => {
	const snippets: TSnippet[] = [];

	// Group instances by date (the ones that have the same time will be grouped together)
	// Consecutive days will also be grouped together if they have the same times-per-day
	// - event that starts at 9am and ends at 5pm each day
	// - event that occurs between 11-14 and 16-18 on 3 days in a row -> will be grouped together as 3 consecutive days with 2 time ranges per day

	const groupedByDate: Record<PartialDate.Day, EventInstance[]> = {};
	const ungroupedByDate: EventInstance[] = [];
	for (const instance of instances) {
		if (instance.start && UtilPartialDate.hasDay(instance.start) && (!instance.end || UtilPartialDateRange.isSameDay(instance))) {
			const day = UtilPartialDate.asDay(instance.start);
			groupedByDate[day] ||= [];
			groupedByDate[day].push(instance);
		} else {
			ungroupedByDate.push(instance);
		}
	}

	// Check for consecutive days with same time and group them together
	const groupedByConsecutiveDays: {
		range: Range<PartialDate.Day>;
		instances: EventInstance[];
	}[] = [];

	const hashTimes = (instances: EventInstance[]) => instances.map(i => [
		i.start,
		i.end,
	].filter((s): s is PartialDate.Full => !!s && UtilPartialDate.hasTime(s)).map(s => UtilPartialDate.getTimePart(s)).join("-"))
		.sort()
		.reduce((acc, time) => acc.includes(time) ? acc : [...acc, time], [] as string[])
		.join("|");

	for (const [day, instances] of Object.entries(groupedByDate) as [PartialDate.Day, EventInstance[]][]) {
		// Try to find an existing group that this day can be added to
		let addedToGroup = false;
		for (const group of groupedByConsecutiveDays) {
			if (
				UtilPartialDateRange.isNextDay({ start: group.range.end, end: day })
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
			const hasStartTime = i.start && UtilPartialDate.hasTime(i.start);
			const hasEndTime = i.end && UtilPartialDate.hasTime(i.end);
			if (hasStartTime && hasEndTime) {
				return `range:${UtilPartialDate.getTimePart(i.start as PartialDate.Full)}-${UtilPartialDate.getTimePart(i.end as PartialDate.Full)}`;
			} else if (hasStartTime) {
				return `time:${UtilPartialDate.getTimePart(i.start as PartialDate.Full)}`;
			}
			return "none";
		}))).map(tr => {
			if (tr.startsWith("range:")) {
				const [startTime, endTime] = tr.replace("range:", "").split("-");
				return {
					type: "time-range",
					value: {
						start: { value: startTime },
						end: { value: endTime },
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

	return snippets;
};

export const snippetInstance = (instance: EventInstance): TSnippet[] => {
	const snippets: TSnippet[] = [];

	if (instance.start && instance.end) {
		const startHasDay = UtilPartialDate.hasDay(instance.start);
		const endHasDay = UtilPartialDate.hasDay(instance.end);
		const startHasTime = UtilPartialDate.hasTime(instance.start);
		const endHasTime = UtilPartialDate.hasTime(instance.end);

		const singleDay = startHasDay && endHasDay && UtilPartialDateRange.isSameDay(instance);
		const bothSameTime = startHasTime && endHasTime && UtilPartialDate.getTimePart(instance.start) === UtilPartialDate.getTimePart(instance.end);

		if (singleDay && bothSameTime) {
			snippets.push({
				icon: "calendar",
				label: { type: "date-time", value: instance.start },
			})
		} else if (singleDay && startHasTime && endHasTime) {
			snippets.push({
				icon: "calendar",
				label: { type: "date-time", value: UtilPartialDate.getDatePart(instance.start) },
			});
			snippets.push({
				icon: "clock",
				label: {
					type: "time-range", value: {
						start: { value: UtilPartialDate.getTimePart(instance.start)!, day: UtilPartialDate.asDay(instance.start! as PartialDate.Full) },
						end: { value: UtilPartialDate.getTimePart(instance.end)!, day: UtilPartialDate.asDay(instance.end! as PartialDate.Full) },
					}
				},
			});
		} else if (singleDay && startHasTime && !endHasTime) {
			snippets.push({
				icon: "calendar",
				label: { type: "date-time", value: UtilPartialDate.getDatePart(instance.start) },
			});
			snippets.push({
				icon: "clock",
				label: {
					type: "time",
					value: UtilPartialDate.getTimePart(instance.start)!,
					day: UtilPartialDate.asDay(instance.start! as PartialDate.Full),
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
