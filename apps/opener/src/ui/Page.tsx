import { useEffect, useState } from "react";
import { BroadcastChannelKey, getInstanceUrl } from "../api";
import { Anchor, Code, Collapse, Container, Group, Image, Paper, Spoiler, Stack, Text } from "@mantine/core";
import { usePublicInstances, type Redirectable } from "./instance-list";
import { useUIMessage } from "./ui-stores";

export const Page = () => {
	const [preferredInstanceUrl, setPreferredInstanceUrl] = useState<string | null>(getInstanceUrl());
	const redirectables = usePublicInstances();
	const message = useUIMessage();

	useEffect(() => {
		new BroadcastChannel(BroadcastChannelKey).onmessage = () => {
			setPreferredInstanceUrl(getInstanceUrl());
		};
	}, []);

	return (
		<Container size="xs" my="md">
			<Stack align="center" w="100%">
				<Text ta="center" fw="bold">
					{message}
				</Text>

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
		</Container>
	)
}



export const InstanceCard = ({
	info,
}: {
	info: Redirectable;
}) => {
	const [iconLoaded, setIconLoaded] = useState(false);

	// const isProtocol = info.url.startsWith("web+evnt://");

	// const name = isProtocol
	// 	? "web+evnt"
	// 	: (info.name || new URL(info.url).host);

	// const label = isProtocol
	// 	? `Protocol Handler`
	// 	: new URL(info.url).origin;

	// const href = useMemo(() => {
	// 	const intentStr = new URLSearchParams(intent ?? {}).toString();
	// 	if (!info.redirectTo) return info.url + "?" + intentStr;

	// 	let map: Partial<Record<string, string>> = {
	// 		intent: intentStr,
	// 	};

	// 	if (intent?.at) {
	// 		const r = parseResourceUri(intent.at);
	// 		if (r.ok) {
	// 			map["aturi"] = intent.at;
	// 			map["aturi-repository"] = r.value.repo;
	// 			map["aturi-collection"] = r.value.collection;
	// 			map["aturi-rkey"] = r.value.rkey;
	// 		};
	// 	}

	// 	return info.redirectTo.replace(/{([^}]+)}/g, (_, key) => {
	// 		return map[key] || "";
	// 	});
	// }, [info, intent]);

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
				className="instance-card"
				shadow="sm"
				p="xs"
			>
				<Group wrap="nowrap" gap="xs">
					<Collapse expanded={!!iconLoaded} orientation="vertical">
						<Image
							src={info.faviconUrl}
							alt={`${info.title} favicon`}
							w={32}
							h={32}
							onLoad={() => setIconLoaded(true)}
							bdrs={info.faviconRadius ?? "50%"}
						/>
					</Collapse>
					<Stack gap={0} flex="1">
						<Text>
							{info.title}
						</Text>
						<Text fz="xs" c="dimmed">
							{info.label}
						</Text>
					</Stack>
				</Group>
			</Paper>
		</Anchor>
	)
};
