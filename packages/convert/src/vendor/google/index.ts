import type { EventData, PartialDate, Translations } from "@evnt/schema";
import { UtilPartialDate } from "@evnt/schema/utils";
import { calendar_v3 } from "googleapis";

export const convertFromGoogle = (data: calendar_v3.Schema$Event, {
	assumeLanguage = "en",
}: {
	assumeLanguage?: string;
} = {}): EventData => {
	const inverseT = (str: string | null | undefined): Translations | undefined => {
		if (!str) return undefined;
		return {
			[assumeLanguage]: str,
		};
	}

	let venues: EventData["venues"] = [];

	if (data.location) {
		// string ??? what tf do we do here
		venues.push({
			id: "google-calendar-location",
			type: "physical", // hm
			name: {
				en: data.location,
			},
		});
		// better than nothing i guess
	}

	const asPartialDate = ({
		date,
		dateTime,
		timeZone,
	}: { dateTime?: string | null; timeZone?: string | null; date?: string | null; }): PartialDate => {
		if (dateTime && !timeZone) return UtilPartialDate.fromDate(new Date(dateTime));
		if (dateTime && timeZone) {
			return UtilPartialDate.fromDate(new Date(
				new Date(dateTime).toLocaleString("en-US", { timeZone }),
			));
		}
		return date as PartialDate;
	};

	return {
		v: 0,
		name: inverseT(data.summary) || { [assumeLanguage]: "No Title" },
		description: inverseT(data.description),
		instances: [
			{
				venueIds: venues.map(v => v.id),
				start: asPartialDate(data.start || {}),
				end: asPartialDate(data.end || {}),
			},
		],
		venues,
	};
}
