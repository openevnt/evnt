import type { Translations } from "@evnt/types";

export type MaybeTranslations = Translations | null | undefined;

export const TranslationsUtil = new (class {
	values(translations: Translations): string[] {
		return Object.values(translations).filter((value): value is string => !!value);
	}

	languages(translations: Translations): string[] {
		return Object.keys(translations).filter((key) => !!translations[key]);
	}

	normalize(translations: Translations): Translations {
		const result: Translations = {};
		for (const [key, value] of Object.entries(translations))
			if (typeof value === "string" && value.trim() !== "") result[key] = value;
		return result;
	}

	add(translations: Translations, code: string, text: string): Translations {
		return { ...translations, [code]: text };
	}

	/** Creates a translator function based on preferred languages */
	createTranslator(preferredLanguages?: string[]) {
		return (t?: MaybeTranslations) => this.translate(t, preferredLanguages);
	}

	/** Translates a translations object based on preferred languages */
	translate(translations?: MaybeTranslations, preferredLanguages: string[] = ["en"]): string {
		if (!translations) return "";

		for (const lang of preferredLanguages) if (translations[lang]) return translations[lang]!;

		return Object.values(translations).find(Boolean) || "";
	}

	/** Merges multiple translations objects into one */
	merge(...list: MaybeTranslations[]): Translations {
		const result: Translations = {};
		for (const entry of list.filter(Boolean) as Translations[])
			for (const [key, value] of Object.entries(entry)) if (value) result[key] = value;

		return result;
	}

	/** Checks if a translations object is empty */
	isEmpty(translations?: MaybeTranslations): boolean {
		if (!translations) return true;
		return Object.values(translations).every((value) => !value);
	}

	/**
	 * Finds the first translation whose value contains the query, case-insensitive.
	 *
	 * @example
	 * const t = { en: "Hello World", fr: "Bonjour le monde" };
	 * TranslationsUtil.find(t, "world");
	 * => { en: "Hello World" }
	 *
	 * @param t Translations object to search
	 * @param query Substring to search for
	 * @returns Translations object with single key or null if not found
	 */
	find(t?: MaybeTranslations, query: string = ""): Translations | null {
		if (!t) return null;
		for (const key of Object.keys(t)) {
			const value = t[key];
			if (!value) continue;
			if (value.toLocaleLowerCase(key).includes(query.toLocaleLowerCase(key))) {
				return { [key]: value };
			}
		}
		return null;
	}

	/** Returns a new Translations object without the specified language codes */
	omit(translations: Translations, ...codes: string[]): Translations {
		const result = { ...translations };
		for (const code of codes) delete result[code];
		return result;
	}
})();

export const LanguageCodeUtil = new (class {
	/** Checks if a language code is recognized by runtime Intl */
	isRecognized(code: string): boolean {
		try {
			new Intl.Locale(code);
			return true;
		} catch {
			return false;
		}
	}

	/** Gets the name of a language code in a specified locale using runtime Intl */
	getName(code: string, displayLocale: string = "en"): string | null {
		try {
			return new Intl.DisplayNames(displayLocale, { type: "language" }).of(code) || null;
		} catch {
			return null;
		}
	}

	/** Gets the name of a language code in its own locale using runtime Intl */
	getAutonym(code: string): string | null {
		return this.getName(code, code);
	}
})();
