import { Container } from "@mantine/core";
import { LandingPage } from "./components/LandingPage";
import { Layout } from "./components/Layout";

export const IndexPage = () => {
	return (
		<Layout>
			<Container>
				<LandingPage />
			</Container>
		</Layout>
	);
}