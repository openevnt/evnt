import { MantineProvider } from "@mantine/core";
import { Page, type PageProps } from "./ui/Page";
import { createRoot } from "react-dom/client";

export const App = (props: PageProps) => {
	return (
		<MantineProvider forceColorScheme="dark">
			<Page {...props} />
		</MantineProvider>
	);
};

export const render = (props: PageProps) => {
	createRoot(document.getElementById('root')!).render(<App {...props} />);
};
