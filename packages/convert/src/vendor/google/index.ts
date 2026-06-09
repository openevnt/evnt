import type { OpenEvnt, PartialDate, Translations } from "@evnt/types";
import { PartialDateUtil } from "@evnt/partial-date";
import { TranslationsUtil } from "@evnt/translations";
import { calendar_v3 } from "googleapis";

export const convertFromGoogle = (data: calendar_v3.Schema$Event, {
	assumeLanguage = "en",
}: {
	assumeLanguage?: string;
} = {}): OpenEvnt => {
	const inverseT = (str: string | null | undefined): Translations | undefined => {
		if (!str) return undefined;
		return {
			[assumeLanguage]: str,
		};
	}

	let venues: OpenEvnt["venues"] = [];

	if (data.location) {
		// string ??? what tf do we do here
		venues.push({
			id: "google-calendar-location",
			$type: "directory.evnt.venue.physical", // hm
			name: {
				en: data.location,
			},
		});
		// better than nothing i guess
	}

	const dateToPartialDate = (dateObj: Date): PartialDate => {
		const hour = dateObj.getUTCHours();
		const minute = dateObj.getUTCMinutes();
		const precision = (hour === 0 && minute === 0) ? "day" : "time";
		return PartialDateUtil.format({
			year: dateObj.getUTCFullYear(),
			month: dateObj.getUTCMonth() + 1,
			day: dateObj.getUTCDate(),
			hour,
			minute,
			timezone: "UTC",
			precision,
		} as PartialDate.Parsed);
	};

	const asPartialDate = ({
		date,
		dateTime,
		timeZone,
	}: { dateTime?: string | null; timeZone?: string | null; date?: string | null; }): PartialDate => {
		if (dateTime && !timeZone) return dateToPartialDate(new Date(dateTime));
		if (dateTime && timeZone) {
			return dateToPartialDate(new Date(
				new Date(dateTime).toLocaleString("en-US", { timeZone }),
			));
		}
		return date as PartialDate;
	};

	return {
		v: "0.1",
		name: inverseT(data.summary) || { [assumeLanguage]: "No Title" },
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
