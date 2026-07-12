# Why Components

## The problem

Every event format has a fixed set of fields: name, description, date, location, maybe a URL. If you need anything else - ticket link, age restriction, accessibility info, organizer contact, speaker list - you're out of luck. The format doesn't have a field for it, so you either:

- Stuff it into an existing field (description field becomes a dumping ground)
- Use a custom extension (iCalendar X-PROPERTY, Schema.org additionalProperty, Community Lexicon custom lexicon)
- Fork the format and add your field (nobody else can read your data)

None of these work well. The description field accumulates random metadata. Custom extensions have no standard shape. Forks defeat interoperability.

## What a component is

A component is a typed block of additional metadata attached to an event.

```json
{
	"$type": "directory.evnt.component.link",
	"url": "https://example.com/tickets",
	"name": { "en": "Get Tickets" }
}
```

Each component has a `$type` that says what it is, and whatever fields make sense for that type. Apps that know the type can use the data. Apps that don't can skip it - no crash, no error.

## Why open extension instead of fixed fields?

Fixed fields mean every new use case requires a format update. Want to add ticket links? Wait for the next spec version. Age restrictions? Another version. Organizer contacts? Another version.

Components flip this: anyone can define a new component type at any time, no format update needed. If you need a component for event sponsors, define `com.example.component.sponsor` and go. No waiting, no permission, no fork.

The `$type` namespace prevents collisions. Your `com.example.component.sponsor` won't conflict with someone else's `org.other.component.sponsor` because the reverse-domain prefix is unique to you.

### What about the defined types?

The spec defines a handful of standard component types - link, source, splashMedia, languages, richtext (Markdown and Bluesky). These cover the most common cases so most events can use standard types instead of inventing custom ones. But they're not a ceiling - if your use case isn't covered, define your own.

## Why preserve unknown components?

When an app encounters a component type it doesn't understand, it has to keep it when re-saving the data.

This is what makes components actually extensible in practice. If app A adds a `com.example.sponsor` component and app B (which doesn't know about sponsors) re-saves the event, the sponsor data survives. If B dropped unknown components, A's data would be silently lost every time the event passed through B.

Without preservation, the format degrades: every processing step loses data from components it doesn't understand. With preservation, new component types can be deployed incrementally without waiting for every tool in the pipeline to support them.

## Why no base fields on EventComponent?

Components only require `$type`. No `id`, no `name`, no `label` at the base level.

You could argue every component should have a standard identifier or display name. But components serve many purposes - a `source` component is just a URL, a `languages` component is a list of language codes, a link component has its own `name` field. A required base `name` would be meaningless for some types and redundant for others.

The base is intentionally minimal. Each component type defines whatever fields it needs.

## What this enables

Components make the format extensible without a spec update. Need a new field? Make a component. Don't understand someone else's component? Skip it - the data survives. Over time, useful component types get adopted across the ecosystem, and nothing breaks along the way.
