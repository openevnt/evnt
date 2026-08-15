# Link Discovery

**Version:** 1: DRAFT

**Last Updated:** 2026-08-15

This document outlines how consumers can discover Open Evnt events and index documents from HTML documents and HTTP responses.

## 1. Introduction

Servers that host Open Evnt events can provide discovery information using the methods described in this document. Consumers can use this information to locate and retrieve event documents and index endpoints.

## 2. Relations and Types

The following link relations and media types are defined for link discovery:

| Where         | `type` attribute                   | `href` points to                        |
|---------------|------------------------------------|-----------------------------------------|
| Event Page    | `application/evnt+json`            | [Open Evnt](../spec/open-evnt-event.md)           |
| Event Listing | `application/open-evnt-index+json` | [Open Evnt Index](../spec/open-evnt-index.md) |

The `rel` attribute of the `<link>` tag or `Link` header MUST be set to `alternate`.

## 3. Linking

HTML pages that describe or contain events that have an Open Evnt representation SHOULD include a `<link>` tag in the `<head>` section of the page to reference the event document or index endpoint.

HTML pages that act as an event listing or index that have an Open Evnt Index representation SHOULD include a `<link>` tag in the `<head>` section of the page to reference the Open Evnt Index document.

The `rel`, `type` and `href` attributes/parameters of the `<link>` tag or `Link` header MUST be set to the appropriate values as defined in [section 2 (Relations and Types)](#2-relations-and-types).

In other documents, such as Markdown or plain text, servers MAY include a `Link` header in the HTTP response to reference the event document or index endpoint. The `rel`, `type` and `href` parameters of the `Link` header MUST be set to the appropriate values as defined in [section 2 (Relations and Types)](#2-relations-and-types).

Servers MAY include multiple `<link>` tags or `Link` headers to reference multiple event documents or index endpoints. Consumers SHOULD follow all links to discover all available events and indexes.

## Appendix: Examples

```html
<link rel="alternate" type="application/evnt+json" href="/events/summer-fest.evnt.json">
<link rel="alternate" type="application/open-evnt-index+json" href="/events.json">
```

```http
Link: <https://example.com/events/summer-fest.evnt.json>; rel="alternate"; type="application/evnt+json"
Link: <https://example.com/events.json>; rel="alternate"; type="application/open-evnt-index+json"
```
