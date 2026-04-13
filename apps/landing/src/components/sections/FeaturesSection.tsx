import { Anchor, Code, List, Stack, Table, Text, Title } from "@mantine/core";
import { IconApps, IconClockQuestion, IconLanguage, IconListNumbers, IconUsers } from "@tabler/icons-react";
import { Section } from "../Section"
import { CodeHighlight } from "@mantine/code-highlight";

export const FeaturesSection = () => {
	return (
		<Section title="Features">
			<Title order={3}>
				<IconLanguage size={28} style={{ verticalAlign: "middle" }} /> Internationalization
			</Title>

			<Text>
				Every piece of text that is meant to be shown to end users in Open Evnt is <Text inline span inherit td="underline">multilingual</Text>.
				This means that instead of just having a "name" field, we have a "name" object that can contain multiple translations of the title.
				This allows applications to easily support multiple languages and also allows for better accessibility.
			</Text>

			<CodeHighlight language="json" code={JSON.stringify({
				name: {
					en: "My Event",
					lt: "Mano Renginys",
					fr: "Mon Événement",
				},
			}, null, 2)} />

			<Text>
				Most of the time, when applications don't support internationalization for something like a description, users tend to put all of them one after another in the same description field.
			</Text>

			<Title order={3} mt="3rem">
				<IconClockQuestion size={28} style={{ verticalAlign: "middle" }} /> Partially Defined Dates
			</Title>

			<Text>
				A lot of events only have partial date information.
				For example, you might only know the month and year of an event, but not the exact day and time.
			</Text>

			<Text>
				Open Evnt uses a consistent way to represent this by allowing partial date strings.
			</Text>

			<Table
				styles={{
					tr: { textAlign: "center" },
				}}
				data={{
					body: [
						["Partial Date", "Description"],
						[<Code>2024-05[Europe/Vilnius]</Code>, "May 2024 (in Vilnius)"],
						[<Code>2024-05-15[Europe/Vilnius]</Code>, "May 15, 2024 (in Vilnius)"],
						[<Code>2024-05-15T12:00[Europe/Vilnius]</Code>, "May 15, 2024 at 12:00 (in Vilnius)"],
					],
				}}
			/>

			<Text>
				Open Evnt uses timezone-aware partial dates, which means that every date includes an explicit timezone identifier.
				Trust me, this is very important.
			</Text>

			<Title order={3} mt="3rem">
				<IconListNumbers size={28} style={{ verticalAlign: "middle" }} /> Multiple Instances and Venues
			</Title>

			<Text>
				Many events can span multiple days, or even have multiple occurrences in different locations.
			</Text>

			<Text>
				Open Evnt natively supports representing this information by allowing events to have multiple date <Text inline span inherit td="underline">instances</Text> and multiple <Text inline span inherit td="underline">venues</Text>.
			</Text>

			<Title order={3} mt="3rem">
				<IconApps size={28} style={{ verticalAlign: "middle" }} /> Extensibility
			</Title>

			<Text>
				Events can have an arbitrary number of <Text inline span inherit td="underline">components</Text>, which are just objects with a <Code>$type</Code> defining what they are.
			</Text>

			<Text>
				Any application can define its own components and use them to store any kind of metadata that doesn't fit into the predefined fields.
			</Text>

			<Text>
				The core specification defines a couple components such as a link component and a splash media component. We are also planning to add more in the future such as ticketing, organizers, categories/tags etc.
			</Text>

			<Title order={3} mt="3rem">
				<IconUsers size={28} style={{ verticalAlign: "middle" }} /> Open Source
			</Title>

			<Text>
				Open Evnt is completely open source, and we welcome contributions from anyone.
			</Text>

			<Text>
				If you are interested in any of these features and would like to help out, or if you have any other ideas or suggestions,
				please feel free to <Anchor
					href="https://github.com/openevnt/evnt/issues"
					target="_blank"
					rel="noopener noreferrer"
					ml={4}
				>
					check out the GitHub issue tracker
				</Anchor>.
			</Text>
		</Section>
	)
};
