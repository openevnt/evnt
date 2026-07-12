# @evnt/dev

CLI tools for [Open Evnt](https://evnt.directory) event files.

## Usage

```
openevnt <command> [options]

Commands:
  validate [file]    Validate event file(s) against the OpenEvnt schema
  show [file]        Pretty-print an event (plain, markdown, discord)
  convert [file]     Convert to another format (ical, as2, schema-org)
  build [dir]        Build a static site from event files
  check [file]       Lint event file(s) for common issues
  new                Interactively create a new event file
```

## Examples

```bash
openevnt validate test.evnt.json

curl -s https://example.com/test.evnt.json | openevnt validate -

openevnt show test.evnt.json --format discord

openevnt convert test.evnt.json --format schema-org | jq .

openevnt new --out my-event.evnt.json
```
