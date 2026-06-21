import { assertType, describe, test } from "vitest";
import { EventComponentSchema } from "../src/schemas/components/EventComponent";

describe("jsonschema", () => {
	test("event components", () => {
		assertType(Array.isArray(EventComponentSchema.toJSONSchema().oneOf))
	})
});
