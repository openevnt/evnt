# Event Data Schema

## EventData

An event

_Object containing the following properties:_

| Property        | Description                           | Type                                               |
| :-------------- | :------------------------------------ | :------------------------------------------------- |
| **`v`** (\*)    | The version of the Event Data schema  | `0`                                                |
| `id`            |                                       | `string`                                           |
| **`name`** (\*) | The name of the event                 | [Translations](#translations)                      |
| `label`         | !unstable(#9)                         | [Translations](#translations)                      |
| `description`   | A short description of the event      | [Translations](#translations)                      |
| `status`        | The status of the event               | [EventStatus](#eventstatus)                        |
| `venues`        | The venues associated with this event | _Array of [Venue](#venue) items_                   |
| `instances`     | The instances of the event            | _Array of [EventInstance](#eventinstance) items_   |
| `components`    | Additional components of the event    | _Array of [EventComponent](#eventcomponent) items_ |

_(\*) Required._

## Address

_Object containing the following properties:_

| Property      | Description                                    | Type     |
| :------------ | :--------------------------------------------- | :------- |
| `countryCode` | The ISO 3166-1 alpha-2 country code            | `string` |
| `postalCode`  | The postal code of the address, if any         | `string` |
| `addr`        | Full address excluding country and postal code | `string` |

_All properties are optional._

## EventComponent

_Object containing the following properties:_

| Property        | Type                      |
| :-------------- | :------------------------ |
| **`type`** (\*) | `string`                  |
| **`data`** (\*) | `Record<string, unknown>` |

_(\*) Required._

## EventInstance

A part of an event that can occur at a known or unknown date and/or time and a known or unknown place or places.

_Object containing the following properties:_

| Property            | Description                                                 | Type                        |
| :------------------ | :---------------------------------------------------------- | :-------------------------- |
| `id`                |                                                             | `string`                    |
| **`venueIds`** (\*) | The IDs of the venues where this event instance takes place | `Array<string>`             |
| `start`             | The start date and/or time                                  | [PartialDate](#partialdate) |
| `end`               | The end date and/or time                                    | [PartialDate](#partialdate) |
| `status`            | The status of the event instance                            | [EventStatus](#eventstatus) |

_(\*) Required._

## EventStatus

_Union of the following possible types:_

- `'planned'`
- `'uncertain'`
- `'postponed'`
- `'cancelled'`
- `'suspended'`

## LanguageKey

BCP37 or ISO 639-1 language code

_String._

## LatLng

_Object containing the following properties:_

| Property       | Type     |
| :------------- | :------- |
| **`lat`** (\*) | `number` |
| **`lng`** (\*) | `number` |

_(\*) Required._

## LinkComponent

_Object containing the following properties:_

| Property       | Description                                         | Type                          |
| :------------- | :-------------------------------------------------- | :---------------------------- |
| **`url`** (\*) | The URL of the link                                 | `string`                      |
| `name`         | The name of the link                                | [Translations](#translations) |
| `description`  | A description of the link                           | [Translations](#translations) |
| `disabled`     | Whether the link is disabled                        | `boolean`                     |
| `opensAt`      | The date and/or time when the link becomes active   | [PartialDate](#partialdate)   |
| `closesAt`     | The date and/or time when the link becomes inactive | [PartialDate](#partialdate)   |

_(\*) Required._

## MediaDimensions

The dimensions of a media item

_Object containing the following properties:_

| Property          | Description                       | Type                 |
| :---------------- | :-------------------------------- | :------------------- |
| **`width`** (\*)  | The width of the media in pixels  | `number` (_int, ≥0_) |
| **`height`** (\*) | The height of the media in pixels | `number` (_int, ≥0_) |

_(\*) Required._

## MediaPresentation

The presentation details of a media item

_Object containing the following properties:_

| Property        | Description                                                                        | Type     |
| :-------------- | :--------------------------------------------------------------------------------- | :------- |
| `blurhash`      |  A BlurHash representation of the media item                                       | `string` |
| `dominantColor` | The dominant color of the media item in hex rgb format (must start with a hashtag) | `string` |

_All properties are optional._

## Media

A media item, such as an image or video

_Object containing the following properties:_

| Property           | Description                                | Type                                                    |
| :----------------- | :----------------------------------------- | :------------------------------------------------------ |
| **`sources`** (\*) | The sources for the media item             | _Array of at least 1 [MediaSource](#mediasource) items_ |
| `alt`              | Alternative text for the media item        | [Translations](#translations)                           |
| `presentation`     | The presentation details of the media item | [MediaPresentation](#mediapresentation)                 |

_(\*) Required._

## MediaSource

A source for a media item.

_Object containing the following properties:_

| Property       | Description                           | Type                                |
| :------------- | :------------------------------------ | :---------------------------------- |
| **`url`** (\*) | The URL of the media source           | `string` (_url_)                    |
| `dimensions`   | The dimensions of the media in pixels | [MediaDimensions](#mediadimensions) |
| `mimeType`     | The MIME type of the media            | `string`                            |

_(\*) Required._

## OnlineVenue

_Object containing the following properties:_

| Property        | Description                                   | Type                          |
| :-------------- | :-------------------------------------------- | :---------------------------- |
| **`type`** (\*) |                                               | `'online'`                    |
| **`id`** (\*)   | ID of the venue to be used in Event Instances | `string`                      |
| **`name`** (\*) | The name of the venue                         | [Translations](#translations) |
| `url`           |                                               | `string`                      |

_(\*) Required._

## PartialDate

An ISO 8601 date and time string that may be incomplete (e.g. '2023', '2023-05') and does not include timezone information (forced UTC)

_String._

## PhysicalVenue

A venue with a known or unknown physical location

_Object containing the following properties:_

| Property            | Description                                   | Type                          |
| :------------------ | :-------------------------------------------- | :---------------------------- |
| **`type`** (\*)     |                                               | `'physical'`                  |
| **`id`** (\*)       | ID of the venue to be used in Event Instances | `string`                      |
| **`name`** (\*)     | The name of the venue                         | [Translations](#translations) |
| `address`           |                                               | [Address](#address)           |
| `coordinates`       | Approximate coordinates                       | [LatLng](#latlng)             |
| `googleMapsPlaceId` |                                               | `string`                      |

_(\*) Required._

## SourceComponent

A source of information about the event, such as a news article, a social media post, an official announcement etc.

_Object containing the following properties:_

| Property       | Description           | Type     |
| :------------- | :-------------------- | :------- |
| **`url`** (\*) | The URL of the source | `string` |

_(\*) Required._

## SplashMediaComponent

_Object containing the following properties:_

| Property         | Description                             | Type                                                 |
| :--------------- | :-------------------------------------- | :--------------------------------------------------- |
| **`roles`** (\*) |                                         | _Array of [SplashMediaRole](#splashmediarole) items_ |
| **`media`** (\*) | A media item, such as an image or video | [Media](#media)                                      |

_(\*) Required._

## SplashMediaRole

_String._

## Translations

A multilingual string

_Object record with dynamic keys:_

- _keys of type_ [LanguageKey](#languagekey)
- _values of type_ `string` (_optional_)

## UnknownEventComponent

_Object containing the following properties:_

| Property        | Type                      |
| :-------------- | :------------------------ |
| **`type`** (\*) | `string`                  |
| **`data`** (\*) | `Record<string, unknown>` |

_(\*) Required._

## Venue

_Union of the following possible types:_

- [PhysicalVenue](#physicalvenue)
- [OnlineVenue](#onlinevenue)
- _Object with properties:_<ul><li>**`type`** (\*): `'unknown'`</li><li>**`id`** (\*): `string` - ID of the venue to be used in Event Instances</li><li>**`name`** (\*): [Translations](#translations) - The name of the venue</li></ul>

## VenueType

_Enum, one of the following possible values:_

- `'physical'`
- `'online'`
- `'unknown'`
