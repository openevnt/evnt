# Translations

In most event formats, internationalization is a convention. An app stores `name_en` and `name_fr` fields, or keeps a separate translation table, or does not support it at all. The format does not help.

Open Evnt makes every user-facing field a Translations object: a map of language codes to strings. This is the type of the field, not an optional add-on. An event with a single English name is valid. An event with twelve translations is equally valid. The format does not distinguish between them.

```json
{
  "name": { "en": "Exhibition Opening", "lt": "Parodos Atidarymas" }
}
```

The resolution algorithm recommended for consumers is:

1. Exact language match
2. Language subtag without region
3. Language subtag only
4. English
5. Any available translation

This is a recommendation, not a requirement. Consumers can implement their own strategy.
