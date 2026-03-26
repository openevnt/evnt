import type { LinkComponent } from "@evnt/schema";
import { UtilTranslations } from "@evnt/schema/utils";
import { Button, Group, Stack, Text } from "@mantine/core";
import { IconExternalLink, IconLink, IconLinkOff } from "@tabler/icons-react";
import { Trans } from "../Trans";

export const EventLinkButton = ({
	value,
}: {
	value: LinkComponent;
}) => {
	const disabled = false;

	let subtitle: string | null = null;
	let dateSubtitle: string | null = null;
	let hideDate = false;

	return (
		<Button
			component={disabled ? "button" : "a"}
			href={value.url}
			target="_blank"

			leftSection={disabled ? <IconLinkOff /> : <IconLink />}

			color={disabled ? "gray.2" : undefined}
			variant="transparent"
			justify="start"
			size="compact-xs"
			ta="center"
			h="auto"
			p={0}
			styles={{
				section: { marginInlineEnd: 4 },
			}}
		>
			<Stack gap={0} py={subtitle ? 4 : "xs"} align="start">
				<Text inline c={disabled ? "gray.4" : undefined}>
					<Trans t={UtilTranslations.isEmpty(value.name) ? { en: "Link" } : value.name} /> <IconExternalLink size={14} />
				</Text>
				<Stack
					gap={0}
					fz="xs"
					c={disabled ? "gray.6" : "blue.4"}
					style={{ textWrap: "wrap" }}
					align="start"
				>
					<Text inline span ta="start" inherit fw="normal" pt={UtilTranslations.isEmpty(value.description) ? 0 : 4}>
						<Trans t={value.description} />
					</Text>

					<Stack gap={0} pt={subtitle ? 4 : 0}>
						<Group gap={4} justify="start">
							<Text inherit inline span>
								{subtitle}
							</Text>
						</Group>

						{!hideDate && dateSubtitle && (
							<Text inherit inline fw="normal">
								({dateSubtitle})
							</Text>
						)}
					</Stack>
				</Stack>
			</Stack>
		</Button>
	);
};
