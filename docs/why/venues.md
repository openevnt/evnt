# Venues

An event has a "where" and a "when". In many formats these are coupled: a start time and a location are sibling fields on the same object. This breaks for hybrid events (physical + stream), rotating venues (a meetup that moves between bars), and multi-day events with different venues each day.

Open Evnt stores venues as a list on the root object and decouples them from instances. Instances reference venues by ID, and can reference multiple venues simultaneously or none at all.

```json
{
  "venues": [
    { "$type": "directory.evnt.venue.physical", "id": "hall", "name": { "en": "Main Hall" } },
    { "$type": "directory.evnt.venue.online", "id": "stream", "name": { "en": "Livestream" } }
  ],
  "instances": [
    { "venueIds": ["hall", "stream"], "start": "2026-06-15T18:00[UTC]" }
  ]
}
```

Three venue types are defined, discriminated by `$type`:

| `$type` | Fields | Use case |
|---------|--------|----------|
| `directory.evnt.venue.physical` | `name`, `address.addr`, `address.countryCode`, `maps` | Real-world location |
| `directory.evnt.venue.online` | `name`, `url` | Website or streaming link |
| `directory.evnt.venue.unknown` | `name` | Placeholder when type is unclear |

Venue IDs are locally unique per event. An event with no known venue uses an empty `venueIds` array rather than a placeholder venue.
