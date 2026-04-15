# Changelog

## `"0.1"`

__**2026-04-15**__

- `PhysicalVenue.coordinates` was removed.

__**2026-04-10**__

- `EventComponent` is no longer in the shape of `{ type, data }`; it is now a flat object with a `$type` field to indicate the component type and the rest of the fields are specific to that component type.
- Event components have been renamed to have a `directory.evnt.component` prefix:
  - `link` -> `directory.evnt.component.link`
  - `source` -> `directory.evnt.component.source`
  - `splashMedia` -> `directory.evnt.component.splashMedia`
- Venue `type` field is now `$type`, and its values have been updated:
  - `online` -> `directory.evnt.venue.online`
  - `physical` -> `directory.evnt.venue.physical`
  - `unknown` -> `directory.evnt.venue.unknown`
- The `v` field on events is now a string instead of a number. This is to allow for more flexible versioning in the future.
- `PartialDate` format has been updated to have an IANA Timezone identifier wrapped in square brackets at the end of the string to indicate the timezone.
- `LinkComponent.description`, `EventData.description` are removed.

## `0`

__**2026-03-06**__

`Venue` common shared property names changed:

- `venueId` -> `id`
- `venueType` -> `type`
- `venueName` -> `name`
