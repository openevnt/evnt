import ICAL from "ical.js";
import type {
	AnyComponent,
	EventInstance,
	EventStatus,
	LinkComponent,
	OpenEvnt,
	PartialDate,
	RichTextMarkdownComponent,
} from "@evnt/types";
import { PartialDateUtil } from "@evnt/partial-date";
import { translate, createTranslations } from "../utils/translations.js";
import type { FormatConverter, ConvertOptions } from "../types.js";

/**
 * A PartialDate names a wall time in its own zone, so a timed value has to be
 * resolved against that zone rather than read as if it were already UTC. The
 * resulting instant is emitted as UTC because a TZID reference would oblige us
 * to ship a VTIMEZONE, and ical.js carries no timezone database to build one.
 */
export const partialDateToICALTime = (
	date: PartialDate,
	mode: "low" | "high" = "low",
): ICAL.Time => {
	const parsed = PartialDateUtil.parse(date);

	if (parsed.precision !== "time") {
		const day = PartialDateUtil.asPlainDate(PartialDateUtil.setPrecision(parsed, "day", mode));
		return new ICAL.Time(
			{ year: day.year, month: day.month, day: day.day, isDate: true },
			ICAL.Timezone.utcTimezone,
		);
	}

	const utc = PartialDateUtil.toInstant(parsed, mode).toZonedDateTimeISO("UTC");
	return new ICAL.Time(
		{
			year: utc.year,
			month: utc.month,
			day: utc.day,
			hour: utc.hour,
			minute: utc.minute,
			second: utc.second,
			isDate: false,
		},
		ICAL.Timezone.utcTimezone,
	);
};

export const icalTimeToPartialDate = (icalTime: ICAL.Time): PartialDate => {
	const precision: "day" | "time" = icalTime.isDate ? "day" : "time";
	const tzid = icalTime.zone.tzid;
	return PartialDateUtil.format({
		year: icalTime.year,
		month: icalTime.month,
		day: icalTime.day,
		hour: icalTime.hour,
		minute: icalTime.minute,
		timezone: !tzid || tzid === "floating" ? "UTC" : tzid,
		precision,
	});
};

export const statusToIcal: Record<string, string> = {
	planned: "CONFIRMED",
	uncertain: "TENTATIVE",
	postponed: "TENTATIVE",
	cancelled: "CANCELLED",
	suspended: "CANCELLED",
};

export const statusFromIcal: Record<string, string> = {
	CONFIRMED: "planned",
	TENTATIVE: "uncertain",
	CANCELLED: "cancelled",
};

/** Clients treat a repeated UID as the same event, so this cannot be random. */
const derivedUid = (summary: string, start: ICAL.Time | null): string => {
	const slug =
		summary
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-|-$/g, "")
			.slice(0, 48) || "event";
	return `${start ? start.toICALString() : "undated"}-${slug}@evnt.directory`;
};

const richtextOf = (components: AnyComponent[] | undefined): string | undefined =>
	components?.find(
		(c): c is RichTextMarkdownComponent => c.$type === "directory.evnt.richtext.markdown",
	)?.content;

const linkOf = (components: AnyComponent[] | undefined): string | undefined =>
	components?.find((c): c is LinkComponent => c.$type === "directory.evnt.component.link")?.url;

/** LOCATION may not repeat within a VEVENT, so several venues share one line. */
const instanceLocation = (
	data: OpenEvnt,
	instance: EventInstance | undefined,
	language: string,
): string | undefined => {
	const names = (instance?.venueIds ?? [])
		.map((id) => data.venues?.find((venue) => venue.id === id))
		.map((venue) => translate(venue?.name, [language]))
		.filter(Boolean);

	return names.length ? names.join(", ") : undefined;
};

const buildVEvent = (
	data: OpenEvnt,
	instance: EventInstance | undefined,
	uid: string,
	groupUid: string | undefined,
	language: string,
): ICAL.Component => {
	const vevent = new ICAL.Component("vevent");
	const summary = translate(data.name, [language]) ?? "Untitled Event";

	const startDate = instance?.start ? partialDateToICALTime(instance.start, "low") : null;
	let endDate = instance?.end ? partialDateToICALTime(instance.end, "high") : null;

	// An OpenEvnt end names the last day of the event, where DTEND is exclusive.
	if (!endDate && startDate?.isDate) endDate = startDate.clone();
	if (endDate?.isDate) endDate.adjust(1, 0, 0, 0);

	vevent.addPropertyWithValue("uid", uid);
	vevent.addPropertyWithValue("dtstamp", ICAL.Time.fromJSDate(new Date(), true));
	vevent.addPropertyWithValue("summary", summary);

	if (startDate) vevent.addPropertyWithValue("dtstart", startDate);
	if (endDate) vevent.addPropertyWithValue("dtend", endDate);

	const location = instanceLocation(data, instance, language);
	if (location) vevent.addPropertyWithValue("location", location);

	const description = richtextOf(instance?.components) ?? richtextOf(data.components);
	if (description) vevent.addPropertyWithValue("description", description);

	const link = linkOf(instance?.components) ?? linkOf(data.components);
	if (link) vevent.addPropertyWithValue("url", link);

	const status = statusToIcal[instance?.status ?? data.status ?? ""];
	if (status) vevent.addPropertyWithValue("status", status);

	if (groupUid) vevent.addPropertyWithValue("related-to", groupUid);

	return vevent;
};

