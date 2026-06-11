# Getting Started in 5 Minutes

Let's say you run a community. You want to organize a meetup. Open Evnt is how you describe it. All you need is a text editor.

---

You know the name.

```json
{
	"v": "0.1",
	"name": {
		"en": "Tech Meetup"
	}
}
```

`v` is the format version, `name` is the event name. That's the minimum. You have an event now. Congrats.

---

Half your members speak Lithuanian. The other half does not. This is normally where you'd write `name_lt` and `name_en` and hope everyone on your team uses the same convention. Or you can just use translations.

```json
{
	"v": "0.1",
	"name": {
		"en": "Tech Meetup",
		"lt": "Tech Susitikimas"
	}
}
```

Any BCP47 code works. `de`, `fr`, `zh-Hans-CN` — add as many as you want. No naming conventions, no side tables, no "english below".

---

You're planning a summer festival. You only know it's next June. Every other format will ask you to pick a date, and you will pick June 1st, and now your data is a lie. Open Evnt lets you say what you actually know.

```json
{
	"v": "0.1",
	"name": {
		"en": "Summer Festival"
	},
	"instances": [
		{
			"venueIds": [],
			"start": "2026-06[Europe/Vilnius]"
		}
	]
}
```

Partial dates work at any precision — year, month, day, or time. "June 2026" is valid. "Some time in 2025" is valid. "I'll figure it out later" is also valid, just leave the field out.

---

You booked a hall. You have an actual date now. Put them in.

```json
{
	"v": "0.1",
	"name": {
		"en": "Tech Meetup",
		"lt": "Tech Susitikimas"
	},
	"venues": [
		{
			"id": "hall",
			"$type": "directory.evnt.venue.physical",
			"name": { "en": "Main Hall" },
			"address": {
				"addr": "123 Main Street, Vilnius",
				"countryCode": "LT"
			}
		}
	],
	"instances": [
		{
			"venueIds": ["hall"],
			"start": "2026-07-15T18:00[Europe/Vilnius]",
			"end": "2026-07-15T21:00[Europe/Vilnius]"
		}
	]
}
```

**`venues`** define locations. **`instances`** define when. **`venueIds`** link them together. Decoupled by design, not "i guess i'll put the stream link in the description field and hope for the best."

---

It's a two-day thing now. Day two moves to a pub. You could make two separate event files and link them manually like it's 1998. Or you can just add another instance.

```json
{
	"v": "0.1",
	"name": {
		"en": "Tech Meetup",
		"lt": "Tech Susitikimas"
	},
	"venues": [
		{
			"id": "hall",
			"$type": "directory.evnt.venue.physical",
			"name": { "en": "Main Hall" },
			"address": {
				"addr": "123 Main Street, Vilnius",
				"countryCode": "LT"
			}
		},
		{
			"id": "pub",
			"$type": "directory.evnt.venue.physical",
			"name": { "en": "The Pub" }
		}
	],
	"instances": [
		{
			"venueIds": ["hall"],
			"start": "2026-07-15T18:00[Europe/Vilnius]",
			"end": "2026-07-15T21:00[Europe/Vilnius]"
		},
		{
			"venueIds": ["pub"],
			"start": "2026-07-16T19:00[Europe/Vilnius]",
			"end": "2026-07-16T22:00[Europe/Vilnius]"
		}
	]
}
```

Each instance has its own time and venue. One event, two days, two pubs. Wait, one pub. One pub.

---

Half your members want to show up in person. Half want to watch from home in their pajamas. Both is fine.

```json
{
	"v": "0.1",
	"name": {
		"en": "Tech Meetup",
		"lt": "Tech Susitikimas"
	},
	"venues": [
		{
			"id": "hall",
			"$type": "directory.evnt.venue.physical",
			"name": { "en": "Main Hall" }
		},
		{
			"id": "stream",
			"$type": "directory.evnt.venue.online",
			"name": { "en": "Livestream" },
			"url": "https://stream.example.com/live"
		}
	],
	"instances": [
		{
			"venueIds": ["hall", "stream"],
			"start": "2026-09-01T10:00[Europe/Vilnius]",
			"end": "2026-09-01T17:00[Europe/Vilnius]"
		}
	]
}
```

A single instance references both venues. Not two separate events. Not "LOCATION: Main Hall / https://stream.example.com/live". Just multiple venue IDs.

---

You made a ticket page. You have a banner image. You want people to actually find these. Throw them in components.

```json
{
	"v": "0.1",
	"name": {
		"en": "Tech Meetup",
		"lt": "Tech Susitikimas"
	},
	"venues": [
		{
			"id": "hall",
			"$type": "directory.evnt.venue.physical",
			"name": { "en": "Main Hall" }
		},
		{
			"id": "stream",
			"$type": "directory.evnt.venue.online",
			"name": { "en": "Livestream" },
			"url": "https://stream.example.com/live"
		}
	],
	"instances": [
		{
			"venueIds": ["hall", "stream"],
			"start": "2026-09-01T10:00[Europe/Vilnius]",
			"end": "2026-09-01T17:00[Europe/Vilnius]"
		}
	],
	"components": [
		{
			"$type": "directory.evnt.component.link",
			"url": "https://example.com/tickets",
			"name": { "en": "Get Tickets" }
		},
		{
			"$type": "directory.evnt.component.splashMedia",
			"media": {
				"sources": [
					{
						"url": "https://example.com/banner.jpg",
						"mimeType": "image/jpeg"
					}
				]
			},
			"roles": ["background"]
		}
	]
}
```

Components are extensible. The `$type` namespace means no field ever collides. Want to add a "trigger warnings" field? Go ahead. Workshop materials? Dietary info? Make up a type — the spec won't break.

```json
{
	"$type": "com.mygroup.component.accessibility",
	"wheelchairAccess": true,
	"hearingLoop": true,
	"notes": { "en": "Step-free entrance, reserved seating" }
}
```

## Share it

Open Evnt is a single JSON file. Put it on a web server, a GitHub repo, a gist — anywhere. No database, no build step, no "please deploy this Next.js app to Vercel."

For a ready-made viewer, use [eventsl.ink](https://eventsl.ink): `https://eventsl.ink/e?url=https://example.com/event.json`.

## What's next

- [Read the full spec](/README) — if you're into that sort of thing
- [Try the playground](/playground) — paste JSON, it tells you if you messed up
- [Convert to/from other formats](/convert) — iCalendar, Schema.org, ActivityStreams, etc.
