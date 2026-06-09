# Components

Every event format eventually faces the same problem: someone needs to add data the spec did not anticipate. A ticket URL. An organizer bio. Dietary information. A track or session label. When the format has no place for this data, developers stuff it into description fields with conventions like `TICKET_URL:...` or `English Below:...` -- **data stuffing**.

Most formats handle this in one of two ways: hardcode every imaginable field (the format grows forever), or provide an unstructured escape hatch (data loses all meaning). Open Evnt does neither.

## How it works

Components are objects with a `$type` string that identifies their schema. The root object contains the universal event structure (version, name, status, label, venues, instances). Everything beyond these built-in fields lives in components with their own namespaced types.

```json
{
  "components": [
    {
      "$type": "directory.evnt.component.link",
      "url": "https://example.com/tickets",
      "name": { "en": "Buy Tickets" }
    }
  ]
}
```

This is a future compatibility guarantee. Adding a ticket link, an organizer field, or dietary information does not require a new version of the spec. It requires a new component type -- defined under a namespace you control.

## Future compatibility

Because component types are namespaced (like AT Protocol or Java package notation), no two organizations can collide. A ticketing platform defines `com.ticketmaster.pricing`. A conference tool defines `com.pretalx.track`. Both coexist in the same event without conflict.

Applications that do not understand a component type must preserve it when editing. This means tools can evolve independently -- an app that does not understand ticket pricing will not delete pricing data when saving an event. This is critical for ecosystem trust and forward compatibility.

## Existing types

| `$type` | Content |
|---------|---------|
| `directory.evnt.component.link` | URL with optional name, opensAt, closesAt |
| `directory.evnt.component.source` | Attribution URL |
| `directory.evnt.component.splashMedia` | Image or video with alt text and roles |
| `app.bsky.richtext` | Rich text with facets (AT Protocol format) |
| `directory.evnt.richtext.markdown` | Markdown content with optional language tag |

Real projects already define custom types:

| `$type` | Used by | Purpose |
|---------|---------|---------|
| `blue.deniz.events.categories` | events-data | Event categorization |
| `blue.deniz.events.pricing` | events-data | Ticket pricing information |
| `blue.deniz.events.organizer` | events-data | Organizer with contacts and avatar |
| `at.markpub.markdown` | events-data | Markdown descriptions |

The format is not opinionated about ticketing, RSVPs, organizers, or any other application-specific concern. Those live in components, not in the core spec. Define your own `$type` under your namespace -- no permission needed.
