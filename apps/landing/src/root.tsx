import { createTheme, DEFAULT_THEME, MantineProvider, type TooltipProps } from "@mantine/core";
import { IndexPage } from ".";
import "./init";
import { CodeHighlightAdapterProvider, createShikiAdapter } from "@mantine/code-highlight";

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

const shikiAdapter = createShikiAdapter(async () => {
	const { createHighlighter } = await import("shiki");
	return await createHighlighter({
		langs: ["json", "ts", "js", "tsx", "bash"],
		themes: [],
	});
});

export const Root = () => {
	return (
		<span suppressHydrationWarning>
			<MantineProvider theme={theme} forceColorScheme="dark">
				<CodeHighlightAdapterProvider adapter={shikiAdapter}>
					<IndexPage />
				</CodeHighlightAdapterProvider>
			</MantineProvider>
		</span>
	);
};