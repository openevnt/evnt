import type { EventData, PartialDate, Translations, Venue } from "@evnt/schema";
import { UtilPartialDate } from "@evnt/schema/utils";
import type { Event, PronounceableText, Role, Text, TextObject, Thing, WithContext } from "schema-dts";

export const convertFromSchemaOrg = (
	data: Event,
	{
		language = "en",
		timezone,
	}: {
		language?: string,
		timezone?: string,
	} = {},
): EventData => {
	const inverseT = (str: string | null | undefined): Translations | undefined => {
		if (!str) return;
		return { [language]: str };
	}

	type IdReference = { "@id": string };
	type OrArray<T> = T | readonly T[];
	type SchemaValue<T> = OrArray<T | Role<T> | IdReference | null> | null | undefined;
	const parseText = (val: SchemaValue<Text | TextObject>): Translations | null => {
		if (!val) return null;
		let translations: Translations = {};
		let texts: (Text | Role<Text> | TextObject)[] = Array.isArray(val) ? val : [val];
		for (const item of texts) {
			if (typeof item === "string") translations[language] = item;
			else if (item["@type"] === "PronounceableText") {
				if (typeof item.textValue != "string") continue;
				let langs: string[] = (Array.isArray(item.inLanguage) ? item.inLanguage : [item.inLanguage]).filter((l) => typeof l === "string");
				for (const lang of langs) {
					if (item.textValue) translations[lang] = item.textValue;
				}
			} else if (item["@type"] === "TextObject") {
				if (typeof item.text != "string") continue;
				let langs: string[] = (Array.isArray(item.inLanguage) ? item.inLanguage : [item.inLanguage]).filter((l) => typeof l === "string");
				for (const lang of langs) {
					if (item.text) translations[lang] = item.text;
				}
			}
		}
		return Object.keys(translations).length > 0 ? translations : null;
	};

	const venues: Venue[] = [];

	if (typeof data.location == "object") {
		const location = data.location;

		if (typeof location == "string") {
			venues.push({
				id: "0",
				name: parseText(location) || { [language]: "Unknown" },
				type: "physical", // Assumption...
				address: {},
			});
		}

		venues.push({
			id: "0",
			name: parseText("name" in location ? location.name : null) || { [language]: "Unknown" },
			type: "physical",
			address: {
				// addr: location.address?.streetAddress,
				// countryCode: location.address?.addressCountry,
			},
		});
	}

	const convertPartialDate = (dateStr: string | undefined): PartialDate | undefined => {
		if (!dateStr) return;

		// wordpress sometimes outputs invalid date strings like "2024-05-01T9:00+3:00"
		dateStr = dateStr.replace(/([+-])(\d:)/g, '$10$2');

		if (dateStr.length === 10) return dateStr as PartialDate;
		if (!dateStr.includes("T")) return dateStr.split("-").map((v) => parseInt(v, 10).toString().padStart(2, "0")).join("-") as PartialDate;

		const date = new Date(dateStr);
		if (isNaN(date.getTime())) return;
		return UtilPartialDate.fromDate(date);
	}

	return {
		v: 0,
		name: parseText(data.name) || { [language]: "Untitled Event" },
		description: parseText("description" in data ? data.description : null) || undefined,
		venues,
		instances: [
			{
				venueIds: venues.map(({ id }) => id),
				start: typeof data.startDate == "string" ? convertPartialDate(data.startDate) : undefined,
				end: typeof data.endDate == "string" ? convertPartialDate(data.endDate) : undefined,
			},
		],
	};
};

export const convertToSchemaOrg = (
	data: EventData,
	{
		language = "en",
		timezone = "UTC",
	}: {
		language?: string,
		timezone?: string,
	} = {},
): WithContext<Event> => {
	const t = (translations: Translations) => {
		return Object.entries(translations).map(([language, content]) => ({
			"@type": "PronounceableText",
			inLanguage: language,
			textValue: content,
		})) as PronounceableText[];
	};

	return {
		"@context": "https://schema.org",
		"@type": "Event",
		name: t(data.name),

	};
};
