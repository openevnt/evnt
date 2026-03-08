import { Box, Center, Flex, Group, Paper, Stack, Text, Title } from "@mantine/core";
import { CodeHighlight } from "@mantine/code-highlight";
import { IconArrowDown, IconArrowRight } from "@tabler/icons-react";
import type { EventData } from "@evnt/schema";
import { UtilPartialDate } from "@evnt/schema/utils";

export const HeroSection = () => {
	const today = UtilPartialDate.today();

	const exampleData: EventData = {
		v: 0,
		name: { en: "Example Event" },
		venues: [
			{
				id: "0",
				name: { en: "Somewhere" },
				type: "unknown",
			},
		],
		instances: [
			{
				venueIds: ["0"],
				start: today,
			},
		],
	};

	const exampleDataString = `
v: 0,
name: { en: "Example Event" },
venues: [
	{
		id: "0",
		name: { en: "Somewhere" },
		type: "unknown",
	},
],
instances: [
	{
		venueIds: ["0"],
		start: "${today}",
	},
],
`.trim().replaceAll(/\t/gm, "  ");

	return (
		<Flex h="100dvh" display="flex">
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

						<Group w="100%">
							<CodeHighlight flex="1" language="js" code={exampleDataString} />
							<Box flex="0">
								<IconArrowRight />
							</Box>
							<Stack gap={0} flex="1">
								<Paper withBorder>
									<iframe
										title="Example Event"
										src={`https://vantage.deniz.blue/embed?${new URLSearchParams({
											"event-data": JSON.stringify(exampleData),
										})}`}
										width="400"
										height="300"
										style={{ border: "none" }}
									/>
								</Paper>
								<Text c="dimmed" fz="xs">
									Rendered using Vantage
								</Text>
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
