# AT Protocol

Open Evnt events are JSON objects. AT Protocol repositories store JSON records. They fit together naturally.

## Record type

Use `directory.evnt.event` as the record `$type`.

This is the same value as the event's own `$type` field. AT Protocol uses it for record routing and schema validation.

## Repository structure

Events live in a `directory.evnt.event` collection under the repo root. Each event is a record with a unique record key (rkey) of your choice.

```
com.atproto.repo.getRecord(
  repo:   alice.bsky.social
  collection: directory.evnt.event
  rkey:  btc-2026
)
```

The rkey can be a slug or a TID (timestamp identifier).

## Lexicons

Published lexicons for Open Evnt live under `directory.evnt.*`. They validate event structure, but the format's own schema is the authoritative definition - the lexicons mirror it rather than defining it.

## Why AT Protocol

AT Protocol gives Open Evnt events things that are hard to build yourself:

- **Sync**  -  subscribe to repos and get live event updates
- **Portability**  -  move events between PDS instances without reformatting
- **Discovery**  -  list all events in a repo by querying the collection

No extra infrastructure. Just put the events in a repo and they get all of this for free.
