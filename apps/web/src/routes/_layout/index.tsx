import { createFileRoute } from "@tanstack/react-router";
import { ActionIcon, Container, Divider, Group, Stack, Title } from "@mantine/core";
import { IconDotsVertical, IconHome } from "@tabler/icons-react";
import { WidgetUpcomingEvents } from "../../components/app/home/widgets/WidgetUpcomingEvents";

export const Route = createFileRoute("/_layout/")({
	component: HomePage,
})

export default function HomePage() {


	return (
		<Container size="md">
			<Stack>
				<Group>
					<IconHome />
					<Title order={3}>
						Home
					</Title>
					<Divider flex="1" />
					<ActionIcon
						variant="subtle"
						color="gray"
						disabled
					>
						<IconDotsVertical />
					</ActionIcon>
				</Group>

				<WidgetUpcomingEvents />
			</Stack>
		</Container>
	)
}
