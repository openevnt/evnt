import type { OpenEvnt, Media, PartialDate, PhysicalVenue } from "@evnt/types";
import { PartialDateUtil } from "@evnt/partial-date";
import { EventBuilder, PhysicalVenueBuilder } from "@evnt/builder";
import type { CommunityLexiconCalendarEvent } from "../lexicons";
import type { FormatConverter, ConvertOptions } from "../types";

interface LexiconEvent extends CommunityLexiconCalendarEvent.Main {
	facets?: Array<{
		index: { byteStart: number; byteEnd: number };
		features: Record<string, unknown>[];
	}>;
	media?: Array<{
		$type?: "community.lexicon.calendar.event#media";
		alt?: string;
		role?: string;
		content: {
			$type: "blob";
			ref: { $link: string };
			size: number;
			mimeType: string;
		};
		aspect_ratio?: { width: number; height: number };
	}>;
	additionalData?: Record<string, unknown>;
}

export const communityLexicon: FormatConverter = {
	name: "Community Lexicon",
	description: "AT Protocol community lexicon calendar event",
	extensions: ["json"],
	mimeTypes: ["application/json"],

	from: (input: string, opts?: ConvertOptions): OpenEvnt => {
		const language = opts?.language ?? "en";
		const event: LexiconEvent = JSON.parse(input);
		const builder = new EventBuilder();

		if (event.name) builder.setName(event.name, language);

		const upsertPhysicalVenue = (name: string, fn: (b: PhysicalVenueBuilder) => PhysicalVenueBuilder) => {
			const idx = builder.data.venues?.findIndex(
				(v) => v.$type === "directory.evnt.venue.physical" && v.name[language] === name,
			);
			builder.data.venues ??= [];
			if (idx !== undefined && idx >= 0) {
				const venue = builder.data.venues[idx]!;
				builder.data.venues[idx] = fn(new PhysicalVenueBuilder(venue as PhysicalVenue, builder)).build();
			} else {
				builder.addPhysicalVenue((b) => fn(b).setName(name, language));
			}
		};

		for (const [index, location] of (event.locations ?? []).entries()) {
			switch (location.$type) {
				case "community.lexicon.calendar.event#uri":
					builder.addOnlineVenue((v) =>
						v.setId(index.toString())
							.setName(location.name ?? "", language)
							.setUrl(location.uri)
					);
					break;
				case "community.lexicon.location.address":
					upsertPhysicalVenue(location.name ?? "", (b) =>
						b.setId(index.toString())
							.setCountryCode(location.country)
							.setAddressLine([location.street, location.locality, location.region].filter(Boolean).join(" "))
					);
					break;
				case "community.lexicon.location.fsq":
				case "community.lexicon.location.geo":
					upsertPhysicalVenue(location.name ?? "", (b) =>
						b.setId(index.toString())
					);
					break;
				default:
					builder.addUnknownVenue((v) =>
						v.setId(index.toString()).setName(location.name ?? "", language)
					);
			}
		}

		// Build PartialDate from a JS Date string
		const jsDateToPartialDate = (value: string): PartialDate | undefined => {
			const d = new Date(value);
			if (isNaN(d.getTime())) return undefined;
			const hour = d.getUTCHours();
			const minute = d.getUTCMinutes();
			return PartialDateUtil.format({
				year: d.getUTCFullYear(),
				month: d.getUTCMonth() + 1,
				day: d.getUTCDate(),
				hour,
				minute,
				timezone: "UTC",
				precision: hour === 0 && minute === 0 ? "day" : "time",
			} as PartialDate.Parsed);
		};

		if (event.startsAt || event.endsAt) {
			builder.addInstance((i) => {
				if (event.startsAt) {
					const pd = jsDateToPartialDate(event.startsAt);
					if (pd) i.setStart(pd);
				}
				if (event.endsAt) {
					const pd = jsDateToPartialDate(event.endsAt);
					if (pd) i.setEnd(pd);
				}
				i.addAllVenues();
				return i;
			});
		}

		for (const link of event.uris ?? []) {
			builder.addLink((l) => l.setUrl(link.uri).setName(link.name ?? "", language));
		}

		for (const media of event.media ?? []) {
			builder.data.components ??= [];
			builder.data.components.push({
				$type: "directory.evnt.component.splashMedia",
				media: {
					alt: media.alt ? { [language]: media.alt } : undefined,
					sources: [
						{
							blob: {
								...media.content,
								$type: "blob",
							},
							url: opts?.did
								? `https://blobs.blue/${opts.did}/blob/${media.content.ref.$link}`
								: `at://${media.content.ref.$link}`,
						},
					],
				} as Media,
				roles: [media.role, "background", "poster"].filter(Boolean) as string[],
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
	},
};
