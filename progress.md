# Progress

## Status
Completed — Technical Writer documentation review delivered

## Tasks
- [x] Read all .md files under docs/ (index, README, ABOUT, CHANGELOG, playground, 4 formats, 2 protocols, 6 why pages, 2 packages pages)
- [x] Audit for confusing sentences, inconsistent terminology, missing cross-references, poor examples, tone shifts
- [x] Verify internal anchors and cross-links
- [x] Produce Technical Writer review with specific line-level findings

## Files Changed
- progress.md (this file — review-only session, no code edits)

## Notes

### Technical Writer Review — OpenEvnt Documentation

**Scope reviewed**: All 19 markdown files under `docs/`, plus the root `README.md`.

---

#### 🚨 Broken Links (must fix)

| Location | Issue |
|----------|-------|
| `docs/README.md` line 280, 330 | References `./SCHEMA.md#physicalvenue` and `./SCHEMA.md#onlinevenue` — file `SCHEMA.md` does not exist anywhere in the repo |
| `docs/README.md` lines 428-431 | "Defined Component Types" inline list has **4 broken anchors**: `#linkcomponent`, `#sourcecomponent`, `#splashmediacomponent` do not match any heading (auto-generated anchors are `#directoryevntcomponentlink`, etc.). `#appbskyrichtext` is the wrong target for `directory.evnt.richtext.markdown`. The TOC entries (lines 31-34) are correct — someone fixed the TOC but not the inline list. |
| `README.md` (root) | Links to `./docs/full-spec.md` — file does not exist. Points to a dead page. |

---

#### 🐛 Spec-Level Inconsistencies

1. **Missing `status` on `EventData`** — `docs/README.md` lines 238-243 list EventData's optional fields but omit `status`. However, the `EventStatus` section says it defines "the possible schedule/planning state of an event instance **or the whole event**." And `docs/why/instances.md` shows an example with `"status": "planned"` at the root level. The spec should either add `status` to EventData's optional fields or correct the EventStatus description.

2. **Duplicate packages pages** — `docs/packages/index.md` and `docs/packages/packages.md` are nearly identical. The first includes `npm install` commands in the table; the second omits them. Both serve the same purpose on the website, creating confusion and maintenance burden.

3. **Instance vs. multi-day ambiguity** — `docs/README.md` lines 371-373 says multiple occurrences (e.g., conference days) should be separate `EventInstance`s, but a festival spanning multiple days should be a single instance. The criterion (continuous vs. discrete) is not stated explicitly, which will confuse readers.

---

#### 🔗 Anchor & Cross-Reference Issues

4. **Defined Component Types list is incomplete** — The inline list at `docs/README.md` line 426-431 omits `app.bsky.richtext` entirely, even though it has its own subsection in the spec and is listed in the TOC.

5. **No cross-reference from formats pages back to why/ pages** — The format comparison pages (`docs/formats/*.md`) do not link to the deeper rationale pages (`docs/why/instances.md`, `docs/why/partial-date.md`, etc.) where the problems are explained in detail. A reader arriving at the comparison pages has no path to the rationale.

---

#### ✏️ Grammar & Wording

6. **`docs/README.md` line 245** — "(`Venue` has a `id` field)" should be "(`Venue` has an **`id`** field)"

7. **`docs/README.md` PartialDate section** — "**must not** include **an** UTC offset" → should be "**a** UTC offset" (phonetically "you-tee-see" starts with a consonant sound)

8. **`docs/README.md` line 386** — "must be same or lower than" → should be "must be the **same as** or lower than"

9. **`docs/index.md` line 43** — "These formats **can not** represent" → "These formats **cannot** represent" (one word)

10. **`docs/README.md` lines 386-387** — "e.g. if `start` defines a date, `end` cannot define a specific time" — "defines" is used twice but the second clause lacks the preposition "a": "cannot define **a** specific time" or "cannot specify a time". The existing wording is OK but reads slightly off.

---

#### 🎯 Tone & Clarity

11. **`docs/why/partial-date.md`** — "The timezone bracket is required in the syntax, but for year-only precision `[UTC]` is a reasonable choice that does not imply the event is UTC -- it simply means the timezone is not relevant at that precision." This is self-contradictory: putting `[UTC]` but saying "it's not UTC." Suggest: "Use `[UTC]` as a conventional placeholder when timezone is not meaningful at the given precision."

12. **`docs/README.md` lines 35-38 (data consumers/producers lists)** — The lists use semicolons after "Data consumers;" and "Data producers;" instead of colons. This is inconsistent with standard Markdown list introductions. Should be colons.

13. **`docs/README.md` lines 432-435 (Components section)** — "Data consumers and providers;" uses a semicolon followed by dash-and-bullet items. Same inconsistency.

14. **`docs/why/index.md` — "Why not build your own?" table** — "None have docs" is informal. "None have documentation" matches the surrounding professional tone.

15. **`docs/README.md` PartialDate invalid examples** — The error for `2025T11:00[Europe/London]` reads "year cannot be provided without a month and day." But the year IS provided (2025). The actual error is that a time component cannot be provided without a day. The message is misleading.

---

#### 🔤 Naming Inconsistency

16. **"Open Evnt" vs. "OpenEvnt"** — The project name appears both ways across the docs. `docs/index.md` uses "Open Evnt" in the title but "OpenEvnt" in the comparison table column header and in the text "These formats can not represent what OpenEvnt can." `docs/why/index.md` uses "Open Evnt" in prose but "OpenEvnt" in "OpenEvnt's component system." The `docs/README.md` spec title uses "Open Evnt." Choose one form and apply it consistently. (Recommendation: "Open Evnt" for the proper name, "OpenEvnt" only as a compound adjective or in code identifiers if desired.)

---

#### ✅ What Works Well

- The "data stuffing" problem framing is compelling and consistent across all pages
- The "Side by side" comparison tables in formats/ are clear, scannable, and effective
- The "Why not build your own?" table in `why/index.md` is one of the best pieces of technical writing in the docs
- The RFC 2119 keyword statement (lowercase for readability) is a thoughtful touch
- Inline code examples are consistent with actual TypeScript syntax and use real-looking data
- The tone across pages is appropriately varied (spec = formal, why = conversational, formats = analytical) — this variation serves the content well, not a problem
- CHANGELOG entries are well-structured and specific
