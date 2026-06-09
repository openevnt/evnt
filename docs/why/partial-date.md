# PartialDate

Not every event has a precise date when it is announced. A festival may be confirmed for "June 2026" months before the exact dates are set. A conference may announce a "2027" edition before the venue is booked. A workshop may have a confirmed start time but no fixed end time.

Most date formats require every component: year, month, day, hour, minute, second. When you do not have all of those, you fabricate a value. "March 2026" becomes "March 1st at midnight." Users do this because the app demands a full date. Developers do this because the schema demands it. Everyone gets wrong information.

The problem gets worse with timezones. If that placeholder midnight is encoded as UTC, users behind UTC see "February 28th 23:00". Everyone loses.

## No one talks using UTC

When a concert starts at 19:00 in Brussels, everyone in Brussels looks at their wall clock. When you tell a friend "I will be there at 2 PM", you are thinking in the local context of where the event takes place.

Event data should preserve the wall-clock time (the intended time at the location), not convert everything to UTC and hope for the best.

## What is a PartialDate

Open Evnt uses a single string type called PartialDate. It is a date format that allows year-only (2026), year-month (2026-03), or full dates with timezone. Precision varies from year-only down to minute, and the timezone is always explicit.

```
YYYY(-MM(-DD(THH:mm)?)?)?[TZ]
```

```
2026[UTC]
2026-03[America/Vancouver]
2026-10-30[Asia/Tokyo]
2027-04-01T14:00[Europe/Vilnius]
```

If a component is not in the string, it does not exist. The format prioritizes being accurate over being precisely wrong.

## Why not ISO 8601?

ISO 8601 does have truncated representations like `2026-03`. But few libraries handle them, they cannot carry timezone information, and RFC 3339 (the profile used by most JSON APIs) does not allow them. PartialDate is not a drop-in replacement for ISO 8601 -- it is a purpose-built format for event data.

The `@evnt/partial-date` package provides TypeScript parsing, formatting, and validation. Community parsers for other languages are open for contribution.

## Why not UTC offsets?

Offsets are snapshots. They do not account for the future. If an authority changes daylight saving rules between when an event is announced and when it happens, the data becomes incorrect. By anchoring the date to an IANA timezone identifier, the wall-clock time stays accurate even if daylight rules change.

## What if I don't know the timezone?

Year-only events can use `[UTC]` as a timezone-agnostic default. The timezone bracket is required in the syntax, but for year-only precision `[UTC]` is a reasonable choice that does not imply the event is UTC -- it simply means the timezone is not relevant at that precision.

## Migration from ISO 8601

Existing ISO 8601 dates can be migrated to PartialDate by appending the appropriate timezone bracket. An RFC 3339 timestamp like `2026-06-15T09:00:00Z` becomes `2026-06-15T09:00[UTC]` (seconds are dropped -- event data does not typically require second precision). A local date like `2026-06-15T09:00:00+03:00` becomes `2026-06-15T09:00[Europe/Vilnius]` when the timezone is known.
