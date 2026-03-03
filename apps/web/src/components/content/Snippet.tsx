import type { PlaceholderHint, SnippetIcon, SnippetLabel, TSnippet } from "@evnt/pretty";
import { Anchor, Box, Group, Stack, Text, Tooltip } from "@mantine/core";
import { useCallback, useMemo, type PropsWithChildren, type ReactNode } from "react";
import { Trans } from "./event/Trans";
import { AddressSnippetLabel } from "./address/AddressSnippetLabel";
import { IconCalendar, IconClock, IconExternalLink, IconLocationQuestion, IconMapPin, IconWorld, IconWorldPin } from "@tabler/icons-react";
import { TimeSnippetLabel } from "./datetime/TimeSnippetLabel";
import { PartialDateSnippetLabel } from "./datetime/PartialDateSnippetLabel";
import { TimeRangeSnippetLabel } from "./datetime/TimeRangeSnippetLabel";
import { PartialDateRangeSnippetLabel } from "./datetime/PartialDateRangeSnippetLabel";
import { ExternalLink } from "./base/ExternalLink";

export const Snippet = ({
	snippet,
	noSublabel,
}: {
	snippet: TSnippet;
	noSublabel?: boolean;
}) => {
	const icon: ReactNode = ({
		"venue-physical": <IconMapPin />,
		"venue-online": <IconWorld />,
		"venue-mixed": <IconWorldPin />,
		"venue-unknown": <IconWorldPin />,
		calendar: <IconCalendar />,
		clock: <IconClock />,
		_: null,
	} as Partial<Record<SnippetIcon | "_", ReactNode>>)[snippet.icon ?? "_"] ?? null;

	const getLabelNode = useCallback((label?: SnippetLabel) => {
		if (!label) return null;

		if (label.type === "text") return <Text inline span inherit>{label.value}</Text>;
		if (label.type === "translations") return (
			<Text inline span inherit>
				<Trans t={label.value} />
			</Text>
		);
		if (label.type === "placeholder") return (
			<Text inline span inherit c="dimmed" fs="italic">
				{({
					"unknown": "<unknown>",
					"unnamed": "<unnamed>",
				} as Record<PlaceholderHint, string>)[label.hint] ?? "Placeholder"}
			</Text>
		);
		if (label.type === "address") return <AddressSnippetLabel value={label.value} />;
		if (label.type === "time") return <TimeSnippetLabel value={label.value} day={label.day} />;
		if (label.type === "time-range") return <TimeRangeSnippetLabel value={label.value} />;
		if (label.type === "date-time-range") return <PartialDateRangeSnippetLabel value={label.value} />;
		if (label.type === "partial-date" || label.type == "date-time") return <PartialDateSnippetLabel value={label.value} />;
		if (label.type === "external-link") return <ExternalLink href={label.url} children={label.name} />;

		return null;
	}, []);

	let label: ReactNode = useMemo(() => getLabelNode(snippet.label), [snippet.label]);
	let sublabel: ReactNode = useMemo(() => getLabelNode(snippet.sublabel), [snippet.sublabel]);

	return (
		<BaseSnippet icon={icon}>
			{label}
			{!noSublabel && sublabel && (
				<Text span inline inherit fz="sm" c="dimmed">
					{sublabel}
				</Text>
			)}
		</BaseSnippet>
	);
};

export const BaseSnippet = ({
	icon,
	children,
}: PropsWithChildren<{
	icon?: ReactNode;
}>) => {
	return (
		<Group gap={4} wrap="nowrap" align="start">
			<Box miw={24} mah={24} display="flex">
				{icon}
			</Box>
			<Stack flex="1" gap="calc(1rem - 12px)" pt="calc(1rem - 12px)" align="start">
				{children}
			</Stack>
		</Group>
	);
};
