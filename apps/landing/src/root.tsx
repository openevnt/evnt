import { createTheme, DEFAULT_THEME, MantineProvider, type TooltipProps } from "@mantine/core";
import { IndexPage } from ".";
import "./init";

const theme = createTheme({
	fontFamily: "Lexend, " + DEFAULT_THEME.fontFamily,
	primaryColor: "violet",
	components: {
		Tooltip: {
			defaultProps: {
				color: "dark",
			},
			styles: {
				color: "var(--mantine-color-text)"
			},
		} as Partial<TooltipProps>,
	},
});

export const Root = () => {
	return (
		<span suppressHydrationWarning>
			<MantineProvider theme={theme} forceColorScheme="dark">
				<IndexPage />
			</MantineProvider>
		</span>
	);
};