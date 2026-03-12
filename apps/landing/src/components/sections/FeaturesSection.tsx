import { Anchor, Code, List, Stack, Text, Title } from "@mantine/core";
import { IconLanguage } from "@tabler/icons-react";
import { Section } from "../Section"

export const FeaturesSection = () => {
	return (
		<Section title="Features">
			When designing Evnt, we had a few key features in mind that we wanted to support:

			<List spacing="md" styles={{ itemIcon: { display: "inline", verticalAlign: "start" } }}>
				<List.Item>
					<Text span fw="bold">Multilingual</Text> - Every text field in Evnt supports multiple languages (by using language-keyed objects). This means that internationalization is built into the core of the format.

					<Code
						block
						mt="xs"
						children={JSON.stringify({ en: "Example message", lt: "Pavyzdžio pranešimas" }, null, 2)}
					/>
				</List.Item>
				<List.Item>
					<Text span fw="bold">Instances</Text> - Events can have multiple time spans. Many events (e.g. conferences) have multiple instances, and it is important to be able to represent that in a consistent way.
				</List.Item>
				<List.Item>
					<Text span fw="bold">Venues</Text> - Events can have multiple venues, both physical and online. This is important for events that have multiple physical locations (e.g. a conference with multiple stages) or that are hybrid (e.g. a conference with both physical and online attendees).
				</List.Item>
				<List.Item>
					<Text span fw="bold">Partial Dates</Text> - Some events only have partial date information. For example, you might only know the month and year of an event, but not the exact day. Evnt allows you to represent this in a consistent way by allowing partial date strings (e.g. "2024-05" for May 2024).
				</List.Item>
				<List.Item>
					<Text span fw="bold">No Timezones</Text> - Everything is stored in UTC, and it's up to the application to convert it to the user's local timezone.
				</List.Item>
				<List.Item>
					<Text span fw="bold">Metadata</Text> - Information that don't belong to a specific instance or venue can be stored as Components, which are extensible.
					<Text my="xs">
						We currently have:
					</Text>
					<List withPadding>
						<List.Item>
							<Text span fw="bold">Links</Text> - Links related to the event (e.g. website, social media, registration form etc.); they can have titles, descriptions and even defined times for when they are valid.
						</List.Item>
						<List.Item>
							<Text span fw="bold">Splash Media</Text> - Images or videos that represent the event. Applications can use this to display a banner for the event, for example.
						</List.Item>
					</List>
					<Text my="xs">
						Components can also be defined by applications, and they can be used to store any kind of metadata that doesn't fit into the predefined fields.
					</Text>
				</List.Item>
			</List>

			<Stack>
				<Title order={3}>
					Roadmap
				</Title>

				<Text>
					We also have other things we are planning to add:
				</Text>

				<List spacing="xs">
					<List.Item>
						<Text span fw="bold">Ticketing</Text> - Weather an event is free or paid, ticket tiers, ticket prices, seller links etc.
					</List.Item>
					<List.Item>
						<Text span fw="bold">Rich Text</Text> - Support for rich text formatting in description fields. We were going to use Markdown, but we will probably use something similar to BlueSky richtext facets instead.
					</List.Item>
					<List.Item>
						<Text span fw="bold">Organizers</Text> - Information about the organizers of the event, such as their name, contact information, social media links etc.
					</List.Item>
					<List.Item>
						<Text span fw="bold">Attending Language</Text> - Metadata about the language(s) used in the event. This would be very useful for multilingual regions for example.
					</List.Item>
					<List.Item>
						<Text span fw="bold">Activities</Text> - Things that go on inside the event. For example, a conference might have talks, workshops, panels etc; a cosplay convention might have a show, a photoshoot, a meetup etc.
					</List.Item>
					<List.Item>
						<Text span fw="bold">Categories/Tags</Text> - The ability to categorize or tag events.
					</List.Item>
				</List>

				<Text>
					If you are interested in any of these features and would like to help out, or if you have any other ideas or suggestions,
					please feel free to <Anchor
						href="https://github.com/openevnt/evnt/issues"
						target="_blank"
						rel="noopener noreferrer"
						ml={4}
					>
						check out the GitHub issue tracker
					</Anchor>
				</Text>
			</Stack>
		</Section>
	)
};
