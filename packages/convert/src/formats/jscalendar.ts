import type { EventInstance, OpenEvnt, PartialDate, Translations } from "@evnt/types";
import { translate, createTranslations } from "../utils/translations.js";
import { isRecord, asNonEmptyString } from "../utils/text.js";
import { parseDateString } from "../utils/date.js";
import { PartialDateUtil } from "@evnt/partial-date";
import type { FormatConverter, ConvertOptions } from "../types.js";

interface JscLink {
	"@type"?: string;
	href: string;
	rel?: string;
	title?: string;
	mediaType?: string;
}

const fromJscStatus = (status: string | undefined): OpenEvnt["status"] => {
	switch (status) {
		case "confirmed":
			return "planned";
		case "tentative":
			return "uncertain";
		case "cancelled":
			return "cancelled";
		default:
			return undefined;
	}
};

const toJscStatus = (status: OpenEvnt["status"]): string | undefined => {
	switch (status) {
		case "planned":
			return "confirmed";
		case "uncertain":
		case "postponed":
		case "suspended":
			return "tentative";
		case "cancelled":
			return "cancelled";
		default:
			return undefined;
	}
};

const pad = (value: number, width = 2): string => String(value).padStart(width, "0");

/** A JSCalendar LocalDateTime carries no zone; the zone travels in `timeZone`. */
const localDateTime = (parsed: PartialDate.Parsed): string => {
	const day = PartialDateUtil.asPlainDate(PartialDateUtil.setPrecision(parsed, "day", "low"));
	const clock =
		parsed.precision === "time" ? `${pad(parsed.hour)}:${pad(parsed.minute)}:00` : "00:00:00";
	return `${pad(day.year, 4)}-${pad(day.month)}-${pad(day.day)}T${clock}`;
};

/**
 * JSCalendar has no `end`: an interval is a start plus a duration. A dateless
 * event counts whole days, and its OpenEvnt end names the last of them, so the
 * duration has to reach past it.
 */
const durationBetween = (start: PartialDate, end: PartialDate | undefined): string | undefined => {
	const parsed = PartialDateUtil.parse(start);

	if (parsed.precision !== "time") {
		const first = PartialDateUtil.asPlainDate(PartialDateUtil.setPrecision(parsed, "day", "low"));
		const last = PartialDateUtil.asPlainDate(
			PartialDateUtil.setPrecision(end ?? start, "day", "high"),
		);
		return `P${first.until(last).days + 1}D`;
	}

	if (!end) return undefined;

	return PartialDateUtil.toInstant(end, "high")
		.since(PartialDateUtil.toInstant(start, "low"), { largestUnit: "hour" })
		.toString();
};

const endFromDuration = (start: PartialDate, duration: string): PartialDate | undefined => {
	try {
		const shifted = PartialDateUtil.asZonedDateTime(
			PartialDateUtil.setPrecision(start, "time", "low"),
		).add(Temporal.Duration.from(duration));

		// A dateless duration is exclusive of the day it lands on.
		const timed = PartialDateUtil.getPrecision(start) === "time";
		const landed = timed ? shifted : shifted.subtract({ days: 1 });
		const formatted = PartialDateUtil.format(PartialDateUtil.parsedFromTemporal(landed));

		return timed ? formatted : PartialDateUtil.setPrecision(formatted, "day", "low");
	} catch {
		return undefined;
	}
};

const localDateTimePattern = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::\d{2})?$/;

const readLocalDateTime = (
	value: string,
	timeZone: string | undefined,
	showWithoutTime: boolean,
): PartialDate | undefined => {
	const match = localDateTimePattern.exec(value);
	if (!match) return parseDateString(value);

	const [year, month, day, hour, minute] = match.slice(1).map(Number) as [
		number,
		number,
		number,
		number,
		number,
	];

	return PartialDateUtil.format({
		year,
		month,
		day,
		hour,
		minute,
		timezone: timeZone ?? "UTC",
		precision: showWithoutTime ? "day" : "time",
	} as PartialDate.Parsed);
};

const stableUid = (name: string, start?: string): string => {
	let hash = 0;
	const input = name + (start ?? "");
	for (let i = 0; i < input.length; i++) {
		hash = (hash * 31 + input.charCodeAt(i)) | 0;
	}
	return `urn:evnt:${Math.abs(hash).toString(36)}`;
};

