import { Text } from "@mantine/core";
import { Section } from "../Section";
import type { OpenEvnt } from "@evnt/types";
import { CodeHighlight, CodeHighlightTabs } from "@mantine/code-highlight";

export const ExampleSection = () => {
	return (
		<Section title="Examples">
			<Text>
				Here is a couple of code examples of evnt events:
			</Text>

			<CodeHighlightTabs
				code={([
					{
						v: "0.1",
						name: { en: "No venues" },
						instances: [
							{
								venueIds: [],
								start: "2027-03-08T09:00[UTC]",
								end: "2027-03-08T18:00[UTC]",
							}
						],
					},
					{
						v: "0.1",
						name: { en: "Physical Venue, Unknown dates" },
						venues: [
							{
								id: "0",
								name: { en: "Somewhere" },
								$type: "directory.evnt.venue.physical",
								address: {
									countryCode: "US",
									addr: "123 Main St, Anytown, USA",
									postalCode: "12345",
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
						v: "0.1",
						name: { en: "Multiple Instances" },
						instances: [
							{
								venueIds: [],
								start: "2027-03-08T09:00[UTC]",
								end: "2027-03-08T18:00[UTC]",
							},
							{
								venueIds: [],
								start: "2027-03-09T09:00[UTC]",
								end: "2027-03-09T18:00[UTC]",
							},
							{
								venueIds: [],
								start: "2027-04-01T10:00[UTC]",
								end: "2027-04-01T16:00[UTC]",
							},
						],
					},
					{
						v: "0.1",
						name: { en: "Links" },
						components: [
							{
								$type: "directory.evnt.component.link",
								name: { en: "Example Link" },
								url: "https://example.com",
							}
						],
					},

					{
						v: "0.1",
						name: { en: "Splash Media" },
						components: [
							{
								$type: "directory.evnt.component.splashMedia",
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
							}
						],
					},
				] as OpenEvnt[]).map((event, i) => ({
					code: JSON.stringify(event, null, 2),
					language: "json",
					fileName: event.name.en!,
				}))}
			/>
		</Section>
	);
}