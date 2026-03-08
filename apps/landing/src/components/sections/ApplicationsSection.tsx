import { Anchor, Button, Group, ScrollArea, Stack, Table, Text, Tooltip } from "@mantine/core"
import { Section } from "../Section"
import { IconBrandReact, IconExternalLink, IconGlobe, IconWorld } from "@tabler/icons-react"

export const ApplicationsSection = () => {
	return (
		<Section title="Applications">
			<Text>
				Evnt is still a relatively new project, so there aren't many applications using it yet.
			</Text>

			<ScrollArea.Autosize scrollbars="x" offsetScrollbars>
				<Table
					withTableBorder
					striped
					data={{
						caption: "Applications using evnt",
						head: [
							"Application",
							"Description",
							"",
							"Source",
						],
						body: [
							[
								<Anchor href="https://vantage.deniz.blue" target="_blank" rel="noopener noreferrer">
									<Group align="center" gap={4} wrap="nowrap">
										<img src="https://vantage.deniz.blue/favicon.ico" alt="Vantage Logo" style={{ width: 24, height: 24 }} />
										Vantage
									</Group>
								</Anchor>,
								<Text fz="sm">
									Default, reference implementation of an event viewer
								</Text>,
								<Group gap={4} wrap="nowrap">
									<Tooltip label="Web">
										<IconWorld />
									</Tooltip>
									<Text>/</Text>
									<Tooltip label="React">
										<IconBrandReact />
									</Tooltip>
								</Group>,
								<Anchor href="https://github.com/deniz-blue/evnt/blob/main/apps/vantage" target="_blank" rel="noopener noreferrer">
									Link
								</Anchor>
							]
						],
					}}
				/>
			</ScrollArea.Autosize>

			<Text>
				These applications all support the <Anchor href="https://eventsl.ink" target="_blank" rel="noopener noreferrer">
					eventsl.ink
				</Anchor> link format which allows you to share links to your events that can be opened in any of these applications.
			</Text>

			<Stack align="center">
				<Button
					component="a"
					href="https://eventsl.ink"
					target="_blank"
					rel="noopener noreferrer"
					rightSection={<IconExternalLink />}
					color="green"
					variant="light"
				>
					eventsl.ink
				</Button>
			</Stack>

			<Text>
				If you're building an application using evnt, please let us know!
			</Text>
		</Section>
	)
}