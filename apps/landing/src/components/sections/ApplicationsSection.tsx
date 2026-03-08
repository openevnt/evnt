import { Anchor, Group, Table, Text, Tooltip } from "@mantine/core"
import { Section } from "../Section"
import { IconBrandReact, IconGlobe, IconWorld } from "@tabler/icons-react"

export const ApplicationsSection = () => {
	return (
		<Section title="Applications">
			<Text>
				Evnt is still a relatively new project, so there aren't many applications using it yet.
			</Text>

			<Table
				withTableBorder
				striped
				data={{
					caption: "Applications using evnt",
					head: [
						"Application",
						"Description",
						"Platform / Technology",
						"Source",
					],
					body: [
						[
							<Anchor href="https://vantage.deniz.blue" target="_blank" rel="noopener noreferrer">
								<img src="https://vantage.deniz.blue/favicon.ico" alt="Vantage Logo" style={{ width: 24, height: 24, verticalAlign: "middle", marginRight: 8 }} />
								Vantage
							</Anchor>,
							<Text>
								Default, reference implementation of an event viewer for evnt.
							</Text>,
							<Group gap={4}>
								<Tooltip label="Web">
									<IconWorld />
								</Tooltip>
								<Text>/</Text>
								<Tooltip label="React">
									<IconBrandReact />
								</Tooltip>
							</Group>,
							<Anchor href="https://github.com/deniz-blue/evnt/blob/main/apps/vantage" target="_blank" rel="noopener noreferrer">
								Source
							</Anchor>
						]
					],
				}}
			/>

			<Text>
				These applications all support the <Anchor href="https://eventsl.ink" target="_blank" rel="noopener noreferrer">
					eventsl.ink
				</Anchor> link format which allows you to share links to your events that can be opened in any of these applications.
			</Text>

			<Text>
				If you're building an application using evnt, please let us know!
			</Text>
		</Section>
	)
}