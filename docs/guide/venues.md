# Why Venues

## The problem

Where does an event happen? Sometimes it's a physical address. Sometimes it's a URL. Often it's both - a meetup with a room and a livestream.

Most formats can only express one location per event, and that location is a single string.

```
LOCATION:123 Main St, Springfield
```

iCalendar uses one `LOCATION` field. It works for a simple meeting at a single address. For anything more complex, you concatenate - "Main Hall / https://zoom.us/j/..." - which defeats the purpose.

```json
{
	"location": {
		"name": "Convention Centre",
		"address": "123 Main St, Springfield"
	}
}
```

Structured formats still embed the location directly on the event. If an event happens in the same room three times, the location is repeated each time. If it has both a room and a stream, there's no way to express both.

This is data stuffing: the format forces you to cram multiple things into one slot because it doesn't have a way to say "this event happens at these locations."

## A single venue

Every venue, regardless of type, has three required fields:

- **`id`**: A local identifier (more on how this gets used later)
- **`$type`**: What kind of venue this is - physical, online, or unknown
- **`name`**: A human-readable name, supporting multiple languages

Everything else depends on the type.

### Physical venue

A real-world location with an address.

```json
{
	"id": "hall",
	"$type": "directory.evnt.venue.physical",
	"name": { "en": "Concert Hall" },
	"address": {
		"addr": "123 Main St, Springfield",
		"countryCode": "US"
	}
}
```

The address is deliberately simple: a free-form string and an optional country code. No street/city/postalCode breakdown.

Real-world addresses are messy. Some countries have postal codes, some don't. Some have states, provinces, or nothing. A structured model that handles every country's conventions would be massive (Schema.org's `PostalAddress` has 20+ fields) and still get edge cases wrong. Free-form addresses are honest about the mess - apps can parse or geocode as needed.

Physical venues can also link to external mapping services:

```json
{
	"id": "hall",
	"$type": "directory.evnt.venue.physical",
	"name": { "en": "Concert Hall" },
	"address": { "addr": "123 Main St, Springfield", "countryCode": "US" },
	"maps": {
		"org.openstreetmap.node": "1234567",
		"com.google.places": "ChIJN1t_tDEuEmsRUsoyG83frY4"
	}
}
```

Keys are reverse-domain names to prevent collisions, values are the IDs those services use.

### Online venue

A virtual location accessed via a URL.

```json
{
	"id": "stream",
	"$type": "directory.evnt.venue.online",
	"name": { "en": "Livestream" },
	"url": "https://live.example.com/concert"
}
```

### Unknown venue

A venue that exists but whose type hasn't been determined.

```json
{
	"id": "unknown-venue",
	"$type": "directory.evnt.venue.unknown",
	"name": { "en": "Some Venue" }
}
```

This is for cases where you know there's a location and you know its name, but you can't tell if it's a physical place or a URL. Auto-collected data often lands here. If there's genuinely no venue (placeholder event, template), just leave the venue out entirely - don't create an UnknownVenue.

### Custom venue types

The three defined types (physical, online, unknown) are the only ones allowed. Venues are structural - they change how an app displays and handles location data. An app needs to know "can I map this?" or "can I link this?" which means it needs to understand every venue type it encounters. Custom types would break that guarantee.

Components have the opposite design (open, anyone can define new ones) because they carry metadata that apps can safely ignore. Venues aren't metadata - they're core structure.
