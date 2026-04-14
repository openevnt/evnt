import { ActionIcon, Anchor, AppShell, Burger, Center, Code, Container, Flex, Group, Loader, NavLink, Space, Text, Title, type ActionIconProps } from "@mantine/core";
import { createFileRoute, Link, Outlet, useMatches, type ErrorComponentProps } from "@tanstack/react-router"
import { IconCalendar, IconList, IconMenu2, IconSearch, IconSettings } from "@tabler/icons-react";
import z from "zod";
import { zodValidator } from "@tanstack/zod-adapter";
import { SettingsDrawer } from "../../components/app/overlay/settings/SettingsDrawer";
import { useSettingsOverlay } from "../../hooks/app/search-param-modals";
import { useDisclosure, useHotkeys } from "@mantine/hooks";
import { EventSourceSchema } from "../../db/models/event-source";
import { useIsFetching } from "@tanstack/react-query";
import { useTasksStore } from "../../stores/useTasksStore";
import { Fragment } from "react/jsx-runtime";
import { ViewIndexOverlay } from "../../components/app/overlay/index/ViewIndexOverlay";
import { EventDetailsOverlay } from "../../components/app/overlay/event/EventDetailsOverlay";
import { AddEventMenu } from "../../components/app/AddEventMenu";
import { VantageSpotlight } from "../../components/app/overlay/spotlight/VantageSpotlight";
import { spotlight } from "@mantine/spotlight";
import { useProvideNavActions } from "../../hooks/actions/useProvideNavActions";

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
	const [isNavbarOpened, { toggle: toggleNavbar }] = useDisclosure();

	const spaceless = useMatches({
		select: (matches) => matches.some((match) => match.staticData?.spaceless),
	});

	const hasEventForm = useMatches({
		select: (matches) => matches.some((match) => match.staticData?.hasEventForm),
	});

	useProvideNavActions();

	return (
		<AppShell
			header={{
				height: "calc(60px + env(safe-area-inset-top, 0px))",
			}}
			navbar={{ width: 300, breakpoint: "sm", collapsed: { desktop: true, mobile: !isNavbarOpened } }}
			mb="env(safe-area-inset-bottom, 0px)"
			padding={spaceless ? 0 : "xs"}
		>
			<AppShell.Navbar>
				<NavLink
					leftSection={<IconList />}
					label="List View"
					component={Link}
					to="/list"
				/>
				<NavLink
					leftSection={<IconCalendar />}
					label="Calendar View"
					component={Link}
					to="/calendar"
				/>
			</AppShell.Navbar>
			<AppShell.Header pt="env(safe-area-inset-top, 0px)">
				<Group gap={0} p="xs" align="center" h="100%" w="100%" justify="space-between">
					<Group gap={4}>
						<ActionIcon
							color="gray"
							variant="transparent"
							aria-label="Toggle navigation menu"
							onClick={toggleNavbar}
							size="input-md"
							hiddenFrom="sm"
						>
							<IconMenu2 />
						</ActionIcon>
						<Logo />
						<Group gap={4}>
							<Link to="/list">
								{({ isActive }) => (
									<NavButton
										icon={<IconList />}
										isActive={isActive}
										aria-label="List View"
									/>
								)}
							</Link>
							<Link to="/calendar">
								{({ isActive }) => (
									<NavButton
										icon={<IconCalendar />}
										isActive={isActive}
										aria-label="Calendar View"
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
							aria-label="Search and Actions"
						>
							<IconSearch />
						</ActionIcon>
						{!hasEventForm && (
							<AddEventMenu />
						)}
						<ActionIcon
							size="input-md"
							color="gray"
							aria-label="Settings"
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
	...props
}: {
	icon: React.ReactNode;
	isActive?: boolean;
} & React.AriaAttributes) => {
	return (
		<ActionIcon
			color="gray"
			size="input-md"
			variant={isActive ? "light" : "subtle"}
			{...props}
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
				aria-label="Home"
			>
				<Flex align="center" justify="center">
					<img
						src="/icon.svg"
						alt="@evnt Viewer Logo"
						aria-hidden
						width={32}
						height={32}
						style={{
							scale: loading ? "0.7" : "1",
							transition: "0.2s",
						}}
					/>
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

			<Text my="md">
				The Application crashed! This means that Deniz fucked up. Here's what we know about the crash, please send her a screenshot of this and the steps to reproduce if possible so she can fix it:
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
