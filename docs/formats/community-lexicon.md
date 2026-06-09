# Compared to Community Lexicon

The Community Lexicon calendar format (`community.lexicon.calendar.event`) is an AT Protocol lexicon for calendar events. It is used by several AT Protocol applications including [atmo.rsvp](https://atmo.rsvp), [smokesignal.events](https://smokesignal.events), and [openmeet.net](https://openmeet.net).

## What it does well

Community Lexicon has a built-in event status system with values for planned, scheduled, rescheduled, cancelled, and postponed. It supports attendance modes (in-person, virtual, hybrid). Locations are an array of inline variant objects supporting street addresses, geographic coordinates, Foursquare POI references, H3 grid cells, and direct URIs. Links can be attached via the `uris` array.

Being an AT Protocol lexicon, events can be stored on a PDS and fetched over the AT Protocol network. The format is compact and straightforward for simple events with a single time and place.

## Where it falls short

- **No multilingual names.** The `name` field is a single string. There is no mechanism for translations.
- **No partial dates.** `startsAt` and `endsAt` are RFC 3339 datetime strings. An event known only as "June 2026" cannot be represented without fabricating a date.
- **Single start/end per event.** There is one `startsAt` and one `endsAt`. A multi-day conference with different hours each day requires either multiple records or an incorrect continuous timespan. There is no instance system.
- **Locations are inline objects, not reusable venues.** Each event embeds its own location data. There is no venue ID system or venue reuse across events. A venue used by ten events must be duplicated in all ten records, with no guarantee of consistency.
- **No component or extensibility system.** Custom data has no defined mechanism. In practice, applications like atmo.rsvp add root-level fields (`media`, `theme`, `timezone`, `additionalData`) that are not part of the core lexicon and have no cross-application compatibility guarantees.
- **No description format specification.** The `description` field is a plain string with no defined markup format. atmo.rsvp treats it as markdown, but this is not specified in the lexicon.

## Real-world usage

[atmo.rsvp](https://atmo.rsvp), [smokesignal.events](https://smokesignal.events), and [openmeet.net](https://openmeet.net) are AT Protocol event apps using this format. In practice, each application extends the core lexicon with its own root-level fields (media, theme, timezone, additionalData), demonstrating that the format lacks built-in support for these common event features.

## Side by side

The same multi-day multilingual conference:

```
Community Lexicon                      Open Evnt
──────────────────────                 ──────────────────────
name: single string                    name: { en, lt, uk }
startsAt/endsAt: RFC 3339 only         start: PartialDate
one start/end per event                3 instances, same event
inline location objects                venues: [physical, online]
uris array for links                   components: [{ $type: link }]
```

**Community Lexicon** represents the event with a single start and end. The name is English-only. The location is an inline address object. The ticket link lives in the `uris` array.

```json
{
  "$type": "community.lexicon.calendar.event",
  "name": "Tech Conference",
  "description": "A technology conference with talks and workshops.",
  "status": "community.lexicon.calendar.event#scheduled",
  "mode": "community.lexicon.calendar.event#hybrid",
  "startsAt": "2026-06-15T09:00:00.000Z",
  "endsAt": "2026-06-17T18:00:00.000Z",
  "locations": [
    {
      "$type": "community.lexicon.location.address",
      "name": "Main Hall",
      "street": "123 Vytauto g.",
      "locality": "Vilnius",
      "country": "LT"
    },
    {
      "$type": "community.lexicon.calendar.event#uri",
      "name": "Livestream",
      "uri": "https://live.example.com/techconf"
    }
  ],
  "uris": [
    {
      "uri": "https://example.com/tickets",
      "name": "Tickets"
    }
  ]
}
```

## When to use which

Use Community Lexicon when you are building an AT Protocol native application that needs simple event records with basic status tracking. The format maps directly to the AT Protocol record system. If your events are single-language, have precise start and end times, and use one location per event, Community Lexicon will serve you well with no extra tooling.

Use Open Evnt when your events need any of the features Community Lexicon cannot represent: [multilingual names](why/translations), [partial dates](why/partial-date), [multiple time blocks](why/instances) per event, [reusable venues](why/venues) shared across events, or a [component system](why/components) for typed extensions.

## Sidecar records: using both on AT Protocol

If you want AT Protocol interoperability without losing rich event data, publish both records under the same rkey. The Community Lexicon record provides basic calendar data for any AT Protocol app. The OpenEvnt `directory.evnt.event` record provides the full representation alongside it.

```
at://did:plc:example/directory.evnt.event/SAME_RKEY   -- full Open Evnt data
at://did:plc:example/community.lexicon.calendar.event/SAME_RKEY  -- basic Lexicon data
```

Apps that only understand Community Lexicon (atmo.rsvp, smokesignal.events) read the Lexicon record and display the event with basic fields. Apps that understand Open Evnt (Vantage) read the `directory.evnt` record and display the full multilingual, multi-instance, component-rich event. Both point to the same real-world event, identified by the same record key.

This is not a conversion workflow -- it is a dual-publication pattern. You keep Open Evnt as your canonical source and publish a simplified Lexicon mirror under the same key for compatibility. The `@evnt/convert` package can generate the Lexicon record from your Open Evnt data, or you can author both from the same source.

Converting from Open Evnt to Community Lexicon still loses data (multiple translations collapse to one name, instances collapse to a single timespan, decoupled venues become inline objects), but the full data remains available in the Open Evnt record at the same location. Applications graduate from basic to rich as they add Open Evnt support.
