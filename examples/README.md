# Examples

Open Evnt documents to test validators and libraries against.

A validator should accept every file in [`valid/`](./valid/) and reject every file in [`invalid/`](./invalid/). Each invalid file has one thing wrong, and its name says what.

A few invalid files break rules the JSON Schema cannot check, so they pass it. See [Appendix B](../docs/spec/open-evnt-event.md#appendix-b-json-schema). `pnpm test` checks the rest against the schema.
