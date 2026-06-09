# Compared to ActivityStreams

ActivityStreams is a W3C standard for social activity data, used by ActivityPub and the fediverse. It defines an `Event` type alongside other activity types such as Note, Article, and Video.

## What ActivityStreams does well

Fediverse-native event distribution. ActivityStreams events can be delivered through ActivityPub, reaching users on Mastodon, Lemmy, and other fediverse platforms. The format is JSON-LD based, which provides a basic extension mechanism through linked context documents.

## Where it falls short

- **One name, one language.** The `name` field is a single string. There is no built-in multilingual structure.
- **RFC 3339 dates only.** `startTime` and `endTime` must be complete ISO 8601 timestamps. Imprecise dates (year-only, month-only) cannot be represented.
- **One start and end per Event.** A multi-day conference requires either a separate Event for each day or an incorrect continuous timespan.
- **No venue decoupling.** The `location` property is a single embedded object or string. Hybrid venues (physical plus online) are not representable.
- **No component or extension system.** Custom data requires either JSON-LD context expansion or ad-hoc properties, which have no cross-implementation compatibility guarantees.
- **No event status.** ActivityStreams has no status field for events. Cancelled, postponed, and planned events are indistinguishable from confirmed ones.

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

ActivityStreams is the right choice when your primary distribution channel is the fediverse. If you are publishing events to followers on Mastodon, Lemmy, or other ActivityPub platforms, modeling them as ActivityStreams Event objects lets you use the existing delivery infrastructure. For simple events with a single date, one location, and one language, ActivityStreams maps cleanly and nothing is lost.

Open Evnt is the right choice when your events include any of the limitations listed above -- [multilingual names](why/translations), [partial dates](why/partial-date), [multiple instances](why/instances), [hybrid venues](why/venues), or [typed extension data](why/components). Each of these requires a workaround in ActivityStreams.

The conversion between the two is handled by `@evnt/convert`. A typical workflow is to author and store events in Open Evnt, then convert to ActivityStreams for fediverse distribution. Be aware of what is lost in the conversion:

- Partial dates become approximate full dates or are dropped entirely.
- Multiple instances are flattened into a single start and end.
- Hybrid venues merge into a single location string, losing the distinction between physical and online.
- Components and extensions are inlined as ad-hoc JSON-LD properties or omitted, with no compatibility guarantees.

For fediverse-centric projects that only need basic event data, ActivityStreams alone is sufficient. For projects that need to represent events as they exist in the real world, start with Open Evnt and treat ActivityStreams as a distribution format.
