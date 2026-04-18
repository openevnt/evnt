import type { EventData, EventInstance, Venue, VenueType } from "@evnt/schema";
import type { EventQueryResult } from "../../db/useEventQuery";
import { TranslationsUtil } from "@evnt/translations";
import { PartialDateUtil } from "@evnt/partial-date";

export type EventFilter = (event: EventData) => boolean;

export const EventFilters = {
	None: () => true,

	SomeInstances: (predicate: (instance: EventInstance) => boolean): EventFilter => (data) => data.instances?.some(predicate) || false,
	AllInstances: (predicate: (instance: EventInstance) => boolean): EventFilter => (data) => data.instances?.every(predicate) || false,
	SomeVenues: (predicate: (venue: Venue) => boolean): EventFilter => (data) => data.venues?.some(predicate) || false,
	AllVenues: (predicate: (venue: Venue) => boolean): EventFilter => (data) => data.venues?.every(predicate) || false,

	Search: (search: string): EventFilter => {
		return (data: EventData) => {
			return [data.name ?? {}].some(translation => !!TranslationsUtil.search(translation, search));
		};
	},

	HasVenueType: (venueType: VenueType): EventFilter => (data) => data.venues?.some(venue => venue.$type === venueType) || false,

	BeforeDate: (instant: Temporal.Instant): EventFilter => {
		return EventFilters.SomeInstances((instance) => {
			if (!instance.start) return false;
			const instanceDate = PartialDateUtil.toInstant(instance.start, "low");
			return Temporal.Instant.compare(instanceDate, instant) < 0;
		});
	},

	AfterDate: (instant: Temporal.Instant): EventFilter => {
		return EventFilters.SomeInstances((instance) => {
			if (!instance.start) return false;
			const instanceDate = PartialDateUtil.toInstant(instance.start, "high");
			return Temporal.Instant.compare(instanceDate, instant) > 0;
		});
	},
} as const;

export const applyEventFilters = (queries: EventQueryResult[], filters: EventFilter[]): EventQueryResult[] => {
	return queries.filter(({ query }) => {
		if (!query.data || !query.data.data) return true;
		return filters.every((filter) => filter(query.data.data!));
	});
};
