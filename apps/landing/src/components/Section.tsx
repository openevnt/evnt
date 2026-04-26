import { Anchor, Paper, Stack, Text, Title } from "@mantine/core";
import type { PropsWithChildren } from "react";

export const Section = ({
	title,
	id,
	children,
}: PropsWithChildren<{
	title?: React.ReactNode;
	id?: string;
}>) => {
	return (
		<Stack component="section">
			<Paper
				pos="sticky"
				top={60}
				withBorder
				style={{ borderTop: "none", borderRight: "none", borderLeft: "none", zIndex: 50 }}
				radius={0}
				pt="xs"
			>
				<a
					style={{ position: "absolute", top: -60, visibility: "hidden" }}
					id={typeof title === "string" ? title.toLowerCase().replace(/\s+/g, "-") : id}
					aria-hidden
				/>
				<Anchor
					c="unset"
					href={`#${typeof title === "string" ? title.toLowerCase().replace(/\s+/g, "-") : id}`}
					style={{ textDecoration: "none" }}
				>
					<Title order={2}>
						{title} <Text component="a" href="#" c="dimmed" fz="sm" aria-hidden>
							↑
						</Text>
					</Title>
				</Anchor>
			</Paper>
			{children}
		</Stack>
	);
};
