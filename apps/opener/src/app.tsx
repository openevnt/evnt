import { createTheme, DEFAULT_THEME, MantineProvider } from "@mantine/core";
import { Page } from "./ui/Page";
import { createRoot } from "react-dom/client";

const theme = createTheme({
	fontFamily: "Lexend, " + DEFAULT_THEME.fontFamily,
	fontFamilyMonospace: "Fira Code, " + DEFAULT_THEME.fontFamilyMonospace,
});

export const App = () => {
	return (
		<MantineProvider forceColorScheme="dark" theme={theme}>
			<Page />
		</MantineProvider>
	);
};

export const render = () => {
	createRoot(document.getElementById('root')!).render(<App />);
};
