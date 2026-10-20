# Translations Specification

This document defines `Translations`, the type Open Evnt uses for text that can be given in several languages.

## 1. Introduction

The key words **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, **SHOULD NOT**, **RECOMMENDED**, **NOT RECOMMENDED**, **MAY**, and **OPTIONAL** in this document are to be interpreted as described in BCP 14 ([RFC 2119](https://www.rfc-editor.org/rfc/rfc2119), [RFC 8174](https://www.rfc-editor.org/rfc/rfc8174)) when, and only when, they appear in all capitals, as shown here.

## 2. Definition

A `Translations` value is a JSON object with at least one key.

Each key MUST be a valid [BCP 47 language tag](https://www.rfc-editor.org/info/bcp47). Keys SHOULD be written in the canonical case of [RFC 5646](https://www.rfc-editor.org/rfc/rfc5646) section 2.1.1, such as `en`, `zh-Hant` or `pt-BR`. Language tags ignore case, so two keys MUST NOT differ only in case.

Each value is the text in that language, as a string. A value MUST NOT be empty.

The tag `und` is for text whose language is not known. The tag `mul` is for text written in several languages at once, such as one announcement in both Lithuanian and English.

## 3. Choosing a Language

Consumers SHOULD pick the value to show with the Lookup scheme of [RFC 4647](https://www.rfc-editor.org/rfc/rfc4647) section 3.4, matched against the reader's preferred languages, so a reader asking for `lt-LT` gets the `lt` value. When nothing matches, consumers SHOULD show the `mul` value if there is one, then the `und` value, and otherwise MAY show any value.

## Appendix A. Examples

```json
{
	"en": "Hello",
	"es": "Hola",
	"fr": "Bonjour",
	"zh-Hans": "你好",
	"zh-Hant": "你好"
}
```

```json
{
	"und": "Content with undefined/undetermined/unknown language"
}
```
