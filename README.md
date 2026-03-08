# <img src="https://github.com/deniz-blue/md-emojis/raw/main/emojis/denizblue/evnt.svg" width="32px" /> @evnt

A **standardized**, **open-source** data **format** for representing and sharing event data across different applications.

_Links:_

- [About & Differences from other formats](./docs/ABOUT.md)
- 📱 [Applications](#applications)
- 📅 [ATProto](#atproto)
- 📅 [Event Repositories](#event-repositories)
- 📜 [Data Format Specification](./docs/README.md)
  - [@evnt/schema](./packages/schema/) package
  - [JSON Schema](./event-data.schema.json) _(generated)_
  - [Markdown Documentation](./docs/SCHEMA.md) _(generated)_
  - [ATProto Lexicon](./event-data.lexicon.json) _(generated, also bad)_
- 🔗 [Event Source](./docs/SOURCE.md)
- 🔗 [Application Links Format](./docs/LINKS.md) _eventsl.ink_

## Applications

- [Application Selector](https://eventsl.ink) (eventsl.ink)

| Name                                      | Description     | Plat.                                                                                                                 | Lang.    | Source Code                                                 |
|-------------------------------------------|-----------------|-----------------------------------------------------------------------------------------------------------------------|----------|-------------------------------------------------------------|
| **[Vantage](https://vantage.deniz.blue)** | Example Web App | 🌐                                                                                                                    | TS+React | [./apps/web](./apps/vantage)                                |
| **Event Viewer**                          | Kuylar's WIP    | <img src="https://github.com/deniz-blue/md-emojis/raw/main/emojis/platform/android.svg" align="center" height="24" /> | Kotlin   | [kuylar/EventViewer](https://github.com/kuylar/EventViewer) |

Applications are the different clients that can be used to view and interact with events.

Applications share links to the application selector (eventsl.ink)

Events can be served over **HTTP** or [ATProto](https://atproto.com).

## ATProto

Event data can be served over [ATProto](https://atproto.com) using the `at://` URI scheme. This allows events to be stored as ATProto records, which can be easily shared and discovered within the ATProto ecosystem. We use the `directory.evnt.event` collection for event records, but this is not strictly required. The content of the record should be the `EventData` schema.

## Event Repositories

An easy way to share and distribute event data is through event repositories which use GitHub pages. You can use [this template repository](https://github.com/deniz-blue/events-repo-template) to create your own event repository.

A list of event repositories:
- [deniz-blue/events-data](https://github.com/deniz-blue/events-data): FOSS, tech, other public events.
- [deniz-blue/events-data-scraped](https://github.com/deniz-blue/events-data-scraped): Scraped event data from various sources.

_Open an issue or PR to add your event repository to this list_

## Relevant XKCD

![](https://imgs.xkcd.com/comics/standards.png)

