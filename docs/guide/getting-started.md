# Quickstart

Write your first Open Evnt event in five minutes.

We're building a community festival in Brussels.

## 1. Start

An event needs a name and a version marker. That's the minimum.

```json
{
  "v": "0.1",
  "name": {
    "en": "Brussels Community Festival"
  }
}
```

`v` is always `"0.1"`. It tells tools which version of the format to expect.

Congratulations. You have created an event.

## 2. Oh no, Brussels has three languages

The festival is in a mixed neighborhood. Flyers go out in French and Dutch, and the tourist board wants English too. One name just isn't going to cut it.

```json
{
  "v": "0.1",
  "name": {
    "en": "Brussels Community Festival",
    "fr": "Festival Communautaire de Bruxelles",
    "nl": "Brussel Gemeenschapsfestival"
  }
}
```

Every human-readable string in Open Evnt supports multiple languages. Apps pick the right one for each user. You wrote the name once in three languages, not three times in one.

## 3. When is it?

You know it's happening in June 2026, but the exact day isn't locked yet because the park permit hasn't come through and the band's drummer is "checking their schedule." No problem.

```json
{
  "v": "0.1",
  "name": {
    "en": "Brussels Community Festival",
    "fr": "Festival Communautaire de Bruxelles",
    "nl": "Brussel Gemeenschapsfestival"
  },
  "instances": [
    {
      "venueIds": [],
      "start": "2026-06[Europe/Brussels]"
    }
  ]
}
```

A date that only specifies the month. No pretending you know the exact day - you don't, and that's fine. The `[Europe/Brussels]` timezone handles DST automatically so you don't have to.

When the day firms up, change it to `"2026-06-15[Europe/Brussels]"`. When the time firms up, make it `"2026-06-15T09:00[Europe/Brussels]"`. The format grows with your certainty.

## 4. Where?

Parc du Cinquantenaire. Add it as a physical venue and connect it to the instance.

```json
{
  "id": "venue-main",
  "$type": "directory.evnt.venue.physical",
  "name": {
    "en": "Parc du Cinquantenaire",
    "fr": "Parc du Cinquantenaire",
    "nl": "Jubelpark"
  },
  "address": {
    "addr": "Parc du Cinquantenaire, 1000 Bruxelles",
    "countryCode": "BE"
  }
}
```

The `id` links the venue to the instance via `venueIds`.

```json
{
  "instances": [
    {
      "venueIds": ["venue-main"],
      "start": "2026-06[Europe/Brussels]"
    }
  ]
}
```

## 5. Also streaming

Some people can't make it to Brussels (valid excuse). Set up a livestream.

```json
{
  "id": "venue-stream",
  "$type": "directory.evnt.venue.online",
  "name": { "en": "Livestream" },
  "url": "https://live.example.com/bfest-2026"
}
```

Now reference both venues on the instance. In-person people go to the park, remote people watch the stream, everyone's happy.

```json
{
  "instances": [
    {
      "venueIds": ["venue-main", "venue-stream"],
      "start": "2026-06[Europe/Brussels]"
    }
  ]
}
```

In most formats you'd need a text field, a separate online event link, or some custom extension. Here it's just two venue IDs.

## 6. Link to it

Add a link component so people can find the stream, grab tickets, or point and laugh at the website.

```json
{
  "components": [
    {
      "$type": "directory.evnt.component.link",
      "url": "https://live.example.com/bfest-2026",
      "name": { "en": "Watch Live" }
    },
    {
      "$type": "directory.evnt.component.link",
      "url": "https://example.com/tickets",
      "name": { "en": "Get Tickets" }
    }
  ]
}
```

## 7. Add a label

Give it a short subtitle so it looks clean in listings.

```json
"label": {
  "en": "June 2026",
  "fr": "Juin 2026",
  "nl": "Juni 2026"
}
```

Same shape as `name`, but meant for display as a subtitle. Apps can show it smaller or dimmer without having to guess what part of the name is the important bit. Also useful for disambiguation - if this festival happens every year, the label carries the edition while the name stays the same.

## 8. The full event

```json
{
  "v": "0.1",
  "name": {
    "en": "Brussels Community Festival",
    "fr": "Festival Communautaire de Bruxelles",
    "nl": "Brussel Gemeenschapsfestival"
  },
  "label": {
    "en": "June 2026",
    "fr": "Juin 2026",
    "nl": "Juni 2026"
  },
  "venues": [
    {
      "id": "venue-main",
      "$type": "directory.evnt.venue.physical",
      "name": {
        "en": "Parc du Cinquantenaire",
        "fr": "Parc du Cinquantenaire",
        "nl": "Jubelpark"
      },
      "address": {
        "addr": "Parc du Cinquantenaire, 1000 Bruxelles",
        "countryCode": "BE"
      }
    },
    {
      "id": "venue-stream",
      "$type": "directory.evnt.venue.online",
      "name": { "en": "Livestream" },
      "url": "https://live.example.com/bfest-2026"
    }
  ],
  "instances": [
    {
      "venueIds": ["venue-main", "venue-stream"],
      "start": "2026-06[Europe/Brussels]"
    }
  ],
  "components": [
    {
      "$type": "directory.evnt.component.link",
      "url": "https://live.example.com/bfest-2026",
      "name": { "en": "Watch Live" }
    },
    {
      "$type": "directory.evnt.component.link",
      "url": "https://example.com/tickets",
      "name": { "en": "Get Tickets" }
    }
  ]
}
```

Every field here was added for a real reason during the planning process. None of them are decorative. The result: apps can display this event without guessing - the name, the subtitle, the venues, the links, the dates - all in structured fields, so users don't need to read and understand a messy description for key details.

## 9. Publish

Save it as `bfest-2026.evnt.json`. The `.evnt.json` extension tells tools what it is.

Then put it on any static file server, CDN, or AT Protocol repo. Open Evnt is just JSON - anything that serves JSON can serve events.

## 10. Next steps

- **Understand the design** in the [Why guides](/guide/root)
