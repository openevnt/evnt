# Event Discovery Protocol

**Version:** 1: DRAFT

Event Discovery is a protocol for discovering and consuming event data from a server. It defines how consumers can discover available event collections and how to access them.

## 1. Introduction

Servers that host Open Evnt events can publish a well-known endpoint that lists available event collections. Consumers can use this endpoint to discover events without needing to know specific URLs.

## 2. Well-known Endpoint

Servers MUST serve the well-known endpoint `/.well-known/event-discovery` with a JSON response in the following format:

```
Manifest
  version:      1               REQUIRED
  collections:  Collection[]    REQUIRED
  auth:         AuthInfo[]?     OPTIONAL
```

The `version` field indicates the version of the returned manifest. Consumers MUST reject manifests with a version they do not understand.

The `collections` field is an array of Collection objects, each describing an available event collection. See [section 3 (Collection)](#3-collection). The array MAY be empty if no collections are available.

The `auth` field is an optional array of AuthInfo objects that provide information about authentication requirements for accessing the collections. See [section 5 (Authentication)](#5-authentication). Servers that do not require any authentication MAY omit this field.

Servers SHOULD respond with `Access-Control-Allow-Origin: *` to allow cross-origin requests from any origin.

## 3. Collection

A Collection object describes an available event collection and how to access it. It has the following shape:

```
Collection
  name:         Translations    REQUIRED
  href:         string          REQUIRED
  type:         string          REQUIRED
  auth:         boolean?        OPTIONAL
```

The `name` field is a Translations object from Open Evnt that provides a human-readable name for the collection.

The `href` field MUST be a URL pointing to the collection's endpoint. If the URL is relative, it MUST be resolved against the domain of the well-known endpoint.

The `type` field indicates the type of the collection. Consumers MUST ignore collections with a type they do not understand. See [section 4 (Collection Types)](#4-collection-types) for a list of known collection types.

The `auth` field is an optional boolean indicating whether authentication is required to access the collection. If omitted, consumers SHOULD assume that authentication is not required.

## 4. Collection Types

The `type` field in a Collection object indicates the type of the collection.

The following collection types are defined:

| Type                   | Description                           |
| ---------------------- | ------------------------------------- |
| `directory.evnt.index` | [Open Evnt Index](open-evnt-index.md) |
| `org.jsonfeed`         | [JSON Feed](https://jsonfeed.org)     |

## 5. Authentication

The manifest may include an `auth` field that provides information about authentication requirements for accessing the collections. The `auth` field is an array of AuthInfo objects.

An AuthInfo object always has a `type` field that indicates the authentication scheme. Consumers MUST ignore AuthInfo objects with a type they do not understand.

## 6. Authentication Types

### 6.1 Open ID Connect

```
AuthInfoOIDC
  type:         "openid-connect" REQUIRED
  issuer:       string           REQUIRED
  scopes:       string[]?        OPTIONAL
```

The `type` field MUST be `"openid-connect"`.

The `issuer` field is the URL of the OpenID Connect issuer. Clients can use this URL to discover the OpenID Connect configuration. (`{issuer}/.well-known/openid-configuration`)

The `scopes` field is an optional array of strings indicating the scopes required for accessing the collections. If omitted, clients SHOULD assume that no specific scopes are required.

## 7. Error Responses

Servers MUST return appropriate HTTP status codes for error conditions. The following status codes are defined:

| Code  | Meaning                          |
| ----- | -------------------------------- |
| `200` | Public access, content returned  |
| `401` | Authentication required          |
| `403` | Authenticated but not authorized |

When returning `401` or `403`, servers SHOULD respond with a JSON error object with a `message` string field describing the error.

Servers SHOULD include a `WWW-Authenticate` header when returning `401` to indicate the required authentication scheme.

## Appendix A: Example Manifest

```json
{
	"version": 1,
	"collections": [
		{
			"name": {
				"en": "All Events"
			},
			"href": "/events/all",
			"type": "directory.evnt.index"
		},
		{
			"name": {
				"en": "My Events"
			},
			"href": "/events/my",
			"type": "directory.evnt.index",
			"auth": true
		}
	],
	"auth": [
		{
			"type": "openid-connect",
			"issuer": "https://auth.example.com",
			"scopes": ["events"]
		}
	]
}
```

## Appendix B: JSON Schema

The JSON schema can be found at https://evnt.directory/well-known.schema.json
