import { useEffect, useState } from "react";
import { BroadcastChannelKey, getInstanceUrl } from "../api";
import { Anchor, Box, Button, Code, Collapse, Container, CopyButton, Divider, Group, Image, Input, Paper, Space, Spoiler, Stack, Text, TextInput, Title } from "@mantine/core";
import { usePublicInstances, type Redirectable } from "./instance-list";
import { useIntent } from "./ui-stores";
import { inferShareLink } from "./infer-share-link";

export const usePreferredInstanceUrl = () => {
	const [preferredInstanceUrl, setPreferredInstanceUrl] = useState<string | null>(getInstanceUrl());

	useEffect(() => {
		const channel = new BroadcastChannel(BroadcastChannelKey);
		channel.onmessage = () => setPreferredInstanceUrl(getInstanceUrl());
		return () => channel.close();
	}, []);

	return preferredInstanceUrl;
};

export const Page = () => {
	const intent = useIntent();

	return (
		<Container size="xs" my="md">
			<Divider
				ff="monospace"
				my="sm"
				mx="xl"
				label={(
					<Text>
						📆 eventsl.ink 🔗
					</Text>
				)}
			/>

			{intent && <RedirectPage />}
			{!intent && <HomePage />}
		</Container>
	)
}

export const HomePage = () => {
	const redirectables = usePublicInstances();
	const [inputValue, setInputValue] = useState("");

	const link = inferShareLink(inputValue);

	const canShare = !!link && navigator.canShare?.({ url: link });

	return (
		<Stack>
			<Text ta="center">
				This website serves as a redirector for events.
			</Text>

			<Text ta="center">
				It allows you to choose your preferred application for viewing events, and create links to allow others to do the same.
			</Text>

			<Space h="md" />

			<TextInput
				value={inputValue}
				onChange={e => setInputValue(e.currentTarget.value)}
				label="Create an eventsl.ink"
				placeholder="Enter a link to an event"
				error={inputValue && !link ? "Unsupported link..." : false}
				inputWrapperOrder={["label", "input", "error", "description"]}
				styles={{ label: { marginBottom: "var(--mantine-spacing-sm)" } }}
				description={(
					<Stack c="dimmed" gap={0}>
						<Text span inherit>
							Supported: atmo.rsvp, Smoke Signal, PDSls, AT-URIs
						</Text>
					</Stack>
				)}
			/>

			<Collapse expanded={!!link}>
				<Group grow>
					<CopyButton value={link}>
						{({ copied, copy }) => (
							<Button
								color={copied ? "teal" : "blue"}
								onClick={copy}
								leftSection={copied ? "✓" : "📋"}
								variant="outline"
							>
								{copied ? "Copied" : "Copy"}
							</Button>
						)}
					</CopyButton>
					{canShare && (
						<Button
							color="blue"
							variant="light"
							leftSection={"📤"}
							onClick={() => navigator.share?.({
								url: link,
							})}
						>
							Share
						</Button>
					)}
					<Button
						component="a"
						href={link}
						target="_blank"
						rel="noopener noreferrer"
						variant="outline"
						color="blue"
						leftSection={"🔗"}
					>
						Preview
					</Button>
				</Group>
			</Collapse>

			<Space h="xl" />

			<Stack gap="sm">
				<Input.Label>Or select an app to visit:</Input.Label>
				<Stack>
					{redirectables.map((redirectable) => (
						<InstanceCard key={redirectable.url} info={redirectable} />
					))}
				</Stack>
			</Stack>
		</Stack>
	)
};

export const RedirectPage = () => {
	const preferredInstanceUrl = usePreferredInstanceUrl();
	const redirectables = usePublicInstances();

	return (
		<Stack align="center" w="100%">
			<Title ta="center" order={3} fw="normal" my="md">
				Choose an app to continue
			</Title>

			{preferredInstanceUrl && (
				<Text ta="center" size="sm" color="gray">
					Your default application is set to <a href={preferredInstanceUrl}>
						{preferredInstanceUrl.startsWith("web+evnt://") ? "web+evnt" : new URL(preferredInstanceUrl).host}
					</a>.
				</Text>
			)}

			<Stack gap={0} w="100%">
				<Stack w="100%">
					{redirectables.map((redirectable) => (
						<InstanceCard key={redirectable.url} info={redirectable} />
					))}
				</Stack>
			</Stack>

			<Stack
				align="start"
				w="100%"
			>
				<Spoiler
					showLabel="What's this?"
					hideLabel="Show less"
					styles={{ control: { fontSize: "var(--mantine-font-size-sm)" } }}
					maxHeight={0}
					w="100%"
				>
					<Stack gap="xs" fz="sm" mb="md">
						<Text inherit>
							<Text span inherit fw="bold">eventsl.ink</Text> is a redirector for events.

							This site allows you to pick your preferred way to view events.
						</Text>

						<Text inherit>
							You can view events that use the <Code>
								<Anchor
									href="https://lexicon.community"
									unstyled
									c="blue"
									inherit
								>
									community.lexicon
								</Anchor>.calendar.event
							</Code> lexicon and <Anchor
								href="https://evnt.directory"
								target="_blank"
								rel="noopener noreferrer"
								inherit
							>
								Evnt
							</Anchor> formats, based on AT Protocol or HTTP sources.
						</Text>
					</Stack>
				</Spoiler>
			</Stack>
		</Stack>
	);
};

export const InstanceCard = ({
	info,
}: {
	info: Redirectable;
}) => {
	return (
		<Anchor
			href={info.url}
			unstyled
			w="100%"
			c="unset"
			td="unset"
			style={{
				cursor: "pointer",
			}}
		>
			<Paper
				withBorder
				radius="xl"
				className="instance-card"
				shadow="sm"
				py="xs"
				px="md"
			>
				<Group wrap="nowrap" gap="xs">
					<Image
						src={info.faviconUrl}
						alt={`${info.title} favicon`}
						w={32}
						width={32}
						h={32}
						bdrs={info.faviconRadius ?? "50%"}
					/>
					<Stack gap={0} flex="1">
						<Text>
							{info.title}
						</Text>
						<Text fz="xs" c="dimmed">
							{info.label}
						</Text>
					</Stack>
					<Box>
						<Text w={32} h="100%" ta="center" c="dimmed" fw={900} fz="lg">
							↗
						</Text>
					</Box>
				</Group>
			</Paper>
		</Anchor>
	)
};
