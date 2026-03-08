import { Box, Flex, Stack, Text, Title } from "@mantine/core";

export const HeroSection = () => {
	return (
		<Flex h="100dvh" display="flex" align="center" justify="center">
			<Stack align="start">
				<Title order={1}>
					EVNT
				</Title>
				<Text>
					A standardized, open-source data format for representing events
				</Text>
			</Stack>
		</Flex>
	)
};
