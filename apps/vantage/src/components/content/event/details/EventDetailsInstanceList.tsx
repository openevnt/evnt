import { Button, Center, CopyButton, Group, Paper, Stack, Text } from "@mantine/core";
import { ExternalLink } from "../../base/ExternalLink";
import { useResolvedEvent } from "../event-envelope-context";
import { UtilPartialDate, UtilPartialDateRange, UtilTranslations } from "~/lib/util/schema-utils";
import type { EventInstance, PartialDate, Venue } from "@evnt/schema";
import type { ReactNode } from "react";
import { IconCalendar, IconCalendarQuestion, IconCheck, IconCopy, IconExternalLink, IconMapPin, IconWorld, IconWorldPin } from "@tabler/icons-react";
import { Trans } from "../../Trans";
import { AddressSnippetLabel } from "../../address/AddressSnippetLabel";
import { useLocaleStore } from "../../../../stores/useLocaleStore";
import { TimeSnippetLabel } from "../../datetime/TimeSnippetLabel";
import { TimeRangeSnippetLabel } from "../../datetime/TimeRangeSnippetLabel";
import { PartialDateSnippetLabel } from "../../datetime/PartialDateSnippetLabel";
import { venueGoogleMapsLink, venueOpenStreetMapsLink } from "@evnt/pretty";
import { PartialDateUtil } from "@evnt/partial-date";

export const EventDetailsInstanceList = () => {
	const { data } = useResolvedEvent();

	const groupedByVenues = data?.instances?.reduce((acc, instance) => {
		const key = JSON.stringify(instance.venueIds.slice().sort());
		acc[key] ??= [];
		acc[key].push(instance);
		return acc;
	}, {} as Record<string, EventInstance[]>);

	const multipleGroups = Object.keys(groupedByVenues ?? {}).length > 1;

	return (
		<Stack gap="xs">
			{Object.entries(groupedByVenues ?? {})
				.map(([venueIdsJson, instances]) => [JSON.parse(venueIdsJson) as string[], instances] as const)
				.map(([venueIds, instances], i) => {
					const showVenuesFirst = (venueIds.length > 0) && (Object.keys(groupedByVenues ?? {}).length > 1);
					const venues = venueIds.map(venueId => data?.venues?.find(v => v.id === venueId)).filter((v): v is Venue => !!v);

					const instanceElements = instances.map((instance, j) => (
						<MiniBoxInstance key={j} instance={instance} />
					));

					const venueElements = venues.map((venue, j) => (
						<MiniBoxVenue key={j} venue={venue} />
					));

					return (
						<Paper
							key={i}
							bg={multipleGroups ? "rgba(0,0,0,0.1)" : "transparent"}
							p={multipleGroups ? "xs" : 0}
						>
							<Stack gap="xs">
								{showVenuesFirst ? venueElements : instanceElements}
								{showVenuesFirst ? instanceElements : venueElements}
							</Stack>
						</Paper>
					);
				})}
		</Stack>
	);
};

