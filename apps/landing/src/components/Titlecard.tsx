import { Text } from "@mantine/core";

export const Titlecard = (props: Text.Props) => {
	return (
		<Text
			inline
			inherit
			span
			variant="gradient"
			gradient={{ from: "violet", to: "blue", deg: 90 }}
			{...props}
		>
			Open Evnt
		</Text>
	);
};
