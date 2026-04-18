import { Stack, Text } from "@mantine/core";
import { SmallTitle } from "../../base/SmallTitle";
import { UtilEventSource, type EventSource } from "../../../../db/models/event-source";
import { IconAt, IconBraces, IconDatabase, IconExternalLink, IconWorld } from "@tabler/icons-react";
import { BaseSnippet } from "../../Snippet";
import { EventLinkButtonBase } from "../link/EventLinkButtonBase";

export const EventDetailsSource = ({ source }: { source?: EventSource }) => {
	return (
		<Stack gap={0} component="section">
			<SmallTitle>
				source
			</SmallTitle>

			{source && UtilEventSource.getType(source) === "local" && (
				<BaseSnippet icon={<IconDatabase />}>
					<Text inline>
						Browser/Device
					</Text>
				</BaseSnippet>
			)}

			{source && UtilEventSource.getType(source) === "at" && (
				<Stack gap={4}>
					<BaseSnippet icon={<IconAt />}>
						<Text inline>
							AT Protocol
						</Text>
					</BaseSnippet>

					<EventLinkButtonBase
						url={`https://pds.ls/${source}`}
						leftSection={<img src="https://pds.ls/favicon.ico" alt="PDSls" width={24} height={24} />}
					>
						<Text inherit span mr={4}>
							View on PDSls
						</Text> <IconExternalLink size={14} />
					</EventLinkButtonBase>
				</Stack>
			)}

			{source && UtilEventSource.getType(source).startsWith("http") && (
				<Stack gap={4}>
					<BaseSnippet icon={<IconWorld />}>
						<Text inline>
							Internet
						</Text>
					</BaseSnippet>
					<EventLinkButtonBase
						leftSection={<IconBraces />}
						url={source}
					>
						<Text inherit span mr={4}>
							View raw data
						</Text> <IconExternalLink size={14} />
					</EventLinkButtonBase>
				</Stack>
			)}
		</Stack>
	)
};
