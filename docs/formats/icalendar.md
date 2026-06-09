# Compared to iCalendar

iCalendar (RFC 5545) is a calendar interchange protocol. It handles recurrence rules, attendee management, RSVP, and free/busy. For everything else -- multilingual names, partial dates, hybrid venues, custom metadata -- you have to hack it into DESCRIPTION fields with ad-hoc conventions like "TICKET_URL:...".

## What iCalendar does well

Recurrence rules (RRULE) are the most mature in any event format. Attendee management, RSVP, and free/busy queries are first-class features. It is the universal calendar interchange format, supported by every calendar application and device.

## Where it falls short

- **One language per event.** The SUMMARY, DESCRIPTION, and LOCATION properties hold a single text value. Language tagging via the LANGUAGE parameter exists, but there is no mechanism for providing translations.
- **No partial dates.** Every date must be a complete timestamp. An event known only by month requires a fabricated date.
- **One VEVENT per timeframe.** A three-day conference with different hours each day requires either three separate VEVENTs (losing the parent relationship) or a recurrence rule with overrides.
- **One LOCATION per VEVENT.** A hybrid event with a physical venue and a livestream requires stuffing both into one string.
- **Custom data has no namespace.** X-properties like `X-TICKET-URL` have no collision protection, no schema enforcement, and no guarantee of preservation across edits.
- **Format overhead.** RFC 5545 is a 300-page document. A valid VEVENT requires a VCALENDAR wrapper, PRODID, VERSION, UID, and MIME content-type before you describe the event.
- **MIME-based transport.** iCalendar is not plain JSON. Consuming it requires a MIME parser on top of the VCALENDAR structure.

## Side by side

The same multi-day multilingual conference:

```
iCalendar                              Open Evnt
───────────────────────────            ────────────────────────────
4 VEVENTs for 1 event                 1 JSON document
English-only SUMMARY                  name: { en, lt, uk }
DESCRIPTION: Ticket URL hack          components: [{ $type: link }]
LOCATION: "Hall / stream"             venues: [physical, online]
Ukraine: separate VEVENT              3 instances, same event
Fake date: 2026-06-01T00:00Z          Partial date: 2026-06[UTC]
```

**iCalendar** version:

```
BEGIN:VEVENT
UID:conf-day1@example.com
DTSTART:20260615T090000Z
SUMMARY:Tech Meetup (English only)
DESCRIPTION:Ticket URL: https://...\n Lithuanian: Technologijų Susitikimas
LOCATION:Main Hall / https://livestream...
END:VEVENT
... (repeat for day 2, day 3)
BEGIN:VEVENT
UID:conf-ua@example.com
DTSTART:20260601T000000Z    ← invented date
SUMMARY:Technolohichna Zustrich
END:VEVENT
```

**Open Evnt** version:

```json
{
  "v": "0.1",
  "name": { "en": "Tech Conference", "lt": "Technologijų Konferencija", "uk": "Технологічна Конференція" },
  "venues": [
    { "id": "hall", "$type": "directory.evnt.venue.physical", "name": { "en": "Main Hall" } },
    { "id": "stream", "$type": "directory.evnt.venue.online", "name": { "en": "Livestream" }, "url": "https://..." }
  ],
  "instances": [
    { "venueIds": ["hall", "stream"], "start": "2026-06-15T09:00[Europe/Vilnius]", "end": "2026-06-15T18:00[Europe/Vilnius]" },
    { "venueIds": ["hall", "stream"], "start": "2026-06-16T10:00[Europe/Vilnius]", "end": "2026-06-16T17:00[Europe/Vilnius]" },
    { "venueIds": ["hall", "stream"], "start": "2026-06-17[Europe/Vilnius]" }
  ],
  "components": [
    { "$type": "directory.evnt.component.link", "url": "https://example.com/tickets", "name": { "en": "Tickets" } }
  ]
}
```

One document. All three languages in the same name field. Three instances with independent times. Two venues cleanly separated. Ticket link as a typed component. No fabricated dates.

## When to use which

**Use iCalendar for** recurrence rules, calendar sync, or attendee management. **Use Open Evnt for** multilingual events, partial dates, hybrid venues, or custom metadata. **Use both** -- write in Open Evnt, convert to iCalendar for calendar distribution via `@evnt/convert`. Converting from Open Evnt to iCalendar loses data because iCalendar cannot represent multilingual names, partial dates, or multiple instances.
