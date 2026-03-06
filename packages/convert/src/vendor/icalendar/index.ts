import type { EventData, PartialDate } from "@evnt/schema";
import { UtilPartialDate, UtilTranslations } from "@evnt/schema/utils";
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
		v: 0,
		name: { [language]: event.summary || "" },
		description: event.description ? { [language]: event.description } : undefined,
		instances: [],
		venues: [],
		components: [],
	};

	for (let loc of event.component.getAllProperties("location")) {
		const location = loc.getFirstValue();
		if (typeof location == "string") eventData.venues!.push({
			id: `icalendar:${eventData.venues!.length}`,
			name: { [language]: location },
			type: "unknown",
		});
	}

	if (event.startDate) {
		eventData.instances!.push({
			venueIds: eventData.venues?.map(({ id }) => id) || [],
			start: UtilPartialDate.fromDate(event.startDate.toJSDate()),
			end: event.endDate ? UtilPartialDate.fromDate(event.endDate.toJSDate()) : undefined,
		});
	}

	for (let uri of event.component.getAllProperties("url")) {
		const url = uri.getFirstValue();
		if (typeof url == "string") eventData.components!.push({
			type: "link",
			data: {
				url,
			},
		});
	}

	return eventData;
};

export const convertToVEvent = (data: EventData, {
	language = "en",
}: {
	language?: string;
} = {}) => {
	const t = UtilTranslations.createTranslator(language);

	const vevent = new ICAL.Component("vevent");
	const event = new ICAL.Event(vevent);

	event.summary = t(data.name);
	if (data.description) event.description = t(data.description);

	const partialDateAsICALTime = (date: PartialDate) => {
		const [year, month, day, hour, minute] = date.split(/\D/).map(Number);
		return new ICAL.Time({
			year,
			month,
			day,
			hour,
			minute,
			isDate: !UtilPartialDate.hasTime(date),
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
