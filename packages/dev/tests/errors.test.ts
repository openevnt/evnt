import { describe, expect, test } from "vitest";
import { ZodError } from "zod";
import { SchemaValidationError, JSONParseError } from "../src/index";

describe("SchemaValidationError", () => {
	test("stores path, zodError, and fileContent", () => {
		const zodError = new ZodError([
			{
				code: "invalid_type",
				expected: "string",
				received: "number",
				path: ["name"],
				message: "Expected string, received number",
			},
		]);
		const error = new SchemaValidationError("/path/to/file.json", zodError, "content");
		expect(error.path).toBe("/path/to/file.json");
		expect(error.zodError).toBe(zodError);
		expect(error.fileContent).toBe("content");
	});

	test("getCodeFrames returns a string", () => {
		const zodError = new ZodError([
			{
				code: "invalid_type",
				expected: "string",
				received: "number",
				path: ["name"],
				message: "Expected string, received number",
			},
		]);
		const error = new SchemaValidationError("/path/file.json", zodError, '{"name": 42}');
		const frames = error.getCodeFrames();
		expect(typeof frames).toBe("string");
		expect(frames).toContain("/path/file.json");
	});
});

describe("JSONParseError", () => {
	test("stores path and wraps SyntaxError", () => {
		const syntaxError = new SyntaxError("Unexpected token");
		const error = new JSONParseError("/path/to/file.json", syntaxError);
		expect(error.path).toBe("/path/to/file.json");
		expect(error.syntaxError).toBe(syntaxError);
	});

	test("is instance of Error", () => {
		const error = new JSONParseError("/f.json", new SyntaxError("bad"));
		expect(error).toBeInstanceOf(Error);
	});
});
