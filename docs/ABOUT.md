# About Open Evnt

## Open Evnt Ethos

1. **No assumptions**: The format should not make any assumptions about the nature of events, their properties, or how they are organized. It should be flexible enough to accommodate a wide variety of event types and structures.
2. **No redundancy**: If certain information can be derived from other data, it should not be included explicitly. For example, if an event has a start and end time, the duration can be calculated and does not need to be stored separately.
3. **Single source of truth**: Each piece of information should be stored in one place only. For example, if an event has a location, the details of that location should be stored in a separate location object, and the event should reference that object rather than duplicating the location details.
4. **Handling the Unknown**: The format should be designed to work even when some information is missing or unknown.
5. **Extensibility**: The format should allow for the addition of new properties or structures. 

## Design Decisions

- [Scheduling is complex: Why we need Partial Dates](https://evnt.leaflet.pub/3mjeydgshtk2z)
- [Instances & Venues](https://evnt.leaflet.pub/3mjjufibxx22a)
