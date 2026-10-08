# Open Evnt Specification

**Version:** 0.1 DRAFT

**Last Updated:** 2026-08-14

[[toc]]

## 1. Introduction

This document describes the Open Evnt specification, which defines a standard format for representing event information in JSON.

### 1.1 Scope

This document defines how an event is represented in the Open Evnt format using JSON.

This document does not define how events are created, updated, deleted, stored, transmitted, or queried. These are implementation details that are outside the scope of this specification.

### 1.2 Conformance

The keywords **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, **SHOULD NOT**, **RECOMMENDED**, **MAY**, and **OPTIONAL** in this document should be interpreted as described in [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119).

### 1.3 Terminology

| Term     | Definition                                             |
|----------|--------------------------------------------------------|
| Event    | A gathering of people for a shared purpose or interest |
| Producer | Software that creates events                           |
| Consumer | Software that uses events                              |

## 2. Open Evnt Document

A single event is represented as an Open Evnt Document.

The document has the following structure:

```
OpenEvnt
  v:          "0.1"                     REQUIRED
  name:       Translations              REQUIRED
  label:      Translations?             OPTIONAL
  status:     Status?                   OPTIONAL
  venues:     Venue[]?                  OPTIONAL
  instances:  Instance[]?               OPTIONAL
  components: Component[]?              OPTIONAL
```

