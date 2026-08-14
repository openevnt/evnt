# Link Discovery

**Version:** 1: DRAFT

This document outlines how consumers can discover Open Evnt events from HTML documents and HTTP responses.

## 1. Introduction

Servers that host Open Evnt events can provide discovery information using the methods described in this document. Consumers can use this information to locate and retrieve event documents.

## 2. HTML Link Tag

HTML pages that describe or contain events SHOULD include a `<link>` tag with the `rel` attribute set to `alternate` and the `type` attribute set to `application/evnt+json`. The `href` attribute should point to the URL of the event JSON document.

```html
<link rel="alternate" type="application/evnt+json" href="/example.evnt.json" />
```

An HTML page MAY include multiple `<link>` tags to reference multiple events.

## 3. HTTP Link Header

Servers MAY include an HTTP `Link` header in responses to indicate the presence of event documents. The `rel` attribute should be set to `alternate`, and the `type` attribute should be set to `application/evnt+json`. The `href` attribute should point to the URL of the event JSON document.

```
Link: </example.evnt.json>; rel="alternate"; type="application/evnt+json"
```
