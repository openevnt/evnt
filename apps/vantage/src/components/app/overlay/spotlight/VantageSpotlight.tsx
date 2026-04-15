import { Spotlight } from "@mantine/spotlight";
import { IconCalendar, IconSearch } from "@tabler/icons-react";
import { useState, type ReactNode } from "react";
import { UtilEventSource, type EventSource } from "../../../../db/models/event-source";
import { useNavigate } from "@tanstack/react-router";
import { useCacheEventsStore } from "../../../../lib/cache/useCacheEventsStore";
import { useShallow } from "zustand/shallow";
import { useEventQuery } from "../../../../db/useEventQuery";
import { EventCardContext } from "../../../content/event/card/event-card-context";
import { EventCardBackground } from "../../../content/event/card/EventCardBackground";
import { Box, Loader, Paper } from "@mantine/core";
import { useActionsStore, type Action } from "./useActionsStore";
import { useTranslations } from "../../../../stores/useLocaleStore";
import { EVENT_REDIRECTOR_URL } from "../../../../constants";
import { trynull } from "../../../../lib/util/trynull";

export const VantageSpotlight = () => {
	const [query, setQuery] = useState("");
	const navigate = useNavigate();
	const providedActions = useActionsStore(state => state.actions);
	const searchResults = useCacheEventsStore(
		useShallow(state => Object.entries(state.cache.byText)
			.filter(([text]) => text.toLowerCase().includes(query.toLowerCase()))
			.flatMap(([, sources]) => sources)
		)
	);

	const actions: Action[] = [];
	actions.push(...Object.values(providedActions));

	const filteredActions = actions
		.filter(props => props.label?.toLowerCase().includes(query.toLowerCase()));

	const asUrl = trynull(() => new URL(query));

	const maybeFromRedirector = asUrl && query.startsWith(EVENT_REDIRECTOR_URL) ? asUrl.searchParams.get("url") || asUrl.searchParams.get("at") : null;

	if (!!maybeFromRedirector)
		filteredActions.push({
			label: "View Event",
			icon: <IconCalendar />,
			execute: () => navigate({
				to: "/event",
				search: { source: maybeFromRedirector },
			}),
		});
	else if (UtilEventSource.is(query, false))
		filteredActions.push({
			label: "View Event",
			icon: <IconCalendar />,
			execute: () => navigate({
				to: "/event",
				search: { source: query },
			}),
		});

	const categorizedActions = filteredActions
		.reduce((acc, cur) => ({
			...acc,
			[cur.category || ""]: [...acc[cur.category || ""] || [], cur],
		}), {} as Record<string, Action[]>);

	const elements: ReactNode[] = Object.entries(categorizedActions).map(([category, actions]) => (
		<Spotlight.ActionsGroup key={category} label={category}>
			{actions.map((action, index) => (
				<Spotlight.Action
					key={index}
					onClick={action.execute}
					leftSection={action.icon}
					label={action.label}
				/>
			))}
		</Spotlight.ActionsGroup>
	));

	if (!!searchResults.length)
		elements.push(
			<Spotlight.ActionsGroup label="Events">
				{searchResults.map(source => (
					<SplotlightEventAction
						key={source}
						source={source}
					/>
				))}
			</Spotlight.ActionsGroup>
		);

	return (
		<Spotlight.Root
			query={query}
			onQueryChange={setQuery}
			triggerOnContentEditable
			tagsToIgnore={[]}
			shortcut={[
				"mod + K",
				"F1",
				"mod + shift + P",
			]}
			styles={{
				inner: {
					padding: "2rem",
					overflow: "scroll",
				},
				content: {
					overflow: "visible",
					borderRadius: "var(--mantine-radius-md)",
				},
			}}
		>
			<Box pos="relative">
				<Paper
					shadow="xl"
					withBorder
					radius="md"
					style={{
						position: "sticky",
						top: 0,
						zIndex: 1,
					}}
				>
					<Spotlight.Search
						placeholder="Search..."
						leftSection={<IconSearch size={16} />}
					/>
				</Paper>
				<Spotlight.ActionsList
					styles={{
						actionsList: {
							border: "none",
						},
					}}
				>
					{elements.length > 0 ? elements : <Spotlight.Empty>Nothing found...</Spotlight.Empty>}
				</Spotlight.ActionsList>
			</Box>
		</Spotlight.Root>
	);
};

export const SplotlightEventAction = ({ source }: { source: EventSource }) => {
	const navigate = useNavigate();
	const t = useTranslations();
	const query = useEventQuery(source);

	const label = t(query.data?.data?.name);

	return (
		<Box pos="relative" style={{ overflow: "hidden" }}>
			<EventCardContext
				value={{
					data: null,
					...query.data,
					loading: query.isFetching,
				}}
			>
				<EventCardBackground backgroundOpacity={0.5} />
				<Spotlight.Action
					label={label || "Loading..."}
					description="Event"
					leftSection={<IconCalendar />}
					rightSection={query.isFetching && <Loader size="xs" />}
					onClick={() => navigate({
						to: "/event",
						search: { source },
					})}
					pos="relative"
				/>
			</EventCardContext>
		</Box>
	);
};
