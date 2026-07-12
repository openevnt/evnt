# @evnt/partial-date

Partial date parsing and formatting for [Open Evnt](https://evnt.directory).

```
2026[UTC]
2026-06[Europe/London]
2026-06-15[America/New_York]
2026-06-15T18:00[Europe/London]
2026-06-15T18:00[Etc/GMT+5]
```

`PartialDate` type is imported from `@evnt/types`

## Usage

```ts
import { PartialDateUtil } from "@evnt/partial-date";

// Parse a PartialDate string into a structured object
const parsed = PartialDateUtil.parse("2026-06-15T18:00[Europe/London]");
// { year: 2026, month: 6, day: 15, hour: 18, minute: 0, timezone: "Europe/London", precision: "time" }

// Format back to a string
const str = PartialDateUtil.format(parsed);
// "2026-06-15T18:00[Europe/London]"

// Convert to a Temporal.ZonedDateTime (requires Temporal API)
const zdt = PartialDateUtil.asZonedDateTime(parsed);
```

## Requirements

Requires the [Temporal API](https://tc39.es/proposal-temporal/docs/).
For environments without native Temporal, use
[temporal-polyfill-lite](https://npmx.dev/package/temporal-polyfill-lite).

## Regex

`PartialDateRegex` is also exported for use in validation contexts.
