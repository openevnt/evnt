🔙 [@evnt Project](../README.md)

# `eventsl.ink` Intents

Applications can use the `eventsl.ink` service to create links that open in compatible applications. This allows users to share events across different platforms while maintaining a consistent experience.

When an event link is opened, the following happens:

1. `eventsl.ink` parses the intent from the URL.
2. If a preferred application is set, forwards the user to that application.
3. If no preferred application is set, shows compatible public applications from [data/instances.json](../data/instances.json).

```mermaid
graph LR
	A([Application A])
	B([Application B])
	C([Application C])
	Redirector(eventsl.ink)

	Redirector -.-> A
	Redirector -.-> B
	Redirector -->|Preferred App| C

	A -->|Share link| Redirector
```

## Link Format

The links are path-based with query parameters for intent parsing. The base URL is `https://eventsl.ink`.

- Show an event: `/event` or `/e`

Search parameters for event links:

- One of the following:
  - `at`: an AT Protocol event record URI
  - `url`: an HTTP URL pointing to a JSON event payload
  - `data`: inline JSON event data

Examples:

- https://eventsl.ink/e?at=at://did:plc:example/community.lexicon.calendar.event/3kxyz
- https://eventsl.ink/event?url=https%3A%2F%2Fdeniz.blue%2Fevents-data%2Fevents%2F2026%2Ffoss%2Ffosdem26.json