export const jscalendar: FormatConverter = {
	name: "JSCalendar",
	description: "JSCalendar (RFC 8984) JSON calendar format",
	extensions: ["json", "jscalendar"],
	mimeTypes: ["application/jscalendar+json", "application/json"],

	from: (input: string, opts?: ConvertOptions): OpenEvnt => {
		const language = opts?.language ?? "en";
		const data = JSON.parse(input);

		const title = asNonEmptyString(data.title);
		const description = asNonEmptyString(data.description);
		const start = asNonEmptyString(data.start);
		const end = asNonEmptyString(data.end);
		const duration = asNonEmptyString(data.duration);
		const status = fromJscStatus(asNonEmptyString(data.status));
		const showWithoutTime = data.showWithoutTime === true;
		const effectiveLanguage = asNonEmptyString(data.locale) ?? language;

		const timeZone = asNonEmptyString(data.timeZone);

		const venues: NonNullable<OpenEvnt["venues"]> = [];
		let venueCounter = 0;
		const nextVenueId = (): string => `jsc:${venueCounter++}`;

		if (data.locations && isRecord(data.locations)) {
			for (const loc of Object.values(data.locations) as Array<{
				name?: string;
				type?: "physical" | "virtual";
				description?: string;
				links?: Record<string, JscLink>;
			}>) {
				const locName = asNonEmptyString(loc.name);
				const firstLinkHref = loc.links
					? (Object.values(loc.links).find((l) => l.href) as JscLink | undefined)?.href
					: undefined;

				if (loc.type === "virtual") {
					venues.push({
						id: nextVenueId(),
						$type: "directory.evnt.venue.online",
						name: createTranslations(
							locName ?? `Online Venue ${venues.length + 1}`,
							effectiveLanguage,
						),
						url: firstLinkHref,
					});
				} else if (loc.type === "physical") {
					venues.push({
						id: nextVenueId(),
						$type: "directory.evnt.venue.physical",
						name: createTranslations(locName ?? `Venue ${venues.length + 1}`, effectiveLanguage),
						address: loc.description ? { addr: loc.description } : undefined,
					});
				} else {
					venues.push({
						id: nextVenueId(),
						$type: "directory.evnt.venue.unknown",
						name: createTranslations(locName ?? `Location ${venues.length + 1}`, effectiveLanguage),
					});
				}
			}
		}

		const components: NonNullable<OpenEvnt["components"]> = [];

		if (description) {
			components.push({
				$type: "directory.evnt.richtext.markdown",
				language: effectiveLanguage,
				content: description,
			});
		}

		if (data.links && isRecord(data.links)) {
			for (const link of Object.values(data.links) as JscLink[]) {
				const href = asNonEmptyString(link.href);
				if (href) {
					components.push({
						$type: "directory.evnt.component.link",
						url: href,
						...(link.title ? { name: createTranslations(link.title, effectiveLanguage) } : {}),
					});
				}
			}
		}

		const parsedStart = start ? readLocalDateTime(start, timeZone, showWithoutTime) : undefined;
		const parsedEnd = end
			? readLocalDateTime(end, timeZone, showWithoutTime)
			: parsedStart && duration
				? endFromDuration(parsedStart, duration)
				: undefined;

		return {
			v: "0.1",
			name: title
				? createTranslations(title, effectiveLanguage)
				: { [effectiveLanguage]: "Untitled Event" },
			status,
			venues: venues.length > 0 ? venues : undefined,
			instances:
				parsedStart || parsedEnd || venues.length > 0
					? [{ venueIds: venues.map((v) => v.id), start: parsedStart, end: parsedEnd }]
					: undefined,
			components: components.length > 0 ? components : undefined,
		};
	},

	to: (data: OpenEvnt, opts?: ConvertOptions): string => {
		const language = opts?.language ?? "en";
		const pickTranslation = (translations: Translations | undefined): string | undefined =>
			translate(translations, [language, "en", ...Object.keys(translations ?? {})]);

		const locations: Record<string, Record<string, unknown>> = {};
		let locIndex = 0;
		for (const venue of data.venues ?? []) {
			const loc: Record<string, unknown> = { "@type": "Location" };
			const venueName = pickTranslation(venue.name);
			if (venueName) loc.name = venueName;

			if (venue.$type === "directory.evnt.venue.online") {
				loc.type = "virtual";
				if (venue.url) loc.links = { "link-0": { "@type": "Link", href: venue.url } };
			} else if (venue.$type === "directory.evnt.venue.physical") {
				loc.type = "physical";
				if (venue.address?.addr) loc.description = venue.address.addr;
			}

			locations[`loc-${locIndex++}`] = loc;
		}

		const links: Record<string, Record<string, unknown>> = {};
		let linkIndex = 0;
		let description: string | undefined;

		for (const component of data.components ?? []) {
			const c = component as Record<string, unknown>;
			const type = c.$type as string;

			if (type === "directory.evnt.component.link") {
				const url = asNonEmptyString(c.url);
				if (url) {
					const link: Record<string, unknown> = { "@type": "Link", href: url };
					const title = pickTranslation(c.name as Translations | undefined);
					if (title) link.title = title;
					links[`link-${linkIndex++}`] = link;
				}
			} else if (type === "directory.evnt.component.source") {
				const url = asNonEmptyString(c.url);
				if (url) {
					links[`link-${linkIndex++}`] = { "@type": "Link", href: url, rel: "source" };
				}
			} else if (type === "directory.evnt.richtext.markdown" && !description) {
				if (typeof c.content === "string") description = c.content;
			}
		}

		const title = pickTranslation(data.name) ?? "Untitled Event";

		const buildEvent = (instance: EventInstance | undefined): Record<string, unknown> => {
			const event: Record<string, unknown> = {
				"@type": "Event",
				uid: stableUid(title, instance?.start),
				title,
			};

			if (instance?.start) {
				const parsed = PartialDateUtil.parse(instance.start);
				event.start = localDateTime(parsed);
				if (parsed.precision === "time") event.timeZone = parsed.timezone;
				else event.showWithoutTime = true;

				const duration = durationBetween(instance.start, instance.end);
				if (duration) event.duration = duration;
			}

			if (Object.keys(locations).length > 0) event.locations = locations;
			if (description) {
				event.description = description;
				event.descriptionContentType = "text/markdown";
			}
			if (Object.keys(links).length > 0) event.links = links;

			const jscStatus = toJscStatus(instance?.status ?? data.status);
			if (jscStatus) event.status = jscStatus;

			return event;
		};

		const dated = data.instances?.filter((instance) => instance.start || instance.end) ?? [];

		// JSCalendar has no way to hold several occurrences in one Event, so a
		// series becomes a Group rather than losing every instance but one.
		if (dated.length > 1) {
			return JSON.stringify(
				{ "@type": "Group", uid: stableUid(title), entries: dated.map(buildEvent) },
				null,
				"\t",
			);
		}

		return JSON.stringify(buildEvent(dated[0] ?? data.instances?.[0]), null, "\t");
	},
};
