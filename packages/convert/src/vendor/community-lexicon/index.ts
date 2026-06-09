import type { OpenEvnt, Media, PartialDate, PhysicalVenue } from "@evnt/types";
import { PartialDateUtil } from "@evnt/partial-date";
import type { CommunityLexiconCalendarEvent } from "../../lexicons";
import { EventBuilder, PhysicalVenueBuilder } from "@evnt/builder";
import type { AtprotoDid } from "@atcute/lexicons/syntax";

export interface LexiconEvent extends CommunityLexiconCalendarEvent.Main {
	facets?: {
		index: { byteStart: number; byteEnd: number };
		features: Record<string, unknown>[];
	}[];

	media?: {
		$type?: "community.lexicon.calendar.event#media";
		alt?: string;
		role?: string;
		content: {
			$type: "blob";
			ref: { $link: string };
			size: number;
			mimeType: string;
		};
		aspect_ratio?: {
			width: number;
			height: number;
		};
	}[];

	additionalData?: Record<string, unknown>;
};

export const convertFromLexicon = (
	event: LexiconEvent,
	{
		language = "en",
		did,
	}: {
		did?: AtprotoDid;
		language?: string;
	} = {},
): OpenEvnt => {
	const builder = new EventBuilder();

	if (event.name) builder.setName(event.name, language);

	const upsertPhysicalVenue = (name: string, fn: (b: PhysicalVenueBuilder) => PhysicalVenueBuilder) => {
		const idx = builder.data.venues?.findIndex(v => v.$type === "directory.evnt.venue.physical" && v.name[language] === name);
		builder.data.venues ??= [];
		if (idx !== undefined && idx >= 0) {
			const venue = builder.data.venues[idx]!;
			builder.data.venues![idx]! = fn(new PhysicalVenueBuilder(venue as PhysicalVenue, builder)).build();
		} else {
			builder.addPhysicalVenue(b => fn(b).setName(name, language));
		}
	};

	for (let [index, location] of (event.locations || []).entries()) {
		switch (location.$type) {
			case "community.lexicon.calendar.event#uri":
				builder.addOnlineVenue(v => v
					.setId(index.toString())
					.setName(location.name ?? "", language)
					.setUrl(location.uri)
				);
				break;
			case "community.lexicon.location.address":
				upsertPhysicalVenue(location.name ?? "", b => b
					.setId(index.toString())
					.setCountryCode(location.country)
					.setAddressLine([
						location.street,
						location.locality,
						location.region,
					].filter(Boolean).join(" "))
				);
				break;
			case "community.lexicon.location.fsq":
			case "community.lexicon.location.geo":
				upsertPhysicalVenue(location.name ?? "", b => b
					.setId(index.toString())
				);
				break;
			default:
				builder.addUnknownVenue(v => v
					.setId(index.toString())
					.setName(location.name ?? "", language)
				);
		}
	}

	if (event.startsAt || event.endsAt) {
		builder.addInstance(i => {
			if (event.startsAt) i.setStart(PartialDateUtil.format({
				year: new Date(event.startsAt).getUTCFullYear(),
				month: new Date(event.startsAt).getUTCMonth() + 1,
				day: new Date(event.startsAt).getUTCDate(),
				hour: new Date(event.startsAt).getUTCHours(),
				minute: new Date(event.startsAt).getUTCMinutes(),
				timezone: "UTC",
				precision: (new Date(event.startsAt).getUTCHours() === 0 && new Date(event.startsAt).getUTCMinutes() === 0) ? "day" : "time",
			} as PartialDate.Parsed));
			if (event.endsAt) i.setEnd(PartialDateUtil.format({
				year: new Date(event.endsAt).getUTCFullYear(),
				month: new Date(event.endsAt).getUTCMonth() + 1,
				day: new Date(event.endsAt).getUTCDate(),
				hour: new Date(event.endsAt).getUTCHours(),
				minute: new Date(event.endsAt).getUTCMinutes(),
				timezone: "UTC",
				precision: (new Date(event.endsAt).getUTCHours() === 0 && new Date(event.endsAt).getUTCMinutes() === 0) ? "day" : "time",
			} as PartialDate.Parsed));
			i.addAllVenues();
			return i;
		});
	}

	for (let link of event.uris || [])
		builder.addLink(l => l.setUrl(link.uri).setName(link.name ?? "", language));

	for (let media of (event.media ?? [])) {
		if (did) builder.data.components?.push({
			$type: "directory.evnt.component.splashMedia",
			media: {
				alt: media.alt ? { [language]: media.alt } : undefined,
				sources: [
					{
						blob: {
							...media.content,
							$type: "blob",
						},
						// Fallback mechanism
						url: `https://blobs.blue/${did}/blob/${media.content.ref.$link}`,
					},
				],
			} as Media,
			roles: [
				...(media.role ? [media.role] : []),
				"background",
				"poster",
			],
		});
	}

	if (event.description) {
		builder.data.components ??= [];
		builder.data.components.push({
			$type: "app.bsky.richtext",
			text: event.description,
			facets: event.facets,
		});
	}

	if (event.additionalData) {
		builder.data.components ??= [];
		builder.data.components.push({
			$type: "community.lexicon.calendar.event#additionalData",
			...event.additionalData,
		});
	}

	return builder.build();
};
