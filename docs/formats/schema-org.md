# Compared to Schema.org

Schema.org Event is a JSON-LD type used by Google, Bing, and Facebook for rich search results. It is the most widely deployed event format on the web. Every major search engine consumes it natively.

## What Schema.org does well

Search engine rich results. Google displays event snippets with dates, locations, and ticket availability directly in search results. No other event format has this distribution channel. Schema.org is also JSON-LD native, which means it can be embedded in HTML pages without a separate fetch.

## Real-world usage

[Calendiverse](https://3rik.cc/calendiverse/calendiverse.en.html) is a community-driven calendar platform for the Fediverse. It uses Schema.org microdata for machine-readable event data on its pages, alongside iCal export and ActivityPub distribution. Events are stored in a database and serialized to Schema.org on the fly.

## Where it falls short

- **No native multilingual names.** Each language requires a separate `name` value with a `@language` attribute, wrapped in a `PronounceableText` array. A simple key-value map like `{ "en": "Name", "lt": "Vardas" }` is not valid Schema.org.
- **No partial dates.** ISO 8601 only. An event known only as "June 2026" requires a fabricated date or omission of the field entirely.
- **One start and end per event.** There is no concept of multiple instances. A conference with different hours each day cannot be represented without creating separate Event items.
- **No venue-to-instance decoupling.** Venues are embedded directly in the Event. A hybrid event referencing both a physical location and a stream URL requires either a single `VirtualLocation` or creative use of `location` arrays.
- **No component system.** Custom data uses `additionalProperty`, an untyped key-value escape hatch with no namespace collision protection.
- **No event status lifecycle.** Schema.org has an `eventStatus` property but the vocabulary is limited to `EventScheduled`, `EventCancelled`, `EventMovedOnline`, `EventPostponed`, and `EventRescheduled`. It does not cover planning or uncertainty states.

## Side by side

```
Schema.org                              Open Evnt
─────────────────────                   ──────────────────────
name: name array with                   name: { en, lt, uk }
  @language per entry                   
startDate: ISO 8601 only                start: PartialDate
endDate: ISO 8601 only                  end: PartialDate
location: single venue                  venues: [physical, online]
offers: single price per event          components: [{ $type: link }]
@context: "https://schema.org"          plain JSON, no context
```

## When to use which

**Use Schema.org for** search engine rich results. **Use Open Evnt for** authoritative event data. Convert from Open Evnt to Schema.org at the SEO layer via `@evnt/convert`. Converting loses data: multiple instances collapse to one, multilingual names become arrays, venues reduce to the first entry, and components are dropped.
