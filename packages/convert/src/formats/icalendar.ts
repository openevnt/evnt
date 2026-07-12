import ICAL from "ical.js";
import type { OpenEvnt, PartialDate } from "@evnt/types";
import { PartialDateUtil } from "@evnt/partial-date";
import { translate, createTranslations } from "../utils/translations";
import type { FormatConverter, ConvertOptions } from "../types";

export const icalendar: FormatConverter = {
	name: "iCalendar",
	description: "RFC 5545 iCalendar format (.ics)",
	extensions: ["ics", "ical", "ifb"],
	mimeTypes: ["text/calendar"],

	to: (data: OpenEvnt, opts?: ConvertOptions): string => {
		const language = opts?.language ?? "en";
		const vevent = new ICAL.Component("vevent");
		const event = new ICAL.Event(vevent);
		event.summary = translate(data.name, [language]) ?? "Untitled Event";

		const partialDateToICALTime = (date: PartialDate) => {
			const parsed = PartialDateUtil.parse(date);
			return new ICAL.Time(
				{
					year: parsed.year,
					month: "month" in parsed ? parsed.month : 1,
					day: "day" in parsed ? parsed.day : 1,
					hour: "hour" in parsed ? parsed.hour : 0,
					minute: "minute" in parsed ? parsed.minute : 0,
					isDate: parsed.precision !== "time",
				},
				ICAL.Timezone.utcTimezone,
			);
		};

		let startDate: ICAL.Time | null = null;
		let endDate: ICAL.Time | null = null;

		for (const { start, end } of data.instances ?? []) {
			if (start) {
				const t = partialDateToICALTime(start);
				if (startDate === null || t.compare(startDate) < 0) startDate = t;
			}
			if (end) {
				const t = partialDateToICALTime(end);
				if (endDate === null || t.compare(endDate) > 0) endDate = t;
			}
		}

		if (startDate) event.startDate = startDate;
		if (endDate) event.endDate = endDate;

		return vevent.toString();
	},

	from: (input: string, opts?: ConvertOptions): OpenEvnt => {
		const language = opts?.language ?? "en";
		const jcal = ICAL.parse(input);
		const vcalendar = new ICAL.Component(jcal);
		const vevent = vcalendar.getFirstSubcomponent("vevent");
		if (!vevent) throw new Error("No VEVENT found in iCalendar input");

		const event = new ICAL.Event(vevent);
		const out: OpenEvnt = {
			v: "0.1",
			name: createTranslations(event.summary, language),
			instances: [],
			venues: [],
			components: [],
		};

		for (const prop of vevent.getAllProperties("location")) {
			const loc = prop.getFirstValue();
			if (typeof loc === "string") {
				out.venues!.push({
					id: `ical:${out.venues!.length}`,
					name: createTranslations(loc, language),
					$type: "directory.evnt.venue.unknown",
				});
			}
		}

		const icalTimeToPartialDate = (icalTime: ICAL.Time): PartialDate => {
			const precision: "day" | "time" = icalTime.isDate ? "day" : "time";
			return PartialDateUtil.format({
				year: icalTime.year,
				month: icalTime.month,
				day: icalTime.day,
				hour: icalTime.hour,
				minute: icalTime.minute,
				timezone: icalTime.zone.tzid || "UTC",
				precision,
			});
		};

		if (event.startDate) {
			out.instances!.push({
				venueIds: out.venues?.map((v) => v.id) ?? [],
				start: icalTimeToPartialDate(event.startDate),
				end: event.endDate ? icalTimeToPartialDate(event.endDate) : undefined,
			});
		}

		if (event.description) {
			out.components!.push({
				$type: "directory.evnt.richtext.markdown",
				content: event.description,
			});
		}

		for (const prop of vevent.getAllProperties("url")) {
			const url = prop.getFirstValue();
			if (typeof url === "string") {
				out.components!.push({ $type: "directory.evnt.component.link", url });
			}
		}

		return out;
	},
};
