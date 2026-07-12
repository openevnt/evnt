import { expect, describe, test } from "vitest";
import { TranslationsUtil, LanguageCodeUtil } from "../src/index";

describe("TranslationsUtil", () => {
	const sample = { en: "Hello", fr: "Bonjour", de: "Hallo" };

	test("values returns all non-empty values", () => {
		expect(TranslationsUtil.values(sample)).toEqual(["Hello", "Bonjour", "Hallo"]);
	});

	test("values filters empty strings", () => {
		expect(TranslationsUtil.values({ en: "Hello", fr: "" })).toEqual(["Hello"]);
	});

	test("languages returns keys with values", () => {
		expect(TranslationsUtil.languages(sample)).toEqual(["en", "fr", "de"]);
	});

	test("languages skips empty values", () => {
		expect(TranslationsUtil.languages({ en: "Hello", fr: "" })).toEqual(["en"]);
	});

	test("normalize removes empty and whitespace-only entries", () => {
		expect(TranslationsUtil.normalize({ en: "Hello", fr: "", de: "  " })).toEqual({ en: "Hello" });
	});

	test("add creates a new object without mutating the original", () => {
		const original = { en: "Hello" };
		const result = TranslationsUtil.add(original, "fr", "Bonjour");
		expect(result).toEqual({ en: "Hello", fr: "Bonjour" });
		expect(original).toEqual({ en: "Hello" });
	});

	test("translate picks first matching preferred language", () => {
		expect(TranslationsUtil.translate(sample, ["fr", "en"])).toBe("Bonjour");
	});

	test("translate falls back to next preferred language", () => {
		expect(TranslationsUtil.translate(sample, ["es", "fr"])).toBe("Bonjour");
	});

	test("translate returns empty string for undefined/empty", () => {
		expect(TranslationsUtil.translate(undefined)).toBe("");
		expect(TranslationsUtil.translate({})).toBe("");
	});

	test("translate falls back to any available value", () => {
		expect(TranslationsUtil.translate(sample, ["es"])).toBe("Hello");
	});

	test("isEmpty returns true for undefined/null/empty", () => {
		expect(TranslationsUtil.isEmpty(undefined)).toBe(true);
		expect(TranslationsUtil.isEmpty(null)).toBe(true);
		expect(TranslationsUtil.isEmpty({})).toBe(true);
	});

	test("isEmpty returns false for non-empty", () => {
		expect(TranslationsUtil.isEmpty({ en: "Hello" })).toBe(false);
	});

	test("merge combines multiple translations (last wins for same key)", () => {
		const result = TranslationsUtil.merge({ en: "Hello" }, { fr: "Bonjour" }, { en: "Hi" });
		expect(result).toEqual({ en: "Hi", fr: "Bonjour" });
	});

	test("merge filters out undefined and null entries", () => {
		const result = TranslationsUtil.merge({ en: "Hello" }, undefined, null);
		expect(result).toEqual({ en: "Hello" });
	});

	test("find returns matching translation (exact match)", () => {
		expect(TranslationsUtil.find(sample, "Bonjour")).toEqual({ fr: "Bonjour" });
	});

	test("find is case-insensitive", () => {
		expect(TranslationsUtil.find(sample, "HELLO")).toEqual({ en: "Hello" });
	});

	test("find returns null for no match", () => {
		expect(TranslationsUtil.find(sample, "xyz")).toBeNull();
	});

	test("find returns null for undefined input", () => {
		expect(TranslationsUtil.find(undefined, "Hello")).toBeNull();
	});

	test("omit removes specified language codes", () => {
		expect(TranslationsUtil.omit(sample, "fr")).toEqual({ en: "Hello", de: "Hallo" });
	});

	test("omit removes multiple codes", () => {
		expect(TranslationsUtil.omit(sample, "fr", "de")).toEqual({ en: "Hello" });
	});

	test("createTranslator returns a function with bound preferences", () => {
		const t = TranslationsUtil.createTranslator(["en", "fr"]);
		expect(t(sample)).toBe("Hello");
	});

	test("createTranslator with no preferences defaults to en", () => {
		const t = TranslationsUtil.createTranslator();
		expect(t(sample)).toBe("Hello");
	});
});

describe("LanguageCodeUtil", () => {
	test("isRecognized returns true for valid codes", () => {
		expect(LanguageCodeUtil.isRecognized("en")).toBe(true);
		expect(LanguageCodeUtil.isRecognized("zh-Hans")).toBe(true);
	});

	test("isRecognized returns false for empty string", () => {
		expect(LanguageCodeUtil.isRecognized("")).toBe(false);
	});

	test("getName returns non-null for known codes", () => {
		expect(LanguageCodeUtil.getName("en")).toBe("English");
	});

	test("getName returns null for empty input", () => {
		expect(LanguageCodeUtil.getName("")).toBeNull();
	});

	test("getAutonym returns the native name", () => {
		expect(LanguageCodeUtil.getAutonym("de")).toBe("Deutsch");
	});
});
