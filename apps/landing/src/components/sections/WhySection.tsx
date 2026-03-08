import { Anchor, Image, Text } from "@mantine/core";
import { Section } from "../Section";

export const WhySection = () => {
	return (
		<Section title="Why?">
			<Text>
				Events are complicated. Modern applications always make assumptions about the structure of events, which makes it difficult to represent certain types of events.

				The ICAL format is old and outdated, and it is not designed to be flexible or extensible.
			</Text>
			<Text>
				Evnt is based on JSON.
			</Text>
			<Text>
				Evnt is designed to be flexible and extensible, allowing users to represent any type of event in a consistent way while allowing for future extensions.
			</Text>
			<Text>
				And yes, this does mean <Anchor href="https://xkcd.com/927/" target="_blank" rel="noopener noreferrer">
					XKCD 927
				</Anchor>.
			</Text>
		</Section>
	)
};
