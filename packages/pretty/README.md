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
  showActivities: true,
});
```

Or DIY with the separate layers:

```ts
import { analyzeEvent, PlainTextFormatter, MarkdownFormatter, DiscordFormatter } from "@evnt/pretty";

const analyzed = analyzeEvent(event, { language: "fr", mergeInstances: true });

const plain = new PlainTextFormatter({ language: "fr" }).formatEvent(analyzed);
const md    = new MarkdownFormatter({ language: "fr" }).formatEvent(analyzed);
const dc    = new DiscordFormatter({ language: "fr" }).formatEvent(analyzed);
```

## Config

Two separate configs, merged at convenience level. No key conflicts.

### AnalyzeConfig

Controls how the event data is interpreted.

| Option           | Default | What it does                                                                                            |
|------------------|---------|---------------------------------------------------------------------------------------------------------|
| `language`       | `"en"`  | Language to resolve translations to (BCP47)                                                             |
| `mergeInstances` | `true`  | Merge consecutive dates into ranges ("Oct 12-14"), group matching non-consecutive days ("Jul 1, 8, 15") |
| `maxVenues`      | `3`     | Collapse to "N locations" past this                                                                     |
| `maxDates`       | `5`     | Collapse date groups past this                                                                          |

### FormatConfig

Controls how the output looks.

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

Set any emoji or status icon to `""` to suppress it. Example: `statusIcons: { planned: "" }` renders just "Planned" with no emoji.

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
  planned: "✅",
  uncertain: "🟡",
  postponed: "⏰",
  cancelled: "❌",
  suspended: "⏸️",
}
```

## Formatters

The three formatters form a class hierarchy:

- **PlainTextFormatter** -- base, works standalone (CLIs, SMS, notifications)
- **MarkdownFormatter** extends it -- adds bold, italic, clickable links
- **DiscordFormatter** extends MarkdownFormatter -- Discord link syntax (`<url>`), blockquote prefixes
