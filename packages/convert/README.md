# @evnt/convert

Convert between different event formats, using [Open Evnt](https://evnt.directory) as the intermediate format.

## Registry pattern

```ts
import { formats } from "@evnt/convert";

// Convert Open Evnt to iCalendar
const ics = formats.icalendar.to?.(event);

// Convert Open Evnt to ActivityStreams
const as2 = formats.activitystreams.to?.(event);

// Convert Schema.org to Open Evnt
const evnt = formats.schemaOrg.from?.(input);

import hEvent from "@evnt/convert/h-event";
const evnt2 = hEvent.from?.(htmlString);
```

Each format has an optional `to` (OpenEvnt → format) and/or `from` (format → OpenEvnt).

## Supported formats

| Key                | Name                          | `.to` | `.from` | Extensions       | Peer dependency |
| ------------------ | ----------------------------- | :---: | :-----: | ---------------- | --------------- |
| `icalendar`        | iCalendar (RFC 5545)          |  ✅   |   ✅    | `.ics`, `.ical`  | `ical.js`       |
| `jcal`             | jCal (RFC 7265)               |  ✅   |   ✅    | `.json`, `.jcal` | `ical.js`       |
| `jscalendar`       | JSCalendar (RFC 8984)         |  ✅   |   ✅    | `.json`          | —               |
| `activitystreams`  | W3C Activity Streams 2.0      |  ✅   |   ✅    | `.json`          | —               |
| `schemaOrg`        | Schema.org JSON-LD Event      |  ✅   |   ✅    | `.json`          | —               |
| `google`           | Google Calendar API           |  ❌   |   ✅    | `.json`          | —               |
| `communityLexicon` | AT Protocol Community Lexicon |  ❌   |   ✅    | `.json`          | —               |
| `hEvent`           | Microformats2 h-event (HTML)  |  ❌   |   ✅    | `.html`, `.htm`  | `htmlparser2`   |

You can import specific formats for tree-shaking:

```ts
import { icalendar, activitystreams } from "@evnt/convert";
import schemaOrg from "@evnt/convert/schema-org";
```

## Dependencies

Most converters have zero external dependencies. Some require an optional peer dependency:

| Peer dependency | Required by         | Install                |
| --------------- | ------------------- | ---------------------- |
| `ical.js`       | `icalendar`, `jcal` | `pnpm add ical.js`     |
| `htmlparser2`   | `hEvent`            | `pnpm add htmlparser2` |

If you import the main package (not tree-shaking), you may need to install these dependencies even if you don't use the formats that require them.
