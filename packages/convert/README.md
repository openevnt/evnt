# @evnt/convert

Format converters for [Open Evnt](https://evnt.directory) — convert OpenEvnt
events to/from other calendar and event formats.

## Registry pattern

```ts
import { formats } from "@evnt/convert";

// Convert OpenEvnt → iCalendar
const ics = formats.icalendar.to?.(event);

// Convert OpenEvnt → ActivityStreams
const as2 = formats.activitystreams.to?.(event);

// Convert Schema.org → OpenEvnt
const evnt = formats.schemaOrg.from?.(input);
```

Each format has an optional `to` (OpenEvnt → format) and/or `from` (format → OpenEvnt).

## Supported formats

| Key                | Name                          | To  | From | Extensions      |
| ------------------ | ----------------------------- | :-: | :--: | --------------- |
| `icalendar`        | iCalendar (RFC 5545)          | ✅  |  ✅  | `.ics`, `.ical` |
| `activitystreams`  | W3C Activity Streams 2.0      | ✅  |  ✅  | `.json`         |
| `schemaOrg`        | Schema.org JSON-LD Event      | ✅  |  ✅  | `.json`         |
| `google`           | Google Calendar API           |  —  |  ✅  | `.json`         |
| `communityLexicon` | AT Protocol Community Lexicon |  —  |  ✅  | `.json`         |

## Convenience imports

```ts
import { icalendar } from "@evnt/convert";
// Or tree-shake directly:
import { icalendar } from "@evnt/convert/formats/icalendar";

icalendar.to?.(event, { language: "de" });
```

## Lookup helpers

```ts
import { findByExtension, findByMimeType } from "@evnt/convert";

const fmt = findByExtension(".ics");
// fmt === formats.icalendar

const fmt2 = findByMimeType("application/ld+json");
// fmt2 === formats.schemaOrg
```

## Shared utilities

Internal helpers shared across converters:

- **`utils/date`**: `parseDateString`, `dateToPartialDate`, `partialDateToIso`, `normalizeDateString`
- **`utils/text`**: `isRecord`, `asArray`, `asNonEmptyString`, `readUrlLike`, `asNumber`
- **`utils/translations`**: `createTranslations`, `translate`
