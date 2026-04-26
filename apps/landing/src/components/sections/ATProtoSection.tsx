import { Anchor, Button, Code, Group, List, Text } from "@mantine/core";
import { Section } from "../Section";
import { IconExternalLink } from "@tabler/icons-react";
import { Titlecard } from "../Titlecard";

export const ATProtoSection = () => {
	return (
		<Section title="AT Protocol">
			<Text>
				Open Evnt can be used with the <Anchor href="https://atproto.com" target="_blank" rel="noopener noreferrer">
					AT Protocol
				</Anchor>!
			</Text>
			<Text>
				We publish lexicons for Open Evnt under the <Code>directory.evnt</Code> namespace, and they can be found on PDSls and GitHub.
			</Text>
			<Group justify="center">
				<Button
					component="a"
					href="https://pds.ls/at://evnt.directory/com.atproto.lexicon.schema"
					target="_blank"
					rightSection={<IconExternalLink />}
					variant="light"
				>
					Lexicons on PDSls
				</Button>
				<Button
					component="a"
					href="https://github.com/openevnt/evnt/blob/main/lexicons/directory/evnt"
					target="_blank"
					rightSection={<IconExternalLink />}
					variant="light"
				>
					Lexicons on GitHub
				</Button>
			</Group>
			<Text>
				The widely used <Anchor component="a" href="https://github.com/lexicon-community/lexicon/blob/main/community/lexicon/calendar/event.json" target="_blank" rel="noopener noreferrer">
					<Code>community.lexicon.calendar.event</Code>
				</Anchor> lexicon and <Titlecard /> are incompatible.
			</Text>
			<Text>
				<Anchor component="a" href="https://github.com/lexicon-community/lexicon/blob/main/community/lexicon/calendar/event.json" target="_blank" rel="noopener noreferrer">
					<Code>community.lexicon.calendar.rsvp</Code>
				</Anchor> records can be used for RSVPs in AT Protocol.
			</Text>
		</Section>
	);
};