import type { Translations } from "@evnt/schema";

export interface TranslationSetter<ReturnType> {
	(str: string, language?: string): ReturnType;
	(translations: Translations): ReturnType;
}

export const createTranslationAdder = <
	ReturnType,
>(getter: () => Translations, parent: ReturnType): TranslationSetter<ReturnType> => {
	return (arg: string | Translations, language?: string) => {
		if (typeof arg === "string") arg = { [language ?? "en"]: arg };
		const translations = getter();
		for (const [lang, str] of Object.entries(arg)) {
			if (typeof str === "string") translations[lang] = str;
		}
		return parent;
	};
};

type Builder<TOut> = {
	build(): TOut;
};

type BuilderCtor<TOut, TParent, TBuilder extends Builder<TOut>> =
	new (arg?: TOut, parent?: TParent) => TBuilder;

export function createBuilderAdder<
	TItem extends Record<string, unknown>,
	TParent,
	TBuilt extends TItem,
	TBuilder extends Builder<TBuilt>,
>(
	getter: () => TItem[],
	BuilderClass: BuilderCtor<TBuilt, TParent, TBuilder>,
	parent: TParent
) {
	return (arg: TItem | ((builder: TBuilder) => TBuilder)): TParent => {
		const item: TItem =
			typeof arg === "function"
				? (arg(new BuilderClass(undefined, parent)).build() as TItem)
				: arg;

		getter().push(item);
		return parent;
	};
}
