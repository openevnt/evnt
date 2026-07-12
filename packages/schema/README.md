# @evnt/schema

Zod validation schemas for [Open Evnt](https://evnt.directory) events.

Validates and parses OpenEvnt JSON data against the spec. Types are
re-exported from `@evnt/types` for convenience.

```ts
import { OpenEvntSchema } from "@evnt/schema";
import type { OpenEvnt } from "@evnt/schema"; // re-exported from @evnt/types

const result = OpenEvntSchema.safeParse(event);
if (result.success) {
	console.log("Valid event!");
} else {
	console.error(result.error.issues);
}
```

## Schemas included

| Schema                 | Type            | Description                            |
| ---------------------- | --------------- | -------------------------------------- |
| `OpenEvntSchema`       | `OpenEvnt`      | Root event schema                      |
| `EventInstanceSchema`  | `EventInstance` | Instance with dates + venue refs       |
| `PhysicalVenueSchema`  | `PhysicalVenue` | Physical venue with address            |
| `OnlineVenueSchema`    | `OnlineVenue`   | Online venue with URL                  |
| `UnknownVenueSchema`   | `UnknownVenue`  | Unspecified venue                      |
| `EventActivitySchema`  | `EventActivity` | Activity within an instance            |
| `TranslationsSchema`   | `Translations`  | Multilingual string map                |
| `PartialDateSchema`    | `PartialDate`   | Partial date string                    |
| Plus component schemas | Various         | Link, Media, Markdown, Bluesky, Source |

## Barrel export

`export * from "@evnt/types"` is re-exported from the barrel, so you can
get types from `@evnt/schema` directly without an extra import.
