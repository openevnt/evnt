# The Root Object

The root object is the envelope for everything else. It holds the event name, status, venues, instances, and components - seven fields total.

Some of them are obvious. Some need explaining. And some things you'd expect aren't there at all.

## name

The one field you can't skip. Every event has a name, and it supports multiple languages. See [the Translations explainer](./translations.md) for why it's an object and not a string.

## label

A subtitle. Apps typically show it smaller under the name - "Vilnius" under "Tech Meetup," or "Day Pass" under "Conference 2026."

Why its own field instead of putting it in the name? Name is what the event _is_. Label is context that helps you pick it out in a list - a city, a pass type, a theme. A dedicated field means apps can display it differently (smaller, dimmer, different color) without extra work.

Labels are always plaintext - no rich text, no formatting. Descriptions (which can be formatted) live in components instead.

## status

Every event has a planning state. You can't make up your own - the five options cover the full lifecycle:

- **planned** - scheduled as described (default)
- **uncertain** - might get rescheduled or cancelled
- **postponed** - moved to a later date, unknown when
- **cancelled** - won't happen, full stop
- **suspended** - paused, might come back

The distinction between uncertain and suspended: uncertain means the event has a date but it might change. Suspended means the event is on hold with no current date. Think of uncertain as "we're still on for now" and suspended as "we've stopped planning for now."

The closed set matters because every status has a visual treatment. If apps could invent custom statuses, nobody would know how to display them - is "tentative" green or yellow? The five values cover the practical range without leaving apps in the dark.

Status is about planning, not time. An event in the past can still be "cancelled" (it never happened) or "planned" (it happened as scheduled). There's no "past" status because that's determined by the instance dates, not a status field.

Cancelled vs suspended: cancelled is done, suspended is "we'll see." Apps should archive cancelled events and keep suspended ones visible.

## What's not on the root

### No description

There's no description field on the root. Descriptions live in [components](./components.md) instead.

Why? Because descriptions come in different formats. Plain text. Markdown. Bluesky rich text. Maybe a format with embedded media. If the root had a `description` string, then every other format would need a second field, and apps would have to pick which one to read. Components solve this cleanly - each format gets its own type, apps display what they support, and the root stays format-agnostic.

Label is on the root because it's always a short plaintext Translation string with no format variation. Description isn't.

### No globally unique event id

Event identity depends on how you serve the data. AT Protocol uses AT URIs. Databases use UUIDs. File systems use paths. An `id` field on the root would either duplicate what the transport already provides or fail to capture every scheme.

If you need cross-system identity, use the transport's identifier. If the transport doesn't have one, add an `id` component.

### No timestamps

Timestamps are transport metadata, not event data. When the file was created or the record was written belongs in the filesystem, the database row, or the API response - not inside the event itself.

### No url

Every event has a website. That's what the `directory.evnt.component.link` component is for. A root-level `url` would only fit one link, but events often have several - website, tickets, stream, recordings. The link component also has extra functionality like `disabled`, open/close times, and display names. A plain string can't do any of that.

### No tags, categories, topics

Tags mean different things to different apps. One app's "tech" is another's "engineering." Baking a taxonomy into the root locks everyone into one system, and events that don't fit would need workarounds.

If your app needs tags, use components. Your taxonomy, your rules.

### No price, age restrictions, accessibility info

All important. All application-specific. Ticketing models vary (free, paid, donation, tiered, pay-what-you-can). Age laws vary by country. Accessibility needs vary by venue and audience. None of these fit in a single root field, and none of them belong in every event.

(The team is working on official components for some of these. Join the community if you want to help define them.)

### No recurrence

Covered in the [Instances explainer](./instances.md). Short version: list every occurrence instead of computing them from rules. Simpler code, fewer bugs.
