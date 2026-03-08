import { Anchor, Code, List, Text } from "@mantine/core";
import { Section } from "../Section";
import { CodeHighlight } from "@mantine/code-highlight";

export const SpecificationSection = () => {
	return (
		<Section title="Specification">
			<Text>
				You can find the specification for evnt in <Anchor href="https://github.com/deniz-blue/evnt/blob/main/docs/readme.md" target="_blank" rel="noopener noreferrer">
					docs/readme.md
				</Anchor> file in the GitHub repository.
			</Text>

			<Text>
				We have a npm package for the schema that uses <Anchor href="https://zod.dev" target="_blank" rel="noopener noreferrer">
					Zod
				</Anchor> and provides TypeScript types as well as runtime validation. You can find it on npm as <Anchor href="https://www.npmjs.com/package/@evnt/schema" target="_blank" rel="noopener noreferrer">
					@evnt/schema
				</Anchor>.
			</Text>

			<Text>
				We also auto-generate a couple things using the <Code>@evnt/schema</Code> code:
			</Text>

			<List spacing="xl">
				<List.Item>
					<Text>
						A <Text span fw="bold">JSON Schema</Text> for the event data, which can be used for validation and type generation. You can find it in <Anchor href="https://github.com/deniz-blue/evnt/blob/main/event-data.schema.json" target="_blank" rel="noopener noreferrer">
							event-data.schema.json
						</Anchor>. Here's a raw link you can use as <Code>$schema</Code>:
					</Text>

					<CodeHighlight
						code="https://raw.githubusercontent.com/deniz-blue/events-format/refs/heads/main/event-data.schema.json"
					/>
				</List.Item>

				<List.Item>
					<Text>
						A <Anchor href="https://github.com/deniz-blue/evnt/blob/main/docs/SCHEMA.md" target="_blank" rel="noopener noreferrer">
							markdown document
						</Anchor> that documents all the type information.
					</Text>
				</List.Item>

				<List.Item>
					<Text>
						A poorly made <Anchor href="https://atproto.com/guides/lexicon">
							ATProto Lexicon
						</Anchor> available at <Anchor href="https://github.com/deniz-blue/evnt/blob/main/event-data.lexicon.json" target="_blank" rel="noopener noreferrer">
							event-data.lexicon.json
						</Anchor>. Lexicons do not support the neccesary features to fully represent the evnt schema. ATProto records for Evnt data should be under the <Code>directory.evnt.event</Code> collection.
					</Text>
				</List.Item>
			</List>
		</Section>
	);
};