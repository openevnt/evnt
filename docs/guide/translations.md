# Why Translations

## The problem

Events happen in the real world, and the real world has more than one language. A conference in Berlin has a German name _and_ an English name. A festival in Montreal needs French, English, maybe Mohawk. A global online conference might have a dozen languages. Who knows?

Every existing format handles this issue by either pretending it doesn't exist or forgetting about it:

```json
{
	"name": "Tech Meetup",
	"description": "English: A meetup about tech.\nLithuanian: Susitikimas apie technologijas."
}
```

Users that create the events have to write two languages into one description field, and the users who are looking at the details have to find the right language in a wall of text. We should be able to fix the "English Below ↓" problem, right?

Some other formats try to solve it by inventing a convention for multiple fields:

```json
{
	"name_en": "Tech Meetup",
	"name_lt": "Tech Susitikimas"
}
```

But this is ad-hoc, non-standard, and doesn't scale. What if you want to add French? Or Spanish? Or a dozen other languages? You end up with a proliferation of fields like `name_fr`, `name_es`, `name_zh-Hans`, etc. It's messy and hard to maintain.

How about an array of objects?

```json
{
	"name": [
		{ "lang": "en", "value": "Tech Meetup" },
		{ "lang": "lt", "value": "Tech Susitikimas" }
	]
}
```

This is better, but it has its own problems. You can have duplicate languages, and it's not as easy to look up a specific language without iterating through the array.

You could, however, instead extract the translations into a separate object:

```json
{
	"name": {
		"en": "Tech Meetup",
		"lt": "Tech Susitikimas"
	}
}
```

Actually, this is exactly what Open Evnt does! The `name` field is a Translations object, which is a flat mapping of [BCP47](https://www.rfc-editor.org/rfc/bcp/bcp47.txt) language tags to strings. This allows for any number of languages without polluting the main object with ad-hoc keys.

It's also easy to look up a specific language:

```ts
event.name[userLanguage] ?? event.name["en"] ?? Object.values(event.name)[0];
```

## Resolution algorithm

When a consumer needs a single string for a user's preferred language, the spec recommends:

1. Exact match against the user's preferred BCP47 tag
2. Match without region subtag (e.g. `zh-Hans-CN` > `zh-Hans`)
3. Match on primary language subtag (e.g. `zh-Hans-CN` > `zh`)
4. Fallback to `en`
5. Any available entry
6. Empty string or placeholder

### Why `en` as the hardcoded fallback?

Pragmatism. The overwhelming majority of events that bother to have machine-readable data also have an English name. Publishing an event with _zero_ English coverage is unusual enough that the fallback ordering before it - exact match > regionless > primary > `en` - catches almost every realistic case.

If your audience primarily speaks Lithuanian and the event has `{ lt: "..." }` but no `en`, step 5 (any available entry) catches it. `en` is the "you really have nothing?" safety net.

## Edge cases

### Two translations for the same language

If you have two texts for the same language but different scripts, you can use the script subtag to distinguish them:

```json
{
	"name": {
		"zh-Hans": "Simplified Chinese",
		"zh-Hant": "Traditional Chinese"
	}
}
```

### Empty strings

The spec requires non-empty strings for all values. An empty string in a translation entry is indistinguishable from "translation not provided" and causes ambiguity in the resolution algorithm.

### Right-to-left languages

BCP47 tags for RTL languages (`ar`, `he`, `fa`) work identically to LTR ones. The consumer is responsible for detecting the script direction from the language tag and rendering accordingly.

### Machine-generated names

If you're collecting event data from an API that returns a single string, wrapping it in a Translations object is straightforward:

```json
{
	"name": { "en": "Event Title" }
}
```

Don't guess the language if you don't know it. `und` (undetermined) is a valid BCP47 tag for this case:

```json
{
	"name": { "und": "Event Title" }
}
```

## What this enables

Because Translations is used for `name`, `label`, link names, venue names, media alt text - basically every human-readable string - an entire event can be fully multilingual:

```json
{
	"name": { "en": "Tech Conf", "lt": "Tech Konferencija" },
	"label": { "en": "Vilnius", "lt": "Vilniuje" },
	"venues": [
		{
			"name": { "en": "Vilnius Convention Centre", "lt": "Vilniaus konferencijų centras" }
		}
	],
	"components": [
		{
			"$type": "directory.evnt.component.link",
			"name": { "en": "Get Tickets", "lt": "Gauti bilietus" }
		}
	]
}
```

One event, one JSON object, full i18n without hacks, conventions, or guesswork.
