import { z } from "zod";

export type LanguageKey = z.infer<typeof LanguageKeySchema>;
export const LanguageKeySchema = z.string().meta({
    description: "BCP37 or ISO 639-1 language code",
});

export type Translations = z.infer<typeof TranslationsSchema>;
export const TranslationsSchema = z.record(LanguageKeySchema, z.string().optional())
    .meta({
        id: "Translations",
        description: "A multilingual string",
        default: {
            en: ""
        },
        examples: [
            { en: "Example", tr: "Örnek", lt: "Pavyzdys" },
        ],
        // vscode snippet support
        defaultSnippets: [
            {
                label: "Add English",
                body: { en: "$1" },
            },
            {
                label: "Add other language",
                body: { "$1": "$2" },
            }
        ]
    });
