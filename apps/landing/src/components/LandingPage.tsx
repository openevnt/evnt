import { Space, Stack } from "@mantine/core";
import { ValidatorSection } from "./sections/ValidatorSection";
import { HeroSection } from "./sections/HeroSection";
import { WhySection } from "./sections/WhySection";
import { FeaturesSection } from "./sections/FeaturesSection";

export const LandingPage = () => {
	return (
		<Stack gap="xl">
			<HeroSection />
			<WhySection />
			<FeaturesSection />
			<ValidatorSection />
			<Space h="100dvh" />
		</Stack>
	)
};
