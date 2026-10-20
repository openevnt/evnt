# I'm building a calendar app

Your users want events in their calendar: the conference next month, the friend's gig, the festival that's "sometime in June". Getting those events in, and keeping them right, is the hard part.

## What you're dealing with now

- **Every source is its own integration.** One site has an API with its own keys, another has a page you scrape, a third has nothing. Each one breaks on its own schedule.
- **"Add to calendar" gives you a snapshot.** The `.ics` file from that button is imported once. When the event moves, nobody tells your app, and your user finds out at a locked door.
- **Vague dates don't fit.** iCalendar wants a day. A festival announced for "June 2027" either becomes 1 June, which is wrong, or doesn't go in at all.
- **One language per field.** A Brussels festival has a French name, a Dutch name and an English one, and you get whichever the organizer typed first.
- **Postponed has nowhere to go.** iCalendar's `STATUS` has tentative, confirmed and cancelled. "Not happening on these dates, new ones to be announced" isn't one of them.

## One format, every source

Conventions, ticketing sites and event directories all publish the same kind of document. Support it once and every one of them works in your app, with no deal to sign with any of them.

- **A convention** puts its event on its own website ([I run a convention's website](./convention-website.md)). Your user pastes the link and has the event.
- **A ticketing site** publishes every event it sells, plus a list of all of them ([I build a ticketing site](./ticketing-site.md)). Your user follows the whole catalogue.
- **A directory** collects events from many sites ([I run an event directory](./event-directory.md)). Your user follows the directory and gets all of it.
- **The same event from two places** carries an `alternate` relation, so you show it once.

It works the other way too. Every app that reads the format is one more reason for an organizer to publish it, and that means more events your users can add.

## What's in each event

- **A URL per event that's also its identity.** Fetch it again next week and you have the current version. Same `id`, same event, so no duplicates when the user adds it twice.
- **Dates as precise as anyone knows them.** "June 2027" stays June 2027 until the organizer knows the day, then the time. Every date carries its real timezone, not an offset.
- **Names in every language the organizer wrote,** and you show the reader theirs.
- **Status that matches what happens to events.** Uncertain, cancelled or postponed for the whole event, and cancelled for one day or one talk. Cancelled events stay published, so your user sees "cancelled" instead of the event quietly vanishing.
- **A real place:** an address as people write it, a country, and a map point that says when it's only approximate.
- **Room to grow.** Anyone can add their own kinds of data as components, and your app skips the ones it doesn't know without breaking.

## What it costs you

A JSON fetch. There's no account, no API key and no SDK you have to use. There's a [JSON Schema](../spec/open-evnt-event.md#appendix-b-json-schema) to validate against, [libraries](../libraries.md) if you write TypeScript, and [test documents](https://github.com/openevnt/evnt/tree/main/examples) to check your parser.

Open Evnt is young. The [Applications](../applications.md) page lists who supports it so far.

## How

### Getting events

- **The user pastes a link.** If it's an event's web page, look for `<link rel="alternate" type="application/vnd.evnt+json">` in its `<head>` and fetch the document it points to ([Link Discovery](../protocol/link-discovery.md)).
- **The user follows a whole site.** Fetch `/.well-known/open-evnt/manifest`, take an item of type `directory.evnt.index`, and walk the index, following `next` ([Manifest](../spec/open-evnt-manifest.md), [Index](../spec/open-evnt-index.md)).
- **Check `v`** and reject versions you don't support ([§7](../spec/open-evnt-event.md#7-versioning)).

### Keeping them up to date

Store the `id` ([§2.2](../spec/open-evnt-event.md#22-identity)). When you refetch and the `id` matches, update the event you have. If two documents share an `id` but are clearly different events, keep them apart.

### Showing dates

- **Show only what's known.** `2027-06[Europe/Brussels]` is "June 2027", not 1 June at midnight ([PartialDate](../spec/open-evnt-partialdate.md)).
- **Convert times, not days.** A time can move to the reader's timezone. A day, month or year belongs to the event's timezone, so show it as written.
- **Use a timezone library.** Times inside a clock change have a [fixed reading](../spec/open-evnt-partialdate.md#31-clock-changes).
- **Each occurrence is its own entry.** All of them are at the event's venue, and any of them may have only a `start`, only an `end`, or neither.

### Status

- `uncertain`: show a warning next to the dates ([§2.1](../spec/open-evnt-event.md#21-status)).
- `cancelled` or `postponed`: keep the event, but stop showing its dates as upcoming.
- `"status": "cancelled"` on an occurrence or an activity: only that day or that part is off.

### Language

Pick a translation with RFC 4647 Lookup, so a reader asking for `pt-BR` gets `pt` when there's no `pt-BR`. If nothing matches, use `und`, then anything ([Translations](../spec/open-evnt-translations.md#3-choosing-a-language)).

### Place

No `venue` means the place isn't known, or the event is online only. Show `address` as it is. Take the map pin from the [Coordinates Component](../spec/open-evnt-event-components.md#28-coordinates-component), and don't draw an exact pin when it has an `uncertainty`.

### Components

Skip types you don't know, and keep them if you save the document back ([§6.1](../spec/open-evnt-event.md#61-component-versions)). The `#N` is part of the type, so `link#0` and `link#1` are different things. A calendar usually wants the [Markdown description](../spec/open-evnt-event-components.md#211-markdown-text-component), [links](../spec/open-evnt-event-components.md#22-link-component), and a [poster](../spec/open-evnt-event-components.md#24-splash-media-component).
