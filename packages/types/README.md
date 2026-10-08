# @evnt/types

TypeScript type definitions for [Open Evnt](https://evnt.directory) events.

All types used across the ecosystem live here - event structure, venues,
instances, components, partial dates, media, translations, etc.

```ts
import type { OpenEvnt, Venue, EventInstance, PartialDate } from "@evnt/types";
```

## Working with components

```ts
let link: Component<"directory.evnt.component.link"> = {
	$type: "directory.evnt.component.link",
	url: "https://evnt.directory",
};
```

## Adding custom components

```ts
declare module "@evnt/types" {
	interface ComponentTypes {
		"my.custom.component": MyCustomComponent;
	}
}
```
