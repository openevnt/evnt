# The Event

An event represented by the Open Evnt format is a single JSON object. The root object has at most seven fields, and each field has a specific purpose. We will explain each field in detail, and also cover what is intentionally _not_ on the root.

## v

The `v` field is the version of the Open Evnt format. It is a string, and the current version is `"0.1"`.

## name

Every event has a name. We define it here.

See [the Translations explainer](./translations.md) for why it's an object and not a string.

## label

The label is a secondary name for the event. Generally, the label does not need to be defined, but it can be useful for a couple scenarios:

1. **Events with long names**

   Some events have long, descriptive names that are not suitable for display in a list. In this case, the `name` field can be used for the short form of the name, and the `label` field can be used for the long form. For example, the `name` might be "FOSDEM" while the `label` might be "Free and Open Source Developers' European Meeting"

   Relevant information: A similar issue exists in [foss.events](https://codeberg.org/foss.events/foss-events-website/wiki#user-content-name)

2. **Events with ambiguous names**

   Some events have names that are ambiguous or could be confused with other events. In this case, the `label` field can be used to provide additional context or clarification. For example, the `name` might be "Tech Conference" while the `label` might be "Birmingham Tech Conference 2026"

Apps should generally display the `label` field under/near the `name` field in smaller text.

## status

Events have a status that describes their planning state. The five allowed values are:

- **planned** - scheduled as described (default)
- **uncertain** - might get rescheduled or cancelled
- **postponed** - moved to a later date, unknown when
- **cancelled** - won't happen, full stop
- **suspended** - paused, might come back

The distinction between uncertain and suspended: uncertain means the event has a date but it might change. Suspended means the event is on hold with no current date. Think of uncertain as "we're still on for now" and suspended as "we've stopped planning for now."

This closed set of values is intentional, otherwise apps would have to guess what a freeform string means. The values are also intentionally about planning, not time. An event in the past can still be "cancelled" (it never happened) or "planned" (it happened as scheduled). There's no "past" status because that's determined by the instance dates, not a status field.

## instances, venues, components

The last three fields are arrays of objects that describe the event in more detail. See the [Instances explainer](./instances.md), [Venues explainer](./venues.md), and [Components explainer](./components.md) for details.

## What's not here?

### No description

There's no description field.

Why? Because descriptions come in different formats. A description might be plain text, markdown, or Bluesky's rich text, or a completely different format. Maybe even a format with embedded media!

We tried to engineer a single description field that could handle all formats, but it was a losing battle. Every new description format would either require a new field, or a new discriminator. And, this approach was not future-proof. You cannot innovate easily by creating a new description format if it's not designed to be extensible.

We realized that we already had a solution for this problem: [components](./components.md). Components are designed to handle different formats, and they can be extended to support new formats as they arise.

Each description format gets its own type and apps display or produce what they support. If someone wants to create a new description format, they can do so without changing the root object. They just need to define a new component type.

### No globally unique event id

Event identity depends on how you serve the data. AT Protocol uses AT URIs. Databases use UUIDs. File systems use paths. An `id` field on the root would either duplicate what the transport already provides or fail to capture every scheme.

If you need cross-system identity, use the transport's identifier. If the transport doesn't have one, add your own [component](./components.md) for it.

### No timestamps

Timestamps are also transport metadata in that regards, not event details. When the file was created or the record was written belongs in the filesystem, the database row, or the API response - not inside the event itself.
