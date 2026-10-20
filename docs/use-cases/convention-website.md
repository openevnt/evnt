# I run a convention's website

Your convention has dates, a venue, a schedule and a ticket link. You want all of that in people's calendars and on every listing site, and you want it to stay right when something changes.

## What you're dealing with now

- **Everyone copies you by hand.** Listing sites, local calendars and fan wikis type your dates in themselves. Some get the timezone wrong, and some never notice when you move a day.
- **"Add to calendar" is a snapshot.** Attendees who pressed it have the dates from the day they pressed it.
- **Every listing site has its own form,** and you fill in all of them, again for every change.
- **No dates yet means no listing.** Most forms want a day, so until you have one, the convention can't be listed at all.

## Publish once, show up everywhere

You publish one document on your own website. Everything that reads Open Evnt picks it up from there:

- **Calendar apps** ([I'm building a calendar app](./calendar-app.md)): an attendee pastes your page's link and has the convention. The app can fetch it again later, so a moved day reaches their calendar.
- **Event directories** ([I run an event directory](./event-directory.md)) that follow your site list the convention with your dates, as you wrote them.
- **Ticketing sites** ([I build a ticketing site](./ticketing-site.md)) that sell your tickets can point their listing at yours with an `alternate` relation, so apps know it's the same convention.

You stay the source. Change the document, and everyone reading it gets the change.

## What you can say

- **Dates as precise as you know them.** The year, then the month, then the days and times.
- **The name in every language** your attendees speak.
- **The schedule,** with each panel or show as an activity.
- **What fell through.** A cancelled panel, a cancelled day, or the whole convention postponed, without deleting anything.
- **The convention across the years.** Each edition points at a document for the whole series.
- **Anything else,** as a component of your own.

## What it costs you

One JSON file on your web server and one line in your page's `<head>`. No account, no platform to sign up for. Check the file in the [Playground](../playground.md) before you publish.

## How

```json
{
	"v": "0.2",
	"id": "https://harbourcon.example/2027/event.evnt.json",
	"name": { "en": "Harbour Comic Con 2027", "fr": "Harbour Comic Con 2027" },
	"venue": {
		"name": { "en": "Halifax Convention Centre" },
		"address": "1650 Argyle Street, Halifax, NS",
		"countryCode": "CA"
	},
	"occurrences": [
		{
			"start": "2027-08-13T10:00[America/Halifax]",
			"end": "2027-08-15T18:00[America/Halifax]",
			"activities": [
				{ "name": { "en": "Opening ceremony" } },
				{ "name": { "en": "Cosplay contest" } }
			]
		}
	],
	"components": [
		{
			"$type": "directory.evnt.component.link#0",
			"url": "https://harbourcon.example/tickets",
			"name": { "en": "Tickets", "fr": "Billets" }
		},
		{
			"$type": "directory.evnt.component.relation#0",
			"type": "parent",
			"target": "https://harbourcon.example/series.evnt.json"
		}
	]
}
```

### id

Use the `https` URL the document is served from ([§2.2](../spec/open-evnt-event.md#22-identity)). Never change it, even if you move the file. Redirect the old URL instead.

Next year's convention is a new event. Copy this year's document if you like, but give the copy a new `id`.

### name and the series

Put the year or edition in the `name`, as you'd write it on a poster. The convention as a whole, across all years, can have its own document, like `series.evnt.json` with just a name. Each year points at it with a `parent` relation.

### venue

An event has one venue. If day one is in the convention centre and day two is in a park across town, that's two events ([§4](../spec/open-evnt-event.md#4-venue)). Point both at the same `parent`.

### dates

If you only know the month so far, write `2027-08[America/Halifax]` and make it more precise later. Use the venue's timezone at every precision.

If doors open at different times for different tickets, `start` and `end` cover the widest window: the earliest anyone gets in, the latest anyone may stay ([§5](../spec/open-evnt-event.md#5-occurrences)).

### schedule

Panels and shows go in `activities`. A panel that's called off gets `"status": "cancelled"`, and the rest of the convention goes on.

### description and poster

Add a [Markdown component](../spec/open-evnt-event-components.md#211-markdown-text-component) for the description and a [splash media component](../spec/open-evnt-event-components.md#24-splash-media-component) with `"roles": ["poster"]` and alt text.

### cancelled or postponed

Set `status` and keep the document where it is, with its last dates ([§2.1](../spec/open-evnt-event.md#21-status)). Don't delete it, since apps that already have it need to see the change. When a postponed convention gets new dates, update `occurrences` and remove `status`.

### events inside the convention

A meetup or an after-party at the convention can be its own event with a `parent` relation to the convention. The convention can list them with `child` relations.

### publishing

- Serve the file as `.evnt.json` with `Content-Type: application/vnd.evnt+json` and `Access-Control-Allow-Origin: *`. See [HTTP](../protocol/http.md).
- On the convention's web page, add `<link rel="alternate" type="application/vnd.evnt+json" href="/2027/event.evnt.json">` to the `<head>`, so apps find the document from the page URL ([Link Discovery](../protocol/link-discovery.md)).
- If a listing site has its own document about your convention, either side can add an `alternate` relation to the other.