export const MiniBoxInstance = ({ instance }: { instance: EventInstance }) => {
	const language = useLocaleStore(state => state.language);

	if (!instance.start) return (
		<MiniBoxSnippet
			icon={<IconCalendarQuestion />}
			title={(
				<Text span inline inherit>
					{"<unknown date>"}
				</Text>
			)}
		/>
	);

	const monthShort = new Intl.DateTimeFormat(language, { month: "short" }).format(UtilPartialDate.toLowDate(instance.start));

	let icon: ReactNode = <IconCalendar />;
	if (PartialDateUtil.has(instance.start, "day")) {
		const parsed = UtilPartialDate.toComponents(instance.start);
		const day = "day" in parsed ? parsed.day : 1;
		icon = (
			<Stack gap={0} align="center">
				<Text span inherit>
					{day}
				</Text>
				<Text fz="xs" c="dimmed" span inline inherit>
					{monthShort}
				</Text>
			</Stack>
		);
	}
	else if (PartialDateUtil.has(instance.start, "month"))
		icon = (
			<Stack gap={0} align="center">
				<Text span inherit>
					{monthShort}
				</Text>
			</Stack>
		);


	let title: ReactNode = null;
	let subtitle: ReactNode = null;
	let fmtSubtitle = true;

	if (instance.end) {
		const bothHasTime = UtilPartialDateRange.bothHasTime(instance);
		const isSameDay = UtilPartialDateRange.isSameDay(instance);
		const isSameTime = UtilPartialDate.getTimePart(instance.start) === UtilPartialDate.getTimePart(instance.end);

		if (isSameDay) {
			title = <PartialDateSnippetLabel value={UtilPartialDate.getDatePart(instance.start)} />;
			if (bothHasTime && !isSameTime)
				subtitle = <TimeRangeSnippetLabel value={{
					start: {
						value: UtilPartialDate.getTimePart(instance.start)!,
						day: UtilPartialDate.asDay(instance.start),
					},
					end: {
						value: UtilPartialDate.getTimePart(instance.end)!,
						day: UtilPartialDate.asDay(instance.end),
					},
				}} />;
			else if (UtilPartialDate.hasTime(instance.start))
				subtitle = <TimeSnippetLabel value={UtilPartialDate.getTimePart(instance.start)!} day={UtilPartialDate.asDay(instance.start)} />;
		} else {
			title = <PartialDateSnippetLabel value={instance.start} />;
			subtitle = <PartialDateSnippetLabel value={instance.end} />;
			fmtSubtitle = false;
		}
	} else {
		title = <PartialDateSnippetLabel value={UtilPartialDate.getDatePart(instance.start)} />;
		if (UtilPartialDate.hasTime(instance.start))
			subtitle = <TimeSnippetLabel value={UtilPartialDate.getTimePart(instance.start)!} day={UtilPartialDate.asDay(instance.start)} />;
	}

	return (
		<MiniBoxSnippet
			icon={icon}
			title={title}
			subtitle={fmtSubtitle ? (
				<Text span inherit inline c="dimmed" fz="sm">
					{subtitle}
				</Text>
			) : subtitle}
		/>
	);
};

export const MiniBoxVenue = ({ venue }: { venue: Venue }) => {
	let icon = <IconWorldPin />;
	if (venue.$type === "directory.evnt.venue.online") icon = <IconWorld />;
	else if (venue.$type === "directory.evnt.venue.physical") icon = <IconMapPin />;

	let title = undefined;
	if (UtilTranslations.isEmpty(venue.name)) title = (
		<Text inline span inherit c="dimmed" fs="italic">
			{"<unnamed>"}
		</Text>
	);
	else title = <Trans t={venue.name} />;

	let subtitle = undefined;
	if (venue.$type === "directory.evnt.venue.physical" && venue.address) subtitle = <AddressSnippetLabel value={venue.address} withCopyButton />;
	else if (venue.$type === "directory.evnt.venue.online" && venue.url) subtitle = <ExternalLink href={venue.url} />;

	let links = [
		{
			link: venueGoogleMapsLink(venue),
			label: "Google Maps",
		},
		{
			link: venueOpenStreetMapsLink(venue),
			label: "OpenStreetMap",
		},
	].filter(l => !!l.link).map((l, i) => (
		<Button
			component="a"
			href={l.link!}
			target="_blank"
			size="compact-xs"
			color="gray"
			variant="light"
			rightSection={<IconExternalLink size={12} />}
			key={i}
		>
			{l.label}
		</Button>
	));

	return (
		<MiniBoxSnippet
			icon={icon}
			title={(
				<Text span inline inherit>
					{title}
				</Text>
			)}
			subtitle={(
				<Stack gap="xs">
					<Text span inherit inline c="dimmed">
						{subtitle}
					</Text>
					{links.length > 0 && (
						<Group gap="xs">
							{links}
						</Group>
					)}
				</Stack>
			)}
		/>
	);
};

export const MiniBoxSnippet = ({
	icon,
	title,
	subtitle,
}: {
	icon?: ReactNode;
	title?: ReactNode;
	subtitle?: ReactNode;
}) => {
	return (
		<Group gap="xs" wrap="nowrap" align={"flex-start"}>
			<Paper
				w="3rem"
				miw="3rem"
				h="3rem"
				mih="3rem"
				display="flex"
				withBorder
				bg="dark.6"
			>
				<Center h="100%" w="100%">
					{icon}
				</Center>
			</Paper>
			<Stack gap={4} pt={7}>
				{title}
				{subtitle}
			</Stack>
		</Group>
	);
};
