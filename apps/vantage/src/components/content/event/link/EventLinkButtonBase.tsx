import { Button } from "@mantine/core";
import { IconLink, IconLinkOff } from "@tabler/icons-react";
import type { PropsWithChildren } from "react";

export const EventLinkButtonBase = ({
	children,
	url,
	disabled,
	leftSection,
}: PropsWithChildren<{
	url?: string;
	disabled?: boolean;
	leftSection?: React.ReactNode;
}>) => {
	return (
		<Button
			component={disabled ? "button" : "a"}
			href={url}
			target="_blank"

			leftSection={leftSection || (disabled ? <IconLinkOff /> : <IconLink />)}

			color={disabled ? "gray.2" : undefined}
			variant="transparent"
			justify="start"
			size="compact-xs"
			ta="center"
			h="auto"
			p={0}
			styles={{
				section: { marginInlineEnd: 4 },
				label: { overflow: "visible" },
			}}
			fz="unset"
			fw="unset"
		>
			{children}
		</Button>
	);
};
