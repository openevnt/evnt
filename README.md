# Open Evnt

[![](https://shields.io/badge/visit_the-website-blue)](https://evnt.directory)
[![](https://shields.io/badge/read_the-specification-blue)](./docs/spec/open-evnt-event.md)
[![](https://shields.io/badge/join_the-discord-blue)](https://deniz.blue/discord-invite?id=1493641727980994710)
[![](https://shields.io/badge/join_the-matrix-blue)](https://matrix.to/#/#evnt:catgirl.cloud)
[![](https://shields.io/badge/follow_on-bluesky-blue)](https://bsky.app/profile/evnt.directory)

[Open Evnt](https://evnt.directory) is a data format for representing events.

This repository holds the specification and the website, which is in [./docs](./docs/).

**Libraries**

The JavaScript and TypeScript packages, `@evnt/*` on npm, are in [openevnt/openevnt-js](https://github.com/openevnt/openevnt-js). Other libraries are on the [libraries page](./docs/libraries.md).

**Join the Community**

- [Discord](https://deniz.blue/discord-invite?id=1493641727980994710)
- [Matrix](https://matrix.to/#/#evnt:catgirl.cloud)
- [BlueSky](https://bsky.app/profile/evnt.directory)

**Related Projects**

- [eventsl.ink](https://github.com/openevnt/eventslink): Application picker for events
- [events-data](https://github.com/deniz-blue/events-data): Sample events in Open Evnt format
- [Vantage](https://github.com/deniz-blue/vantage): Calendar application that supports Open Evnt

## Contributing

### Contributing to the ecosystem

If you want to build an application, a library, or anything else using Open Evnt, that's great! We would love to see what you build and help in any way we can. Join our Discord/Matrix and share your project with us! We can also add it to this README to help others discover it.

### Contributing to the specification

The specification is open for contributions! If you have suggestions for improvements or have ideas or just want provide constructive criticism, feel free to open an issue, a pull request or join our Discord/Matrix and discuss it with us.

### Contributing to the code

Library code goes to [openevnt/openevnt-js](https://github.com/openevnt/openevnt-js). The website uses [pnpm](https://pnpm.io/):

- `pnpm install` - install dependencies
- `pnpm fmt` - run oxfmt
- `pnpm lint` - run oxlint
- `pnpm docs:dev` - run docs in development mode
- `pnpm docs:build` - build docs for production
