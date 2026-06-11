# Packages

Tooling for working with Open Evnt is published under the `@evnt` scope on npm. The format itself has no dependency on any of these packages — they're just convenience.

All packages are at **v0.1.0** and stable for use.

| Package | `npm install` | What it does |
|---------|---------------|--------------|
| `@evnt/types` | `npm install @evnt/types` | TypeScript type definitions for the format |
| `@evnt/schema` | `npm install @evnt/schema` | Zod validation schemas — validate event data at runtime |
| `@evnt/partial-date` | `npm install @evnt/partial-date` | Parse and format partial dates (year-only, month-only, etc.) |
| `@evnt/translations` | `npm install @evnt/translations` | Resolve multilingual text by language preference |
| `@evnt/builder` | `npm install @evnt/builder` | Fluent builder API for constructing events |
| `@evnt/pretty` | `npm install @evnt/pretty` | Render events as plain text, markdown, or Discord format |
| `@evnt/convert` | `npm install @evnt/convert` | Convert to/from iCalendar, Schema.org, ActivityStreams, Google, Community Lexicon |
| `@evnt/dev` | `npm install -D @evnt/dev` | CLI for validation, display, conversion, scaffolding |

## Schema validation

```bash
npm install @evnt/schema
```

```ts
import { OpenEvntSchema } from "@evnt/schema";

const result = OpenEvntSchema.safeParse(data);
if (!result.success) {
  console.error(result.error.issues);
}
```

## Format conversion

```bash
npm install @evnt/convert
```

```ts
import { formats } from "@evnt/convert";

// Open Evnt → iCalendar
const ics = formats.icalendar.to?.(event);

// iCalendar → Open Evnt
const evnt = formats.icalendar.from?.(input);
```

Supported formats: **iCalendar**, **Schema.org**, **ActivityStreams**, **Google Calendar**, **Community Lexicon**.

Each format supports one or both directions. The [convert page](/convert) has an interactive tool to try them out.

## Pretty-printing

```bash
npm install @evnt/pretty
```

```ts
import { MarkdownFormatter, analyzeEvent } from "@evnt/pretty";

const analyzed = analyzeEvent(event, { language: "en" });
const md = new MarkdownFormatter(MarkdownFormatter.defaults).formatEvent(analyzed);
```

## Builder

```bash
npm install @evnt/builder
```

```ts
import { EventBuilder } from "@evnt/builder";

const event = new EventBuilder()
  .setName("My Event", "en")
  .addPhysicalVenue((v) => v.setId("hall").setName("Main Hall", "en"))
  .addInstance((i) => i.setStart("2026-07-15T18:00[Europe/Vilnius]").addVenueIds("hall"))
  .build();
```

## CLI

```bash
npx @evnt/dev validate event.json
npx @evnt/dev show event.json
npx @evnt/dev convert event.json -f icalendar
npx @evnt/dev new --out my-event.json
```
