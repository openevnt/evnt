# I build a ticketing site

You host events for many organizers. People find them on your site, buy a ticket, and then have to get the event into the rest of their life somehow.

## What you're dealing with now

- **The event stays on your site.** Buyers copy the date into their calendar by hand, or press "Add to calendar" and get a snapshot.
- **Changes don't travel.** When an organizer moves a date, your page is right, and every calendar and listing that copied it is wrong.
- **Every aggregator wants its own feed,** or scrapes you.
- **The organizer publishes too.** The same event on their site and on yours looks like two events to anyone collecting both.

## Where your events go

- **Calendar apps** ([I'm building a calendar app](./calendar-app.md)) read the document behind each event page, and can follow your whole catalogue. A date change reaches your buyers' calendars.
- **Event directories** ([I run an event directory](./event-directory.md)) collect your catalogue from one manifest, without a custom feed for each.
- **Organizers** who publish their own document ([I run a convention's website](./convention-website.md)) and your listing can point at each other, so apps know they're one event. Your ticket link travels with it.

## What you can say

- **Ticket links** that stay listed when sales pause or sell out, marked unavailable.
- **Doors and prices per ticket type,** in a component of your own.
- **Cancelled and postponed events** that stay published, with a refund link.
- **One day of a festival** called off, while the rest goes ahead.
- **Separate lists** per organizer, or private ones behind a login.

## What it costs you

One JSON document per event, generated from data you already have, plus an index and a manifest. You don't register with anyone.

## How

### One document per event

Each event gets its own document at its own URL, and that URL is its `id` ([§2.2](../spec/open-evnt-event.md#22-identity)). Generate it. Organizers shouldn't have to think of one.

If an organizer already publishes their own document for the event, there are two ways to go:

- **Serve theirs unchanged:** keep their `id`. An `id` stays the same when a document is mirrored or copied.
- **Write your own listing,** with your prices and your links: give it your own `id`, and add an `alternate` [relation](../spec/open-evnt-event-components.md#27-relation-component) pointing at theirs. They can add one back.

### Tickets

Ticket pages are [link components](../spec/open-evnt-event-components.md#22-link-component). When sales are paused or sold out, set `"disabled": true` rather than removing the link.

If ticket types get in at different times, an occurrence's `start` and `end` cover the widest window ([§5](../spec/open-evnt-event.md#5-occurrences)). The tiers themselves go in a component of your own:

```json
{
	"$type": "com.example-tickets.tiers#0",
	"tiers": [
		{ "name": "Early entry", "doors": "2027-03-06T09:00[Europe/Madrid]", "price": "45 EUR" },
		{ "name": "Day pass", "doors": "2027-03-06T11:00[Europe/Madrid]", "price": "30 EUR" }
	]
}
```

Use a domain you control in the `$type`. Start at `#0`, and only move to `#1` when you remove a field or change what one means ([§6.1](../spec/open-evnt-event.md#61-component-versions)). Adding an optional field doesn't need a new version. Apps that don't know your component skip it and keep it when they save the event.

### The whole catalogue

- **An index** at a URL like `/events.json` lists your events, with `href`, `name` and `updatedAt` or `etag` so apps only refetch what changed. Support the filters you can (`after`, `before`, `search`, `limit`), and page with `next` in a stable order. See the [Index](../spec/open-evnt-index.md).
- **A manifest** at `/.well-known/open-evnt/manifest` points to the index. Mark the main one `primary`. Per-organizer or private lists can be more items, with `"auth": "required"` where needed. See the [Manifest](../spec/open-evnt-manifest.md).
- **Your pages:** event pages link to their document with `<link rel="alternate" type="application/vnd.evnt+json">`, and listing pages link to the index with `type="application/open-evnt-index+json"` ([Link Discovery](../protocol/link-discovery.md)).

### When things change

When an event is cancelled or postponed, set `status` and keep the document published ([§2.1](../spec/open-evnt-event.md#21-status)). A refund page is one more link. If only one day of a multi-day event is off, mark that occurrence `"status": "cancelled"` instead.

If you build the listing from an announcement on another site, add a [source component](../spec/open-evnt-event-components.md#23-source-component) pointing at it. You don't need one when the organizer gave you the details directly.
