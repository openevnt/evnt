# @evnt/pretty

Format an OpenEvnt event as a short human-readable summary. Notifications, CLI output, markdown, Discord, etc.

```ts
import { renderMarkdown } from "@evnt/pretty";

renderMarkdown(event);
// **Tech Meetup**
// Jun 15 · 18:00-21:00
// Google Campus · 6 Pancras Square, GB
```

## One call

```ts
renderMarkdown(event, {
	language: "de",
	timezone: "Europe/Berlin",
	showLinks: true,
});
```

## Or compose yourself

```ts
import {
	MarkdownFormatter,
	PlainTextFormatter,
	groupDates,
	formatDate,
	addDuration,
} from "@evnt/pretty";

const md = new MarkdownFormatter({ language: "fr" }).formatEvent(event);
const plain = new PlainTextFormatter({ language: "fr" }).formatEvent(event);

// just the date grouping
const groups = groupDates(event.instances ?? [], true);

// just format a PartialDate
formatDate("2026-06-15[Europe/London]", { language: "en", compactDates: true, timezone: "UTC" });
// "Jun 15"

addDuration("14:00", "01:30");
// "15:30"
```

## Package structure

```
src/
├── index.ts              re-exports everything
├── types.ts              DateGroup, SingleDate, DateRange, DateList, TimeSlot
├── analyze-config.ts     AnalyzeConfig { mergeInstances }
├── analyze.ts            groupDates() -- groups instances by venue + time pattern
├── date.ts               formatDate, formatTime, formatTimeRange, formatDateRange
├── duration.ts           addDuration
└── formatters/
    ├── base.ts           PlainTextFormatter + FormatConfig
    ├── emoji.ts          EmojiFormatter + EmojiFormatConfig
    ├── markdown.ts       MarkdownFormatter
    └── discord.ts        DiscordFormatter + DiscordFormatConfig
```

Standalone utils (date, duration) are useful without the formatter classes.

## Formatters

| Formatter          | Extends            | Adds                              | Config                                                       |
| ------------------ | ------------------ | --------------------------------- | ------------------------------------------------------------ |
| PlainTextFormatter | -                  | raw text                          | FormatConfig (language, timezone, compactDates, show*, max*) |
| EmojiFormatter     | PlainTextFormatter | calendar/clock/venue/status emoji | EmojiFormatConfig (+ emoji, statusIcons)                     |
| MarkdownFormatter  | EmojiFormatter     | bold, italic, clickable links     | EmojiFormatConfig                                            |
| DiscordFormatter   | MarkdownFormatter  | inline timestamps, blockquotes    | DiscordFormatConfig (+ timestampStyle)                       |

Set any emoji or status icon to `""` to suppress it.

## Config

### FormatConfig (base)

| Option         | Default | Does                                 |
| -------------- | ------- | ------------------------------------ |
| language       | "en"    | locale for dates/times               |
| timezone       | "UTC"   | IANA timezone for local time display |
| mergeInstances | true    | merge consecutive days into ranges   |
| showStatus     | false   | show cancelled/uncertain etc         |
| showLinks      | false   | show link components                 |
| compactDates   | true    | "Jun 15" vs "June 15, 2026"          |
| maxDates       | 5       | max date groups to show              |

### EmojiFormatConfig

```ts
emoji: {
	calendar: "📅", clock: "🕐",
	online: "🌐", physical: "📍", unknown: "📍",
	link: "🔗",
}
statusIcons: {
	planned: "", uncertain: "🟡", postponed: "🟡",
	cancelled: "🔴", suspended: "🟠",
}
```

### DiscordFormatConfig

```ts
timestampStyle: "off" | "both" | "only";
```

"off" = text, "both" = timestamp + text, "only" = timestamp only.

## Example outputs

```
# PlainTextFormatter
Tech Meetup
Jun 15 · 18:00-21:00
Google Campus

# MarkdownFormatter
**Tech Meetup**
Jun 15 · 18:00-21:00
Google Campus

# DiscordFormatter (timestampStyle: "only")
**Tech Meetup**
<t:1718460000:f>
Google Campus
```
