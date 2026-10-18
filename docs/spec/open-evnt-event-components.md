# Open Evnt Event Components

**Version:** 0.2 DRAFT

**Last Updated:** 2026-10-18

[[toc]]

This document outlines the Open Evnt defined components that can be used to describe an event. These components are used in the `components` field of an Open Evnt Event document.

## 1. Introduction

The key words **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, **SHOULD NOT**, **RECOMMENDED**, **NOT RECOMMENDED**, **MAY**, and **OPTIONAL** in this document are to be interpreted as described in BCP 14 ([RFC 2119](https://www.rfc-editor.org/rfc/rfc2119), [RFC 8174](https://www.rfc-editor.org/rfc/rfc8174)) when, and only when, they appear in all capitals, as shown here.

How components are carried, how `$type` is chosen, and how consumers treat unknown components is defined in [section 6 (Component Extension Model)](open-evnt-event.md#6-component-extension-model) of the Open Evnt specification. The `Translations` and `PartialDate` types used below are defined in its [section 3 (Common Data Types)](open-evnt-event.md#3-common-data-types).

A component describes the object whose `components` array holds it: the event, its venue, or an occurrence.

## 2. Components

| `$type`                                  | Section                                    |
| ---------------------------------------- | ------------------------------------------ |
| `directory.evnt.richtext.markdown#0`     | [2.1.1](#211-markdown-rich-text-component) |
| `directory.evnt.component.link#0`        | [2.2](#22-link-component)                  |
| `directory.evnt.component.source#0`      | [2.3](#23-source-component)                |
| `directory.evnt.component.splashMedia#0` | [2.4](#24-splash-media-component)          |
| `directory.evnt.component.languages#0`   | [2.5](#25-languages-component)             |
| `directory.evnt.component.placeId#0`     | [2.6](#26-place-id-component)              |
| `directory.evnt.component.relation#0`    | [2.7](#27-relation-component)              |
| `directory.evnt.component.coordinates#0` | [2.8](#28-coordinates-component)           |

## 2.1. Rich Text Components

Rich text components carry a description in a text format.

An object MAY hold more than one rich text component. Consumers SHOULD display only one of them, picking the format and language that suit them best.

## 2.1.1. Markdown Rich Text Component

```
directory.evnt.richtext.markdown#0
  $type:     "directory.evnt.richtext.markdown#0"  REQUIRED
  content:   string                                REQUIRED
  language:  string?                               OPTIONAL
  flavor:    string?                               OPTIONAL
```

The `content` field is the Markdown text.

The `language` field is a [BCP 47 language tag](https://www.rfc-editor.org/rfc/bcp/bcp47.txt) for the language of `content`. Producers SHOULD set it when the language is known.

The `flavor` field names the Markdown flavor of `content`, such as `"commonmark"` or `"gfm"`. Producers SHOULD set it when the flavor is known.

```json
{
	"$type": "directory.evnt.richtext.markdown#0",
	"content": "Two days of talks and **workshops**.",
	"language": "en",
	"flavor": "commonmark"
}
```

## 2.2. Link Component

A link related to the event, such as its website, ticket sales or a social media page.

```
directory.evnt.component.link#0
  $type:     "directory.evnt.component.link#0"  REQUIRED
  url:       string                             REQUIRED
  name:      Translations?                      OPTIONAL
  disabled:  boolean?                           OPTIONAL
```

The `url` field is the URL of the link.

The `name` field is a label for the link. Consumers MAY show the URL when it is absent.

The `disabled` field, when `true`, means the link is unavailable for now. Consumers SHOULD NOT present a disabled link as usable.

```json
{
	"$type": "directory.evnt.component.link#0",
	"url": "https://example.com/tickets",
	"name": { "en": "Get Tickets" }
}
```

## 2.3. Source Component

Where the event data came from, such as an announcement or a news article.

```
directory.evnt.component.source#0
  $type:  "directory.evnt.component.source#0"  REQUIRED
  url:    string                               REQUIRED
```

The `url` field is the URL of the source.

Producers SHOULD add this component when the event data was taken from an external announcement or publication. It is not needed when the document itself is the primary source.

```json
{
	"$type": "directory.evnt.component.source#0",
	"url": "https://news.example.com/tech-conference-announced"
}
```

## 2.4. Splash Media Component

An image or video that represents the event visually.

```
directory.evnt.component.splashMedia#0
  $type:  "directory.evnt.component.splashMedia#0"  REQUIRED
  media:  Media                                     REQUIRED
  roles:  string[]?                                 OPTIONAL
```

The `media` field is the media itself. See [section 2.4.1 (Media)](#241-media).

The `roles` field lists where the media is meant to be shown. Consumers MAY use media without `roles` in any role. The following values are defined:

| Value        | Meaning                                       |
| ------------ | --------------------------------------------- |
| `background` | Behind the event's content, may be cropped    |
| `poster`     | The event's poster, shown whole               |
| `banner`     | A wide strip across the top of the event page |

Producers MAY use other values. Consumers MUST ignore values they do not recognize.

```json
{
	"$type": "directory.evnt.component.splashMedia#0",
	"media": {
		"sources": [{ "url": "https://example.com/poster.jpg" }],
		"alt": { "en": "Tech Conference 2026 poster" }
	},
	"roles": ["poster"]
}
```

## 2.4.1. Media

An image or video, available from one or more sources.

```
Media
  sources:       MediaSource[]       REQUIRED
  alt:           Translations?       OPTIONAL
  presentation:  MediaPresentation?  OPTIONAL

MediaSource
  url:         string       REQUIRED
  mimeType:    string?      OPTIONAL
  dimensions:  Dimensions?  OPTIONAL

Dimensions
  width:   number  REQUIRED
  height:  number  REQUIRED

MediaPresentation
  blurhash:       string?  OPTIONAL
  dominantColor:  string?  OPTIONAL
```

The `sources` field holds at least one `MediaSource`. All sources of one `Media` MUST show the same content; they differ only in format or resolution.

The `url` field is the URL of the media file.

The `mimeType` field is the MIME type of the file, such as `image/jpeg` or `video/mp4`.

The `dimensions` field is the width and height of the file in pixels.

The `alt` field is alternative text for the media. Producers SHOULD set it.

The `presentation.blurhash` field is a [BlurHash](https://blurha.sh/) string for a blurred placeholder.

The `presentation.dominantColor` field is the dominant color of the media as six-digit hexadecimal RGB with a leading `#`, such as `#1a1a2e`.

## 2.5. Languages Component

The languages the event is held in. This describes the event, not the document: an event held in Lithuanian can be described in English.

```
directory.evnt.component.languages#0
  $type:      "directory.evnt.component.languages#0"  REQUIRED
  languages:  LanguageInfo[]                          REQUIRED

LanguageInfo
  code:  string  REQUIRED
```

The `code` field is a [BCP 47 language tag](https://www.rfc-editor.org/rfc/bcp/bcp47.txt).

```json
{
	"$type": "directory.evnt.component.languages#0",
	"languages": [{ "code": "lt" }, { "code": "en" }]
}
```

## 2.6. Place ID Component

The venue's entry in a map or place service. Place ID components belong in the venue's `components`.

```
directory.evnt.component.placeId#0
  $type:  "directory.evnt.component.placeId#0"  REQUIRED
  type:   string                                REQUIRED
  id:     string                                REQUIRED
```

The `type` field names the service and the kind of entry. The following values are defined:

| Value                        | Service       | Entry           |
| ---------------------------- | ------------- | --------------- |
| `org.openstreetmap.node`     | OpenStreetMap | Node (POI)      |
| `org.openstreetmap.way`      | OpenStreetMap | Way (building)  |
| `org.openstreetmap.relation` | OpenStreetMap | Relation (area) |
| `com.google.places`          | Google Places | Place ID        |
| `com.foursquare`             | Foursquare    | Venue ID        |

The `id` field is the identifier that the service gives the entry.

Producers MAY use other values in reverse domain name notation, built from the service's own domain. Consumers MUST ignore values they do not recognize.

A venue MAY have any number of place ID components, including several of the same `type`.

```json
{
	"$type": "directory.evnt.component.placeId#0",
	"type": "org.openstreetmap.way",
	"id": "123456789"
}
```

## 2.7. Relation Component

A link from the event to another event. Relation components belong in the event's `components`.

```
directory.evnt.component.relation#0
  $type:   "directory.evnt.component.relation#0"  REQUIRED
  type:    string                                 REQUIRED
  target:  string                                 REQUIRED
```

The `target` field is an absolute URI, usually the `id` of the other event.

The `type` field says how the other event relates to this one. The following values are defined:

| Value       | Meaning                                                                                     |
| ----------- | ------------------------------------------------------------------------------------------- |
| `parent`    | This event is part of the other, such as a meetup at a convention or an edition of a series |
| `child`     | The other event is part of this one                                                         |
| `alternate` | The other document describes this same event, such as a listing on another site             |

`alternate` is the same event, not an alternative to it.

Producers MAY use other values in reverse domain name notation, such as `com.example.rivalOf`. Consumers MUST ignore values they do not recognize.

An event MAY have any number of relation components, including several of the same `type`.

A relation is a claim by the publisher of the document that holds it. Either side of a relation can state it.

A consumer that wants more certainty can check whether the target links back: `child` for a `parent`, `parent` for a `child`, and `alternate` for an `alternate`.

`parent` and `child` match `RELTYPE=PARENT` and `RELTYPE=CHILD` on the iCalendar `RELATED-TO` property ([RFC 5545](https://www.rfc-editor.org/rfc/rfc5545) section 3.8.4.5), and the `parent` and `child` relations in JSCalendar's `relatedTo` ([RFC 8984](https://www.rfc-editor.org/rfc/rfc8984) section 4.1.3).

```json
{
	"$type": "directory.evnt.component.relation#0",
	"type": "parent",
	"target": "https://example.com/events/tech-conference"
}
```

## 2.8. Coordinates Component

Where the venue is on a map. Coordinates components belong in the venue's `components`.

```
directory.evnt.component.coordinates#0
  $type:        "directory.evnt.component.coordinates#0"  REQUIRED
  latitude:     number                                    REQUIRED
  longitude:    number                                    REQUIRED
  uncertainty:  number?                                   OPTIONAL
```

The `latitude` and `longitude` fields are WGS 84 coordinates in decimal degrees, the system GPS uses. `latitude` is from -90 to 90 and `longitude` from -180 to 180.

The point SHOULD be where attendees head for, such as the main entrance of a large venue.

The `uncertainty` field is how far the venue may be from the point, in metres, like the `u` parameter of a `geo` URI ([RFC 5870](https://www.rfc-editor.org/rfc/rfc5870)). It MUST be greater than 0. When it is absent, the point is the venue itself. Producers SHOULD set it when the point is approximate, such as the centre of a city where the venue is not known yet. Consumers SHOULD NOT show an approximate point as an exact pin.

A venue MUST NOT have more than one coordinates component.

```json
{
	"$type": "directory.evnt.component.coordinates#0",
	"latitude": 54.8985,
	"longitude": 23.9036,
	"uncertainty": 5000
}
```
