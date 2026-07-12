# @evnt/dev

General-purpose CLI for [Open Evnt](https://evnt.directory) — validate,
convert, pretty-print, check, and scaffold events.

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
# Validate a file
openevnt validate event.json

# Validate from stdin
curl -s https://example.com/event.json | openevnt validate -

# Pretty-print in Discord format
openevnt show event.json --format discord

# Convert and pipe to jq
openevnt convert event.json --format schema-org | jq .

# Interactive creation
openevnt new --out my-event.json
```

## Features

- **stdin support**: Pass `-` or omit the file arg to read from stdin
- **stdout output**: Convert commands write to stdout by default for piping
- **Color output**: Uses `picocolors` for green/red/yellow indicators
- **Registry-based convert**: Uses `@evnt/convert` format registry internally
