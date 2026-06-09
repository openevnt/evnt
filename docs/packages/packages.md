# Packages

Convenience tooling for working with Open Evnt is published under the `@evnt` scope on npm. The format itself has no dependency on these packages.

| Package | Description |
|---------|-------------|
| `@evnt/types` | TypeScript type definitions for the format |
| `@evnt/schema` | Zod validation schemas, re-exports types |
| `@evnt/partial-date` | Partial date parsing and formatting |
| `@evnt/translations` | Multilingual text utilities |
| `@evnt/builder` | Builder pattern for constructing events |
| `@evnt/pretty` | Layered formatters (plain, markdown, Discord) |
| `@evnt/convert` | Convert to/from iCalendar, ActivityStreams, Schema.org, Google, Community Lexicon |
| `@evnt/dev` | CLI tool for validation, display, conversion, scaffolding |

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
