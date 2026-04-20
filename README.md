# <img src="https://github.com/deniz-blue/md-emojis/raw/main/emojis/denizblue/evnt.svg" width="32px" /> Open Evnt

[![](https://shields.io/badge/join_the-discord-blue)](https://deniz.blue/discord-invite?id=1493641727980994710)

A modern data format for events.

This monorepo contains a lot of things:

__Specification__: The data format specification document, [**can be found here**](./docs/README.md). There's also:

- [JSON Schema](./event-data.schema.json) of the data format
- [Markdown documentation](./docs/SCHEMA.md) which is generated from the JSON Schema
- [AT Protocol Lexicons](./lexicons/)

__Packages__: We publish a few packages to make it easier to work with the data format:

- [@evnt/schema](./packages/schema/): Types and Zod validation
- [@evnt/partial-date](./packages/partial-date/): Helpers for working with partial dates using Temporal API
- [@evnt/translations](./packages/translations/): Helper for working with Translations type
- [@evnt/convert](./packages/convert/): Converters between Open Evnt and other formats (such as iCalendar, Community Lexicon, schema.org, etc.)
- [@evnt/pretty](./packages/pretty/): Opinionated helpers for pretty-printing of event data

__Applications__

- [landing](./apps/landing/): A landing page for the project hosted at https://evnt.directory

__Related Projects__: Not on this repository;

- [eventsl.ink](https://github.com/openevnt/eventslink): Share event links independently of the website or platform it's on
- [Vantage](https://github.com/deniz-blue/vantage): Proof-of-concept calendar application built on top of Open Evnt

## Contributing

### Contributing to the specification

The specification is open for contributions! If you have suggestions for improvements or want to add something, feel free to open an issue or a pull request.

When making a pull request, only update `docs/README.md`, `packages/schema` and `lexicons-src`. The JSON Schema and the Markdown documentation will be generated from these files.

### Contributing to the code

This monorepo uses pnpm as the package manager. Run `pnpm install` to install dependencies.

You can run tests using `pnpm test`. We use Vitest for testing.
