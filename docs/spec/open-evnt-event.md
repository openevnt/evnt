# Open Evnt Specification

**Version:** 0.2 DRAFT

**Last Updated:** 2026-10-09

## 1. Introduction

Open Evnt is a JSON format for describing one event: what it is, where and when it takes place, and where to find out more. It is meant for passing events between the sites and apps that list them.

### 1.1 Scope

This document defines how one event is represented as an Open Evnt document.

It does not define how events are created, updated, deleted, stored or transmitted. Querying a collection of events is defined by the [Open Evnt Index](open-evnt-index.md), and finding collections by the [Open Evnt Manifest](open-evnt-manifest.md).

Parts of the format are defined in companion documents:

- [Open Evnt Event Components](open-evnt-event-components.md), the components defined by Open Evnt
- [Translations](open-evnt-translations.md), for text in several languages
- [PartialDate](open-evnt-partialdate.md), for dates that may be incomplete

### 1.2 Conformance

The key words **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, **SHOULD NOT**, **RECOMMENDED**, **NOT RECOMMENDED**, **MAY**, and **OPTIONAL** in this document are to be interpreted as described in BCP 14 ([RFC 2119](https://www.rfc-editor.org/rfc/rfc2119), [RFC 8174](https://www.rfc-editor.org/rfc/rfc8174)) when, and only when, they appear in all capitals, as shown here.

This specification sets requirements for documents, producers and consumers:

- A document conforms when it follows every MUST and MUST NOT that applies to documents, in this document and in the documents it references.
- A producer conforms when every document it writes conforms and it follows every MUST and MUST NOT that applies to producers.
- A consumer conforms when it follows every MUST and MUST NOT that applies to consumers.

### 1.3 Terminology

| Term      | Definition                                                                               |
|-----------|------------------------------------------------------------------------------------------|
| Event     | A gathering of people for a shared purpose or interest                                   |
| Document  | A JSON object that describes one event, as defined in [section 2](#2-open-evnt-document) |
| Organizer | The person or group that runs the event                                                  |
| Publisher | The person or group that publishes a document, who may not be the organizer              |
| Producer  | Software that writes Open Evnt documents                                                 |
| Consumer  | Software that reads Open Evnt documents                                                  |

### 1.4 Notation

Objects are described in blocks like this one:

```
Example
  name:  string     REQUIRED
  tags:  string[]?  OPTIONAL
  kind:  "a"?       OPTIONAL
```

The first line names the type. Each line under it is a field of the JSON object, with its type and whether it is REQUIRED or OPTIONAL. A REQUIRED field MUST be present. An OPTIONAL field MAY be left out, and its type ends in `?`.

`string`, `number` and `boolean` are the JSON types of [RFC 8259](https://www.rfc-editor.org/rfc/rfc8259). `T[]` is a JSON array of `T`. A quoted value such as `"0.2"` is a string that MUST have exactly that value. Other type names are defined in this document or in the documents it references.

No field takes `null`. A field without a value is left out. Consumers MUST reject a document in which a field defined by this specification is `null`.

## 2. Open Evnt Document

A single event is represented as an Open Evnt Document.

The document has the following structure:

```
OpenEvnt
  v:           "0.2"                     REQUIRED
  id:          string                    REQUIRED
  name:        Translations              REQUIRED
  status:      Status?                   OPTIONAL
  venue:       Venue?                    OPTIONAL
  occurrences: Occurrence[]?             OPTIONAL
  components:  Component[]?              OPTIONAL
```

The `v` field indicates the version of the Open Evnt specification that the event conforms to. See [section 7 (Versioning)](#7-versioning).

The `id` field identifies the event. See [section 2.2 (Identity)](#22-identity).

The `name` field is the event's name as its organizer uses it, including any year or edition number, such as "GameOn 2026". See [section 3.1 (Translations)](#31-translations).

The `status` field says that the event may not take place as listed. See [section 2.1 (Status)](#21-status).

The `venue` field is the place where the event takes place. See [section 4 (Venue)](#4-venue).

The `occurrences` field lists the times the event takes place. See [section 5 (Occurrences)](#5-occurrences).

The `components` field holds components that describe the event. See [section 6 (Component Extension Model)](#6-component-extension-model).

### 2.1 Status

The `status` field is only present when the event may not take place as listed. An event without a `status` has nothing known to be wrong with it. The following values are defined:

| Value       | Description                                                                    |
|-------------|--------------------------------------------------------------------------------|
| `uncertain` | The organizer has said the event may not take place as listed                  |
| `cancelled` | The event will not take place                                                  |
| `postponed` | The event will not take place on the listed dates, and new dates are not known |

Consumers SHOULD show that an `uncertain` event may not take place as listed wherever they show its dates.

When a postponed event gets new dates, producers SHOULD update its `occurrences` and remove `status`. The event keeps its `id`.

Producers SHOULD keep a cancelled or postponed event published at its `id`, with its last dates and venue, and SHOULD NOT delete it. Consumers SHOULD NOT present the dates of a cancelled or postponed event as upcoming.

When only some dates or parts of an event are called off, the `status` of the [occurrence](#5-occurrences) or [activity](#51-activities) says so, and the event has no `status`.

### 2.2 Identity

The `id` field is an absolute URI, as defined by [RFC 3986](https://www.rfc-editor.org/rfc/rfc3986), that identifies the event.

Producers SHOULD use the `https` URL the document itself is fetched from, not the URL of a web page about the event. When there is none, such as for a draft or a document shared as a file, producers MAY use a `urn:uuid:` URI ([RFC 9562](https://www.rfc-editor.org/rfc/rfc9562)). Producers SHOULD generate the `id` without asking a person for it.

The `id` of an event MUST NOT change, including when the document is moved, mirrored or copied to another publisher. An `id` MUST NOT be reused for a different event. A producer that creates an event by copying an existing document, such as the next edition of the event, MUST give the copy a new `id`.

When a document with an `https` id moves, its old URL SHOULD redirect to the new one.

An `https` id is verified when fetching it, following redirects, returns a document with the same `id`. Consumers MAY treat an unverified `id` as a claim.

Consumers that find the same `id` on documents describing clearly different events SHOULD treat this as a collision and SHOULD NOT merge the documents.

A document that describes the same event as another document with a different `id`, such as a listing on another site, can link it with a [Relation Component](open-evnt-event-components.md#28-relation-component) of type `alternate`.

## 3. Common Data Types

### 3.1. Translations

Text that can be given in several languages, defined by the [Open Evnt Translations specification](open-evnt-translations.md).

### 3.2. PartialDate

A date and optional time known to a year, month, day or minute, defined by the [Open Evnt PartialDate specification](open-evnt-partialdate.md).

## 4. Venue

A `Venue` is the physical place where an event takes place. It is a JSON object with the following structure:

```
Venue
  name:        Translations?  OPTIONAL
  address:     string?        OPTIONAL
  countryCode: string?        OPTIONAL
  components:  Component[]?   OPTIONAL
```

A venue MUST have at least one field.

The `name` field is the name of the venue, such as "LITEXPO". It is left out when the place has no name, or when only its address or city is known.

The `address` field is the address of the venue as people would write it, such as "Laisvės pr. 5, Vilnius". It does not have to be a postal address, so a park or a field has one too. When only the city or area is known, the address is just that.

The `countryCode` field is the country the venue is in, as an uppercase [ISO 3166-1](https://www.iso.org/iso-3166-country-codes.html) alpha-2 code, such as "LT".

The `components` field is an optional array of components that describe the venue. See [section 6 (Component Extension Model)](#6-component-extension-model).

Where the venue is on a map goes in a [Coordinates Component](open-evnt-event-components.md#29-coordinates-component).

An event has at most one venue, and every occurrence of the event takes place there. An event that changes place between occurrences MUST be split into one event per place.

An event in Kaunas whose venue has not been announced yet has this venue:

```json
{ "address": "Kaunas", "countryCode": "LT" }
```

An event without a `venue` has no known physical place: either nothing about the place has been announced, or the event is held online only. An event held online, alone or next to a venue, carries an [Online Component](open-evnt-event-components.md#26-online-component).

## 5. Occurrences

An `Occurrence` is one time the event takes place: a stretch of time in which attendees can take part in it. It is a JSON object with the following structure:

```
Occurrence
  start:      PartialDate?  OPTIONAL
  end:        PartialDate?  OPTIONAL
  status:     "cancelled"?  OPTIONAL
  activities: Activity[]?   OPTIONAL
  components: Component[]?  OPTIONAL
```

All occurrences of an event take place at the event's venue. See [section 4 (Venue)](#4-venue).

The `start` and `end` fields are optional `PartialDate` fields that represent the start and end times of the occurrence. If both are present, `start` MUST NOT be after `end`, as defined in [section 3.2 (Order)](open-evnt-partialdate.md#32-order) of the PartialDate specification.

When attendees are admitted at different times, such as by ticket type, `start` and `end` span the widest window: `start` is the earliest time anyone is admitted and `end` is the latest time anyone may stay. The times for each group belong in components.

The `status` field is `cancelled` when this occurrence will not take place but other occurrences of the event still do. No other values are defined for occurrences.

The `activities` field is an optional array of `Activity` objects that represent the activities that take place during the occurrence. See [section 5.1 (Activities)](#51-activities).

The `components` field is an optional array of `Component` objects that represent additional information about the occurrence. See [section 6 (Component Extension Model)](#6-component-extension-model).

### 5.1. Activities

An `Activity` is a specific activity that takes place during an occurrence of an event. Activities are represented as JSON objects.

The `Activity` object has the following structure:

```
Activity
  name:     Translations  REQUIRED
  status:   "cancelled"?  OPTIONAL
```

The `name` is a required `Translations` field that describes the name of the activity.

The `status` field is `cancelled` when the activity will not take place but the rest of the event still does. No other values are defined for activities.

## 6. Component Extension Model

The event itself, its venue, and its occurrences can be extended with additional information using the component extension model.

The `components` field in the Open Evnt document, the `Venue` object, and `Occurrence` objects is an optional array of `Component` objects.

A `Component` object MUST have a `$type` field that indicates the type of the component.

The `$type` field is a string that follows the reverse domain name notation. Producers SHOULD use a domain name that they control to avoid naming collisions with other producers.

### 6.1. Component Versions

A component type has an integer version. The version follows the name after a `#`, such as `directory.evnt.component.link#1`. A `$type` without a `#` is version 0. Producers MUST NOT write `#0`.

A new version is only made for a breaking change: a field is removed, or its meaning or type changes. Adding an optional field does not make a new version.

Consumers MUST treat each version as a separate type. A consumer that supports `directory.evnt.component.link` but not `directory.evnt.component.link#1` treats the latter as an unknown type.

Consumers MAY ignore components with unknown `$type` values.

Consumers MUST preserve components with unknown `$type` values when modifying an Open Evnt document.

The order of components in the `components` array is not significant. Consumers MAY reorder components when modifying an Open Evnt document.

## 7. Versioning

The `v` field in the Open Evnt document indicates the version of the Open Evnt specification that the event conforms to.

Consumers MUST reject versions that they do not support. Producers MUST set `v` to the version of the specification that they are using.

The current version of the Open Evnt specification is `"0.2"`. Producers SHOULD use this version when creating new events.

When a new version of the Open Evnt specification is released, producers MAY choose to update their events to conform to the new version. Consumers MAY choose to support multiple versions of the Open Evnt specification.

## 8. Serialization

An Open Evnt document is serialized as a single JSON object encoded as UTF-8.

### 8.1. Field Ordering

The order of keys in a JSON object is not significant. Consumers MUST NOT depend on key order, and producers MUST NOT assign meaning to it.

### 8.2. Additional Properties

An object defined by this specification MUST NOT carry properties other than those defined for it. Consumers MUST reject documents containing such properties.

This rule does not apply to `Component` objects. A `Component` carries whatever properties its `$type` defines, and consumers MUST preserve them as described in [section 6 (Component Extension Model)](#6-component-extension-model).

### 8.3. Media Type and File Extension

An Open Evnt document SHOULD be served with the media type `application/vnd.evnt+json` and saved with the file extension `.evnt.json`. Consumers MAY accept other media types and file extensions.

## Appendix A: Complete Example

```json
{
	"v": "0.2",
	"id": "https://example.com/events/tech-conference-2026",
	"name": {
		"en": "Tech Conference 2026",
		"lt": "Tech Konferencija 2026"
	},
	"venue": {
		"name": { "en": "Vilnius Convention Centre" },
		"address": "Konstitucijos pr. 123, Vilnius",
		"countryCode": "LT",
		"components": [
			{
				"$type": "directory.evnt.component.placeId",
				"type": "org.openstreetmap.way",
				"id": "123456789"
			}
		]
	},
	"occurrences": [
		{
			"start": "2026-06-15T09:00[Europe/Vilnius]",
			"end": "2026-06-15T18:00[Europe/Vilnius]",
			"activities": [
				{ "name": { "en": "Opening Keynote" } },
				{ "name": { "en": "Workshop: Building Event Directories" } }
			]
		},
		{
			"start": "2026-06-16T10:00[Europe/Vilnius]",
			"end": "2026-06-16T17:00[Europe/Vilnius]"
		}
	],
	"components": [
		{
			"$type": "directory.evnt.component.relation",
			"type": "parent",
			"target": "https://example.com/events/tech-conference"
		},
		{
			"$type": "directory.evnt.component.online",
			"url": "https://live.example.com/techconf-2026",
			"name": { "en": "Livestream" }
		},
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
						"dimensions": { "width": 1200, "height": 600 }
					}
				],
				"alt": { "en": "Tech Conference 2026 banner" },
				"presentation": {
					"dominantColor": "#1a1a2e"
				}
			}
		}
	]
}
```

The component types used above are defined by the [Open Evnt Event Components specification](open-evnt-event-components.md), not by this document.

## Appendix B: JSON Schema

The machine-validatable JSON Schema for this specification is published at `https://evnt.directory/openevnt.schema.json`.

## Appendix C: Changelog

### 0.2: draft

- Added the required `id` field.
- Replaced the `venues` array with a single optional `venue`. Venue ids and venue types are removed; online attendance moved to the Online Component.
- Renamed `instances` to `occurrences`.
- Removed `venueIds` from occurrences.
- Removed the `$type` field from the document.
- Added component versions.
- Removed the `planned` and `suspended` statuses. An event without `status` has nothing known to be wrong with it.
- Cancelled and postponed events stay published. Consumers no longer ignore their dates; they just don't present them as upcoming.
- Added `status` to occurrences and activities.
- Events link to each other with the new Relation Component.
- `null` is not a valid field value. A field without a value is left out.
- Removed the `label` field. The year or edition goes in `name`, and the series is a `parent` relation.
- The media type is now `application/vnd.evnt+json`, and it moved to section 8.
- PartialDate moved to its own document, with rules for ordering and clock changes.
- Removed `opensAt` and `closesAt` from the Link Component.
- Removed the `Address` object. `address` is a string, `countryCode` moved onto the venue, and the venue `name` is optional.
- Added the Coordinates Component for where the venue is on a map.
- Translations keys must not differ only in case, values must not be empty, and consumers pick a language with RFC 4647 Lookup.

### 0.1: 2026-06-12

- Initial draft of the Open Evnt specification.
