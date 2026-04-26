import { Anchor, Button, Group, ScrollArea, Stack, Table, Text, Tooltip } from "@mantine/core"
import { Section } from "../Section"
import { IconBrandReact, IconExternalLink, IconGlobe, IconWorld } from "@tabler/icons-react"
import { Titlecard } from "../Titlecard"

export const ApplicationsSection = () => {
	return (
		<Section title="Applications">
			<ScrollArea.Autosize scrollbars="x" offsetScrollbars>
				<Table
					withTableBorder
					striped
					style={{ textWrap: "nowrap" }}
					data={{
						caption: "Let us know if you're building an application using Open Evnt!",
						head: [
							"Application",
							"Description",
							"Source",
						],
						body: [
							[
								<Anchor href="https://vantage.deniz.blue" target="_blank" rel="noopener noreferrer">
									Vantage ↗
								</Anchor>,
								<Text>
									Proof-of-concept calendar application that uses <Titlecard />
								</Text>,
								<Anchor href="https://github.com/openevnt/evnt/blob/main/apps/vantage" target="_blank" rel="noopener noreferrer">
									Link ↗
								</Anchor>
							],
							[
								<Anchor href="https://eventsl.ink" target="_blank" rel="noopener noreferrer">
									eventsl.ink ↗
								</Anchor>,
								<Text>
									Create event sharing links without being tied to any app
								</Text>,
								<Anchor href="https://github.com/openevnt/eventslink" target="_blank" rel="noopener noreferrer">
									Link ↗
								</Anchor>
							]
						],
					}}
				/>
			</ScrollArea.Autosize>
		</Section>
	)
}