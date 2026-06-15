# Open Evnt

Open Evnt is a data format for events.

Other formats can handle events that fit in a box - one name, one date, one location. When your event has a name in three languages, a date you only know as "June 2026," and both a livestream and a physical venue - the box doesn't fit. Your data ends up with a fake date, details crammed into the description field, or left out entirely. The description becomes a dumping ground - apps can't do anything useful with it, and anyone reading it has to pick through text to find what matters.

Open Evnt doesn't have a box. It handles names in any number of languages, dates at whatever precision you have, multiple venues on the same instance, and custom fields when you need them. Not as workarounds - as features.

Describe your event accurately. As it actually is.
## What that looks like

```json
{
	"v": "0.1",
	"name": {
		"en": "Summer Workshop Series",
		"fr": "Ateliers d'\u00e9t\u00e9",
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
	]
}
```

## Start here

- **Try it** in the [Playground](/playground)
- **Write your first event** with the [Quickstart](/guide/getting-started)
- Read the [Specification](/spec/)
- **Understand the design** in the [Why guides](/guide/root)
