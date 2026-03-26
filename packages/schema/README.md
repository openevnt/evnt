# @evnt/schema

[Evnt](https://evnt.directory) is a standardized, open-source data format for representing events.

This package provides Zod schemas for validating and parsing Evnt data, as well as utility functions for working with the schema.

Read the [specification](https://github.com/openevnt/evnt/blob/main/docs/README.md) for more details on the data format and its structure.

```ts
import { EventDataSchema, type EventData } from "@evnt/schema";

const event: EventData = {
	v: 0,
	name: {
		en: "My Event",
	},
	instances: [
		{
			venueIds: [],
			start: "2026-01-01",
		}
	],
	components: [
		{
			type: "link",
			data: { url: "https://example.com" },
		},
		{
			type: "com.example:custom",
			data: { custom: "data" },
		},
	],
};

const parsedEvent = EventDataSchema.parse(event);
```