/**
 * Open Evnt enumerates occurrences rather than defining recurrence rules, so
 * each instance becomes its own VEVENT. Collapsing them into one span would
 * bury the gaps between them, along with the venue and status each carries.
 */
export const buildVEvents = (data: OpenEvnt, opts?: ConvertOptions): ICAL.Component[] => {
	const language = opts?.language ?? "en";
	const summary = translate(data.name, [language]) ?? "Untitled Event";
	const instances: (EventInstance | undefined)[] = data.instances?.length
		? data.instances
		: [undefined];
	const series = instances.length > 1;
	const groupUid = series ? (opts?.uid ?? derivedUid(summary, null)) : undefined;

	return instances.map((instance, index) => {
		const start = instance?.start ? partialDateToICALTime(instance.start, "low") : null;
		const uid = opts?.uid
			? series
				? `${opts.uid}#${instance?.id ?? index}`
				: opts.uid
			: derivedUid(summary, start);

		return buildVEvent(data, instance, uid, groupUid, language);
	});
};

export const buildVCalendar = (vevents: ICAL.Component[]): ICAL.Component => {
	const vcalendar = new ICAL.Component("vcalendar");
	vcalendar.addPropertyWithValue("version", "2.0");
	vcalendar.addPropertyWithValue("prodid", "-//Open Evnt//@evnt/convert//EN");
	vcalendar.addPropertyWithValue("calscale", "GREGORIAN");
	for (const vevent of vevents) vcalendar.addSubcomponent(vevent);
	return vcalendar;
};

const statusOf = (vevent: ICAL.Component): EventStatus | undefined =>
	statusFromIcal[
		((vevent.getFirstPropertyValue("status") as string | null) ?? "").toUpperCase()
	] as EventStatus | undefined;

/** Reads every VEVENT in the calendar back into one event's instances. */
export const readVCalendar = (vcalendar: ICAL.Component, language: string): OpenEvnt => {
	const vevents = vcalendar.getAllSubcomponents("vevent");
	const first = vevents[0];
	if (!first) throw new Error("No VEVENT found in calendar input");

	const out: OpenEvnt = {
		v: "0.1",
		name: createTranslations(first.getFirstPropertyValue("summary") as string | null, language),
		instances: [],
		venues: [],
		components: [],
	};

	out.status = statusOf(first);

	const venueIds = new Map<string, string>();
	const venueIdFor = (location: string): string => {
		const known = venueIds.get(location);
		if (known) return known;

		const id = `ical:${venueIds.size}`;
		venueIds.set(location, id);
		out.venues!.push({
			id,
			name: createTranslations(location, language),
			$type: "directory.evnt.venue.unknown",
		});
		return id;
	};

	for (const vevent of vevents) {
		const start = vevent.getFirstPropertyValue("dtstart");
		if (!(start instanceof ICAL.Time)) continue;

		const end = vevent.getFirstPropertyValue("dtend");
		let last: ICAL.Time | undefined;
		if (end instanceof ICAL.Time) {
			last = end.clone();
			// DTEND is exclusive, where an OpenEvnt end names the last day itself.
			if (last.isDate) last.adjust(-1, 0, 0, 0);
		}

		const locations = vevent
			.getAllProperties("location")
			.map((prop) => prop.getFirstValue())
			.filter((value): value is string => typeof value === "string");

		const status = statusOf(vevent);

		out.instances!.push({
			venueIds: locations.map(venueIdFor),
			start: icalTimeToPartialDate(start),
			end: last ? icalTimeToPartialDate(last) : undefined,
			...(status && status !== out.status ? { status } : {}),
		});
	}

	const description = first.getFirstPropertyValue("description") as string | null;
	if (description) {
		out.components!.push({
			$type: "directory.evnt.richtext.markdown",
			content: description,
		});
	}

	for (const prop of first.getAllProperties("url")) {
		const url = prop.getFirstValue();
		if (typeof url === "string") {
			out.components!.push({ $type: "directory.evnt.component.link", url });
		}
	}

	return out;
};

export const icalendar: FormatConverter = {
	name: "iCalendar",
	description: "RFC 5545 iCalendar format (.ics)",
	extensions: ["ics", "ical", "ifb"],
	mimeTypes: ["text/calendar"],

	to: (data: OpenEvnt, opts?: ConvertOptions): string =>
		buildVCalendar(buildVEvents(data, opts)).toString(),

	from: (input: string, opts?: ConvertOptions): OpenEvnt =>
		readVCalendar(new ICAL.Component(ICAL.parse(input)), opts?.language ?? "en"),
};
