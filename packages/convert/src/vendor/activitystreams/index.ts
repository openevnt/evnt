import type { EventData, PartialDate, Venue } from "@evnt/schema";
import { EventDataSchema } from "@evnt/schema";
import { PartialDateUtil } from "@evnt/partial-date";
import { TranslationsUtil } from "@evnt/translations";

const isRecord = (value: unknown): value is Record<string, unknown> => {
	return typeof value === "object" && value !== null;
};

const asArray = <T>(value: T | T[] | null | undefined): T[] => {
	if (value === null || value === undefined) return [];
	return Array.isArray(value) ? value : [value];
};

const asNonEmptyString = (value: unknown): string | undefined => {
	if (typeof value !== "string") return undefined;
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : undefined;
};

const asNumber = (value: unknown): number | undefined => {
	if (typeof value === "number" && Number.isFinite(value)) return value;
	if (typeof value === "string") {
		const parsed = Number.parseFloat(value);
		if (Number.isFinite(parsed)) return parsed;
	}
	return undefined;
};

const toPartialDate = (value: string): PartialDate | undefined => {
	if (/^\d{4}$/.test(value)) return `${value}[UTC]` as PartialDate;
	if (/^\d{4}-\d{2}$/.test(value)) return `${value}[UTC]` as PartialDate;
	if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return `${value}[UTC]` as PartialDate;

	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return undefined;

	const isMidnightUTC = date.getUTCHours() === 0 && date.getUTCMinutes() === 0;
	return PartialDateUtil.format({
		year: date.getUTCFullYear(),
		month: date.getUTCMonth() + 1,
		day: date.getUTCDate(),
		hour: date.getUTCHours(),
		minute: date.getUTCMinutes(),
		timezone: "UTC",
		precision: isMidnightUTC ? "day" : "time",
	} as PartialDate.Parsed);
};

const toDateTime = (value: PartialDate): string | undefined => {
	const parsed = PartialDateUtil.parse(value);
	if (parsed.precision !== "time") return undefined;
	return PartialDateUtil.asZonedDateTime(parsed).toInstant().toString();
};

const readUrlLike = (value: unknown): string | undefined => {
	if (typeof value === "string") return asNonEmptyString(value);
	if (!isRecord(value)) return undefined;

	return asNonEmptyString(value.href)
		?? asNonEmptyString(value.url)
		?? asNonEmptyString(value.id);
};

const withTranslation = (value: string | undefined, language: string): EventData["name"] => {
	if (!value) return {};
	return { [language]: value };
};

export type ActivityStreamsEvent = {
	"@context"?: unknown;
	id?: unknown;
	type?: unknown;
	name?: unknown;
	summary?: unknown;
	content?: unknown;
	startTime?: unknown;
	endTime?: unknown;
	location?: unknown;
	url?: unknown;
	attachment?: unknown;
	evntData?: unknown;
	[key: string]: unknown;
};

export const convertFromActivityStreamsEvent = (
	data: ActivityStreamsEvent,
	{
		assumeLanguage = "en",
	}: {
		assumeLanguage?: string;
	} = {},
): EventData => {
	if (isRecord(data.evntData)) {
		const embedded = EventDataSchema.safeParse(data.evntData);
		if (embedded.success) return embedded.data;
	}

	const venues: Venue[] = [];
	const toVenueId = () => `activitystreams:${venues.length}`;

	for (const rawLocation of asArray(data.location)) {
		if (typeof rawLocation === "string") {
			venues.push({
				id: toVenueId(),
				$type: "directory.evnt.venue.unknown",
				name: { [assumeLanguage]: rawLocation },
			});
			continue;
		}
		if (!isRecord(rawLocation)) continue;

		const locationName = asNonEmptyString(rawLocation.name) ?? `Venue ${venues.length + 1}`;
		const locationUrl = readUrlLike(rawLocation.url) ?? readUrlLike(rawLocation);
		const latitude = asNumber(rawLocation.latitude);
		const longitude = asNumber(rawLocation.longitude);
		const addressRaw = rawLocation.address;
		const addressLine = typeof addressRaw === "string"
			? addressRaw
			: isRecord(addressRaw)
				? asNonEmptyString(addressRaw.streetAddress)
					?? asNonEmptyString(addressRaw.addressLocality)
					?? asNonEmptyString(addressRaw.name)
				: undefined;
		const countryCodeRaw = isRecord(addressRaw)
			? asNonEmptyString(addressRaw.addressCountry)
			: undefined;
		const countryCode = countryCodeRaw && countryCodeRaw.length === 2
			? countryCodeRaw.toUpperCase()
			: undefined;

		const type = asNonEmptyString(rawLocation.type)?.toLowerCase();
		const looksOnline = type === "link" || type === "linkobject" || type === "virtualplace";
		const hasPhysicalData = latitude !== undefined || longitude !== undefined || addressLine !== undefined || countryCode !== undefined;

		if (locationUrl && (looksOnline || !hasPhysicalData)) {
			venues.push({
				id: toVenueId(),
				$type: "directory.evnt.venue.online",
				name: { [assumeLanguage]: locationName },
				url: locationUrl,
			});
			continue;
		}

		venues.push({
			id: toVenueId(),
			$type: "directory.evnt.venue.physical",
			name: { [assumeLanguage]: locationName },
			address: {
				addr: addressLine,
				countryCode,
			},
		});
	}

	const components: NonNullable<EventData["components"]> = [];
	const addUrlAsLink = (url: unknown) => {
		const href = readUrlLike(url);
		if (!href) return;
		components.push({
			$type: "directory.evnt.component.link",
			url: href,
		});
	};

	for (const urlValue of asArray(data.url)) addUrlAsLink(urlValue);

	for (const attachment of asArray(data.attachment)) {
		if (typeof attachment === "string") {
			addUrlAsLink(attachment);
			continue;
		}
		if (!isRecord(attachment)) continue;

		const href = readUrlLike(attachment);
		if (!href) continue;

		const mediaType = asNonEmptyString(attachment.mediaType) ?? "";
		const attachmentType = asNonEmptyString(attachment.type)?.toLowerCase();
		const isMedia = mediaType.startsWith("image/") || mediaType.startsWith("video/") || attachmentType === "image" || attachmentType === "video";

		if (isMedia) {
			components.push({
				$type: "directory.evnt.component.splashMedia",
				media: {
					sources: [{
						url: href,
						mimeType: mediaType || undefined,
					}],
					alt: withTranslation(asNonEmptyString(attachment.name), assumeLanguage),
				},
				roles: ["background"],
			});
			continue;
		}

		addUrlAsLink(href);
	}

	const summary = asNonEmptyString(data.summary);
	const content = asNonEmptyString(data.content);
	if (content || summary) {
		components.push({
			$type: "directory.evnt.richtext.markdown",
			language: assumeLanguage,
			markdown: content ?? summary ?? "",
		});
	}

	const start = asNonEmptyString(data.startTime);
	const end = asNonEmptyString(data.endTime);
	const instanceStart = start ? toPartialDate(start) : undefined;
	const instanceEnd = end ? toPartialDate(end) : undefined;

	return {
		v: "0.1",
		name: withTranslation(asNonEmptyString(data.name), assumeLanguage) || { [assumeLanguage]: "Untitled Event" },
		venues,
		instances: (instanceStart || instanceEnd || venues.length > 0) ? [{
			venueIds: venues.map((venue) => venue.id),
			start: instanceStart,
			end: instanceEnd,
		}] : undefined,
		components: components.length > 0 ? components : undefined,
	};
};

