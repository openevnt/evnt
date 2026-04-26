import { ActionIcon, AppShell, Group, Text, Tooltip } from "@mantine/core";
import { IconBrandBluesky, IconBrandDiscord, IconBrandGithub, IconBrandMatrix } from "@tabler/icons-react";
import type { PropsWithChildren } from "react";
import { Titlecard } from "./Titlecard";

export const Layout = ({ children }: PropsWithChildren) => {
	return (
		<AppShell
			header={{
				height: 60,
			}}
		>
			<AppShell.Header>
				<Group justify="space-between" align="center" h="100%" px="md">
					<Group>
						<Text size="lg" fw="bold">
							<Titlecard />
						</Text>
					</Group>
					<Group>

					</Group>
					<Group gap={4}>
						<Tooltip label="BlueSky" withArrow>
							<ActionIcon
								component="a"
								href="https://bsky.app/profile/evnt.directory"
								variant="transparent"
								size="lg"
							>
								<IconBrandBluesky />
							</ActionIcon>
						</Tooltip>
						<Tooltip label="Discord" withArrow>
							<ActionIcon
								component="a"
								href="https://deniz.blue/discord-invite?id=1493641727980994710"
								variant="transparent"
								size="lg"
							>
								<IconBrandDiscord />
							</ActionIcon>
						</Tooltip>
						<Tooltip label="Matrix" withArrow>
							<ActionIcon
								component="a"
								href="https://matrix.to/#/#evnt:catgirl.cloud"
								variant="transparent"
								size="lg"
							>
								<IconBrandMatrix />
							</ActionIcon>
						</Tooltip>
						<Tooltip label="View on GitHub" withArrow>
							<ActionIcon
								component="a"
								href="https://github.com/openevnt/evnt"
								variant="transparent"
								size="lg"
							>
								<IconBrandGithub />
							</ActionIcon>
						</Tooltip>
					</Group>
				</Group>
			</AppShell.Header>
			<AppShell.Main>
				{children}
			</AppShell.Main>
		</AppShell>
	)
};
