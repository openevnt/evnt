import { Anchor, Button, Code, List, Stack, Text } from "@mantine/core";
import { Section } from "../Section";
import { CodeHighlight, CodeHighlightTabs } from "@mantine/code-highlight";
import { IconExternalLink } from "@tabler/icons-react";
import { Titlecard } from "../Titlecard";

export const SpecificationSection = () => {
	return (
		<Section title="Specification">
			<Text>
				You can find the specification document for <Titlecard /> in <Anchor href="https://github.com/openevnt/evnt/blob/main/docs/README.md" target="_blank" rel="noopener noreferrer">
					docs/README.md
				</Anchor> file in the GitHub repository.
			</Text>

			<Stack align="center">
				<Button
					component="a"
					href="https://github.com/openevnt/evnt/blob/main/docs/README.md"
					target="_blank"
					rel="noopener noreferrer"
					rightSection={<IconExternalLink />}
					variant="light"
				>
					Read the Specification
				</Button>
			</Stack>

			<Text>
				The specification is also published as a JSON Schema, which can be found in <Anchor href="https://github.com/openevnt/evnt/blob/main/event-data.schema.json" target="_blank" rel="noopener noreferrer">
					event-data.schema.json
				</Anchor>. You can also use the raw link to the JSON Schema as a <Code>$schema</Code> reference in your own JSON Schema documents:
			</Text>

			<CodeHighlight
				styles={{
					code: { paddingRight: 60 },
				}}
				code="https://raw.githubusercontent.com/openevnt/evnt/refs/heads/main/event-data.schema.json"
			/>

			<Text>
				We also publish various npm packages for working with <Titlecard />, such as <Code>@evnt/schema</Code> which provides Zod schema definitions or <Code>@evnt/partial-date</Code> which contains utilities for working with partial dates.
			</Text>

			<CodeHighlightTabs
				code={[
					{ language: "bash", code: "pnpm add @evnt/schema", fileName: "pnpm" },
					{ language: "bash", code: "npm install @evnt/schema", fileName: "npm" },
					{ language: "bash", code: "yarn add @evnt/schema", fileName: "yarn" },
				]}
			/>
		</Section>
	);
};