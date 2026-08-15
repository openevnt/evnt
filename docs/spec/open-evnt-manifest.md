# Open Evnt Manifest

**Version:** 1: DRAFT

**Last Updated:** 2026-08-15

This document defines the Open Evnt Manifest, a JSON document that servers can serve to link to available event collections or other manifests. The manifest provides a structured way for clients to discover and access event data, including information about authentication requirements.

## 1. Manifest Structure

```
Manifest
  version:  1             REQUIRED
  name:     Translations  REQUIRED
  items:    Item[]        REQUIRED

Item
  name:     Translations      REQUIRED
  href:     string            REQUIRED
  type:     string            REQUIRED
  primary:  boolean?          OPTIONAL
  auth:     AuthRequirement?  OPTIONAL

AuthRequirement := "none" | "optional" | "required"
```

The `version` field indicates the version of the returned manifest. Consumers MUST reject manifests with a version they do not understand.

The `name` field is a Translations object from Open Evnt that provides a human-readable name for the manifest.

The `items` field is an array of Item objects, each describing an available event collection or another manifest. See [section 2 (Item)](#2-item). The array MAY be empty if no items are available.

## 2. Item

An Item object describes related event collections or manifests and how to access them. See [section 1 (Manifest Structure)](#1-manifest-structure) for the structure of an Item object.

The `name` field is a Translations object from Open Evnt that provides a human-readable name for the item.

The `href` field MUST be a URL pointing to the item's endpoint or resource. If the URL is relative, it MUST be resolved against the domain of the manifest.

The `type` field indicates the type of the item. See [section 3 (Item Types)](#3-item-types) for a list of known item types.

The `primary` field is an optional boolean indicating whether the item is the primary item in the manifest. If omitted, consumers SHOULD assume that the item is not primary. Consumers SHOULD ignore multiple items marked as primary and treat them as non-primary.

The `auth` field is an optional string enumeration indicating the authentication requirement for accessing the item. The possible values are:

- `"none"`: No authentication is required to access the item.
- `"optional"`: Authentication is optional to access the item. Consumers MAY choose to authenticate, but it is not required. This value indicates that the server MAY provide additional information or functionality to authenticated consumers, but it is not required for basic access.
- `"required"`: Authentication is required to access the item. Consumers MUST authenticate before accessing the item. This value indicates that the server will not provide any information or functionality to unauthenticated consumers.

## 3. Item Types

The `type` field in an Item object indicates the type of the item. The type string is a reverse domain name that identifies the type of the item. Consumers MUST ignore items with a type they do not understand.

This document defines the following item types:

- `directory.evnt.manifest`: An Open Evnt Manifest document as defined in section 1. This allows for nested manifests, where a manifest can link to other manifests.
- `directory.evnt.index`: An Open Evnt Index document as defined in [Open Evnt Index](open-evnt-index.md).
- `org.jsonfeed`: A [JSON Feed](https://jsonfeed.org).
- `text/calendar`: An iCalendar file as defined in [RFC 5545](https://www.rfc-editor.org/rfc/rfc5545.html).

## 4. Item Responses

Servers MUST return appropriate HTTP status codes for item requests. The following status codes are defined:

| Code  | Meaning                          |
|-------|----------------------------------|
| `200` | Public access, content returned  |
| `401` | Authentication required          |
| `403` | Authenticated but not authorized |

When returning `401` or `403`, servers SHOULD respond with a JSON error object with a `message` string field describing the error.

Servers SHOULD include a `WWW-Authenticate` header when returning `401` to indicate the required authentication scheme.

## 5. Well-known Manifest Location

Servers MAY serve an Open Evnt Manifest at the well-known location to allow clients to discover the manifest without prior knowledge of its location. The well-known location defined as:

```
/.well-known/open-evnt/manifest
```

## Appendix A: Example

```json
{
	"version": 1,
	"name": {
		"en": "Cool Events"
	},
	"items": [
		{
			"name": {
				"en": "All Events"
			},
			"href": "/events/all",
			"type": "directory.evnt.index",
			"primary": true
		},
		{
			"name": {
				"en": "My Events"
			},
			"href": "/events/my",
			"type": "directory.evnt.index",
			"auth": "required"
		}
	]
}
```

## Appendix B: JSON Schema

The JSON schema can be found at https://evnt.directory/manifest.schema.json
