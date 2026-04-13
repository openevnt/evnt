import { Anchor, Image, List, Text, Title } from "@mantine/core";
import { Section } from "../Section";

export const WhySection = () => {
	return (
		<Section title="Introduction">
			<Text>
				Most event data today is currently treated as an <Text inline inherit span td="underline">afterthought</Text>; it is often stored in simple, rigid, legacy formats that fail to capture the complexity and richness of real-world events.
			</Text>
			<Text>
				<Text inline inherit span fw="bold">Open Evnt</Text> aims to fix this issue by providing a modern, extensible, and easy-to-use JSON-based data format for events.
			</Text>
			<Text>
				<Text inline inherit span fw="bold">Open Evnt</Text> addresses the structural oversights of existing formats almost everyone ignores: things such as internationalization, multiple locations or occurrences, partially known times, etc.
			</Text>
			<Text>
				<Text inline inherit span fw="bold">Open Evnt</Text> is designed to be a common format for calendar applications, event management systems, event listing sites and others to use for representing events. This allows for better interoperability between different applications and services.
			</Text>
			<Text>
				This does mean that we are <Anchor href="https://xkcd.com/927/" target="_blank" rel="noopener noreferrer">
					reinventing the wheel
				</Anchor>.
			</Text>
		</Section>
	)
};