The `v` field indicates the version of the Open Evnt specification that the event conforms to. See [section 7 (Versioning)](#7-versioning).

The `name` field is a required field that contains the name of the event in multiple languages. See [section 3.1 (Translations)](#31-translations).

The `label` field indicates a secondary name for the event, such as its edition, year, or other identifying information. Producers MAY use this field to distinguish the event from similarly named events. Producers SHOULD omit this field if not necessary. Consumers MAY display this field alongside the `name` field.

The `status` field indicates the current status of the event. See [section 2.2 (Status)](#22-status).

The `venues` field is an optional array of venues where the event takes place. See [section 4 (Venues)](#4-venues).

The `instances` field is an optional array of instances of the event. See [section 5 (Instances)](#5-instances).

The `components` field is an optional array of components that describe the event. See [section 6 (Component Extension Model)](#6-component-extension-model).

### 2.1 MIME/Content Type & File Extension

The Open Evnt document SHOULD have the MIME/content type `application/evnt+json` and the file extension `.evnt.json`. Consumers MAY accept other MIME types and file extensions, but producers SHOULD use the recommended MIME type and file extension.

### 2.2 Status

The `status` field indicates the planning phase of the event. The following values are defined:

| Value       | Description                                              |
|-------------|----------------------------------------------------------|
| `planned`   | No changes to scheduling                                 |
| `uncertain` | Changes to scheduling are possible                       |
| `cancelled` | The event has been cancelled and will not take place     |
| `postponed` | The event will take place at a later unknown time        |
| `suspended` | All scheduling decisions are paused until further notice |

In the absence of a `status` field, the event is assumed to be in the `planned` state.

The values `uncertain`, `cancelled`, `postponed`, and `suspended` determine that the dates and times of the event are not guaranteed to be accurate. Consumers SHOULD NOT rely on the dates and times of events with these statuses to determine the temporal aspects of the event.

## 3. Common Data Types

The Open Evnt specification defines several common data types that are used throughout the specification. Some of these data types are defined in separate documents, while others are defined in this document.

### 3.1. Translations

The `Translations` data type is used to represent a string in multiple languages.

The `Translations` data type is defined by the [Open Evnt Translations specification](open-evnt-translations.md).

### 3.2. PartialDate

The `PartialDate` data type is used to represent dates that may be incomplete or uncertain.

The `PartialDate` data type is defined by the [Open Evnt PartialDate specification](open-evnt-partialdate.md).

## 4. Venues

A `Venue` is a location where an event takes place. Venues are represented as JSON objects.

There are three types of venues defined in the Open Evnt specification: physical, online, and unknown. Each type of venue has its own set of fields that are used to describe the venue.

All venue types share the following common fields:

```
Venue
  $type:   string        REQUIRED
  name:    Translations  REQUIRED
  id:      string        REQUIRED
```

The `$type` field is a required string that indicates the type of venue. See [section 4.1 (Venue Types)](#41-venue-types) for the list of defined venue types.

The `name` field is a required `Translations` field that describes the name of the venue.

The `id` field is a required string that uniquely identifies the venue in the current Open Evnt document. Producers MUST use a unique identifier for each venue in the document.

### 4.1. Venue Types

The type of the venue is determined by the `$type` field in the `Venue` object. The following values are defined:

- `"directory.evnt.venue.physical"`: [4.1.1. Physical Venue](#411-physical-venue)
- `"directory.evnt.venue.online"`: [4.1.2. Online Venue](#412-online-venue)
- `"directory.evnt.venue.unknown"`: [4.1.3. Unknown Venue](#413-unknown-venue)

Producers MUST NOT use any other values for the `$type` field. Consumers MAY ignore venues with unknown `$type` values.

#### 4.1.1. Physical Venue

The physical venue type is used to represent a physical location where an event takes place. The `Venue` object for a physical venue has the following additional fields:

```
PhysicalVenue extends Venue
  $type:     "directory.evnt.venue.physical"  REQUIRED
  address:   Address?  OPTIONAL

Address
  addr:        string?  OPTIONAL
  countryCode: string?  OPTIONAL
```

#### 4.1.2. Online Venue

The online venue type is used to represent an online location where an event takes place. The `Venue` object for an online venue has the following additional fields:

```
OnlineVenue extends Venue
  $type:     "directory.evnt.venue.online"  REQUIRED
  url:        string                        REQUIRED
```

The `url` field is a required string that represents the URL of the online venue.

#### 4.1.3. Unknown Venue

The unknown venue type is used to represent a venue whose type is not known. The `Venue` object for an unknown venue has no additional fields.

```
UnknownVenue extends Venue
  $type:     "directory.evnt.venue.unknown"  REQUIRED
```

Producers SHOULD use the unknown venue type when the type of the venue is not known or cannot be determined.

## 5. Instances

An `Instance` is a specific occurrence of an event. An instance represents a time slice in which attendees can participate in the event.

Instances are represented as JSON objects.

An `Instance` object has the following structure:

```
Instance
  venueIds:   string[]  REQUIRED
  start:      PartialDate?  OPTIONAL
  end:        PartialDate? OPTIONAL
  activities: Activity[]? OPTIONAL
  components: Component[]? OPTIONAL
```

The `venueIds` field MUST be present and MUST be an array of strings, possibly empty. Each value MUST match the `id` field of a `Venue` object in the `venues` array of the Open Evnt document. Duplicate values MUST NOT appear. Consumers SHOULD treat a value that matches no venue as an error.

Producers MAY leave `venueIds` empty if the instance does not have a known location.

The `start` and `end` fields are optional `PartialDate` fields that represent the start and end times of the instance. If both fields are present, the `start` field MUST be less than or equal to the `end` field. See [section 3.2 (PartialDate)](#32-partialdate) for more information about the `PartialDate` data type and the sorting semantics.

The `activities` field is an optional array of `Activity` objects that represent the activities that take place during the instance. See [section 5.1 (Activities)](#51-activities).

The `components` field is an optional array of `Component` objects that represent additional information about the instance. See [section 6 (Component Extension Model)](#6-component-extension-model).

### 5.1. Activities

An `Activity` is a specific activity that takes place during an instance of an event. Activities are represented as JSON objects.

The `Activity` object has the following structure:

```
Activity
  name:     Translations  REQUIRED
```

The `name` is a required `Translations` field that describes the name of the activity.

## 6. Component Extension Model

The event itself, its venues, and its instances can be extended with additional information using the component extension model.

The `components` field in the Open Evnt document, `Instance` objects, and `Venue` objects is an optional array of `Component` objects.

A `Component` object MUST have a `$type` field that indicates the type of the component.

The `$type` field is a string that follows the reverse domain name notation. Producers SHOULD use a domain name that they control to avoid naming collisions with other producers.

Consumers MAY ignore components with unknown `$type` values.

Consumers MUST preserve components with unknown `$type` values when modifying an Open Evnt document.

The order of components in the `components` array is not significant. Consumers MAY reorder components when modifying an Open Evnt document.

## 7. Versioning

The `v` field in the Open Evnt document indicates the version of the Open Evnt specification that the event conforms to.

Consumers MUST reject versions that they do not support. Producers MUST set `v` to the version of the specification that they are using.

The current version of the Open Evnt specification is `"0.1"`. Producers SHOULD use this version when creating new events.

When a new version of the Open Evnt specification is released, producers MAY choose to update their events to conform to the new version. Consumers MAY choose to support multiple versions of the Open Evnt specification.

## 8. Serialization

An Open Evnt document is serialized as a single JSON object encoded as UTF-8.

### 8.1. Field Ordering

The order of keys in a JSON object is not significant. Consumers MUST NOT depend on key order, and producers MUST NOT assign meaning to it.

### 8.2. Additional Properties

An object defined by this specification MUST NOT carry properties other than those defined for it. Consumers MUST reject documents containing such properties.

This rule does not apply to `Component` objects. A `Component` carries whatever properties its `$type` defines, and consumers MUST preserve them as described in [section 6 (Component Extension Model)](#6-component-extension-model).

## Appendix A: Complete Example

```json
{
	"v": "0.1",
	"name": {
		"en": "Tech Conference",
		"lt": "Tech Konferencija"
	},
	"label": {
		"en": "2026",
		"lt": "2026"
	},
	"status": "planned",
	"venues": [
		{
			"$type": "directory.evnt.venue.physical",
			"id": "main-hall",
			"name": { "en": "Vilnius Convention Centre" },
			"address": {
				"addr": "123 Konstitucijos pr., Vilnius",
				"countryCode": "LT"
			}
		},
		{
			"$type": "directory.evnt.venue.online",
			"id": "stream",
			"name": { "en": "Livestream" },
			"url": "https://live.example.com/techconf-2026"
		}
	],
	"instances": [
		{
			"venueIds": ["main-hall", "stream"],
			"start": "2026-06-15T09:00[Europe/Vilnius]",
			"end": "2026-06-15T18:00[Europe/Vilnius]",
			"activities": [
				{ "name": { "en": "Opening Keynote" } },
				{ "name": { "en": "Workshop: Building Event Directories" } }
			]
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

### 0.1: 2026-06-12

- Initial draft of the Open Evnt specification.
