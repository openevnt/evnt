import { Container, Space, Stack } from "@mantine/core";
import { ValidatorSection } from "./sections/ValidatorSection";
import { HeroSection } from "./sections/HeroSection";
import { WhySection } from "./sections/WhySection";
import { FeaturesSection } from "./sections/FeaturesSection";
import { ExampleSection } from "./sections/ExampleSection";
import { ApplicationsSection } from "./sections/ApplicationsSection";
import { SpecificationSection } from "./sections/SpecificationSection";
import { ATProtoSection } from "./sections/ATProtoSection";
import { ComparisionSection } from "./sections/ComparisionSection";

export const LandingPage = () => {
	return (
		<Stack w="100%">
			<HeroSection />
			<Container size="md" w="100%">
				<Stack gap="6rem" w="100%">
					<WhySection />
					<FeaturesSection />
					<ApplicationsSection />
					<SpecificationSection />
					<ATProtoSection />
					<ExampleSection />
					<ValidatorSection />
				</Stack>
			</Container>
			<Space h="100dvh" />
		</Stack>
	)
};
