# @evnt/pretty

Format [OpenEvnt](https://evnt.directory) events as human-readable text.

```ts
import { MarkdownFormatter } from "@evnt/pretty";

new MarkdownFormatter().formatEvent(event);
// **Tech Meetup**
// 📍 Google Campus
// 📅 Jun 15
// 🕐 18:00 – 21:00
```

## Formatters

- **PlainTextFormatter** — raw text, no markup
- **EmojiFormatter** — adds 📅🕐📍 emoji
- **MarkdownFormatter** — bold, italic, clickable links
- **DiscordFormatter** — inline timestamps, blockquotes

```ts
import { PlainTextFormatter, DiscordFormatter } from "@evnt/pretty";

new PlainTextFormatter().formatEvent(event);
new DiscordFormatter({ timestampStyle: "both" }).formatEvent(event);
```

## Options

| Option                | Default | Description                      |
| --------------------- | ------- | -------------------------------- |
| language              | "en"    | locale for dates/times           |
| timezone              | null    | viewer timezone (nullable)       |
| groupConsecutiveDates | true    | merge consecutive same-time days |
| showStatus            | false   | show cancelled/uncertain etc     |
| showLinks             | false   | show link components             |
| compactDates          | true    | "Jun 15" vs "June 15, 2026"      |
| maxDates              | 5       | max date groups to show          |

`EmojiFormatOptions` extends these with `emoji` and `statusIcons` maps. Set any icon to `""` to suppress it.

`DiscordFormatOptions` extends further with `timestampStyle: "off" | "both" | "only"`.

## Utilities

```ts
import { groupDates, formatDate, addDuration } from "@evnt/pretty";

// group instances by venue-set + time pattern
const venueGroups = groupDates(event.instances ?? [], true);

// format a PartialDate
formatDate("2026-06-15[Europe/London]", { language: "en", compactDates: true });

// add duration to a time string
addDuration("14:00", "01:30"); // "15:30"
```
