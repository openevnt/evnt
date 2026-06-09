# Packages

Convenience tooling for working with Open Evnt is published under the `@evnt` scope on npm. The format itself has no dependency on these packages.

| Package | Problem it solves | Description |
|---------|-------------------|-------------|
| `@evnt/types` | Type-check your event data at compile time | TypeScript type definitions for the format |
| `@evnt/schema` | Validate event data at runtime | Zod validation schemas, re-exports types |
| `@evnt/partial-date` | Work with year-precision, month-precision, and other imprecise dates | Partial date parsing and formatting |
| `@evnt/translations` | Handle multi-language event names, descriptions, and venues | Multilingual text utilities |
| `@evnt/builder` | Construct events incrementally with full type safety | Builder pattern for constructing events |
| `@evnt/pretty` | Render events as formatted text for terminals, docs, or chat apps | Layered formatters (plain, markdown, Discord) |
| `@evnt/convert` | Interoperate with existing calendar and event formats | Convert to/from iCalendar, ActivityStreams, Schema.org, Google, Community Lexicon |
| `@evnt/dev` | Inspect, validate, and scaffold events from the command line | CLI tool for validation, display, conversion, scaffolding |

## Schema validation

```ts
import { OpenEvntSchema } from "@evnt/schema";

const result = OpenEvntSchema.safeParse(data);
if (!result.success) {
  console.error(result.error.issues);
}
```

## Format conversion

```ts
import { formats } from "@evnt/convert";

const ics = formats.icalendar.to?.(event);
const evnt = formats.activitystreams.from?.(input);
```

## Pretty-printing

```ts
import { MarkdownFormatter, analyzeEvent } from "@evnt/pretty";

const analyzed = analyzeEvent(event, { language: "en" });
const md = new MarkdownFormatter(MarkdownFormatter.defaults).formatEvent(analyzed);
```
