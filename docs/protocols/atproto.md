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

The `community.lexicon.calendar.event` lexicon is structurally different from Open Evnt, but `@evnt/convert` includes a converter:

```ts
import { communityLexicon } from "@evnt/convert";
const event = communityLexicon.from?.(lexiconEvent);
```

## RSVPs

For RSVPs in the AT Protocol ecosystem, use the `community.lexicon.calendar.rsvp` record type, which is handled independently of Open Evnt.

## Events via AT Protocol

Event data can be stored as AT Protocol records and fetched via AT URIs. The [eventsl.ink](https://eventsl.ink) project supports this method:

`https://eventsl.ink/e?at=at://did:plc:ir2qabq56znbbinhktehjmc6/directory.evnt.event/3mgnekiomev2y`

Vantage also fetches events from AT Protocol PDS instances for decentralized event discovery.

## Sidecar records

For AT Protocol applications that want both broad compatibility and rich event data, publish both a `community.lexicon.calendar.event` record and a `directory.evnt.event` record under the same rkey:

```
at://did:plc:example/directory.evnt.event/SAME_RKEY          -- full Open Evnt data
at://did:plc:example/community.lexicon.calendar.event/SAME_RKEY -- basic Lexicon data
```

Apps that only understand Community Lexicon (atmo.rsvp, smokesignal.events) read the Lexicon record. Apps that understand Open Evnt (Vantage) read the `directory.evnt` record. Both identify the same event by the same record key. This is not a conversion -- it is dual publication from a single canonical source.
