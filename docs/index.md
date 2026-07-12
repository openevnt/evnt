# Open Evnt

Open Evnt is a data format for events.

Open Evnt can represent events of any type, in any language, with any level of detail. It can describe a single-day conference with live streaming, a multi-day festival, or anything in between. Designed to be machine-readable and as accurate as possible, it can be used to power apps, websites, and other tools that need to understand events.

Open Evnt is a JSON-based format, with a simple structure that can be extended to meet your needs. It's meant to fix two big issues:

- **Data-stuffing**: Many event formats are designed to fit a single type of event, and when your event doesn't fit that type, you end up cramming data into fields that don't make sense. A description field becomes a dumping ground for details that don't fit anywhere else, and apps can't do anything useful with it. Open Evnt is designed to handle events as they actually are, without forcing them into a box.

- **Fragmentation**: Since there really was never a standard for detailed event data, every app and website has its own format. There is barely any interoperability between them, and event data is often locked into a single platform. Open Evnt is designed to be a standard that everyone can use, so that event data can be shared and reused across apps and websites.

## An example

```json
{
	"v": "0.1",
	"name": {
		"en": "Summer Workshop Series",
		"fr": "Ateliers d'été",
		"de": "Sommer-Workshop-Reihe"
	},
	"instances": [
		{
			"venueIds": ["venue-park", "venue-stream"],
			"start": "2026-07[Europe/Berlin]"
		}
	],
	"venues": [
		{
			"id": "venue-park",
			"$type": "directory.evnt.venue.physical",
			"name": { "en": "City Park" }
		},
		{
			"id": "venue-stream",
			"$type": "directory.evnt.venue.online",
			"name": { "en": "Livestream" },
			"url": "https://live.example.com/summer-workshops"
		}
	],
	"components": [
		{
			"$type": "directory.evnt.richtext.markdown",
			"content": "An example description!",
			"flavor": "gfm"
		},
		{
			"$type": "directory.evnt.component.link",
			"url": "https://example.com/summer-workshops"
		}
	]
}
```

**Summer Workshop Series**

July 2026, City Park and Livestream

An example description!

Link: example.com/summer-workshops

## Start here

- **Try it** in the [Playground](./playground)
- **Write your first event** with the [Quickstart](./guide/getting-started)
- Read the [Specification](./spec/index.md)
- **Understand the design** in the [Why guides](./guide/root.md)
