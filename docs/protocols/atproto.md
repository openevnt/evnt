# AT Protocol

Open Evnt integrates with the AT Protocol, the protocol behind BlueSky.

## Lexicons

The project publishes lexicons under the `directory.evnt` namespace:

- [directory.evnt.event](https://github.com/openevnt/evnt/blob/main/lexicons/directory/evnt/event.json)
- [directory.evnt.event.instance](https://github.com/openevnt/evnt/blob/main/lexicons/directory/evnt/event/instance.json)
- [directory.evnt.venue.physical](https://github.com/openevnt/evnt/blob/main/lexicons/directory/evnt/venue/physical.json)
- [directory.evnt.media](https://github.com/openevnt/evnt/blob/main/lexicons/directory/evnt/media.json)

These can be found on [PDSls](https://pds.ls/at://evnt.directory/com.atproto.lexicon.schema).

## Community lexicon interop

The widely-used `community.lexicon.calendar.event` lexicon is structurally different from Open Evnt, but `@evnt/convert` includes a converter:

```ts
import { communityLexicon } from "@evnt/convert";
const event = communityLexicon.from?.(lexiconEvent);
```

## RSVPs

For RSVPs in the AT Protocol ecosystem, use the `community.lexicon.calendar.rsvp` record type, which is handled independently of Open Evnt.

## Events via AT Protocol

Event data can be stored as AT Protocol records and fetched via AT URIs. The [eventsl.ink](https://eventsl.ink) project supports this method:

`https://eventsl.ink/e?at=at://did:plc:ir2qabq56znbbinhktehjmc6/directory.evnt.event/3mgnekiomev2y`

Vantage also supports fetching events from AT Protocol PDS instances, enabling a decentralized event discovery ecosystem.
