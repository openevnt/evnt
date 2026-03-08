import { Stack, Title } from "@mantine/core";
import type { PropsWithChildren } from "react";

export const Section = ({
	title,
	children,
}: PropsWithChildren<{
	title?: React.ReactNode;
}>) => {
	return (
		<Stack component="section">
			<Title order={2}>
				{title}
			</Title>
			{children}
		</Stack>
	);
};
