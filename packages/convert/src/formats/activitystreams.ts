import type { OpenEvnt, PartialDate } from "@evnt/types";
import { OpenEvntSchema } from "@evnt/schema";
import { PartialDateUtil } from "@evnt/partial-date";
import { translate, createTranslations } from "../utils/translations.js";
import { isRecord, asArray, asNonEmptyString, asNumber, readUrlLike } from "../utils/text.js";
import { parseDateString, partialDateToIso } from "../utils/date.js";
import type { FormatConverter, ConvertOptions } from "../types.js";

export const activitystreams: FormatConverter = {
	name: "ActivityStreams",
	description: "W3C Activity Streams 2.0 format",
	extensions: ["json"],
	mimeTypes: ["application/activity+json", "application/ld+json"],

	from: (input: string, opts?: ConvertOptions): OpenEvnt => {
		const language = opts?.language ?? "en";
		const data = JSON.parse(input);

		// If there's an embedded canonical OpenEvnt, prefer it
		if (isRecord(data.evntData)) {
			const embedded = OpenEvntSchema.safeParse(data.evntData);
			if (embedded.success) return embedded.data;
		}

		const venues: NonNullable<OpenEvnt["venues"]> = [];
		let venueCounter = 0;
		const nextVenueId = (): string => `as:${venueCounter++}`;

		for (const rawLocation of asArray(data.location)) {
			if (typeof rawLocation === "string") {
				venues.push({
					id: nextVenueId(),
					$type: "directory.evnt.venue.unknown",
					name: createTranslations(rawLocation, language),
				});
				continue;
			}
			if (!isRecord(rawLocation)) continue;

			const locationName = asNonEmptyString(rawLocation.name) ?? `Venue ${venues.length + 1}`;
			const locationUrl = readUrlLike(rawLocation.url) ?? readUrlLike(rawLocation);
			const latitude = asNumber(rawLocation.latitude);
			const longitude = asNumber(rawLocation.longitude);

			const addressRaw = rawLocation.address;
			const addressLine =
				typeof addressRaw === "string"
					? addressRaw
					: isRecord(addressRaw)
						? (asNonEmptyString(addressRaw.streetAddress) ??
							asNonEmptyString(addressRaw.addressLocality) ??
							asNonEmptyString(addressRaw.name))
						: undefined;
			const countryCodeRaw = isRecord(addressRaw)
				? asNonEmptyString(addressRaw.addressCountry)
				: undefined;
			const countryCode =
				countryCodeRaw && countryCodeRaw.length === 2 ? countryCodeRaw.toUpperCase() : undefined;

			const type = asNonEmptyString(rawLocation.type)?.toLowerCase();
			const looksOnline = type === "link" || type === "linkobject" || type === "virtualplace";
			const hasPhysicalData =
				latitude !== undefined ||
				longitude !== undefined ||
				addressLine !== undefined ||
				countryCode !== undefined;

			if (locationUrl && (looksOnline || !hasPhysicalData)) {
				venues.push({
					id: nextVenueId(),
					$type: "directory.evnt.venue.online",
					name: createTranslations(locationName, language),
					url: locationUrl,
				});
				continue;
			}

			venues.push({
				id: nextVenueId(),
				$type: "directory.evnt.venue.physical",
				name: createTranslations(locationName, language),
				address: { addr: addressLine, countryCode },
			});
		}

		const components: NonNullable<OpenEvnt["components"]> = [];
		const addUrlAsLink = (url: unknown) => {
			const href = readUrlLike(url);
			if (href) components.push({ $type: "directory.evnt.component.link", url: href });
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
			const isMedia =
				mediaType.startsWith("image/") ||
				mediaType.startsWith("video/") ||
				attachmentType === "image" ||
				attachmentType === "video";

			if (isMedia) {
				components.push({
					$type: "directory.evnt.component.splashMedia",
					media: {
						sources: [{ url: href, mimeType: mediaType || undefined }],
						alt: createTranslations(asNonEmptyString(attachment.name), language),
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
				language,
				content: content ?? summary ?? "",
			});
		}

		const start = asNonEmptyString(data.startTime);
		const end = asNonEmptyString(data.endTime);

		const nameStr = asNonEmptyString(data.name);

		return {
			v: "0.1",
			name: nameStr ? createTranslations(nameStr, language) : { [language]: "Untitled Event" },
			venues: venues.length > 0 ? venues : undefined,
			instances:
				start || end || venues.length > 0
					? [
							{
								venueIds: venues.map((v) => v.id),
								start: start ? parseDateString(start) : undefined,
								end: end ? parseDateString(end) : undefined,
							},
						]
					: undefined,
			components: components.length > 0 ? components : undefined,
		};
	},

	to: (data: OpenEvnt, opts?: ConvertOptions): string => {
		const language = opts?.language ?? "en";
		const object: Record<string, unknown> = {
			"@context": "https://www.w3.org/ns/activitystreams",
			type: "Event",
			name: translate(data.name, [language]) ?? "Untitled Event",
		};

		object.evntData = data;

		const primaryInstance =
			data.instances?.find((inst) => inst.start || inst.end) ?? data.instances?.[0];
		if (primaryInstance?.start) {
			const iso = partialDateToIso(primaryInstance.start);
			if (iso) object.startTime = iso;
			else (object as Record<string, unknown>).evntPartialStart = primaryInstance.start;
		}
		if (primaryInstance?.end) {
			const iso = partialDateToIso(primaryInstance.end);
			if (iso) object.endTime = iso;
			else (object as Record<string, unknown>).evntPartialEnd = primaryInstance.end;
		}

		const locations: Record<string, unknown>[] = [];
		for (const venue of data.venues ?? []) {
			const venueName = translate(venue.name, [language]);
			if (venue.$type === "directory.evnt.venue.online") {
				locations.push({ type: "Link", name: venueName, href: venue.url });
			} else if (venue.$type === "directory.evnt.venue.physical") {
				locations.push({ type: "Place", name: venueName, address: venue.address?.addr });
			} else {
				locations.push({ type: "Place", name: venueName });
			}
		}
		if (locations.length === 1) object.location = locations[0];
		else if (locations.length > 1) object.location = locations;

		const urls: string[] = [];
		const attachments: Record<string, unknown>[] = [];

		for (const component of data.components ?? []) {
			const c = component as Record<string, unknown>;
			const type = c.$type as string;

			if (type === "directory.evnt.component.link" || type === "directory.evnt.component.source") {
				if (c.url && typeof c.url === "string") urls.push(c.url);
				continue;
			}

			if (type === "directory.evnt.component.splashMedia") {
				const splash = c as unknown as {
					$type: string;
					media: {
						sources: Array<{ url?: string; blob?: { mimeType?: string } }>;
						alt?: Record<string, string>;
					};
				};
				for (const source of splash.media.sources) {
					if (!source.url) continue;
					attachments.push({
						type: source.blob?.mimeType?.startsWith("video/") ? "Video" : "Image",
						url: source.url,
						mediaType: source.blob?.mimeType,
						name: splash.media.alt ? translate(splash.media.alt, [language]) : undefined,
					});
				}
				continue;
			}

			if (type === "directory.evnt.richtext.markdown") {
				if (!object.content && typeof c.content === "string") object.content = c.content;
				continue;
			}

			if (type === "directory.evnt.richtext.bluesky") {
				if (!object.content && typeof c.text === "string") object.content = c.text;
			}
		}

		if (urls.length === 1) object.url = urls[0];
		else if (urls.length > 1) object.url = urls;
		if (attachments.length > 0) object.attachment = attachments;

		return JSON.stringify(object, null, "\t");
	},
};
