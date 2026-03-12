import { Alert, Box, Button, Center, Flex, Group, Paper, Stack, Text, Title } from "@mantine/core";
import { IconArrowDown, IconExternalLink } from "@tabler/icons-react";
import type { EventData } from "@evnt/schema";

export const HeroSection = () => {
	const exampleData: EventData = {
		v: 0,
		name: { en: "Some Hackathon" },
		venues: [
			{
				id: "0",
				name: { en: "Somewhere" },
				type: "physical",
			},
			{
				id: "1",
				name: { en: "And Online" },
				type: "online",
				url: "https://example.com",
			},
		],
		instances: [
			{
				venueIds: ["0", "1"],
				start: "2027-03-08T09:00",
				end: "2027-03-08T18:00",
			},
			{
				venueIds: ["0", "1"],
				start: "2027-03-09T09:00",
				end: "2027-03-09T18:00",
			},
		],
	};

	const cardPart = (
		<Stack gap={0}>
			<Paper withBorder w="calc(min(100%, 400px))" h={200}>
				<iframe
					title="Example Event"
					src={`https://vantage.deniz.blue/embed?${new URLSearchParams({
						data: JSON.stringify(exampleData),
					})}`}
					style={{ border: "none", margin: 0, padding: 0, width: "100%", height: "100%" }}
				/>
			</Paper>
			<Text c="dimmed" fz="xs">
				Rendered using Vantage
			</Text>
		</Stack>
	);

	return (
		<Flex mih="calc(100svh - 60px)" display="flex" w="100%">
			<Stack justify="space-between" align="start" w="100%">
				<Center flex="1" w="100%">
					<Stack>
						<Group justify="space-between" w="100%" wrap="nowrap">
							<Stack w="100%">
								<Stack gap={0} align="start">
									<Text size="xs" c="dimmed">
										(Open Evnt)
									</Text>
									<Title order={1}>
										EVNT
									</Title>
									<Text>
										A standardized, open-source data format for representing events
									</Text>
								</Stack>

								<Stack gap={4}>
									<Group gap={4}>
										<Button
											component="a"
											href="https://github.com/openevnt/evnt"
											target="_blank"
											rightSection={<IconExternalLink />}
											variant="light"
										>
											GitHub
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

									<Group>
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
									</Group>
								</Stack>

								<Box hiddenFrom="sm">
									{cardPart}
								</Box>
							</Stack>
							<Box visibleFrom="sm">
								{cardPart}
							</Box>
						</Group>

						<Alert color="dark.8" variant="light">
							<Text inherit>
								Events are complicated. Existing tooling is too unspecific and flawed. We aim to fix that.
							</Text>
						</Alert>
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
