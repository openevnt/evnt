# Why Instances

## The problem

Most formats assume one event equals one occurrence at one time.

```
DTSTART:20251112T190000
DTEND:20251112T220000
```
iCalendar has one start and one end. If an event happens across three days, you either repeat the whole event three times (and lose the connection between them) or use recurrence rules that are famously hard to get right.

```json
{
  "startDate": "2025-11-12",
  "endDate": "2025-11-14"
}
```
Other formats (like Schema.org) can represent a date range, but it's still one occurrence with one start and one end. If day one is at a different venue than day two, or has different hours, there's no way to express that without creating separate events.

The bet these formats make: an event is a single block on a calendar. That's true for a meeting. It's false for almost everything else - conferences, festivals, tours, workshops.

## What an instance is

An instance is a single continuous occurrence of an event.

If something happens once - a one-night concert, a single workshop - it has one instance. If it happens multiple times - a conference over three days, a tour with six stops - each occurrence is its own instance.

Each instance has this shape:

```
{
  venueIds: string[];
  start?:   PartialDate;
  end?:     PartialDate;
}
```

Partial dates make this especially useful - an instance can start "sometime in June 2026" and end "sometime in July 2026" without fabricating a specific day.

```json
{
  "instances": [
    { "venueIds": ["hall"], "start": "2026-06-15T09:00[Europe/Vilnius]", "end": "2026-06-15T18:00[Europe/Vilnius]" },
    { "venueIds": ["hall"], "start": "2026-06-16T10:00[Europe/Vilnius]", "end": "2026-06-16T17:00[Europe/Vilnius]" }
  ]
}
```

Two days, two instances, same venue. Each has its own start and end. No recurrence rules, no repeated events - just a list of when this event actually happens.

### Why instances instead of recurrence rules?

Recurrence rules (RRULE in iCalendar) are a mathematical way to describe repeating patterns - "every Tuesday at 7pm until December." They're compact and powerful. They're also notoriously hard to implement correctly. Edge cases around exception dates, modified instances, and DST crossings are a constant source of bugs.

Instances are the opposite: explicit and dumb. Every occurrence is listed. If a conference reschedules day two, you change one instance instead of computing exception rules. If a festival adds a fourth day, you append an instance instead of modifying a recurrence pattern.

The tradeoff: for truly repeating events like "every Tuesday at 7pm," you'd write out 52 instances for a year. That's more data, but it's simpler data. A app doesn't need an RRULE parser - it just reads the list. Recurrence as an optimization can be added later at the transport or application layer without changing the core format.

## venueIds

Every instance has a `venueIds` array. It's required but can be empty.

```json
{ "venueIds": [], "start": "2026-06[Europe/Vilnius]" }
```

An empty array means "no venue is known" - the event has a date but nobody knows where yet. As the event gets planned, venues get added to the event's venue list and the instance's `venueIds` gets populated.

Each id in the array matches a venue's `id` from the event's `venues` list. Together they look like:

```json
{
  "venues": [
    { "id": "hall", "$type": "directory.evnt.venue.physical", "name": { "en": "Main Hall" } },
    { "id": "stream", "$type": "directory.evnt.venue.online", "name": { "en": "Livestream" }, "url": "https://..." }
  ],
  "instances": [
    { "venueIds": ["hall", "stream"], "start": "2026-06-15T09:00[Europe/Vilnius]" }
  ]
}
```

Multiple venue ids per instance means hybrid events work naturally - the instance happens in the hall AND on the stream. No need to cram two locations into one string.

## start and end

Both are optional. An instance with no start or end means the time isn't known yet - a placeholder that says "this will happen, we'll figure out when later."

This is different from an event with no instances at all. Zero instances means nothing is scheduled. An instance with no start/end means something is scheduled but the time is unknown.

### Why no duration?

Open Evnt follows single source of truth: one way to express one thing. Duration duplicates end - if you know start and duration, you can compute end, and if both are provided they could disagree. Dropping duration avoids that.

You could flip it and ask: why not start + duration instead of start + end? Because PartialDates can be imprecise - a month-precision start with a "2 hours" duration is ambiguous (2 hours on which day?). End dates are unambiguous regardless of precision: an end of "June 2026" means the event finishes sometime in June.

### Why the end precision constraint?

End has to be the same or lower precision than start. The reasoning: if you know the end time down to the minute, you probably know the start with at least the same detail. A start of "sometime on June 15" with an end of "exactly 6pm on June 16" is unusual enough that the spec doesn't optimize for it. If you need this, use day precision for both and express the end time in a component.



## Multi-day vs multiple instances

Two patterns for events spanning multiple days:

- **Single instance, multi-day**: Use when attendance is continuous. A weekend-long festival where attendees stay the whole time gets one instance starting Saturday and ending Sunday. One start, one end, one venue.

- **Multiple instances**: Use when attendance is discrete. A conference with day 1 and day 2 as separate sessions with different hours gets two instances, one per day.

The rule of thumb is attendance pattern, not calendar days. If an attendee leaves and comes back, it's multiple instances. If they stay, it's one.

## Zero-instance events

An event with no instances is valid. It represents an event that hasn't been scheduled yet - you know the name, maybe the venue, but not when it happens. It's a shell that gets populated as planning progresses.

```json
{
  "name": { "en": "Upcoming Workshop" },
  "venues": [
    { "id": "hall", "$type": "directory.evnt.venue.physical", "name": { "en": "Workshop Space" } }
  ]
}
```

No instances means no scheduled occurrences. When a date is set, an instance gets added.
