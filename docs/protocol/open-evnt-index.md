# Open Evnt Index

**Version:** 1: DRAFT

The Open Evnt Index is a HTTP and JSON-based protocol for querying a collection of events.

## 1. Introduction

An Open Evnt Index is an HTTP endpoint that responds with a JSON document. The JSON document contains an array of items. Each item includes the URL to the event.

The index MAY support filtering and pagination.

## 2. Request & Response

The index is queried via HTTP GET requests. The request MAY include query parameters for filtering and pagination. See [section 4 (Filtering)](#4-filtering) and [section 5 (Pagination)](#5-pagination) for details.

The response is a JSON document with the following shape:

```
Index
  version:  1               REQUIRED
  items:    IndexItem[]     REQUIRED
  supports: string[]?       OPTIONAL
  updated:  string?         OPTIONAL
  next:     string?         OPTIONAL
  total:    number?         OPTIONAL
```

`version` is the format version. MUST be `1`. Consumers MUST reject responses with an unknown `version`.

`items` is an array of index items. MAY be empty. See [section 3 (IndexItem)](#3-indexitem).

Pages MUST use stable ordering. The order of items in the response MUST NOT change between pages, unless the underlying data has changed. Consumers SHOULD handle items appearing in multiple pages by deduplicating them based on their `href` field.

The `next` field is the URL for the next page of results. Servers MAY omit this field when there are no more pages or pagination is not supported. See [section 5 (Pagination)](#5-pagination). Consumers SHOULD follow `next` links to fetch additional pages of results.

The `total` field indicates the total number of matching events. Consumers MAY use this to display the total number of results. Servers MAY omit this for performance or privacy reasons.

`supports` is an array of strings indicating the features supported by the index. See [section 4 (Filtering)](#4-filtering). Absent or empty means the index supports no filtering.

`updated` is an ISO 8601 datetime of when the index was last updated. Servers MAY omit this field.


## 3. IndexItem

The index contains an array of items. Each item has the following shape:

```
IndexItem
  href:     string          REQUIRED
  name:     Translations?   OPTIONAL
  summary:  string?         OPTIONAL
```

Each item MUST include the `href` field, which is the URL of the event, relative to the index's origin. The `href` field MUST point to a valid Open Evnt event JSON document.

An item MAY include the `name` field, which is the same as the `name` field in the event. Consumers MAY use this for list display without fetching the full event.

An item MAY also include the `summary` field, which is a short human-readable description of the event. Consumers MAY use this for list display without fetching the full event. Servers MAY generate the summary from the event's instances and venues.

Consumers SHOULD NOT assume that the `name` and `summary` fields are always present. When absent, consumers MAY fetch the event to get the name and summary.

Consumers MUST treat the Open Evnt event as the source of truth.

Servers MAY omit the `name` and `summary` fields for performance or privacy reasons.

## 4. Filtering

The `supports` array defines which query parameters the index supports. Each entry is a string matching a query parameter name. Each entry MUST be unique. The order of entries is not significant.

Array entries MUST be one of the following: `search`, `after`, `before`, `limit`.

`search` indicates that the index supports a `search` query parameter for full-text search. Servers MAY implement specialized search behavior, such as searching only certain fields or supporting advanced query syntax. Consumers SHOULD NOT assume that the `search` parameter behaves the same across different indexes.

`before` and `after` indicate that the index supports filtering events by their start or end times. The values of these parameters MUST be ISO 8601 datetimes.

Servers that support `before` and `after` query parameters MUST handle the special `"now"` value, which MUST be interpreted as the current time.

`limit` indicates the client's preferred maximum number of items to return in the response. Servers MAY ignore this parameter or enforce a maximum limit.

Servers that support more than one filtering parameter MUST apply filtering using a logical AND.

## 5. Pagination

The index MAY support pagination. If it does, the response includes a `next` field with a URL for the next page of results.

The `next` field when present MUST point to a valid index document.

---

## Appendix A: Examples

Example request for events after June 1, 2026, with a search term "conference" and a limit of 10 results:

```http
GET /events.json?after=2026-06-01T00:00:00Z&search=conference&limit=10
```

Example response:

```json
{
	"version": 1,
	"supports": ["after", "before", "search", "limit"],
	"updated": "2026-07-15T10:30:00Z",
	"items": [
		{
			"href": "/events/summer-fest.evnt.json",
			"name": { "en": "Summer Festival" },
			"summary": "July 2026, City Park"
		},
		{
			"href": "/events/winter-gala.evnt.json",
			"name": { "en": "Winter Gala" },
			"summary": "December 2026, Grand Hall"
		}
	],
	"next": "/events.json?cursor=eyJpZCI6Mn0",
	"total": 47
}
```

## Appendix B: JSON Schema

The JSON schema can be found at https://evnt.directory/openevnt-index.schema.json
