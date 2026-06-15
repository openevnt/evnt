# Why Translations

A single name field doesn't work for events.

## The problem

Events happen in the real world, and the real world has more than one language. A conference in Berlin has a German name *and* an English name. A festival in Montreal needs French, English, maybe Mohawk. A global online conference might have a dozen languages.

Every existing format handles this by pretending it doesn't exist.

```json
{
  "name": "Tech Meetup",
  "description": "A meetup about tech. In Lithuanian: Susitikimas apie technologijas."
}
```
You stuff everything into one field. Structured data becomes unstructured prose. It works, but it's ugly - everyone has seen "English Below ↓" crammed into the end of a localized string.

The workaround is always the same: invent a convention (`name:en`, `name:lt`, a parallel `_translations` field), document it nowhere, and hope consumers guess correctly.

## The approach

Open Evnt uses a flat object mapping [BCP47](https://www.rfc-editor.org/rfc/bcp/bcp47.txt) language tags to strings.

```json
{
  "name": {
    "en": "Tech Meetup",
    "lt": "Tech Susitikimas"
  }
}
```

That's it. A language tag, a string. No nesting, no arrays of `{ lang, value }` pairs, no special metadata per translation.

### Why a flat object?

Three alternatives were considered:

| Approach | Problem |
|----------|---------|
| Separate fields (`name_en`, `name_lt`) | Pollutes the object with ad-hoc keys, no standard naming convention. |
| Array of `{ lang, value }` | Allows duplicate languages (which one wins?). No natural lookup. JSON-LD already uses objects for this. |
| **Flat object `{ en: "...", lt: "..." }`** | Simple, natural lookup, BCP47 validation is straightforward, mirrors existing web conventions. |

The object form also maps directly to how you'd use it in code:

```ts
event.name[userLanguage] ?? event.name["en"] ?? Object.values(event.name)[0]
```

### Why BCP47?

BCP47 is the established standard for language tags. It handles:

- **Language only**: `en`, `lt`, `zh`
- **With region**: `en-US`, `zh-CN`, `zh-TW`
- **With script**: `zh-Hans`, `zh-Hant`
- **Both**: `zh-Hans-CN`

This covers every realistic multilingual event scenario. The spec doesn't mandate canonicalization (e.g. `EN` vs `en`), but consumers SHOULD handle case-insensitive matching per BCP47.

## Resolution algorithm

When a consumer needs a single string for a user's preferred language, the spec recommends:

1. Exact match against the user's preferred BCP47 tag
2. Match without region subtag (e.g. `zh-Hans-CN` > `zh-Hans`)
3. Match on primary language subtag (e.g. `zh-Hans-CN` > `zh`)
4. Fallback to `en`
5. Any available entry
6. Empty string or placeholder

### Why `en` as the hardcoded fallback?

Pragmatism. The overwhelming majority of events that bother to have machine-readable data also have an English name. Publishing an event with *zero* English coverage is unusual enough that the fallback ordering before it - exact match > regionless > primary > `en` - catches almost every realistic case.

If your audience primarily speaks Lithuanian and the event has `{ lt: "..." }` but no `en`, step 5 (any available entry) catches it. `en` is the "you really have nothing?" safety net.

### Why RECOMMENDED and not REQUIRED?

Different consumers have different needs. A global event directory might want a more aggressive fallback chain. A local Lithuanian-only app might skip step 3 entirely and go straight to step 5 after checking `lt`. Mandating a single algorithm would force suboptimal UX on some consumers.

The algorithm is a *good default*. Deviating from it is fine as long as the result is at least as good for the user.

## Edge cases

### Two translations for the same language

BCP47 keys are unique by construction - you can't have `{ en: "...", en: "..." }` in JSON because duplicate keys are undefined behavior. If you need two English variants (e.g. US vs UK spelling), use region tags: `en-US` and `en-GB`.

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
