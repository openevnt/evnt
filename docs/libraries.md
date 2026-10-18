# Libraries

This page lists the libraries, SDKs, and tools for Open Evnt.

To add an entry to this page, open an issue or a pull request.

## Official TypeScript libraries

The Open Evnt project maintains these libraries. All of them are on npm in the `@evnt` scope, and their source is in [openevnt/openevnt-js](https://github.com/openevnt/openevnt-js).

- [@evnt/types](https://npmx.dev/package/@evnt/types) - TypeScript types for Open Evnt events.
- [@evnt/schema](https://npmx.dev/package/@evnt/schema) - Zod schemas that validate Open Evnt events.
- [@evnt/builder](https://npmx.dev/package/@evnt/builder) - A builder API that constructs events.
- [@evnt/convert](https://npmx.dev/package/@evnt/convert) - Converters between Open Evnt and other event formats.
- [@evnt/partial-date](https://npmx.dev/package/@evnt/partial-date) - Utilities for Open Evnt partial dates.
- [@evnt/translations](https://npmx.dev/package/@evnt/translations) - Utilities for Open Evnt translations.
- [@evnt/pretty](https://npmx.dev/package/@evnt/pretty) - A pretty-printer for Open Evnt events.

## Command line

- [@evnt/dev](https://npmx.dev/package/@evnt/dev) - The `openevnt` command. It validates, shows, and converts event files.

```
openevnt validate my-event.evnt.json
```

## Third-party libraries

This list is empty. To add a library for a different language, open an issue or a pull request.

---

For applications and services, refer to [Applications](./applications.md).
