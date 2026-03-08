import { Space, Stack } from "@mantine/core";
import { ValidatorSection } from "./sections/ValidatorSection";
import { HeroSection } from "./sections/HeroSection";
import { WhySection } from "./sections/WhySection";
import { FeaturesSection } from "./sections/FeaturesSection";
import { ExampleSection } from "./sections/ExampleSection";
import { ApplicationsSection } from "./sections/ApplicationsSection";
import { SpecificationSection } from "./sections/SpecificationSection";

export const LandingPage = () => {
	return (
		<Stack gap="10rem">
			<HeroSection />
			<WhySection />
			<FeaturesSection />
			<ApplicationsSection />
			<SpecificationSection />
			<ExampleSection />
			<ValidatorSection />
			<Space h="100dvh" />
		</Stack>
	)
};
