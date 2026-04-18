🔙 [@evnt Project](../README.md)

Jump to:
- [Prior Art](#prior-art)
- [Differences from other formats](#differences-from-other-formats)

## Prior Art

Back when I started going to cosplay conventions, in Turkey specifically, I had issues finding events and gathering information (date, time, place, price) about them. I created an instagram profile for announcing any events I came accross so others could find them too. After a while, I realized one crucial issue: properties of events are volatile, and can change; instagram posts cannot.

To solve this issue, I started developing a [website](https://events.deniz.blue) for keeping a list of these events where users could follow events and recieve push notifications whenever something changes. At first I entered all the data manually, but the main idea was that event organizers would authenticate and update event data themselves. After a while, I noticed the need for i18n and implemented it, along with some other niche features. Developing the website sure took a while but it gave me valuable insight for the current event data format we are defining right here.

## Open Evnt Ethos

1. **No assumptions**: The format should not make any assumptions about the nature of events, their properties, or how they are organized. It should be flexible enough to accommodate a wide variety of event types and structures.
2. **No redundancy**: If certain information can be derived from other data, it should not be included explicitly. For example, if an event has a start and end time, the duration can be calculated and does not need to be stored separately.
3. **Single source of truth**: Each piece of information should be stored in one place only. For example, if an event has a location, the details of that location should be stored in a separate location object, and the event should reference that object rather than duplicating the location details.
4. **Handling the Unknown**: The format should be designed to work even when some information is missing or unknown.
5. **Extensibility**: The format should allow for the addition of new properties or structures. 


