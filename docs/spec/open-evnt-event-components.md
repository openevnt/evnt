# Open Evnt Event Components

**Version:** 0.1 DRAFT

**Last Updated:** 2026-10-08

[[toc]]

This document outlines the Open Evnt defined components that can be used to describe an event. These components are used in the `components` field of an Open Evnt Event document.

## 1. Introduction

The keywords **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, **SHOULD NOT**, **RECOMMENDED**, **MAY**, and **OPTIONAL** in this document should be interpreted as described in [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119).

How components are carried, how `$type` is chosen, and how consumers treat unknown components is defined in [section 6 (Component Extension Model)](open-evnt-event-rewrite.md#6-component-extension-model) of the Open Evnt specification. The `Translations` and `PartialDate` types used below are defined in its [section 3 (Common Data Types)](open-evnt-event-rewrite.md#3-common-data-types).

A component describes the object whose `components` array holds it: the event, a venue, or an instance.

## 2. Components

| `$type`                                | Section                                    |
| -------------------------------------- | ------------------------------------------ |
| `directory.evnt.richtext.markdown`     | [2.1.1](#211-markdown-rich-text-component) |
| `directory.evnt.component.link`        | [2.2](#22-link-component)                  |
| `directory.evnt.component.source`      | [2.3](#23-source-component)                |
| `directory.evnt.component.splashMedia` | [2.4](#24-splash-media-component)          |
| `directory.evnt.component.languages`   | [2.5](#25-languages-component)             |

## 2.1. Rich Text Components

Rich text components carry a description in a text format.

An object MAY hold more than one rich text component. Consumers SHOULD display only one of them, picking the format and language that suit them best.

## 2.1.1. Markdown Rich Text Component

```
directory.evnt.richtext.markdown
  $type:    "directory.evnt.richtext.markdown"  REQUIRED
  content:  string                              REQUIRED
  language: string?                             OPTIONAL
  flavor:   string?                             OPTIONAL
```

The `content` field is the Markdown text.

The `language` field is a [BCP 47 language tag](https://www.rfc-editor.org/rfc/bcp/bcp47.txt) for the language of `content`. Producers SHOULD set it when the language is known.

The `flavor` field names the Markdown flavor of `content`, such as `"commonmark"` or `"gfm"`. Producers SHOULD set it when the flavor is known.

```json
{
	"$type": "directory.evnt.richtext.markdown",
	"content": "Two days of talks and **workshops**.",
	"language": "en",
	"flavor": "commonmark"
}
```

## 2.2. Link Component

A link related to the event, such as its website, ticket sales or a social media page.

```
directory.evnt.component.link
  $type:     "directory.evnt.component.link"  REQUIRED
  url:       string                           REQUIRED
  name:      Translations?                    OPTIONAL
  disabled:  boolean?                         OPTIONAL
  opensAt:   PartialDate?                     OPTIONAL
  closesAt:  PartialDate?                     OPTIONAL
```

The `url` field is the URL of the link.

The `name` field is a label for the link. Consumers MAY show the URL when it is absent.

The `disabled` field, when `true`, means the link is unavailable for now. Consumers SHOULD NOT present a disabled link as usable.

The `opensAt` and `closesAt` fields give when the link becomes usable and when it stops being usable, such as when ticket sales open and close.

```json
{
	"$type": "directory.evnt.component.link",
	"url": "https://example.com/tickets",
	"name": { "en": "Get Tickets" },
	"opensAt": "2026-05-01T10:00[Europe/Vilnius]"
}
```

## 2.3. Source Component

Where the event data came from, such as an announcement or a news article.

```
directory.evnt.component.source
  $type:  "directory.evnt.component.source"  REQUIRED
  url:    string                             REQUIRED
```

The `url` field is the URL of the source.

Producers SHOULD add this component when the event data was taken from an external announcement or publication. It is not needed when the document itself is the primary source.

```json
{
	"$type": "directory.evnt.component.source",
	"url": "https://news.example.com/tech-conference-announced"
}
```

## 2.4. Splash Media Component

An image or video that represents the event visually.

```
directory.evnt.component.splashMedia
  $type:  "directory.evnt.component.splashMedia"  REQUIRED
  media:  Media                                   REQUIRED
  roles:  string[]                                REQUIRED
```

The `media` field is the media itself. See [section 2.4.1 (Media)](#241-media).

The `roles` field lists where the media is meant to be shown. The following values are defined:

| Value        | Meaning                                       |
| ------------ | --------------------------------------------- |
| `background` | Behind the event's content, may be cropped    |
| `poster`     | The event's poster, shown whole               |
| `banner`     | A wide strip across the top of the event page |

Producers MAY use other values. Consumers MUST ignore values they do not recognize.

```json
{
	"$type": "directory.evnt.component.splashMedia",
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
directory.evnt.component.languages
  $type:      "directory.evnt.component.languages"  REQUIRED
  languages:  LanguageInfo[]                        REQUIRED

LanguageInfo
  code:  string  REQUIRED
```

The `code` field is a [BCP 47 language tag](https://www.rfc-editor.org/rfc/bcp/bcp47.txt).

```json
{
	"$type": "directory.evnt.component.languages",
	"languages": [{ "code": "lt" }, { "code": "en" }]
}
```
