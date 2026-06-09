# @evnt/translations

Multilingual translations utilities for [Open Evnt](https://evnt.directory).

Works with the `Translations` type (`Record<string, string>`) used
throughout the Open Evnt ecosystem for multilingual fields.

## Usage

```ts
import { TranslationsUtil } from "@evnt/translations";

const name = { en: "Tech Meetup", de: "Techniktreffen", fr: "Rencontre Tech" };

// Get the best match for preferred languages
TranslationsUtil.translate(name, ["de", "en"]);
// "Techniktreffen"

// List available languages
TranslationsUtil.languages(name);
// ["en", "de", "fr"]

// Find a translation by substring
TranslationsUtil.find(name, "Tech");
// { en: "Tech Meetup" }

// Get all non-empty values
TranslationsUtil.values(name);
// ["Tech Meetup", "Techniktreffen", "Rencontre Tech"]

// Omit certain languages
TranslationsUtil.omit(name, "fr");
// { en: "Tech Meetup", de: "Techniktreffen" }
```

## API

| Method | Description |
|--------|-------------|
| `values(t)` | Get all non-empty translation values |
| `languages(t)` | List available language codes with non-empty values |
| `translate(t, preferred)` | Get best-matching translation from preferred language list |
| `find(t, query)` | Find first translation where value contains `query` (case-insensitive) |
| `omit(t, ...codes)` | Return new Translations without specified languages |
| `merge(...list)` | Merge multiple Translations objects |
| `normalize(t)` | Remove empty/whitespace entries |
| `add(t, code, text)` | Immutably add a translation |
| `isEmpty(t)` | Check if all values are empty |
| `createTranslator(preferred)` | Create a bound translate function |

> Renamed from the legacy naming: `texts` → `values`, `codes` → `languages`,
> `search` → `find`, `without` → `omit`.

