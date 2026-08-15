# Open Evnt

Open Evnt is a specification for representing, publishing, discovering social events on the web.

It provides a modern JSON data format for rich event details alongside a lightweight discovery and indexing protocols that allow events to be shared across apps and websites.

Open Evnt addresses three major problems in event management and sharing:

- **Data-stuffing**: Existing event formats force multi-day, hybrid, or complex event schedules into rigid fields. Unstructured details get dumped into description fields where applications can't process them. Open Evnt models events as they actually exist - with support for partial dates, multiple venues or dates, multi-language content, and extensible component blocks that allow for rich, structured event information.
- **Fragmentation**: Without an open standard for rich event data, every website, ticket platform, conference app, and social network uses its own format gated behind proprietary APIs. Event data is siloed and cannot be shared or reused across platforms. Open Evnt creates a single, shared format that can be used for seamless interoperability between applications and services.
- **Discoverability**: Finding and subscribing to structured event feeds today requires custom API integrations or static, unqueryable `.ics` files. Open Evnt provides protocols for publishing and discovering event collections allowing applications to query and filter events across the web in a standardized way.

## The Open Evnt Stack

Open Evnt consists of three complementary specifications:

- [Open Evnt Event](./spec/open-evnt-event.md) - The primary JSON schema for modelling events in high detail.
- [Open Evnt Manifest](./spec/open-evnt-manifest.md) - A well-known domain endpoint for exposing available event collections.
- [Open Evnt Index](./protocol/open-evnt-index.md) - A filterable, paginated index format for querying events.

## An Example Event

```json
{
	"v": "0.1",
	"name": {
		"en": "Summer Workshop Series",
		"fr": "Ateliers d'été",
		"de": "Sommer-Workshop-Reihe"
	},
	"instances": [
		{
			"venueIds": ["venue-park", "venue-stream"],
			"start": "2026-07[Europe/Berlin]"
		}
	],
	"venues": [
		{
			"id": "venue-park",
			"$type": "directory.evnt.venue.physical",
			"name": { "en": "City Park" }
		},
		{
			"id": "venue-stream",
			"$type": "directory.evnt.venue.online",
			"name": { "en": "Livestream" },
			"url": "https://live.example.com/summer-workshops"
		}
	],
	"components": [
		{
			"$type": "directory.evnt.richtext.markdown",
			"content": "An example description!",
			"flavor": "gfm"
		},
		{
			"$type": "directory.evnt.component.link",
			"url": "https://example.com/summer-workshops"
		}
	]
}
```

**Summer Workshop Series**

July 2026, City Park and Livestream

An example description!

Link: example.com/summer-workshops

## Start here

- **Try it** in the [Playground](./playground)
- **Write your first event** with the [Quickstart](./guide/getting-started)
- Read the [Event Specification](./spec/open-evnt-event.md)
- Read the [Manifest Specification](./spec/open-evnt-manifest.md)
- Read the [Index Specification](./protocol/open-evnt-index.md)

## Contributing

Feedback, contributions, and questions are welcome! Join our [Discord](https://deniz.blue/discord-invite?id=1493641727980994710) or [Matrix](https://matrix.to/#/#evnt:catgirl.cloud) to discuss Open Evnt with the community.
