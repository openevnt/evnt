import { Code, List, Text } from "@mantine/core";
import { IconLanguage } from "@tabler/icons-react";
import { Section } from "../Section"

export const FeaturesSection = () => {
	return (
		<Section title="Features">
			When designing Evnt, we had a few key features in mind that we wanted to support:

			<List spacing="md" styles={{ itemIcon: { display: "inline", verticalAlign: "start" } }}>
				<List.Item>
					<IconLanguage />

					<Text span fw="bold">Multilingual</Text> - Every text field in Evnt supports multiple languages (by using language-keyed objects). This means that internationalization is built into the core of the format.

					<Code
						block
						mt="xs"
						children={JSON.stringify({ en: "Example message", lt: "Pavyzdžio pranešimas" }, null, 2)}
					/>
				</List.Item>
				<List.Item>
					<Text span fw="bold">Multiple Dates/Times</Text> - Every event is represented as a list of instances, where each instance has a start and end date/time.
				</List.Item>
				<List.Item>
					<Text span fw="bold">Partial Dates</Text> - Evnt supports events that have partial date information (e.g. only known month without date or only known date without time).
				</List.Item>
				<List.Item>
					<Text span fw="bold">No Timezones</Text> - Everything is stored in UTC, and it's up to the application to convert it to the user's local timezone.
				</List.Item>
				<List.Item>
					<Text span fw="bold">Multiple Locations</Text> - Evnt has first class support for events that have multiple locations, both physical and online, maybe even multiple physical locations.
				</List.Item>
				<List.Item>
					<Text span fw="bold">Extensible</Text> - Designed to be flexible and extensible
				</List.Item>
			</List>
		</Section>
	)
};
