# Why Partial Dates

Dates in the real world are rarely precise. Event formats should handle that.

## The problem

"June 2026" is a valid date for an event. A music festival announces "Summer 2026" and everyone knows what it means. A conference says "doors at 7pm" and the timezone is implied by the venue.

But try putting that in ISO 8601.

```
2026-06          <- invalid ISO 8601
2026-06-01T00:00 <- valid, but wrong (you fabricated the day and time)
```

Every existing format forces you to pick a specific instant. So you invent one. June 1st at midnight. Then you add a note saying "actual date TBD." The data is technically valid but semantically wrong. Anyone reading it has to guess which fields are real and which were made up.

This is the core problem: **date formats are designed for precision, but events live in uncertainty.** An event might be scheduled with only a month known, or a day but no time, or a time but no end time. The format should reflect that uncertainty, not paper over it.

## What PartialDate looks like

```
2025[Europe/London]          <- year only
2025-11[Europe/London]       <- year and month
2025-11-12[Europe/London]    <- full date
2025-11-12T11:00[Europe/London] <- date and time (no seconds)
```

A year, optionally a month, optionally a day, optionally a time. Every value MUST include an IANA timezone in square brackets at the end.

```json
{
  "instances": [
    { "venueIds": ["hall"], "start": "2026-06[Europe/Berlin]" }
  ]
}
```

That's a real event happening sometime in June 2026 in Berlin. No fabrication.

### Invalid examples

| Value | Why it's invalid |
|-------|-----------------|
| `2025-11-12T11:00Z` | UTC offset `Z`, not allowed |
| `2025-11-12T11:00+02:00` | UTC offset, not allowed |
| `2025-11-12T11:00[Europe/London` | Missing closing bracket |
| `2025-11-12T11:00:00[Europe/London]` | Seconds not allowed |
| `2025-11-12T11[Europe/London]` | Time without minutes |
| `2025-11T11:00[Europe/London]` | Time without day |
| `2025T11:00[Europe/London]` | Time without month and day |

## Why a new format instead of ISO 8601 / RFC 3339?

ISO 8601 and RFC 3339 are designed for precise timestamps. They require at minimum a full date (year-month-day). There's no standard way to say "June 2026" without inventing a day.

RFC 9557 added timezone brackets to RFC 3339, but still requires a full date. Open Evnt's PartialDate shares the bracket syntax but drops the full-date requirement and adds precision levels.

The format is deliberately simpler than ISO 8601 because events don't need UTC offsets, sub-minute precision, or duration/interval syntax.

### What about RFC 9557 specifically?

The spec says PartialDate is "adapted from RFC 9557 but **not compatible**." The bracket timezone syntax works the same, but PartialDate differs in four ways: it requires only a year (not a full date), it does not allow seconds, it does not allow UTC offsets like `Z` or `+02:00`, and it does not allow floating time without a timezone. If you're familiar with RFC 9557, the differences only matter when parsing: expect no seconds, no `Z`, and don't require a full date.

## Why no seconds?

Events don't have second-level precision. "Doors at 7:00:17pm" is not a thing anyone schedules. Including seconds would imply a level of precision that doesn't exist for real-world event planning.

## Why always require a timezone?

Every PartialDate includes an IANA timezone, even year-only dates where the timezone carries no semantic meaning. There are two reasons:

**1. Uniform parsing and comparison.** Every PartialDate has the same shape: precision fields plus a timezone. The parser has one code path, not "parse with timezone" vs "parse without timezone." Sorting and bounds checking also work uniformly because every value has a timezone for conversion.

**2. Floating time is ambiguous.** "Doors at 7pm" with no timezone can mean 7pm at the venue, 7pm in the organizer's timezone, or 7pm in the reader's local time. Different consumers will interpret it differently, and the same event will show different times to different people.

If the timezone is implicit from the venue, model it explicitly instead of relying on floating time:

```json
{
  "venues": [
    {
      "id": "hall",
      "$type": "directory.evnt.venue.physical",
      "name": { "en": "Concert Hall" }
    }
  ],
  "instances": [{
    "venueIds": ["hall"],
    "start": "2025-11-12T19:00[Europe/Berlin]"
  }]
}
```

The timezone is paired with the venue's location. A consumer resolves "doors at 7pm at the venue" by reading the start timezone.

For year-only and month-only dates where the timezone doesn't affect meaning, `[UTC]` is the conventional choice.

## Why IANA timezones instead of UTC offsets?

UTC offsets (`+02:00`, `-05:00`) look precise but lie about real-world time. An event at `2025-07-15T11:00+02:00` is wrong if the venue observes DST, because July in that location might be `+03:00`. The offset `+02:00` is only correct for winter.

IANA timezone identifiers (`Europe/Berlin`) carry the full DST rules. A consumer with a timezone database can compute the correct offset for any date. The tradeoff: IANA timezones require a timezone database (included in every modern OS, browser, and language stdlib). UTC offsets can be parsed without any dependencies. For event data, where date accuracy across DST boundaries matters, the dependency is worth it.

DST transition days also work correctly with IANA timezones. A day-precision date like `2025-03-30[Europe/London]` covers midnight-to-midnight in that zone, even if the actual duration is 23 or 25 hours due to clocks changing. Consumers with timezone libraries handle this automatically.

## Why require minutes?

Clock times in event contexts almost always include minutes. "Doors at 7pm" is `19:00`, doors at half past seven is `19:30`. Even when someone says "starts at 7" colloquially, they mean 7:00.

Allowing `T19` would save three characters but create ambiguity: does `T19` mean exactly 19:00, or "sometime between 19:00 and 19:59"? By requiring minutes, every time value pins down the minute with no ambiguity. If you truly don't know the minute, the time precision level isn't appropriate for your data.

## Why cross-precision comparison is not recommended

Comparing `2025[UTC]` (year) with `2025-06[UTC]` (month) means comparing ranges, not points. The year covers 365 days. The month covers 30. "Does June 2025 fall within 2025?" Yes. "Does 2025 fall within June 2025?" No.

The answer depends on what you're asking. Containment, overlap, and ordering each require a different algorithm. Rather than define one that's wrong for some use cases, the spec leaves it as "not recommended" and lets consumers define their own rules.

## What this enables

PartialDate lets you represent events exactly as they're known, no fabrication:

```json
{
  "name": { "en": "Summer Music Festival" },
  "instances": [
    { "venueIds": ["field"], "start": "2026-06[Europe/Berlin]" }
  ]
}
```

That's a real event happening sometime in June 2026. The data is true. Every consumer knows the precision is month-level because the PartialDate says so - no guessing, no conventions.
