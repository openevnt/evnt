import type { OpenEvnt, PartialDate, Translations } from "@evnt/types";
import { translate, createTranslations } from "../utils/translations";
import { isRecord, asNonEmptyString } from "../utils/text";
import { dateToPartialDate, normalizeDateString } from "../utils/date";
import type { FormatConverter, ConvertOptions } from "../types";

export const schemaOrg: FormatConverter = {
	name: "Schema.org",
	description: "Schema.org Event (JSON-LD)",
	extensions: ["json"],
	mimeTypes: ["application/ld+json", "application/json"],

	from: (input: string, opts?: ConvertOptions): OpenEvnt => {
		const language = opts?.language ?? "en";
		const data = JSON.parse(input);

		const parseTextFromSchema = (val: unknown): Translations | null => {
			if (!val) return null;
			const translations: Translations = {};
			const items = Array.isArray(val) ? val : [val];

			for (const item of items) {
				if (typeof item === "string") {
					translations[language] = item;
					continue;
				}
				if (!isRecord(item)) continue;

				if (item["@type"] === "PronounceableText" || item["@type"] === "TextObject") {
					const text = asNonEmptyString(item.textValue ?? item.text);
					if (!text) continue;
					const langs: string[] = (
						Array.isArray(item.inLanguage) ? item.inLanguage : [item.inLanguage]
					).filter((l: unknown): l is string => typeof l === "string");
					for (const lang of langs.length > 0 ? langs : [language]) {
						translations[lang] = text;
					}
				}
			}

			return Object.keys(translations).length > 0 ? translations : null;
		};

		const convertPartialDate = (dateStr: string | undefined): PartialDate | undefined => {
			if (!dateStr) return;

			// Fix common invalid formats (e.g. WordPress "2024-05-01T9:00+3:00")
			dateStr = normalizeDateString(dateStr);

			// Already a date-only string (YYYY-MM-DD)
			if (dateStr.length === 10) return dateStr as PartialDate;

			if (!dateStr.includes("T")) {
				return dateStr
					.split("-")
					.map((v) => parseInt(v, 10).toString().padStart(2, "0"))
					.join("-") as PartialDate;
			}

			const date = new Date(dateStr);
			if (isNaN(date.getTime())) return;
			return dateToPartialDate(date, "UTC");
		};

		const venues: NonNullable<OpenEvnt["venues"]> = [];
		const location = data.location;

		if (isRecord(location)) {
			const venueName = parseTextFromSchema(location.name) ??
				createTranslations(asNonEmptyString(location.name), language) ?? { [language]: "Unknown" };

			venues.push({
				id: "0",
				name: venueName,
				$type: "directory.evnt.venue.physical",
				address: {
					addr: isRecord(location.address)
						? (asNonEmptyString(location.address.streetAddress) ??
							asNonEmptyString(location.address.addressLocality))
						: undefined,
					countryCode: isRecord(location.address)
						? asNonEmptyString(location.address.addressCountry)
						: undefined,
				},
			});
		} else if (typeof location === "string") {
			venues.push({
				id: "0",
				name: { [language]: location },
				$type: "directory.evnt.venue.physical",
			});
		}

		return {
			v: "0.1",
			name: parseTextFromSchema(data.name) ?? { [language]: "Untitled Event" },
			venues: venues.length > 0 ? venues : undefined,
			instances: [
				{
					venueIds: venues.map((v) => v.id),
					start:
						typeof data.startDate === "string" ? convertPartialDate(data.startDate) : undefined,
					end: typeof data.endDate === "string" ? convertPartialDate(data.endDate) : undefined,
				},
			],
		};
	},

	to: (data: OpenEvnt, opts?: ConvertOptions): string => {
		const language = opts?.language ?? "en";

		const nameAsPronounceable = (translations: Translations | undefined): unknown[] => {
			if (!translations) return [];
			return Object.entries(translations).map(([lang, text]) => ({
				"@type": "PronounceableText",
				inLanguage: lang,
				textValue: text,
			}));
		};

		const pickTranslation = (translations: Translations | undefined): string | undefined => {
			if (!translations) return undefined;
			return translate(translations, [language, "en", ...Object.keys(translations)]);
		};

		return JSON.stringify(
			{
				"@context": "https://schema.org",
				"@type": "Event",
				name: pickTranslation(data.name) ?? "Untitled Event",
				startDate: data.instances?.[0]?.start,
				endDate: data.instances?.[0]?.end,
				location: data.venues?.[0]?.name
					? {
							"@type": "Place",
							name: pickTranslation(data.venues[0]!.name) ?? "Unknown",
						}
					: undefined,
			},
			null,
			"\t",
		);
	},
};
