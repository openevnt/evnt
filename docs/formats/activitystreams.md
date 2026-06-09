# Compared to ActivityStreams

ActivityStreams is a W3C standard for social activity data, used by ActivityPub and the fediverse. It defines an `Event` type alongside other activity types such as Note, Article, and Video.

## What ActivityStreams does well

Fediverse-native event distribution. ActivityStreams events can be delivered through ActivityPub, reaching users on Mastodon, Lemmy, and other fediverse platforms. The format is JSON-LD based, which provides a basic extension mechanism through linked context documents.

## Where it falls short

- **One name, one language.** The `name` field is a single string. There is no multilingual structure.
- **RFC 3339 dates only.** `startTime` and `endTime` must be complete ISO 8601 timestamps. Imprecise dates cannot be represented.
- **One start and end per Event.** A multi-day conference requires either a separate Event for each day or an incorrect continuous timespan.
- **No venue decoupling.** The `location` property is a single embedded object or string. Hybrid venues are not representable.
- **No component or extension system.** Custom data requires either JSON-LD context expansion or ad-hoc properties, which have no cross-implementation compatibility guarantees.
- **No event status.** ActivityStreams has no status field for events. Cancelled, postponed, planned events are indistinguishable from confirmed ones.

## Side by side

```
ActivityStreams                        Open Evnt
──────────────────────                 ──────────────────────
name: single string                    name: { en, lt, uk }
startTime: RFC 3339 only               start: PartialDate
endTime: RFC 3339 only                 end: PartialDate
location: single string or object      venues: [physical, online]
no component/extension system          components: [{ $type: link }]
one start/end per event                3 instances, same event
```

## When to use which

**Use ActivityStreams when** you need fediverse-native event distribution. **Use Open Evnt when** you need rich event representation. Convert between them via `@evnt/convert`. Converting to ActivityStreams loses partial dates, multiple instances, and components.
