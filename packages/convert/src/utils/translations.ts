import type { Translations } from "@evnt/types";

/** Create a single‑language Translations object from a string and language code. */
export const createTranslations = (
	text: string | undefined | null,
	language: string,
): Translations => {
	if (!text) return {};
	return { [language]: text };
};

/** Inverse — extract a single string from Translations for a preferred language. */
export const translate = (
	translations: Translations | undefined | null,
	preferred: string[],
): string | undefined => {
	if (!translations) return undefined;
	for (const lang of preferred) {
		const val = translations[lang];
		if (val) return val;
	}
	return undefined;
};
