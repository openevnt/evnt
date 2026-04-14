import type { EventData, PartialDate } from "@evnt/schema";
import { PartialDateUtil } from "@evnt/partial-date";
import { TranslationsUtil } from "@evnt/translations";
import ICAL from "ical.js";

export const convertFromVEvent = (
	vevent: ICAL.Component,
	{
		language = "en",
	}: {
		language?: string;
	} = {},
): EventData => {
	const event = new ICAL.Event(vevent);

	const eventData: EventData = {
		v: "0.1",
		name: { [language]: event.summary || "" },
		instances: [],
		venues: [],
		components: [],
	};

	for (let loc of event.component.getAllProperties("location")) {
		const location = loc.getFirstValue();
		if (typeof location == "string") eventData.venues!.push({
			id: `icalendar:${eventData.venues!.length}`,
			name: { [language]: location },
			$type: "directory.evnt.venue.unknown",
		});
	}

	const icalTimeToPartialDate = (icalTime: ICAL.Time): PartialDate => {
		if (icalTime.isDate) {
			return PartialDateUtil.format({
				precision: "day",
				year: icalTime.year,
				month: icalTime.month,
				day: icalTime.day,
				timezone: icalTime.zone.tzid,
			});
		} else {
			return PartialDateUtil.format({
				precision: "time",
				year: icalTime.year,
				month: icalTime.month,
				day: icalTime.day,
				hour: icalTime.hour,
				minute: icalTime.minute,
				timezone: icalTime.zone.tzid,
			});
		}
	};

	if (event.startDate) {
		const startDate = event.startDate
		eventData.instances!.push({
			venueIds: eventData.venues?.map(({ id }) => id) || [],
			start: icalTimeToPartialDate(startDate),
			end: event.endDate ? icalTimeToPartialDate(event.endDate) : undefined,
		});
	}

	if (event.description) {
		eventData.components!.push({
			$type: "app.bsky.richtext",
			description: { text: event.description, facets: [] },
		});
	}

	for (let uri of event.component.getAllProperties("url")) {
		const url = uri.getFirstValue();
		if (typeof url == "string") eventData.components!.push({
			$type: "directory.evnt.component.link",
			url,
		});
	}

	return eventData;
};

export const convertToVEvent = (data: EventData, {
	language = "en",
}: {
	language?: string;
} = {}) => {
	const vevent = new ICAL.Component("vevent");
	const event = new ICAL.Event(vevent);

	event.summary = TranslationsUtil.translate(data.name, [language]);

	const partialDateAsICALTime = (date: PartialDate) => {
		const parsed = PartialDateUtil.parse(date);
		return new ICAL.Time({
			year: parsed.year,
			month: "month" in parsed ? parsed.month : 1,
			day: "day" in parsed ? parsed.day : 1,
			hour: "hour" in parsed ? parsed.hour : 0,
			minute: "minute" in parsed ? parsed.minute : 0,
			isDate: parsed.precision !== "time",
		}, ICAL.Timezone.utcTimezone);
	};

	let startDate: ICAL.Time | null = null;
	let endDate: ICAL.Time | null = null;
	for (const instance of data.instances ?? []) {
		if (instance.start) {
			const instanceStartDate = partialDateAsICALTime(instance.start);
			if (startDate === null || instanceStartDate.compare(startDate) < 0) {
				startDate = instanceStartDate;
			}
		}

		if (instance.end) {
			const instanceEndDate = partialDateAsICALTime(instance.end);
			if (endDate === null || instanceEndDate.compare(endDate) > 0) {
				endDate = instanceEndDate;
			}
		}
	}

	if (startDate !== null) event.startDate = startDate;
	if (endDate !== null) event.endDate = endDate;

	return vevent;
};
