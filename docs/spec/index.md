# Open Evnt Specification

**Version:** 0.1: DRAFT
**Last updated:** 2026-06-12

## 1. Introduction

This document defines the Open Evnt data format for describing events.

### 1.1 Scope

This specification defines:

- The data model for representing events, venues, instances, and components
- The partial date string format
- The extension mechanism for custom component and venue types
- Conformance requirements for producers and consumers

This specification does not define:

- Transport protocols, APIs, storage, or recurrence rules
- How events should be displayed or rendered

### 1.2 Conformance

The keywords **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, **SHOULD NOT**, **RECOMMENDED**, **MAY**, and **OPTIONAL** in this document are to be interpreted as described in [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119).

For readability, these keywords appear in lowercase in this document.

### 1.3 Terminology

| Term | Definition |
|------|------------|
| Event | A planned happening, represented as an `OpenEvnt` object |
| Producer | Software that creates or emits Open Evnt documents |
| Consumer | Software that reads or processes Open Evnt documents |
| Instance | A single continuous occurrence of an event with its own time and venue references |
| Component | A typed piece of additional event metadata, extensible by `$type` |
| Partial Date | A string representing a date and/or time with varying precision and an explicit timezone |

---

## 2. Data Model

### 2.1 OpenEvnt

The root object representing a single event.

```
OpenEvnt
  $type:      "directory.evnt.event"?     OPTIONAL
  v:          "0.1"                     REQUIRED
  name:       Translations              REQUIRED
  label:      Translations?             OPTIONAL
  status:     EventStatus?              OPTIONAL
  venues:     Venue[]?                  OPTIONAL
  instances:  EventInstance[]?          OPTIONAL
  components: EventComponent[]?         OPTIONAL

  Additional properties: NOT ALLOWED
```

**`$type`**: An optional type identifier for AT Protocol record wrapping. When present, MUST be `"directory.evnt.event"`.

