import { Box, Button, Center, Container, Flex, Group, Paper, Stack, Text, Title } from "@mantine/core";
import { IconArrowDown, IconExternalLink } from "@tabler/icons-react";
import { Titlecard } from "../Titlecard";

export const HeroSection = () => {
	return (
		<Stack w="100%" justify="center">
			<Container size="xl" mih="calc(80svh - 60px)" w="100%">
				<Stack align="start" justify="start" h="100%" w="100%" py="calc(var(--mantine-spacing-xl) * 5)">
					<Stack align="start" maw="500px" gap="xs">
						<Group gap="xs">
							<img src="/favicon.ico" alt="Open Evnt Logo" style={{ height: "32px", verticalAlign: "middle" }} />
							<Titlecard fw="bold" fz="h2" />
						</Group>
						<Title order={1}>
							A <Text inline inherit span td="underline">modern</Text> data format for social events
						</Title>
						<Text>
							Localizable, extensible and flexible data format for events, designed to be used in a wide range of applications and contexts.
						</Text>
						<Group gap={4}>
							<Button
								component="a"
								href="https://github.com/openevnt/evnt/blob/main/docs/README.md"
								target="_blank"
								rightSection={<IconExternalLink />}
								variant="light"
								color="gray.8"
							>
								Specification
							</Button>
							<Button
								component="a"
								href="#applications"
								rightSection={<IconArrowDown />}
								variant="light"
								color="green"
							>
								Apps
							</Button>
						</Group>
					</Stack>
				</Stack>
			</Container>
		</Stack>
	)


	return (
		<Flex mih="calc(100svh - 60px)" display="flex" w="100%">
			<Stack justify="space-between" align="start" w="100%">
				<Center flex="1" w="100%">
					<Stack>
						<Group justify="space-between" w="100%" wrap="nowrap">
							<Stack w="100%">
								<Stack gap={0} align="start">
									<Title order={1}>
										Open Evnt
									</Title>
									<Text>
										A modern data format for events.
									</Text>
								</Stack>

								<Stack gap={4}>


									<Group>

									</Group>
								</Stack>
							</Stack>
						</Group>
					</Stack>
				</Center>
				<Center p="md" w="100%">
					<Text>
						<IconArrowDown /> Learn more <IconArrowDown />
					</Text>
				</Center>
			</Stack>
		</Flex>
	)
};
