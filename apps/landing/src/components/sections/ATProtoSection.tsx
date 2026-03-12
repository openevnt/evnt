import { Anchor, Button, Code, Group, List, Text } from "@mantine/core";
import { Section } from "../Section";
import { IconExternalLink } from "@tabler/icons-react";

export const ATProtoSection = () => {
	return (
		<Section title="ATProto">
			<Text>
				The Evnt format is compatible with <Anchor href="https://atproto.com" target="_blank" rel="noopener noreferrer">
					ATProto
				</Anchor>.
			</Text>
			<Text>
				Applications should use the <Code>directory.evnt.event</Code> collection for events.
			</Text>
			<Text>
				You can find the lexicons below. Lexicon version 1 does not support the neccesary features to fully represent the evnt schema, so this is a very rough approximation.
			</Text>
			<Group justify="center">
				<Button
					component="a"
					href="https://pds.ls/at://evnt.directory/com.atproto.lexicon.schema/directory.evnt.event#schema"
					target="_blank"
					rightSection={<IconExternalLink />}
					variant="light"
				>
					Lexicon on PDSls
				</Button>
				<Button
					component="a"
					href="https://github.com/openevnt/evnt/blob/main/event-data.lexicon.json"
					target="_blank"
					rightSection={<IconExternalLink />}
					variant="light"
				>
					Lexicon on GitHub
				</Button>
			</Group>
			<Text>
				Currently the standard collection for events is the <Anchor component="a" href="https://github.com/lexicon-community/lexicon/blob/main/community/lexicon/calendar/event.json" target="_blank" rel="noopener noreferrer">
					<Code>community.lexicon.calendar.event</Code>
				</Anchor> lexicon. Unfortunately, Evnt is more complex so these two lexicons are not fully compatible.
			</Text>
			<Text>
				Applications wishing to support both lexicons can use the same TID and do conversion between the formats.
			</Text>
			<Text>
				The <Anchor component="a" href="https://github.com/lexicon-community/lexicon/blob/main/community/lexicon/calendar/event.json" target="_blank" rel="noopener noreferrer">
					<Code>community.lexicon.calendar.rsvp</Code>
				</Anchor> lexicons can be used for RSVPs since <Code>subject</Code> field is a <Code>com.atproto.repo.strongRef</Code> and allows referencing the event in the <Code>directory.evnt.event</Code> collection.
			</Text>
		</Section>
	);
};