**`v`**: A string literal `"0.1"` identifying the format version. See [Versioning](#9-versioning) for version semantics.

**`name`**: The event name as a [Translations](#22-translations) object. MUST have at least one entry.

**`label`**: A short label or subtitle as a [Translations](#22-translations) object. Typically displayed as smaller text under the name in UI lists and cards.

**`status`**: An [EventStatus](#23-eventstatus) value describing the current planning state. When absent, consumers MUST treat the event as `"planned"`.

**`venues`**: An array of [Venue](#4-venues) objects. Each venue MUST have a unique `id` within this array.

**`instances`**: An array of [EventInstance](#5-instances) objects representing occurrences of the event.

**`components`**: An array of [EventComponent](#6-components) objects representing additional metadata.

### 2.2 Translations

An object mapping BCP47 language tags to strings.

```
Translations
  [language: string]: string

  Constraints:
    Keys MUST be valid BCP47 language tags
    Values MUST be non-empty strings
    At least one entry REQUIRED
```

#### Resolution algorithm

When a consumer needs a single string for a user's preferred language, the following algorithm is RECOMMENDED:

1. Exact match against the user's preferred BCP47 tag
2. Match without region subtag (e.g. `zh-Hans-CN` → `zh-Hans`)
3. Match on primary language subtag only (e.g. `zh-Hans-CN` → `zh`)
4. Fallback to `en`
5. Any available entry
6. Empty string or placeholder

### 2.3 EventStatus

An enum representing the planning state of an event or instance.

```
EventStatus: "planned" | "uncertain" | "postponed" | "cancelled" | "suspended"
```

| Variant | Description | Dates valid? |
|---------|-------------|-------------|
| `planned` | Event is scheduled as described (default) | Yes |
| `uncertain` | Event may be rescheduled or cancelled | Unknown |
| `postponed` | Event moved to a later, unknown date | No |
| `cancelled` | Event will not take place | No |
| `suspended` | Event paused; future unknown | No |

- `planned` is the initial state and the default when `status` is absent.
- `cancelled` is a terminal state — it MUST NOT transition to any other status.
- Any non-terminal status MAY return to `planned`.

When `status` is not `"planned"`, consumers SHOULD treat associated dates as potentially invalid.

### 2.4 Media

A media asset (image, video) with one or more sources.

```
Media
  sources:      MediaSource[]           REQUIRED
  alt:          Translations?           OPTIONAL
  presentation: PresentationInfo?       OPTIONAL
```

**`sources`**: One or more sources for the same media in different formats or resolutions. MUST NOT contain semantically different content in the same `Media` object.

**`alt`**: Alternative text for accessibility.

**`presentation`**: Visual hints for rendering.

```
PresentationInfo
  blurhash:       string?    OPTIONAL
  dominantColor:  string?    OPTIONAL
```

**`blurhash`**: A [BlurHash](https://blurha.sh/) string representing a placeholder image.

**`dominantColor`**: A hex color code (e.g. `#1a1a2e`) representing the dominant color in the media.

#### MediaSource

```
MediaSource
  url:          string?                 OPTIONAL
  blob:         object?                 OPTIONAL
  mimeType:     string?                 OPTIONAL
  dimensions:   { width: number, height: number }?   OPTIONAL

  Either url OR blob MUST be present
```

**`url`**: A publicly accessible URL for the media source.

**`blob`**: An inline blob reference, as defined by the enclosing transport layer (e.g. AT Protocol `BlobRef`).

**`mimeType`**: The MIME type of the media (e.g. `image/jpeg`, `video/mp4`). When `blob` is used, MAY be inferred from the blob's metadata.

**`dimensions`**: The native width and height of the media in pixels.

Either `url` or `blob` MUST be present.

---

## 3. Partial Date

A `PartialDate` is a string that represents a date and/or time with varying precision and an explicit timezone.

### 3.1 Grammar

```
partialdate = year [ "-" month [ "-" day [ "T" time ] ] ] "[" timezone "]"

time     = hour ":" minute
year     = 4DIGIT
month    = 2DIGIT  ; 01–12
day      = 2DIGIT  ; 01–31
hour     = 2DIGIT  ; 00–23
minute   = 2DIGIT  ; 00–59
timezone = 1*( ALPHA / DIGIT / "-" / "_" / "/" / "+" )
```

The grammar is adapted from [RFC 9557](https://www.rfc-editor.org/rfc/rfc9557) (which extends RFC 3339) but is **not compatible** with RFC 3339 or ISO 8601.

### 3.2 Precision levels

| Level | Pattern | Example |
|-------|---------|---------|
| Year | `2025[Europe/London]` | Only the year is known |
| Month | `2025-11[Europe/London]` | Year and month known |
| Day | `2025-11-12[Europe/London]` | Full date known |
| Time | `2025-11-12T11:00[Europe/London]` | Date and time (without seconds) known |

### 3.3 Constraints

- Precision levels MUST be provided in order. Skipping a level (e.g. year to day without month) is NOT ALLOWED.
- A time component MUST NOT appear without a day.
- A day MUST NOT appear without a month.
- A month MUST NOT appear without a year.
- Seconds MUST NOT be included.

### 3.4 Timezone

Every `PartialDate` MUST include an IANA timezone identifier in square brackets at the end of the string.

- UTC offsets (`Z`, `+02:00`) are NOT ALLOWED.
- Only IANA timezone identifiers (e.g. `Europe/London`, `America/New_York`, `UTC`) are valid.

When precision is year-only or month-only, the timezone carries no semantic meaning but MUST still be provided. `[UTC]` is a conventional choice.

### 3.5 Semantics

- A `PartialDate` represents a range of possible instants, not a single instant.
- At year precision, the value covers the entire calendar year in the specified timezone.
- At month precision, the value covers the entire calendar month.
- At day precision, the value covers the entire calendar day.
- At time precision, the value is a specific instant (subject to timezone rules such as DST).

### 3.6 Comparison

Two `PartialDate` values MAY be compared only when they share the same precision and timezone. Cross-precision comparison (e.g. year vs month) is NOT RECOMMENDED without explicit resolution rules.

### 3.7 Invalid examples

| Value | Reason |
|-------|--------|
| `2025-11-12T11:00Z` | UTC offset, not timezone bracket |
| `2025-11-12T11:00+02:00` | UTC offset, not timezone bracket |
| `2025-11-12T11:00[Europe/London` | Missing closing bracket |
| `2025-11-12T11:00:00[Europe/London]` | Seconds not allowed |
| `2025-11-12T11[Europe/London]` | Time must include minutes |
| `2025-11T11:00[Europe/London]` | Time without day |
| `2025T11:00[Europe/London]` | Time without month and day |

---

## 4. Venues

A venue represents a location where an event takes place. Venues are defined at the event level and referenced by instances via their `id` field.

### 4.1 Venue (base)

```
Venue (base)
  id:     string              REQUIRED
  $type:  string              REQUIRED
  name:   Translations        REQUIRED
```

**`id`**: A locally unique identifier within the event's `venues` array. Two different events MAY use the same venue IDs. Within a single event, venue IDs MUST be unique.

**`$type`**: A reverse-domain string identifying the venue variant. Determines the structure of the venue object.

**`name`**: A human-readable name as a [Translations](#22-translations) object.

### 4.2 PhysicalVenue

`$type`: `directory.evnt.venue.physical`

A real-world location.

```
PhysicalVenue extends Venue
  $type:    "directory.evnt.venue.physical"
  address:  Address?            OPTIONAL
  maps:     MapReferences?      OPTIONAL
```

#### Address

```
Address
  addr:         string?         OPTIONAL
  countryCode:  string?         OPTIONAL
```

**`addr`**: The full address as a single free-form string.

**`countryCode`**: An ISO 3166-1 alpha-2 country code (e.g. `LT`, `US`). SHOULD be uppercase.

#### MapReferences

A record of identifiers for the venue in external map services.

```
MapReferences
  [nsid: string]: string | string[]
```

Keys are reverse-domain NSIDs. Values are the identifier(s) assigned by that service.

| NSID | Service | Entity |
|------|---------|--------|
| `org.openstreetmap.node` | OpenStreetMap | Node (POI) |
| `org.openstreetmap.way` | OpenStreetMap | Way (building) |
| `org.openstreetmap.relation` | OpenStreetMap | Relation (area) |
| `com.google.places` | Google Places | Place ID |
| `com.foursquare` | Foursquare | Venue ID |
| `com.what3words` | what3words | 3-word address |
| `org.geonames` | GeoNames | Feature ID |
| `org.wikidata.entity` | Wikidata | Entity QID |

### 4.3 OnlineVenue

`$type`: `directory.evnt.venue.online`

A virtual or web-based location.

```
OnlineVenue extends Venue
  $type:    "directory.evnt.venue.online"
  url:      string?            OPTIONAL
```

**`url`**: The URL where the event can be accessed online.

### 4.4 UnknownVenue

`$type`: `directory.evnt.venue.unknown`

This represents a location with a name but does not make any guarantees about whether it is physical or online. Recommended for automated data collection when the venue type cannot be determined.

```
UnknownVenue extends Venue
  $type:    "directory.evnt.venue.unknown"
```

If an instance has no known venue at all, use an empty `venueIds` array rather than creating an `UnknownVenue`.

### 4.5 Custom venue types

Producers MUST NOT define custom venue types. Consumers MUST ignore venues with unknown `$type` values and MUST preserve them when re-saving.

If a venue is ignored due to unknown `$type`, its `id` is no longer available for instance references. Consumers SHOULD treat references to ignored venues as unresolvable.

---

## 5. Instances

An instance represents a single continuous occurrence of an event. If an event happens multiple times (e.g. a conference with multiple days), each occurrence is a separate instance.

### 5.1 EventInstance

```
EventInstance
  id:        string?                  OPTIONAL
  venueIds:  string[]                 REQUIRED
  start:     PartialDate?             OPTIONAL
  end:       PartialDate?             OPTIONAL
  status:    EventStatus?             OPTIONAL
  components:EventComponent[]?        OPTIONAL

  Additional properties: NOT ALLOWED
```

**`id`**: An optional local identifier for the instance.

**`components`**: An array of [EventComponent](#6-components) objects representing additional metadata specific to this instance.

**`venueIds`**: References to [Venues](#4-venues) defined in the parent `OpenEvnt.venues`. MUST be an array (possibly empty). Duplicate values MUST NOT appear. Each value MUST match the `id` field of a venue in `venues`. If a value does not match any venue, consumers SHOULD treat it as an error.

When displaying venue information, consumers SHOULD use the `venueIds` of each instance rather than listing all event-level venues directly. This prevents displaying venues that are not relevant to a specific instance.

Producers SHOULD warn if a venue in `venues` is not referenced by any instance.

**`start`**: The start date and/or time as a [PartialDate](#3-partial-date).

**`end`**: The end date and/or time as a [PartialDate](#3-partial-date). When both `start` and `end` are present, `end` MUST have the same or lower precision than `start` (e.g. if `start` specifies a day, `end` cannot specify a time).

**`status`**: The planning state of this instance. Overrides the event-level [EventStatus](#23-eventstatus) for this instance. When absent, inherits from the event-level `status`.

An event with no instances has no scheduled occurrences. This is valid for placeholder or template events.

### 5.2 Multiple instances

When an event has multiple occurrences with different times or venues, each occurrence SHOULD be represented as a separate instance.

```json
{
  "instances": [
    { "venueIds": ["hall"], "start": "2026-06-15T09:00[Europe/Vilnius]", "end": "2026-06-15T18:00[Europe/Vilnius]" },
    { "venueIds": ["hall"], "start": "2026-06-16T10:00[Europe/Vilnius]", "end": "2026-06-16T17:00[Europe/Vilnius]" }
  ]
}
```

### 5.3 Multi-day events

A single event spanning multiple consecutive days (e.g. a festival, a game jam) SHOULD be represented as a single instance with `start` and `end` dates. The criterion is whether attendance is continuous (one instance) vs. discrete separate sessions (multiple instances).

### 5.4 Instance status

Each instance MAY have its own `status`, independent of the event-level status.

```json
{
  "status": "planned",
  "instances": [
    { "venueIds": ["hall"], "status": "planned", "start": "2026-06-15[Europe/Vilnius]" },
    { "venueIds": ["hall"], "status": "uncertain", "start": "2026-06-16[Europe/Vilnius]" }
  ]
}
```

Instance-level status overrides the event-level status for that instance only.

---

## 6. Components

Components carry additional metadata about an event that is not tied to a specific venue or instance. They are the primary extension mechanism of Open Evnt.

### 6.1 EventComponent (base)

```
EventComponent
  $type:  string    REQUIRED

  Additional properties: ALLOWED
```

**`$type`**: A reverse-domain string identifying the component type. Determines the structure and semantics of the remaining fields.

### 6.2 Component processing rules

- Consumers MUST ignore components with unknown `$type` values.
- Consumers MUST preserve unknown components and their properties when re-saving event data.
- Producers MAY define custom component types using any reverse-domain string.
- Custom `$type` values SHOULD use a namespace the producer controls (e.g. `com.example.component.metadata`).

## 7. Defined component types

### `directory.evnt.component.link`

A link related to the event (website, ticketing, social media, etc.).

```
directory.evnt.component.link
  $type:     "directory.evnt.component.link"
  url:       string              REQUIRED
  name:      Translations?       OPTIONAL
  disabled:  boolean?            OPTIONAL
  opensAt:   PartialDate?        OPTIONAL
  closesAt:  PartialDate?        OPTIONAL
```

**`disabled`**: When `true`, the link is temporarily unavailable.

**`opensAt`**: The link becomes active at this time.

**`closesAt`**: The link becomes inactive at this time.

### `directory.evnt.component.source`

A source of information about the event (news article, announcement, etc.).

```
directory.evnt.component.source
  $type:     "directory.evnt.component.source"
  url:       string              REQUIRED
```

Producers SHOULD use this component when the event data was sourced from an external announcement or publication. It is not needed when the event itself is the primary source.

### `directory.evnt.component.splashMedia`

A media item for visual representation of the event (cover image, poster, etc.).

```
directory.evnt.component.splashMedia
  $type:     "directory.evnt.component.splashMedia"
  media:     Media               REQUIRED
  roles:     string[]            REQUIRED
```

**`roles`**: Usage roles such as `"background"`, `"thumbnail"`, `"poster"`. Applications MAY define their own roles.

### `directory.evnt.component.languages`

Languages the event is available in.

```
directory.evnt.component.languages
  $type:      "directory.evnt.component.languages"
  languages:  LanguageInfo[]           REQUIRED
```

**`languages`**: An array of language entries.

```
LanguageInfo
  code:  string    REQUIRED
```

**`code`**: A BCP47 language tag (e.g. `"en"`, `"lt"`, `"zh-Hans"`).

### `directory.evnt.richtext.bluesky`

Rich text content in the Bluesky Rich Text format.

```
directory.evnt.richtext.bluesky
  $type:     "directory.evnt.richtext.bluesky"
  text:      string              REQUIRED
  facets:    Facet[]?            OPTIONAL
```

The `facets` field uses the same format as [Bluesky Rich Text Facets](https://docs.bsky.app/docs/advanced-guides/post-richtext). `Facet` is defined by the Bluesky AT Protocol and is not part of this specification.

### `directory.evnt.richtext.markdown`

Markdown content with an optional language hint.

```
directory.evnt.richtext.markdown
  $type:    "directory.evnt.richtext.markdown"
  content:  string              REQUIRED
  language: string?             OPTIONAL
```

`language`: A BCP47 language tag for the markdown content. Producers SHOULD populate this field when the language is known.

---

## 8. Serialization

Open Evnt documents are serialized as JSON.

### 8.1 JSON representation

An `OpenEvnt` object MUST be represented as a JSON object conforming to the [data model](#2-data-model) defined in this specification.

```json
{
	"v": "0.1",
	"name": {
		"en": "Example Event"
	}
}
```

### 8.2 Field ordering

Consumers MUST NOT depend on JSON object key order.

### 8.3 Unknown fields

At the `OpenEvnt` level, consumers MUST reject objects with properties not defined in the data model.

At the component level, additional properties beyond `$type` are PERMITTED. Consumers MUST preserve them when re-saving.

### 8.4 File extension

The RECOMMENDED file extension for Open Evnt files is `.evnt.json`. This distinguishes Open Evnt files from generic JSON while keeping standard tooling (syntax highlighting, validators) working.

```
meetup.evnt.json
fosdem-2026.evnt.json
```

### 8.5 MIME type

The RECOMMENDED MIME type is `application/evnt+json`.

Optional version parameter:

```
application/evnt+json; v=0.1
```

### 8.6 HTTP serving

HTTP servers serving Open Evnt files SHOULD include these headers:

```
Content-Type: application/evnt+json
Access-Control-Allow-Origin: *
```

---

## 9. Versioning

### 9.1 Version scheme

Versions follow a `MAJOR.MINOR` scheme.

**Exception for 0.x versions:** All `0.*` versions may introduce breaking changes. This follows the ZeroVer convention while the format is in development. Starting from `1.0`, the rules below apply.

- **MINOR** changes (e.g. `1.0` → `1.1`): Additive only. New optional fields, new component types. Existing documents remain valid.
- **MAJOR** changes (e.g. `1.0` → `2.0`): May break backward compatibility. Fields may be removed, required fields may change, serialization format may change.

### 9.2 Current version

The current version is `"0.1"`. All published documents MUST set `v` to `"0.1"`.

The `0.` prefix indicates the format is in development. Producers and consumers SHOULD expect breaking changes between any `0.x` versions.

### 9.3 Producer requirements

- Producers MUST set `v` to the version of the spec they conform to.
- Producers MUST NOT produce documents with a `v` value that does not match the spec they implement.

### 9.4 Consumer requirements

- Consumers MUST accept documents with a `v` value equal to or lower than the highest version they support.
- Consumers MAY accept documents with a higher minor version (e.g. a `1.0` consumer MAY accept `1.1` documents, ignoring unrecognized fields).
- Consumers MUST reject documents with a higher major version they do not support.

---

## Appendix A: Complete example

```json
{
	"v": "0.1",
	"name": {
		"en": "Tech Conference 2026",
		"lt": "Tech Konferencija 2026"
	},
	"label": {
		"en": "The premier tech event in Vilnius",
		"lt": "Pagrindinis technologijų renginys Vilniuje"
	},
	"status": "planned",
	"venues": [
		{
			"id": "main-hall",
			"$type": "directory.evnt.venue.physical",
			"name": { "en": "Vilnius Convention Centre" },
			"address": {
				"addr": "123 Konstitucijos pr., Vilnius",
				"countryCode": "LT"
			}
		},
		{
			"id": "stream",
			"$type": "directory.evnt.venue.online",
			"name": { "en": "Livestream" },
			"url": "https://live.example.com/techconf-2026"
		}
	],
	"instances": [
		{
			"venueIds": ["main-hall", "stream"],
			"start": "2026-06-15T09:00[Europe/Vilnius]",
			"end": "2026-06-15T18:00[Europe/Vilnius]"
		},
		{
			"venueIds": ["main-hall", "stream"],
			"start": "2026-06-16T10:00[Europe/Vilnius]",
			"end": "2026-06-16T17:00[Europe/Vilnius]"
		}
	],
	"components": [
		{
			"$type": "directory.evnt.component.link",
			"url": "https://example.com/tickets",
			"name": { "en": "Get Tickets" }
		},
		{
			"$type": "directory.evnt.component.splashMedia",
			"media": {
				"sources": [
					{
						"url": "https://example.com/banner.jpg",
						"mimeType": "image/jpeg",
						"dimensions": { "width": 1200, "height": 600 }
					}
				],
				"alt": { "en": "Tech Conference 2026 banner" },
				"presentation": {
					"dominantColor": "#1a1a2e"
				}
			},
			"roles": ["background"]
		}
	]
}
```

---

## Appendix B: JSON Schema

The machine-validatable JSON Schema for this specification is published at `https://evnt.directory/openevnt.schema.json`.

---

## Appendix C: Changelog

### 0.1: 2026-06-12

- Initial draft of the Open Evnt specification.
