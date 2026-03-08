import { Text } from "@mantine/core";
import { Section } from "../Section";
import type { EventData, SplashMediaComponent } from "@evnt/schema";
import { CodeHighlight } from "@mantine/code-highlight";

export const ExampleSection = () => {
	return (
		<Section title="Examples">
			<Text>
				Here is a couple of code examples of evnt events:
			</Text>

			{([
				{
					v: 0,
					name: { en: "No venues" },
					instances: [
						{
							venueIds: [],
							start: "2027-03-08T09:00",
							end: "2027-03-08T18:00",
						}
					],
				},
				{
					v: 0,
					name: { en: "One physical venue, unknown dates" },
					venues: [
						{
							id: "0",
							name: { en: "Somewhere" },
							type: "physical",
							address: {
								countryCode: "US",
								addr: "123 Main St, Anytown, USA",
								postalCode: "12345",
							},
							coordinates: {
								lat: 40.7128,
								lon: -74.0060,
							},
						},
					],
					instances: [
						{
							venueIds: ["0"],
						}
					],
				},
				{
					v: 0,
					name: { en: "Multiple instances, unknown locations" },
					instances: [
						{
							venueIds: [],
							start: "2027-03-08T09:00",
							end: "2027-03-08T18:00",
						},
						{
							venueIds: [],
							start: "2027-03-09T09:00",
							end: "2027-03-09T18:00",
						},
						{
							venueIds: [],
							start: "2027-04-01T10:00",
							end: "2027-04-01T16:00",
						},
					],
				},
				{
					v: 0,
					name: { en: "With Links" },
					components: [
						{
							type: "link",
							data: {
								name: { en: "Example Link" },
								url: "https://example.com",
							},
						}
					],
				},

				{
					v: 0,
					name: { en: "With Splash Media Art" },
					components: [
						{
							type: "splashMedia",
							data: {
								media: {
									sources: [
										{
											url: "https://example.com/image.jpg",
											mimeType: "image/jpeg",
											dimensions: {
												width: 1200,
												height: 630,
											},
										},
									],
									alt: { en: "Example Image" },
									presentation: {
										blurhash: "LKO2?U%2Tw=w]~RBVZRi};RPxuwH",
										aspectRatio: 1200 / 630,
										dominantColor: "#cccccc",
									},
								},
								roles: ["background"],
							} as SplashMediaComponent,
						}
					],
				},
			] as EventData[]).map((event, i) => (
				<CodeHighlight
					key={i}
					language="json"
					code={JSON.stringify(event, null, 2)}
				/>
			))}
		</Section>
	);
}