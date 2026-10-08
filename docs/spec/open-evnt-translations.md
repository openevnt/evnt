# Translations Specification

This document describes the Translations specification, which is a JSON object that contains translations of a string in multiple languages.

## 1. Introduction

The keywords **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, **SHOULD NOT**, **RECOMMENDED**, **MAY**, and **OPTIONAL** in this document should be interpreted as described in [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119).

## 2. Definition

The Translations data type is a JSON object.

The keys of the JSON object MUST be valid [BCP 47 language tags](https://www.rfc-editor.org/rfc/bcp/bcp47.txt).

The values MUST be strings.

The JSON object MUST contain at least one key-value pair.

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
