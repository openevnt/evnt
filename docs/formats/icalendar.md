# Compared to iCalendar

iCalendar (RFC 5545) is a calendar interchange protocol. It handles recurrence rules, attendee management, RSVP, and free/busy. For everything else -- multilingual names, partial dates, hybrid venues, custom metadata -- you have to hack it into DESCRIPTION fields with ad-hoc conventions like "TICKET_URL:...".

## What iCalendar does well

Recurrence rules (RRULE) are the most mature in any event format. Attendee management, RSVP, and free/busy queries are first-class features. iCalendar is the universal calendar interchange format, supported by every calendar application and device.

## Where it falls short

- **One language per event.** The SUMMARY, DESCRIPTION, and LOCATION properties hold a single text value. There is no mechanism for providing multiple translations of the same property.
- **No partial dates.** iCalendar supports date-only values (YYYYMMDD for whole-day events), but there is no way to represent month (2026-06) or year (2026) precision. An event known only by month requires a fabricated day.
- **One DTSTART/DTEND pair per VEVENT.** A three-day conference with different hours each day requires either three separate VEVENTs (losing the parent relationship) or a recurrence rule with overrides.
- **One LOCATION per VEVENT.** A hybrid event with a physical venue and a livestream requires stuffing both into one string.
- **Custom data has no namespace.** X-properties like X-TICKET-URL have no collision protection, no schema enforcement, and no guarantee of preservation across edits.
- **Format overhead.** A valid VEVENT requires a VCALENDAR wrapper, PRODID, VERSION, UID, and MIME content-type before you describe the event. iCalendar is not plain JSON -- consuming it requires a MIME parser on top of the VCALENDAR structure.

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

**iCalendar version:**

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
DTSTART:20260601T000000Z    -- invented date
SUMMARY:Technolohichna Zustrich
END:VEVENT
```

## When to use which

**Use iCalendar when:**

- **You need recurrence rules.** RRULE is the most powerful recurrence system available. If your events have patterns like "every second Tuesday except the third month of odd years," iCalendar handles it natively. Open Evnt does not yet define a recurrence model.
- **You need calendar sync with mainstream tools.** Every calendar app imports and exports iCalendar. If your event data must land on a user's personal calendar, iCalendar is the path in.
- **You need attendee management and RSVP.** iCalendar has built-in ORGANIZER, ATTENDEE, and STATUS properties.
- **You are building a calendar application that exchanges events with other calendar software.** iCalendar is the interchange format for calendar data.

**Use Open Evnt for everything else.** Open Evnt handles [translations](why/translations), [partial dates](why/partial-date), [multiple instances](why/instances), [decoupled venues](why/venues), and [typed extensions](why/components) natively -- each of which requires a data-stuffing workaround in iCalendar. Use it as your canonical event format and convert to iCalendar on export.

**How they work together.** Author and manage events in Open Evnt, convert to iCalendar for calendar sync using `@evnt/convert`. Converting from Open Evnt to iCalendar loses data that iCalendar cannot represent -- multilingual names, partial dates, multiple instances, and typed components. This is a one-way conversion by design: iCalendar is the distribution format, not the source of truth.
