# Open Evnt PartialDate

**Last Updated:** 2026-10-09

This document defines `PartialDate`, the date type used in Open Evnt specifications.

## 1. Introduction

A `PartialDate` is a string holding a date, and optionally a time, that is known only to some precision: a year, a month, a day or a minute. Every value names its timezone.

The key words **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, **SHOULD NOT**, **RECOMMENDED**, **NOT RECOMMENDED**, **MAY**, and **OPTIONAL** in this document are to be interpreted as described in BCP 14 ([RFC 2119](https://www.rfc-editor.org/rfc/rfc2119), [RFC 8174](https://www.rfc-editor.org/rfc/rfc8174)) when, and only when, they appear in all capitals, as shown here.

## 2. Format

### 2.1 Grammar

The grammar is written in ABNF ([RFC 5234](https://www.rfc-editor.org/rfc/rfc5234)):

```
partialdate = year [ "-" month [ "-" day [ "T" time ] ] ] "[" timezone "]"

time        = hour ":" minute
year        = 4DIGIT
month       = 2DIGIT  ; 01-12
day         = 2DIGIT  ; 01-31
hour        = 2DIGIT  ; 00-23
minute      = 2DIGIT  ; 00-59
timezone    = 1*( ALPHA / DIGIT / "-" / "_" / "/" / "+" )
```

Each part can only follow the one before it, so a time needs a day, a day needs a month, and a month needs a year. Seconds MUST NOT appear.

The date MUST exist in the Gregorian calendar. `2026-02-29` and `2026-04-31` are invalid.

The bracketed timezone is borrowed from [RFC 9557](https://www.rfc-editor.org/rfc/rfc9557), but a `PartialDate` is not a valid RFC 3339, RFC 9557 or ISO 8601 value.

### 2.2 Precision

The precision of a `PartialDate` is its last part:

| Precision | Example                           | Known                            |
| --------- | --------------------------------- | -------------------------------- |
| Year      | `2025[Europe/London]`             | The year                         |
| Month     | `2025-11[Europe/London]`          | The year and month               |
| Day       | `2025-11-12[Europe/London]`       | The date                         |
| Time      | `2025-11-12T11:00[Europe/London]` | The date and time, to the minute |

### 2.3 Timezone

The timezone is a name from the [IANA Time Zone Database](https://www.iana.org/time-zones), such as `Europe/Vilnius` or `UTC`. UTC offsets such as `Z` or `+02:00` MUST NOT be used.

Producers SHOULD use the timezone of the event's venue at every precision, including year and month. An event without a venue SHOULD use the timezone its organizer gives times in, or `UTC` when there is none.

### 2.4 Invalid Examples

| Value                                | Why                              |
| ------------------------------------ | -------------------------------- |
| `2025-11-12T11:00Z`                  | UTC offset instead of a timezone |
| `2025-11-12T11:00+02:00`             | UTC offset instead of a timezone |
| `2025-11-12T11:00[Europe/London`     | Missing closing bracket          |
| `2025-11-12T11:00:00[Europe/London]` | Seconds                          |
| `2025-11-12T11[Europe/London]`       | Time without minutes             |
| `2025-11T11:00[Europe/London]`       | Time without a day               |
| `2025T11:00[Europe/London]`          | Time without a month and day     |
| `2026-02-29[Europe/London]`          | 2026 has no 29 February          |

## 3. Meaning

A `PartialDate` covers a period of time in its timezone:

- A year covers that whole calendar year.
- A month covers that whole calendar month.
- A day covers that whole calendar day, which is 23 or 25 hours long when clocks change.
- A time covers the single instant it names.

A period starts at its first instant. A year, month or day ends at the first instant after it. A time ends at the instant it starts.

### 3.1 Clock Changes

A time that a clock change skips is read with the UTC offset from before the change. In `Europe/Vilnius`, clocks go from 03:00 to 04:00 on 29 March 2026, so `2026-03-29T03:30[Europe/Vilnius]` is the instant 04:30 local time. A time that happens twice, when clocks go back, is the first of the two.

This is how iCalendar reads local times ([RFC 5545](https://www.rfc-editor.org/rfc/rfc5545) section 3.3.5).

### 3.2 Order

A `PartialDate` *a* is not after *b* when the period of *a* starts before the period of *b* ends, or both periods start at the same instant. So a start of `2025-11-12[Europe/London]` is not after an end of `2025-11-12T18:00[Europe/London]`, and a start of `2025-11-12T10:00[Europe/London]` is not after an end of `2025-11-12[Europe/London]`.

To sort values, consumers SHOULD compare the instants their periods start at. When two periods start at the same instant, the value with the finer precision comes first.
