import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { LOCALSTORAGE_KEYS } from "../constants";
import { useCallback, useMemo } from "react";
import type { Translations } from "@evnt/schema";
import { TranslationsUtil } from "@evnt/translations";

export interface LocaleStore {
	language: string;
	setLanguage: (lang: string) => void;
	timezone?: string;
};

export const useLocaleStore = create<LocaleStore>()(
	persist(
		immer((set, get) => ({
			language: "en",
			setLanguage: (lang: string) => set((state) => {
				state.language = lang;
			}),
		})),
		{
			name: LOCALSTORAGE_KEYS.locale,
			version: 1,
		},
	),
);

export const useTranslations = () => {
	const language = useLocaleStore((state) => state.language);

	const resolve = useMemo(() => TranslationsUtil.createTranslator([language]), [language]);

	return resolve;
};
