# Compared to Community Lexicon

The Community Lexicon calendar format (`community.lexicon.calendar.event`) is an AT Protocol lexicon for calendar events. It is used by several AT Protocol applications including [atmo.rsvp](https://atmo.rsvp), [smokesignal.events](https://smokesignal.events), and [openmeet.net](https://openmeet.net).

## What it does well

It has a built-in event status system with values for planned, scheduled, rescheduled, cancelled, and postponed. It supports attendance modes (in-person, virtual, hybrid). Locations are a union type supporting street addresses, geographic coordinates, Foursquare references, and H3 grid cells. Links can be attached via the `uris` array.

Being an AT Protocol lexicon, events can be stored on a PDS and fetched over the AT Protocol network.

## Where it falls short

- **No multilingual names.** The `name` field is a single string. There is no mechanism for translations.
- **No partial dates.** `startsAt` and `endsAt` are RFC 3339 datetime strings. An event known only as "June 2026" cannot be represented without fabricating a date.
- **Single start/end per event.** There is no concept of multiple instances. A multi-day conference with different hours each day requires either multiple records or an incorrect continuous timespan.
- **No component or extensibility system.** Custom data has no defined mechanism. In practice, applications like atmo.rsvp add root-level fields (`media`, `theme`, `timezone`, `additionalData`) that are not part of the core lexicon and have no cross-application compatibility guarantees.
- **Locations are flat objects.** There is no venue ID system or venue reuse across events. Each location is self-contained within the event.
- **No description format specification.** The `description` field is a plain string with no defined markup format. atmo.rsvp treats it as markdown but this is not specified in the lexicon.

## Real-world usage

[atmo.rsvp](https://atmo.rsvp), [smokesignal.events](https://smokesignal.events), and [openmeet.net](https://openmeet.net) are AT Protocol event apps using this format, with real events ranging from DWeb Camp Berlin to local meetups. In practice, each application extends the core lexicon with its own root-level fields (media, theme, timezone, additionalData), demonstrating that the format lacks built-in support for these common event features.

## Side by side

```
Community Lexicon                      Open Evnt
──────────────────────                 ──────────────────────
name: single string                    name: { en, lt, uk }
RFC 3339 datetime only                 PartialDate
single start/end                       multiple instances
inline location objects                venues decoupled + referenced by ID
no component system                    components: [{ $type: link }]
extends with app-specific fields       extensibility built into the spec
```

## When to use which

**Use Community Lexicon for** AT Protocol native event records that need simple event data and basic status tracking. **Use Open Evnt for** richer event data with multilingual names, partial dates, multiple instances, decoupled venues, and typed extensibility. Convert between them via `@evnt/convert` (Vantage already imports Lexicon events). Open Evnt also publishes its own lexicons under `directory.evnt` for AT Protocol.
