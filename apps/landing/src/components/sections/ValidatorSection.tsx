import { JsonInput, Text } from "@mantine/core";
import { Section } from "../Section";
import { useState } from "react";
import { EventDataSchema, type EventData } from "@evnt/schema";
import { z } from "zod";

export const ValidatorSection = () => {
	const [value, setValue] = useState(JSON.stringify({
		v: 0,
		name: { en: "Event" },
	} as EventData, null, 2));

	let error: string | null = null;
	let object: unknown = null;
	try {
		object = JSON.parse(value);
	} catch (e) {
		error = (e as Error).message;
	}

	if (object) {
		let result = EventDataSchema.safeParse(object);
		if (!result.success) error = z.prettifyError(result.error);
	}

	return (
		<Section title="Data Validator">
			<Text>
				Use the section below to validate JSON in the format
			</Text>

			<JsonInput
				label="Evnt Data"
				placeholder="Enter your JSON here..."
				minRows={5}
				autosize
				value={value}
				onChange={setValue}
				error={error}
				formatOnBlur
				styles={{
					error: {
						whiteSpace: "pre-wrap",
						color: "var(--mantine-color-yellow-text)",
					}
				}}
			/>
		</Section>
	)
};
