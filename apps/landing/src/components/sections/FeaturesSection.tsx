import { Anchor, Button, Center, Code, Group, List, Marquee, Paper, SimpleGrid, Skeleton, Stack, Table, Tabs, Text, Timeline, Title } from "@mantine/core";
import { IconApps, IconClockQuestion, IconExternalLink, IconLanguage, IconListNumbers, IconUsers } from "@tabler/icons-react";
import { Section } from "../Section"
import { CodeHighlight } from "@mantine/code-highlight";
import { Titlecard } from "../Titlecard";

export const FeaturesSection = () => {
	return (
		<Section title="Features">
			<Title order={3}>
				<IconLanguage size={28} style={{ verticalAlign: "middle" }} /> Internationalization
			</Title>

			<Text>
				Every piece of text that is meant to be shown to end users in <Titlecard /> is <Text inline span inherit td="underline">multilingual</Text>.
				This means that instead of just having a <Code>name</Code> string field, we have a <Code>name</Code> object that can contain multiple translations of the title.
				This allows applications to easily support multiple languages and also allows for better accessibility.
			</Text>

			<SimpleGrid
				cols={{ base: 1, sm: 2 }}
			>
				<CodeHighlight language="json" code={JSON.stringify({
					name: {
						en: "My Event",
						lt: "Mano Renginys",
						fr: "Mon Événement",
					},
				}, null, 2)} />
				<Paper withBorder p="xs">
					<Tabs defaultValue="en" variant="pills">
						<Stack gap="xs">
							<Tabs.List>
								<Tabs.Tab value="en">English</Tabs.Tab>
								<Tabs.Tab value="lt">Lithuanian</Tabs.Tab>
								<Tabs.Tab value="fr">French</Tabs.Tab>
							</Tabs.List>
							<Tabs.Panel value="en">
								📆 My Event
							</Tabs.Panel>
							<Tabs.Panel value="lt">
								📆 Mano Renginys
							</Tabs.Panel>
							<Tabs.Panel value="fr">
								📆 Mon Événement
							</Tabs.Panel>
							<Skeleton h="1rem" animate={false} />
							<Skeleton h="1rem" w="70%" animate={false} />
						</Stack>
					</Tabs>
				</Paper>
			</SimpleGrid>

			<Text>
				Internationalization is not just limited to the title of the event, but can be used for any text field such as descriptions, location names, etc.
			</Text>

			<Title order={3} mt="3rem">
				<IconClockQuestion size={28} style={{ verticalAlign: "middle" }} /> Partial Dates
			</Title>

			<Text>
				<Anchor href="https://evnt.leaflet.pub/3mjeydgshtk2z" target="_blank" rel="noopener noreferrer">
					Scheduling is complex
				</Anchor>, and a lot of events have some level of uncertainty around their date and time.
			</Text>

			<Text>
				For example, an event might be scheduled for a specific month but the exact date is not yet known, or it might be scheduled for a specific date but the time is not yet known.
			</Text>

			<Text>
				Unlike other formats, <Titlecard /> offers first-class support for representing these kinds of events.
			</Text>

			<Marquee
				w="100%"
				gap="lg"
				duration={20000}
			>
				{/* A bunch of HUMANIZED partial dates */}
				{[
					"2026",
					"October 30th 2026, 15:00",
					"May 2026",
					"October 2026",
					"May 15th 2026",
					"April 26th 2026, 13:45",
					"2027",
					"June 2026",
					"April 1st 2026, 09:00",
				].map((t, i) => (
					<Text>
						📅 {t}
					</Text>
				))}
			</Marquee>

			<Text>
				Partial dates are also <Text inline inherit span td="underline">timezone-aware</Text> which means that no one has to worry about local vs event time and all the issues that come with it.
			</Text>

			<Title order={3} mt="3rem">
				<IconListNumbers size={28} style={{ verticalAlign: "middle" }} /> Multiple Dates
			</Title>

			<Text>
				Social events are too complicated to be represented by a single start and end date.
				Multi-day events can start and end on different hours, which are irrepresentable in other formats.
			</Text>

			<Text>
				<Titlecard /> defines events as having a list of time ranges instead of just a single start and end date, which allows for representing these kinds of events.
			</Text>

			<SimpleGrid
				cols={{ base: 1, sm: 2 }}
				my="md"
			>
				<CodeHighlight language="json" code={JSON.stringify({
					instances: [
						{
							start: "2026-10-30T12:00[Europe/Brussels]",
							end: "2026-10-30T18:00[Europe/Brussels]",
						},
						{
							start: "2026-10-31T12:00[Europe/Brussels]",
							end: "2026-10-31T15:00[Europe/Brussels]",
						},
					],
				}, null, 2)} />
				<Paper withBorder p="xs">
					<Center h="100%">
						<Stack>
							<Group gap="md">
								<Text>
									📆
								</Text>
								<Text>
									Big Conference
								</Text>
							</Group>
							<Timeline
								active={2}
								bulletSize={18}
							>
								<Timeline.Item title="October 30th 2026" children="12:00 - 18:00" />
								<Timeline.Item title="October 31st 2026" children="12:00 - 15:00" />
							</Timeline>
						</Stack>
					</Center>
				</Paper>
			</SimpleGrid>

			<Title order={3} mt="3rem">
				<IconApps size={28} style={{ verticalAlign: "middle" }} /> Extensible
			</Title>

			<Text>
				<Titlecard /> is designed to be extensible, which means that applications can define their own components and use them to store any kind of metadata that doesn't fit into the predefined fields.
			</Text>

			<Text>
				Components are defined using namespace identifiers which prevent naming collisions and allow for better interoperability between different applications and services.
			</Text>

			<Title order={3} mt="3rem">
				<IconUsers size={28} style={{ verticalAlign: "middle" }} /> Open Source
			</Title>

			<Text>
				<Titlecard /> is completely open source, and we welcome contributions from anyone.
			</Text>

			<Text>
				We use GitHub issues for tracking features and discussions, so if you have any ideas or suggestions, please feel free to check out the issue tracker.

				You can also join our Discord or Matrix communities to chat with us and other people interested in <Titlecard />.
			</Text>

			<Group justify="center">
				<Button
					component="a"
					href="https://github.com/openevnt/evnt/issues"
					target="_blank"
					rel="noopener noreferrer"
					rightSection={<IconExternalLink />}
					variant="light"
				>
					View Issues
				</Button>
				<Button
					component="a"
					href="https://deniz.blue/discord-invite?id=1493641727980994710"
					target="_blank"
					rel="noopener noreferrer"
					rightSection={<IconExternalLink />}
					variant="light"
				>
					Discord
				</Button>
				<Button
					component="a"
					href="https://matrix.to/#/#evnt:catgirl.cloud"
					target="_blank"
					rel="noopener noreferrer"
					rightSection={<IconExternalLink />}
					variant="light"
				>
					Matrix
				</Button>
			</Group>
		</Section>
	)
};
