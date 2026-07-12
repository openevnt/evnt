import type { OpenEvnt, PartialDate } from "@evnt/types";
import { PartialDateUtil } from "@evnt/partial-date";
import { createTranslations } from "../utils/translations.js";
import { asNonEmptyString } from "../utils/text.js";
import { dateToPartialDate } from "../utils/date.js";
import type { FormatConverter, ConvertOptions } from "../types.js";

interface GoogleCalendarEvent {
	summary?: string | null;
	location?: string | null;
	start?: { date?: string | null; dateTime?: string | null; timeZone?: string | null } | null;
	end?: { date?: string | null; dateTime?: string | null; timeZone?: string | null } | null;
	[key: string]: unknown;
}

export const google: FormatConverter = {
	name: "Google Calendar",
	description: "Google Calendar API event format (JSON)",
	extensions: ["json"],
	mimeTypes: ["application/json"],

	from: (input: string, opts?: ConvertOptions): OpenEvnt => {
		const data: GoogleCalendarEvent = JSON.parse(input);

		const venues: NonNullable<OpenEvnt["venues"]> = [];
		const locationStr = asNonEmptyString(data.location);
		if (locationStr) {
			venues.push({
				id: "google-location",
				$type: "directory.evnt.venue.physical",
				name: { en: locationStr },
			});
		}

		const asPartialDate = (obj: GoogleCalendarEvent["start"]): PartialDate | undefined => {
			if (!obj) return undefined;

			if (obj.dateTime) {
				const date = new Date(obj.dateTime);
				if (isNaN(date.getTime())) return undefined;

				if (obj.timeZone) {
					// Convert to the target timezone using locale string
					const localized = new Date(date.toLocaleString("en-US", { timeZone: obj.timeZone }));
					return dateToPartialDate(localized, obj.timeZone);
				}
				return dateToPartialDate(date, "UTC");
			}

			if (obj.date) {
				return obj.date as PartialDate;
			}

			return undefined;
		};

		const lang = opts?.language ?? "en";
		const name = createTranslations(data.summary, lang);

		return {
			v: "0.1",
			name: Object.keys(name).length > 0 ? name : { [lang]: "No Title" },
			venues: venues.length > 0 ? venues : undefined,
			instances: [
				{
					venueIds: venues.map((v) => v.id),
					start: asPartialDate(data.start),
					end: asPartialDate(data.end),
				},
			],
		};
	},
};