export const convertToActivityStreamsEvent = (
	data: EventData,
	{
		language = "en",
		includeContext = true,
		includeEventData = true,
		type = "Event",
	}: {
		language?: string;
		includeContext?: boolean;
		includeEventData?: boolean;
		type?: string;
	} = {},
): ActivityStreamsEvent => {
	const name = TranslationsUtil.translate(data.name, [language]);
	const object: ActivityStreamsEvent = {
		type,
		name: name || "Untitled Event",
	};

	if (includeContext) object["@context"] = "https://www.w3.org/ns/activitystreams";

	if (includeEventData) object.evntData = data;

	const primaryInstance = data.instances?.find((instance) => instance.start || instance.end) ?? data.instances?.[0];
	if (primaryInstance?.start) {
		const startTime = toDateTime(primaryInstance.start);
		if (startTime) object.startTime = startTime;
		else object.evntPartialStart = primaryInstance.start;
	}
	if (primaryInstance?.end) {
		const endTime = toDateTime(primaryInstance.end);
		if (endTime) object.endTime = endTime;
		else object.evntPartialEnd = primaryInstance.end;
	}

	const locations: Record<string, unknown>[] = [];
	for (const venue of data.venues || []) {
		const venueName = TranslationsUtil.translate(venue.name, [language]);
		if (venue.$type === "directory.evnt.venue.online") {
			locations.push({
				type: "Link",
				name: venueName,
				href: venue.url,
			});
			continue;
		}

		if (venue.$type === "directory.evnt.venue.physical") {
			locations.push({
				type: "Place",
				name: venueName,
				address: venue.address?.addr,
			});
			continue;
		}

		locations.push({
			type: "Place",
			name: venueName,
		});
	}
	if (locations.length === 1) object.location = locations[0];
	if (locations.length > 1) object.location = locations;

	const urls: string[] = [];
	const attachments: Record<string, unknown>[] = [];

	for (const component of data.components || []) {
		if (component.$type === "directory.evnt.component.link" || component.$type === "directory.evnt.component.source") {
			urls.push(component.url);
			continue;
		}

		if (component.$type === "directory.evnt.component.splashMedia") {
			for (const source of component.media.sources) {
				if (!source.url) continue;
				attachments.push({
					type: source.mimeType?.startsWith("video/") ? "Video" : "Image",
					url: source.url,
					mediaType: source.mimeType,
					name: component.media.alt ? TranslationsUtil.translate(component.media.alt, [language]) : undefined,
				});
			}
			continue;
		}

		if (component.$type === "directory.evnt.richtext.markdown") {
			if (!object.content) object.content = component.markdown;
			continue;
		}

		if (component.$type === "app.bsky.richtext") {
			if (!object.content) object.content = component.text;
		}
	}

	if (urls.length === 1) object.url = urls[0];
	if (urls.length > 1) object.url = urls;
	if (attachments.length > 0) object.attachment = attachments;

	return object;
};
