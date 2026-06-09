# Open Evnt

Events don't fit in a calendar. A festival announced as "June 2026." A conference with different hours each day and a livestream link. A meetup that rotates between venues. A name that needs to read "Technologijų Susitikimas" in Vilnius and "Technologische Begegnung" in Berlin.

Every event format eventually faces the same problem: someone needs to put data where it doesn't belong. A ticket URL in a description field. A second language name prefixed with "English below." A venue hack for a hybrid event. This is **data stuffing** -- solving the format's limitations by breaking its semantics.

Open Evnt is a file format that eliminates data stuffing. Multilingual fields are not a convention, they are built in. Dates match what you actually know, not what a calendar widget demands. Venues and times are decoupled. Custom fields use a naming system that never requires a spec change.

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

## Real events, real usage

Open Evnt powers a production ecosystem:

- [**Vantage**](https://github.com/deniz-blue/vantage) -- a full-featured calendar web app with event editing, caching, AT Protocol publishing, and embed support
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
