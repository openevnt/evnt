import { Anchor, Image, List, Text, Title } from "@mantine/core";
import { Section } from "../Section";
import { Titlecard } from "../Titlecard";

export const WhySection = () => {
	return (
		<Section id="intro" title={(
			<>
				What is <Titlecard />?
			</>
		)}>
			<Text>
				Most event data today is currently treated as an <Text inline inherit span td="underline">afterthought</Text>; it is often stored in simple, rigid, legacy formats that fail to capture the complexity and richness of real-world events.
			</Text>
			<Text>
				<Titlecard /> aims to fix this issue by providing a modern, extensible, and easy-to-use JSON-based data format for events.
			</Text>
			<Text>
				<Titlecard /> is designed to be a common data format for calendar applications, event management systems, event listing sites and others to use for representing events. This allows for better interoperability between different applications and services.
			</Text>
			<Text>
				The main design goals of <Titlecard /> are:
			</Text>
			<List withPadding>
				<List.Item>
					<Text inline span fw="bold">No data-stuffing:</Text> Details of an event deserve their own fields, not to be crammed into a description field.
				</List.Item>
				<List.Item>
					<Text inline span fw="bold">No assumptions:</Text> How an event is organized or structured should not be dictated by the data format.
				</List.Item>
				<List.Item>
					<Text inline span fw="bold">Support impercision:</Text> Some event details are often not known.
				</List.Item>
				<List.Item>
					<Text inline span fw="bold">Accessibility:</Text> Event details should be localizable.
				</List.Item>
				<List.Item>
					<Text inline span fw="bold">Extensibility:</Text> Allow more metadata to be added without breaking existing implementations.
				</List.Item>
			</List>
			<Text>
				Please note that <Titlecard /> is only a data format and not a protocol. It's meant to be protocol-agnostic so that it can be used with various protocols and systems.
			</Text>
			<Text>
				Relevant <Anchor href="https://xkcd.com/927/" target="_blank" rel="noopener noreferrer">
					XKCD 927: Standards
				</Anchor>
			</Text>
		</Section>
	)
};
