import { ActionIcon, Anchor, AppShell, Button, Code, Container, Flex, Group, Loader, Space, Text, Title, type ActionIconProps, type ButtonProps } from "@mantine/core";
import { createFileRoute, Link, Outlet, useMatches, useNavigate, type ErrorComponentProps, createLink } from "@tanstack/react-router"
import { IconCalendar, IconCalendarPlus, IconHome, IconList, IconSearch, IconSettings } from "@tabler/icons-react";
import z from "zod";
import { zodValidator } from "@tanstack/zod-adapter";
import { SettingsDrawer } from "../../components/app/overlay/settings/SettingsDrawer";
import { useSettingsOverlay } from "../../hooks/app/search-param-modals";
import { useHotkeys } from "@mantine/hooks";
import { EventSourceSchema } from "../../db/models/event-source";
import { useIsFetching } from "@tanstack/react-query";
import { useTasksStore } from "../../stores/useTasksStore";
import { Fragment } from "react/jsx-runtime";
import { ViewIndexOverlay } from "../../components/app/overlay/index/ViewIndexOverlay";
import { EventDetailsOverlay } from "../../components/app/overlay/event/EventDetailsOverlay";
import { AddEventMenu } from "../../components/app/AddEventMenu";
import { VantageSpotlight } from "../../components/app/overlay/spotlight/VantageSpotlight";
import { spotlight } from "@mantine/spotlight";
import { useProvideAction } from "../../components/app/overlay/spotlight/useAction";

const SearchParamsSchema = z.object({
	settings: z.string().optional(),
	event: EventSourceSchema.optional(),
	"view-index": z.string().optional(),
});

export const Route = createFileRoute("/_layout")({
	component: LayoutPage,
	validateSearch: zodValidator(SearchParamsSchema),
	errorComponent: ErrorBoundary,
})

function LayoutPage() {
	const navigate = useNavigate();

	const spaceless = useMatches({
		select: (matches) => matches.some((match) => match.staticData?.spaceless),
	});

	const hasEventForm = useMatches({
		select: (matches) => matches.some((match) => match.staticData?.hasEventForm),
	});

	useProvideAction({
		label: "Go to Home",
		category: "Navigation",
		icon: <IconHome />,
		execute: () => navigate({ to: "/" }),
	});

	useProvideAction({
		label: "Go to List view",
		category: "Navigation",
		icon: <IconList />,
		execute: () => navigate({ to: "/list" }),
	});

	useProvideAction({
		label: "Go to Calendar view",
		category: "Navigation",
		icon: <IconCalendar />,
		execute: () => navigate({ to: "/calendar" }),
	});

	useProvideAction({
		label: "Create new event",
		category: "Navigation",
		icon: <IconCalendarPlus />,
		execute: () => navigate({ to: "/new" }),
	});

	useProvideAction({
		label: "Toggle Settings",
		category: "Navigation",
		icon: <IconSettings />,
		execute: () => navigate({
			to: ".",
			search: prev => ({
				...prev,
				settings: prev.settings !== undefined ? undefined : "",
			}),
		}),
	});

	return (
		<AppShell
			header={{
				height: "calc(60px + env(safe-area-inset-top, 0px))",
			}}
			mb="env(safe-area-inset-bottom, 0px)"
			padding={spaceless ? 0 : "xs"}
		>
			<AppShell.Header pt="env(safe-area-inset-top, 0px)">
				<Group gap={0} p="xs" align="center" h="100%" w="100%" justify="space-between">
					<Group gap={4}>
						<Logo />
						<Group gap={4}>
							<Link to="/list">
								{({ isActive }) => (
									<NavButton
										icon={<IconList />}
										isActive={isActive}
									/>
								)}
							</Link>
							<Link to="/calendar">
								{({ isActive }) => (
									<NavButton
										icon={<IconCalendar />}
										isActive={isActive}
									/>
								)}
							</Link>
						</Group>
					</Group>
					<Group gap={4}>
						<ActionIcon
							color="gray"
							size="input-md"
							onClick={spotlight.toggle}
						>
							<IconSearch />
						</ActionIcon>
						{!hasEventForm && (
							<AddEventMenu />
						)}
						<ActionIcon
							size="input-md"
							color="gray"
							renderRoot={(props) => (
								<Link
									to="."
									search={prev => ({
										...prev,
										settings: prev.settings !== undefined ? undefined : "",
									})}
									{...props}
								/>
							)}
						>
							<IconSettings />
						</ActionIcon>
					</Group>
				</Group>
			</AppShell.Header>
			<AppShell.Main>
				<Outlet />
				<Overlays />
				<Shortcuts />
				<VantageSpotlight />
				{!spaceless && <Space h="30vh" />}
			</AppShell.Main>
		</AppShell>
	)
}

const NavButton = ({
	icon,
	isActive,
}: {
	icon: React.ReactNode;
	isActive?: boolean;
}) => {
	return (
		<ActionIcon
			color="gray"
			size="input-md"
			variant={isActive ? "light" : "subtle"}
		>
			{icon}
		</ActionIcon>
	);
};

const Overlays = () => {
	const { toggle: toggleSettings, useValue } = useSettingsOverlay();
	const settingsIsOpen = useValue();

	return (
		<Fragment>
			<SettingsDrawer
				isOpen={settingsIsOpen !== undefined}
				close={toggleSettings}
			/>
			<ViewIndexOverlay />
			<EventDetailsOverlay />
		</Fragment>
	);
};

const Shortcuts = () => {
	const { toggle: toggleSettings } = useSettingsOverlay();

	useHotkeys([
		["mod + O", () => toggleSettings("")],
		["mod + ,", () => toggleSettings("")],
	], []);
	useHotkeys([["O", () => toggleSettings("")]]);

	return null;
};

const Logo = () => {
	const fetchingAmount = useIsFetching();
	const tasks = useTasksStore((state) => state.tasks);

	const loading = !!fetchingAmount || !!tasks.length;

	return (
		<Link to="/">
			<ActionIcon
				size="input-md"
				variant="subtle"
				color="gray"
				p={0}
			>
				<Flex align="center" justify="center">
					<img src="/icon.svg" alt="@evnt Viewer Logo" width={32} height={32} style={{
						scale: loading ? "0.7" : "1",
						transition: "0.2s",
					}} />
					<Loader
						pos="absolute"
						width="100%"
						height="100%"
						style={{
							opacity: loading ? 1 : 0,
							transition: "0.2s",
						}}
					/>
				</Flex>
			</ActionIcon>
		</Link>
	);
};

export function ErrorBoundary({ error, reset, info }: ErrorComponentProps) {
	let title = "";
	let codeContent = "";

	if (error instanceof Error) {
		title = error.message;
		codeContent = error.stack || "";
	} else {
		title = "Unknown Error";
		codeContent = String(error);
	}

	if (info?.componentStack) codeContent += `\n\nComponent Stack:\n${info.componentStack}`;

	return (
		<Container my="xl" size="sm" py="xl">
			<Title>
				Fuck
			</Title>

			<Text>
				The Application crashed! Please report the following error to the developers:
			</Text>

			<Text>
				{title}
			</Text>

			<Code block>
				{codeContent}
			</Code>

			<Anchor component="button" onClick={() => reset()} mt="md" display="block">
				Reset
			</Anchor>
		</Container>
	);
};
