# Packages

Convenience tooling for working with Open Evnt is published under the `@evnt` scope on npm. The format itself has no dependency on these packages.

| Package | npm install | What it solves | Description |
|---------|-------------|----------------|-------------|
| `@evnt/types` | `npm install @evnt/types` | Type-safe event data in your TypeScript project | TypeScript type definitions for the format |
| `@evnt/schema` | `npm install @evnt/schema` | Validate incoming event data against the spec at runtime | Zod validation schemas, re-exports types |
| `@evnt/partial-date` | `npm install @evnt/partial-date` | Parse and format imprecise dates (year-only, month-only) | Partial date parsing and formatting |
| `@evnt/translations` | `npm install @evnt/translations` | Resolve multilingual event content by language preference | Multilingual text utilities |
| `@evnt/builder` | `npm install @evnt/builder` | Construct complex event objects with a fluent API | Builder pattern for constructing events |
| `@evnt/pretty` | `npm install @evnt/pretty` | Format events as human-readable text for any medium | Layered formatters (plain, markdown, Discord) |
| `@evnt/convert` | `npm install @evnt/convert` | Exchange event data with iCalendar, Schema.org, ActivityStreams, and more | Convert to/from iCalendar, ActivityStreams, Schema.org, Google, Community Lexicon |
| `@evnt/dev` | `npm install -D @evnt/dev` | Validate, convert, and scaffold events from the terminal | CLI tool for validation, display, conversion, scaffolding (also works via `npx`) |

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

const ics = formats.icalendar.to?.(event);
const evnt = formats.activitystreams.from?.(input);
```

## Pretty-printing

```bash
npm install @evnt/pretty
```

```ts
import { MarkdownFormatter, analyzeEvent } from "@evnt/pretty";

const analyzed = analyzeEvent(event, { language: "en" });
const md = new MarkdownFormatter(MarkdownFormatter.defaults).formatEvent(analyzed);
```

## CLI

```bash
npx @evnt/dev validate event.json
npx @evnt/dev show event.json
npx @evnt/dev convert event.json -f icalendar
```

```ts
import { validate, show, convert, build, check, genNew } from "@evnt/dev";
```
