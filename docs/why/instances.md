# Instances

A single start and end time is not enough for real events. A three-day conference with different hours each day cannot be represented as one continuous timespan. A rotating meetup that uses a different venue each month cannot be represented as one location.

Open Evnt solves this with instances. Each occurrence of the event gets its own start, end, and venue references. They share the same event metadata (name, description, components) but have independent times and locations.

## Multiple instances

```json
{
  "instances": [
    { "venueIds": ["hall"], "start": "2026-06-15T09:00[Europe/Vilnius]", "end": "2026-06-15T18:00[Europe/Vilnius]" },
    { "venueIds": ["hall"], "start": "2026-06-16T10:00[Europe/Vilnius]", "end": "2026-06-16T17:00[Europe/Vilnius]" },
    { "venueIds": ["hall"], "start": "2026-06-17[Europe/Vilnius]" }
  ]
}
```

Each instance has independent times. Day one runs 09:00 to 18:00. Day two runs 10:00 to 17:00. Day three is an all-day hackathon with no end time. Three instances, one event.

This avoids the complexity of parent-child event relationships. No syncing data between sub-events, no ambiguity about which time belongs to which day.

## Different venues per instance

A meetup that rotates between bars references a different venue per instance:

```json
{
  "venues": [
    { "id": "pub-a", "$type": "directory.evnt.venue.physical", "name": { "en": "The Old Pub" } },
    { "id": "pub-b", "$type": "directory.evnt.venue.physical", "name": { "en": "The New Bar" } }
  ],
  "instances": [
    { "venueIds": ["pub-a"], "start": "2026-03-10T19:00[Europe/London]" },
    { "venueIds": ["pub-b"], "start": "2026-04-14T19:00[Europe/London]" }
  ]
}
```

Venues are defined once in the event and referenced by ID per instance. The same venue can be used across multiple instances, and multiple venues can be referenced in the same instance (for hybrid events).

## Venue decoupling

Venues are defined at the event level, not embedded in each instance. This means:

- A hybrid event references both a physical venue and a stream URL in every instance
- A multi-venue conference reuses the same venue IDs across days
- An online-only event has no physical venues at all

The venue list is the authoritative set of locations. Instances select from this set. This decoupling is what makes rotating venues, hybrid events, and multi-day conferences representable in a single document.

## Per-instance status

Each instance can have its own status, independent of the event root:

```json
{
  "status": "planned",
  "instances": [
    { "venueIds": ["hall"], "start": "2026-06-15T09:00[Europe/Vilnius]", "status": "planned" },
    { "venueIds": ["hall"], "start": "2026-06-16T10:00[Europe/Vilnius]", "status": "uncertain" }
  ]
}
```

Day one is planned. Day two is uncertain, pending speaker confirmation. The event as a whole is planned. Instance-level status enables granular scheduling without splitting the event.

## Omitting dates

Instances can omit dates entirely when the time is not known. This is useful for events where the schedule is still being finalized:

```json
{
  "instances": [
    { "venueIds": ["hall"] }
  ]
}
```

The instance exists -- the event will happen at this venue -- but the date is not yet set. This is not the same as an event with no instances. It is an event where one of the occurrences has no fixed time yet.
