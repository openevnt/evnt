# @evnt/pretty

Turn an OpenEvnt event into a short human-readable summary. Good for notifications, CLI output, markdown, Discord, etc.

```ts
import { renderMarkdown } from "@evnt/pretty";

const md = renderMarkdown(event);
// **Tech Meetup**
// 📅 Jun 15 · 18:00–21:00
// 📍 Google Campus · 6 Pancras Square, GB
```

## Usage

One call:

```ts
renderMarkdown(event, {
	language: "de",
	timezone: "Europe/Berlin",
	showLinks: true,
});
```

Or DIY with the separate layers:

```ts
import { analyzeEvent, PlainTextFormatter, MarkdownFormatter, DiscordFormatter } from "@evnt/pretty";

const analyzed = analyzeEvent(event, { language: "fr", mergeInstances: true });

const plain = new PlainTextFormatter({ language: "fr" }).formatEvent(analyzed);
const md    = new MarkdownFormatter({ language: "fr" }).formatEvent(analyzed);
const dc    = new DiscordFormatter({ ...DiscordFormatter.defaults, language: "fr" }).formatEvent(analyzed);
```

## Layers

### AnalyzeConfig & analyzeEvent

Controls how the event data is interpreted. Defined in `analyze-config.ts`.

| Option           | Default | What it does                                                                                            |
|------------------|---------|---------------------------------------------------------------------------------------------------------|
| `language`       | `"en"`  | Language to resolve translations to (BCP47)                                                             |
| `mergeInstances` | `true`  | Merge consecutive dates into ranges ("Oct 12-14"), group matching non-consecutive days ("Jul 1, 8, 15") |
| `maxVenues`      | `3`     | Collapse to "N locations" past this                                                                     |
| `maxDates`       | `5`     | Collapse date groups past this                                                                          |

```ts
const analyzed = analyzeEvent(event, { language: "de" });
```

### PlainTextFormatter & FormatConfig

The base formatter — pure text, no emoji, no markdown. Good for SMS, notifications, CLI output.

Config defined in `formatters/base.ts`. Used by `EmojiFormatter` and `MarkdownFormatter` too.

| Option            | Default       | What it does                                         |
|-------------------|---------------|------------------------------------------------------|
| `language`        | `"en"`        | Locale for `Intl.DateTimeFormat`                     |
| `timezone`        | `"UTC"`       | IANA timezone for local time display                 |
| `showStatus`      | `false`       | Show status (Cancelled, Uncertain, etc.)             |
| `showActivities`  | `false`       | Show activity sub-items                              |
| `showLinks`       | `false`       | Show link components                                 |
| `showDescription` | `false`       | Show description (from markdown/richtext components) |
| `compactDates`    | `true`        | "Jun 15" vs "June 15, 2026"                          |
| `emoji`           | _(see below)_ | Icon overrides                                       |
| `statusIcons`     | _(see below)_ | Status icon overrides                                |

Each formatter has `static defaults` to fill in the blanks:

```ts
new MarkdownFormatter({ ...MarkdownFormatter.defaults, language: "fr" });
```

```ts
const f = new PlainTextFormatter({ language: "de" });
console.log(f.formatEvent(analyzed));
// Tech Meetup
// Jun 15 · 18:00–21:00
// Google Campus · 6 Pancras Square, GB
```

Set any emoji or status icon to `""` to suppress it. Example: `statusIcons: { planned: "" }` renders just "Planned" with no emoji.

### EmojiFormatter

Extends `PlainTextFormatter`. Adds calendar/clock/venue/link/activity emoji and status icons. The clock emoji is dynamically picked to match the hour (🕐–🕛).

### MarkdownFormatter

Extends `EmojiFormatter`. Bolds the header, italicizes the label, makes online URLs clickable.

```ts
const f = new MarkdownFormatter({ language: "de" });
// **Tech Meetup**
// 📅 Jun 15 · 18:00–21:00
// 📍 Google Campus · 6 Pancras Square, GB
```

### DiscordFormatter & DiscordFormatConfig

Extends `MarkdownFormatter`. Config defined in `formatters/discord.ts`.

| Option           | Default | What it does                                                           |
|------------------|---------|------------------------------------------------------------------------|
| `timestampStyle` | `"off"` | `"off"` = text, `"both"` = timestamp + text, `"only"` = timestamp only |

When `timestampStyle` is `"only"` or `"both"`, dates/times use Discord inline timestamps (`<t:unix:style>`) that render in each user's local timezone. Also uses masked links (`[text](url)`) and blockquote prefixes (`-#`).

```ts
new DiscordFormatter({
	...DiscordFormatter.defaults,
	timestampStyle: "only",
});
```

### Emoji defaults

```ts
emoji: {
	calendar: "📅",
	clock: "🕐",
	online: "🌐",
	physical: "📍",
	unknown: "📍",
	link: "🔗",
	activity: "🎭",
}

statusIcons: {
	planned: "",
	uncertain: "🟡",
	postponed: "🟡",
	cancelled: "🔴",
	suspended: "🟠",
}
```
