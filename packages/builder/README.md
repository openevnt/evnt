# @evnt/builder

Builder pattern classes for constructing [Open Evnt](https://evnt.directory) events.

Provides a fluent API for building OpenEvnt objects step by step.

```ts
import { EventBuilder } from "@evnt/builder";

const event = new EventBuilder()
	.setName("Tech Meetup", "en")
	.addPhysicalVenue((v) =>
		v.setId("v1").setName("Community Hall", "en").setAddressLine("Main St 1").setCountryCode("LT"),
	)
	.addInstance((i) =>
		i
			.setStart("2026-06-15T18:00[Europe/Vilnius]")
			.setEnd("2026-06-15T21:00[Europe/Vilnius]")
			.addAllVenues(),
	)
	.addLink((l) => l.setUrl("https://example.com"))
	.build();
```
