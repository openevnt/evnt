# <img src="https://github.com/deniz-blue/md-emojis/raw/main/emojis/denizblue/evnt.svg" width="32px" style="vertical-align: middle;" /> Open Evnt

[![](https://shields.io/badge/visit_the-website-blue)](https://evnt.directory)
[![](https://shields.io/badge/read_the-specification-blue)](./docs/README.md)
[![](https://shields.io/badge/join_the-discord-blue)](https://deniz.blue/discord-invite?id=1493641727980994710)
[![](https://shields.io/badge/join_the-matrix-blue)](https://matrix.to/#/#evnt:catgirl.cloud)
[![](https://shields.io/badge/follow_on-bluesky-blue)](https://bsky.app/profile/evnt.directory)

A modern data format for events.

This monorepo contains a lot of things:

__Specification__: The data format specification document, [**can be found here**](./docs/README.md). There's also:

- [JSON Schema](./event-data.schema.json) of the data format
- [Markdown documentation](./docs/SCHEMA.md) which is generated from the JSON Schema
- [AT Protocol Lexicons](./lexicons/)

__Packages__: We publish a few NPM packages to make it easier to work with the data format:

- [@evnt/schema](./packages/schema/): Types and Zod validation
- [@evnt/partial-date](./packages/partial-date/): Helpers for working with partial dates using Temporal API
- [@evnt/translations](./packages/translations/): Helper for working with Translations type
- [@evnt/convert](./packages/convert/): Converters between Open Evnt and other formats (such as iCalendar, Community Lexicon, schema.org, etc.)
- [@evnt/pretty](./packages/pretty/): Opinionated helpers for pretty-printing of event data

__Applications__

- [landing](./apps/landing/): A landing page for the project hosted at https://evnt.directory

__Other Links__

- [Discord](https://deniz.blue/discord-invite?id=1493641727980994710)
- [Matrix](https://matrix.to/#/#evnt:catgirl.cloud)
- [BlueSky](https://bsky.app/profile/evnt.directory)
- [Leaflet](https://evnt.leaflet.pub/); Design decisions:
  - [Scheduling is complex: Why we need Partial Dates](https://evnt.leaflet.pub/3mjeydgshtk2z)
  - [Instances & Venues](https://evnt.leaflet.pub/3mjjufibxx22a)

__Related Projects__

- [eventsl.ink](https://github.com/openevnt/eventslink): Share event links independently of the website or platform it's on
- [Vantage](https://github.com/deniz-blue/vantage): Proof-of-concept calendar application built on top of Open Evnt

## Contributing

### Contributing to the ecosystem

If you want to build an application, a library, or anything else using Open Evnt, that's great! We would love to see what you build and help in any way we can. Join our Discord/Matrix and share your project with us! We can also add it to this README to help others discover it.

### Contributing to the specification

The specification is open for contributions! If you have suggestions for improvements or have ideas or just want provide constructive criticism, feel free to open an issue or a pull request.

When making a pull request, only update `docs/README.md`, `packages/schema` and `lexicons-src`. The JSON Schema and the Markdown documentation will be generated from these files.

### Contributing to the code

This monorepo uses pnpm as the package manager. Run `pnpm install` to install dependencies.

You can run tests using `pnpm test`. We use Vitest for testing.
