# Compared to Schema.org

Schema.org Event is a JSON-LD type used by Google, Bing, Yandex, and other search engines for rich results. It is the most widely deployed event format on the web and the only one that major search engines consume natively for search snippets and result enrichment.

## What Schema.org does well

**Search engine reach.** Google displays event snippets with dates, locations, and ticket availability directly in search results. No other event format gives you that distribution channel. Schema.org is also JSON-LD native, so it can be embedded in HTML pages without a separate fetch or external file.

**Broad ecosystem support.** Every major search engine and many content management systems understand Schema.org Event out of the box. Tools for validation, testing (Google's Rich Results Test), and monitoring are mature and well-documented.

**Simplicity for single events.** For a one-time event with a single venue, clear dates, and a ticket link, Schema.org Event is concise and well-understood by developers.

## Where it falls short

- **No native multilingual names.** Schema.org stores names as plain text or as an array of language-tagged values. A simple key-value map like `{"en":"Name","lt":"Vardas"}` is not valid without a custom JSON-LD context.
- **No partial dates.** ISO 8601 only. An event known only as "June 2026" requires either a fabricated date or omission of the field.
- **One start and end per event.** Multiple instances (a conference with different hours each day, a tour with dates in different cities) cannot be represented inside a single Event. Each instance requires a separate Event item with no built-in grouping mechanism.
- **No venue-to-instance decoupling.** Venues are embedded directly inside the Event via a `location` property. A hybrid event with both a physical address and a stream URL requires an array mixing `Place` and `VirtualLocation`, and the same venue cannot be referenced across events without repeating its full definition.
- **No component system.** Custom data uses `additionalProperty`, an untyped key-value escape hatch. There is no namespace mechanism, no type identifier, and no way to enforce structure on extension data.
- **Limited event status vocabulary.** Schema.org provides a fixed set of status values with no vocabulary for planning, tentative, or uncertain states.

## Side by side

```
Schema.org (JSON-LD)                    Open Evnt (JSON)
─────────────────────                   ─────────────────────
name: [{"@language":"en",...}]          name: {"en":"Name","lt":"Vardas"}
startDate: ISO 8601 only                start: partial date (year, month, or day)
endDate: ISO 8601 only                  end: partial date (year, month, or day)
location: single Place or array         venues: [Physical, Virtual, ...]
offers: single PriceSpecification       components: [{"$type":"..."}, ...]
@context: "https://schema.org"          no @context required
eventStatus: fixed enum                 status: custom lifecycle
```

## When to use which

**Use Schema.org Event when your primary goal is search engine visibility.** If you are publishing event data on a public website and want Google or Bing to show rich snippets, Schema.org is the only format that reliably triggers those results. For simple events with a single date, venue, and language, it works well.

**Use Open Evnt for your canonical event data.** Schema.org cannot represent [translations](why/translations), [partial dates](why/partial-date), [multiple instances](why/instances), [decoupled venues](why/venues), or [custom component data](why/components) without workarounds or data loss. Keep your master event records in Open Evnt, convert to Schema.org at the SEO layer.

**A practical workflow:**

1. Author events in Open Evnt.
2. Convert to Schema.org JSON-LD at render time using `@evnt/convert`.
3. Inject the Schema.org markup into your HTML as a `<script type="application/ld+json">` block.

**What you lose in conversion.** Multiple instances collapse to a single date pair. Multilingual names become verbose language-tagged arrays. Secondary venues and virtual locations are dropped. Components have no equivalent and are omitted. Partial dates must be fabricated into full ISO 8601 dates or omitted.

**When to skip Open Evnt.** If your event data is simple (single date, single venue, no multilingual needs, no custom fields) and you only care about search results, writing Schema.org JSON-LD directly is the pragmatic choice.
