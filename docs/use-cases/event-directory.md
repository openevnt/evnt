# I run an event directory

You collect events from many places and list them in one spot: a city's listings, a fandom's convention calendar, a community's meetups.

## What you're dealing with now

- **You scrape or you type.** Every source has its own format, or none, and each scraper breaks on its own schedule.
- **Duplicates.** The same event arrives from the organizer, the ticket shop and another directory, and you merge them by guessing from names and dates.
- **Stale listings.** A cancelled event often just disappears from its source, so you keep listing it.
- **Your list stays on your site.** People who want your events in their calendar copy them over one by one.

## Collect from everyone, publish to everyone

- **Organizers and ticketing sites** publish documents, indexes and manifests you can collect from ([I run a convention's website](./convention-website.md), [I build a ticketing site](./ticketing-site.md)). One crawler covers all of them.
- **Duplicates come labelled.** Every event has a stable `id`, and the same event on two sites carries an `alternate` relation, so you merge on data instead of guesses.
- **Cancelled events say so.** The spec asks publishers to keep them up with a status instead of deleting them.
- **What you collect, you publish again.** Calendar apps ([I'm building a calendar app](./calendar-app.md)) can follow your directory, so your users get your picks in the app they already use. Other directories can build on yours the same way.

## What's in it for your listings

- **Dates as precise as the organizer knows them,** so "June 2027" can be listed before the day is set, and sorted with the rest.
- **Names in many languages,** so one listing works for readers of each.
- **Series and parts.** An edition links to its series, and a meetup to the convention it's part of.
- **Where it came from.** Listings you write yourself point at their source.

## What it costs you

You already crawl. This gives the crawler one format to read and a [JSON Schema](../spec/open-evnt-event.md#appendix-b-json-schema) to check it with. Publishing again is the same document format, plus an index and a manifest.

## How

### Finding events

- **Manifests** at `/.well-known/open-evnt/manifest` on the sites you follow. Skip item types you don't understand, and respect `auth`. See the [Manifest](../spec/open-evnt-manifest.md).
- **Indexes** list event URLs. Follow `next`, and dedupe items by `href`, since an item can show up on two pages. Use `updatedAt` or `etag` to skip events that haven't changed. See the [Index](../spec/open-evnt-index.md).
- **Web pages** of single events can point to their document with `<link rel="alternate">` ([Link Discovery](../protocol/link-discovery.md)).

Reject documents with a `v` you don't support, or with fields the spec doesn't define outside of components ([§8.2](../spec/open-evnt-event.md#82-additional-properties)). The JSON Schema checks most of this, but not everything.

### One event, many documents

Key everything by `id` ([§2.2](../spec/open-evnt-event.md#22-identity)).

- **Verify `https` ids.** Fetch the `id`, following redirects. If you get back a document with the same `id`, it's verified. If not, treat the `id` as a claim from whoever published it.
- **Collisions.** Two documents with the same `id` that clearly describe different events aren't the same event. Don't merge them.
- **Duplicates.** The same event listed on two sites has two `id`s. An `alternate` [relation](../spec/open-evnt-event-components.md#27-relation-component) says so. A relation is a claim by the publisher that wrote it. For more certainty, check that the other document links back.
- **Series and parts.** `parent` and `child` relations connect an edition to its series, or a meetup to the convention it's part of. The same back-link check works here: `child` for a `parent`, `parent` for a `child`.

### Publishing again

- **Mirroring** a document as it is: keep its `id`. An `id` doesn't change when a document is copied to another publisher.
- **Writing your own** from an announcement, a poster or a web page: it gets your own `id`, a [source component](../spec/open-evnt-event-components.md#23-source-component) pointing at where you got it, and an `alternate` relation to the organizer's document if there is one.
- **Keep components you don't understand** when you re-publish ([§6.1](../spec/open-evnt-event.md#61-component-versions)).
- **List what you publish** in an index and a manifest, the way a [ticketing site](./ticketing-site.md#the-whole-catalogue) does.

### Listing

- Keep cancelled and postponed events listed, but don't show their dates as upcoming ([§2.1](../spec/open-evnt-event.md#21-status)).
- Sort by when periods start, with finer precision first on a tie ([PartialDate §3.2](../spec/open-evnt-partialdate.md#32-order)).

Showing dates, languages and places works the same as in a [calendar app](./calendar-app.md#showing-dates).
