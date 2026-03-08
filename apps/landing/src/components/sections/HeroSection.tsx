import { Button, Center, Flex, Group, Paper, Stack, Text, Title } from "@mantine/core";
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
		<Flex mih="calc(100svh - 60px)" display="flex">
			<Stack justify="space-between" align="start" w="100%">
				<Center flex="1" w="100%">
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

						<Group gap={4}>
							<Button
								component="a"
								href="https://github.com/deniz-blue/evnt"
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

						{cardPart}

						{/* <Box visibleFrom="sm">
							<Group w="100%" wrap="nowrap">
								{codePart}
								<Box flex="0">
									<IconArrowRight />
								</Box>
								{cardPart}
							</Group>
						</Box>
						<Box hiddenFrom="sm">
							<Stack w="100%" align="center">
								{codePart}
								<IconArrowDown />
								{cardPart}
							</Stack>
						</Box> */}
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
