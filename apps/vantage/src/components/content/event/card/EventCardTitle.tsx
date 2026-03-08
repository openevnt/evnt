import type { ReactNode } from "react";
import { useEventDetailsModal } from "../../../../hooks/app/useEventDetailsModal";
import { Anchor, Group, Loader, Skeleton, Stack, Text, Transition, type MantineTransition } from "@mantine/core";
import { useEventCardContext } from "./event-card-context";
import { UtilTranslations } from "@evnt/schema/utils";
import { Trans } from "../Trans";
import { Link } from "@tanstack/react-router";
import { EnvelopeErrorBadge } from "../envelope/EnvelopeErrorBadge";
import { useEventEnvelope } from "../event-envelope-context";

const loaderTransition: MantineTransition = {
	in: { opacity: 1, width: "1.5rem" },
	out: { opacity: 0, width: "0" },
	transitionProperty: "opacity, width",
} as const;

const loadingTextTransition: MantineTransition = {
	in: { opacity: 1, height: "1rem", marginLeft: "1.5rem" },
	out: { opacity: 0, height: "0", marginLeft: "0" },
	transitionProperty: "opacity, height, margin-left",
} as const;

export const EventCardTitle = () => {
	const { data, err } = useEventEnvelope();
	const { loading, variant, menu, embed, source } = useEventCardContext();
	const { key } = useEventDetailsModal();

	let title: ReactNode = <Text inherit inline span c="dimmed" fz="sm" fs="italic" children="<no title>" />;
	if (!!err) title = <Text inherit inline span c="dimmed" fz="sm" fs="italic" children="<unknown>" />;
	else if (!!loading) title = <Skeleton height="1rem" width="16ch" />;

	if (!!data && !UtilTranslations.isEmpty(data.name))
		title = <Trans t={data.name} />;
	else if (!!data)
		title = <Text inherit inline span c="dimmed" fz="sm" fs="italic" children="<no title>" />;

	return (
		<Group
			align="start"
			fz={variant === "inline" ? "xs" : undefined}
		>
			<Stack gap={0} flex="1">
				<Group gap={4} align="center">
					<Group gap={0} align="center" wrap="nowrap">
						<Transition
							mounted={!!loading}
							transition={loaderTransition}
						>
							{(styles) => <Loader size="xs" style={styles} />}
						</Transition>
						<Anchor
							c="unset"
							inherit
							renderRoot={(props) => (
								<Link
									to="."
									search={(old) => ({ ...old, [key]: source })}
									target={embed ? "_blank" : undefined}
									disabled={!source}
									{...props}
								/>
							)}
						>
							<Text
								fw={variant == "inline" ? undefined : "bold"}
								inherit
								span
								style={variant == "inline" ? {
									whiteSpace: "pre",
									textOverflow: "clip",
									overflow: "hidden",
								} : undefined}
							>
								{title}
							</Text>
						</Anchor>
					</Group>
					<EnvelopeErrorBadge />
				</Group>
				{variant !== "inline" && (
					<>
						<Text fz="sm" c="dimmed" inline span>
							{(!!data && "label" in data && data.label) && (
								<Trans t={data.label} />
							)}
						</Text>
						<Transition
							mounted={!data && !!loading}
							transition={loadingTextTransition}
						>
							{(styles) => (
								<Text style={styles} fz="xs" c="dimmed" fs="italic">loading...</Text>
							)}
						</Transition>
					</>
				)}
			</Stack>
			{menu}
		</Group>
	);
};