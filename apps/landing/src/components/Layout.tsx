import { ActionIcon, AppShell, Group, Text, Tooltip } from "@mantine/core";
import { IconBrandBluesky, IconBrandGithub } from "@tabler/icons-react";
import type { PropsWithChildren } from "react";

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
							Open Evnt
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
						<Tooltip label="View on GitHub" withArrow>
							<ActionIcon
								component="a"
								href="https://github.com/deniz-blue/evnt"
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
