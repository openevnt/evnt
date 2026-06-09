# Open Evnt

Not every event fits in a calendar. A festival announced as "June 2026." A conference with different hours each day and a livestream link. A meetup that rotates between venues. A name that needs to read "Technologijų Susitikimas" in Vilnius and "Technologische Begegnung" in Berlin.

And when you do find an event, it is trapped in whichever app listed it. Facebook Events. Google Calendar. Luma. Eventbrite. Meetup. Discord. Each stores event data in its own silo. Each speaks a different format. Users check five places. Developers write five scrapers. The event itself? It exists in none of them.

This is **data fragmentation** -- your event is split across platforms that cannot talk to each other.

Even within a single format, the data itself does not fit. A ticket URL goes in a description field. A second language name gets prefixed with "English below." A hybrid venue gets stuffed into a single location string. This is **data stuffing** -- solving the format's limitations by breaking its semantics.

Open Evnt is a universal file format for events. It eliminates both problems. Multilingual fields are built in, not bolted on. Dates match what you actually know, not what a calendar widget demands. Venues and times are decoupled. Custom fields use a naming system that never requires a spec change. One file, one representation. Your canonical source of truth, not another silo.

- [Why Open Evnt?](why/) -- read the design rationale
- [Try the playground](playground) -- validate and experiment with events
- [See real events](https://github.com/deniz-blue/events-data) -- browse 50+ events in the format
- [Read the spec](https://github.com/openevnt/evnt/blob/main/docs/README.md) -- full format specification

## What data stuffing looks like

The same conference in iCalendar (left) and Open Evnt (right):

```
iCalendar                          OpenEvnt
─────────────────────────────      ─────────────────────────────
4 VEVENTs for 1 event             1 JSON document
English-only SUMMARY              name: { en, lt, uk }
DESCRIPTION: Ticket URL hack      components: [{ $type: link }]
LOCATION: "Hall / stream"         venues: [physical, online]
Ukraine: separate VEVENT          3 instances, same event
Fake date: 2026-06-01T00:00Z      Partial date: 2026-06[UTC]
```

These formats can not represent what Open Evnt can. When you need legacy output, `@evnt/convert` provides one-way conversion to iCalendar, ActivityStreams, Schema.org, and Google Events -- with the understanding that the target format cannot express everything Open Evnt stores. Your data is not locked in, but the richer representation is Open Evnt.

## Data fragmentation

Events today are scattered across platforms. A conference might be on Luma for tickets, Google Calendar for scheduling, BlueSky for announcements, and a website for details. Each platform stores a partial copy of the event. None holds the complete picture.

Open Evnt is designed as the canonical source. You store the complete event in one place -- multilingual names, partial dates, multiple instances, all venues, typed metadata -- and convert to platform-specific formats on export. Your event data is not trapped in a silo. It lives in a format designed for events, not for a single application. This means:

- **Publish once, distribute everywhere.** Write one Open Evnt file, generate iCalendar for calendar apps, Schema.org for search engines, ActivityStreams for the fediverse, and plain JSON for your own frontend.
- **No more scraping.** When your event is in Open Evnt, any tool that reads Open Evnt can display it. No API integrations, no HTML parsing, no brittle import scripts.
- **Your data, your control.** The format has no dependency on any platform, service, or vendor. A directory of JSON files on a web server is a fully functional event distribution system.

## Real events, real usage

Open Evnt is used by these projects:

- [**Vantage**](https://github.com/deniz-blue/vantage) -- a full-featured calendar web app with event editing, caching, and embed support
- [**events-data**](https://github.com/deniz-blue/events-data) -- 50+ real events from FOSDEM to cosplay conventions, in multiple languages and categories
- [**eventsl.ink**](https://eventsl.ink) -- shareable links for any Open Evnt event, viewable with no setup
- [**@evnt/**](packages/) -- TypeScript types, Zod validation, datetime parsers, format converters, pretty-printers

## Try it

[Open the playground](playground) to validate and experiment with event data in your browser.

```bash
npx @evnt/dev validate event.json
```

Or validate against the [canonical JSON Schema](https://raw.githubusercontent.com/openevnt/evnt/refs/heads/main/event-data.schema.json) with any JSON Schema validator.

## Project links

- [GitHub](https://github.com/openevnt/evnt) -- source code, issues, discussions
- [BlueSky](https://bsky.app/profile/evnt.directory) -- announcements and updates
- [Discord](https://deniz.blue/discord-invite?id=1493641727980994710) -- community chat
- [Matrix](https://matrix.to/#/#evnt:catgirl.cloud) -- community chat
