# Why Open Evnt

Most event data formats were designed for specific use cases, not for general purpose event representation. iCalendar (RFC 5545) was built for calendar interoperability: recurrence rules, attendees, free/busy queries. The community lexicon was built for the AT Protocol social graph. Both are good at what they were designed for. Neither is good at representing what an event actually is.

Open Evnt is a file format that focuses on the event itself: what happens, where it happens, and when it happens.

## What makes it different

**Multilingual by default.** Every text field holds translations natively. No naming conventions, no side tables.

**Dates that match real precision.** A festival can be "June 2026". A meetup can be "March 8 at 9 AM London time". Same field, different precision.

**Multiple instances per event.** A three-day conference with different hours each day uses separate instances, each with independent times and venue references.

**Venues decoupled from schedule.** Hybrid events reference both physical and online venues. Rotating meetups reference different venues per instance. Venue and timing are not coupled.

**Extensible without limits.** The component system lets anyone add any field. Ticket links, dietary info, organizer bios -- none require a spec update.

**Converts to and from existing formats.** iCalendar, ActivityStreams, Schema.org, Google Events, Community Lexicon. Your existing tooling does not need to change overnight.

## What this means for developers

**Building a calendar app?** Open Evnt gives you rich event detail that iCalendar cannot represent -- multilingual names, partial dates, hybrid venues, custom metadata. Use it as your internal data model and convert to iCalendar for calendar sync, recurrence, and attendee management. You get the best of both formats.

**Building anything else?** Event discovery platforms, ticketing systems, conference websites, community boards, event APIs -- they all need a data format that matches how events actually work in the real world. Open Evnt is designed for that.

## Why not build your own?

Every team that builds an events system independently discovers the same edge cases. Adding an `events` table to your database takes a few hours. The hidden costs show up later.

| You start with | Then you need | And you discover |
|---|---|---|
| `start_ts TIMESTAMPTZ` | An event announced as "March 2026" | You add a `precision` column. Every query checks it. You have reinvented PartialDate. |
| `name TEXT` | French and German names | You add `name_fr`, `name_de`, then a translations table with joins. You have reinvented the Translations type. |
| `venue VARCHAR` | A hybrid event with physical + online venue | You normalize venues, add a join table, duplicate venue assignment per day. You have reinvented instance-venue decoupling. |
| `metadata JSONB` | Ticket URLs, organizer bios, dietary info | Your team uses different keys. Some collide. None have docs. Open Evnt's component system is this escape hatch, designed from the start with namespace ownership. |
| Nothing | Google Calendar export | You write a one-off iCalendar converter. It has bugs. You maintain it forever. |

Open Evnt is those edge cases, solved and documented. The npm packages (`@evnt/schema`, `@evnt/convert`, `@evnt/partial-date`, `@evnt/pretty`) provide the tooling you would otherwise write from scratch. The spec and rationale pages document the decisions so your next hire does not need to rediscover them.

A team of one can ignore a format and hand-roll their schema. A team of ten inherits every edge case the original developer did not anticipate. Open Evnt is what you get when someone already paid that cost.

## Using the format

Open Evnt is plain JSON. Any file with the correct structure is valid. The canonical JSON Schema is published at the [GitHub repository](https://raw.githubusercontent.com/openevnt/evnt/refs/heads/main/event-data.schema.json) and can be used for validation.

Tooling for validation, conversion, pretty-printing, and scaffolding is available under the `@evnt/*` namespace on npm, but the format has no dependency on any of these packages. 
