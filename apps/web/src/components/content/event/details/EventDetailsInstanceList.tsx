import { Stack, Timeline } from "@mantine/core";
import { snippetInstance, snippetVenue, venueGoogleMapsLink, venueOpenStreetMapsLink } from "@evnt/pretty";
import { Snippet } from "../../Snippet";
import { ExternalLink } from "../../base/ExternalLink";
import { useEventEnvelope } from "../event-envelope-context";
import { UtilPartialDate, UtilPartialDateRange } from "@evnt/schema/utils";
import type { PartialDate } from "@evnt/schema";

export const EventDetailsInstanceList = () => {
	const { data } = useEventEnvelope();

	return (
		<Stack>
			<Timeline
				bulletSize={24}
				styles={{
					itemBody: { paddingLeft: 0 },
				}}
			>
				{data?.instances?.map((instance, i) => (
					<Timeline.Item
						key={i}
						bullet={i + 1}
					>
						<Stack>
							<Stack key={i} gap={0}>
								{instance.start && (!instance.end || UtilPartialDateRange.isSameDay(instance)) && (
									<>
										<Snippet
											snippet={{
												icon: "calendar",
												label: {
													type: "partial-date",
													value: UtilPartialDate.asDay(instance.start as PartialDate.Full),
												},
											}}
										/>

										{UtilPartialDate.hasTime(instance.start) && (!instance.end || !UtilPartialDate.hasTime(instance.end) || (
											UtilPartialDate.getTimePart(instance.start) === UtilPartialDate.getTimePart(instance.end)
										)) && (
												<Snippet
													snippet={{
														icon: "clock",
														label: {
															type: "time",
															value: UtilPartialDate.getTimePart(instance.start)!,
															day: UtilPartialDate.asDay(instance.start! as PartialDate.Full),
														},
													}}
												/>
											)}

										{UtilPartialDate.hasTime(instance.start) && instance.end && UtilPartialDate.hasTime(instance.end) && (
											UtilPartialDate.getTimePart(instance.start) !== UtilPartialDate.getTimePart(instance.end)
										) && (
												<Snippet
													snippet={{
														icon: "clock",
														label: {
															type: "time-range",
															value: {
																start: {
																	value: UtilPartialDate.getTimePart(instance.start)!,
																	day: UtilPartialDate.asDay(instance.start! as PartialDate.Full),
																},
																end: {
																	value: UtilPartialDate.getTimePart(instance.end)!,
																	day: UtilPartialDate.asDay(instance.end! as PartialDate.Full),
																},
															},
														},
													}}
												/>
											)}
									</>
								)}

								{instance.start && instance.end && !UtilPartialDateRange.isSameDay(instance) && (
									<Snippet
										snippet={{
											icon: "calendar",
											label: {
												type: "date-time-range",
												value: {
													start: instance.start,
													end: instance.end,
												},
											},
										}}
									/>
								)}

								{instance.venueIds
									.map(venueId => data.venues?.find(v => v.id === venueId))
									.filter(venue => venue !== undefined)
									.map((venue, index) => (
										<Stack key={index} gap={0}>
											<Snippet key={index} snippet={snippetVenue(venue!, true)} />

											<Stack gap={4} my={4} pl={28} fz="sm" align="start">
												{venueGoogleMapsLink(venue) && (
													<ExternalLink
														children="View on Google Maps"
														noTooltip
														href={venueGoogleMapsLink(venue)!}
													/>
												)}
												{venueOpenStreetMapsLink(venue) && (
													<ExternalLink
														children="View on OpenStreetMap"
														noTooltip
														href={venueOpenStreetMapsLink(venue)!}
													/>
												)}
											</Stack>
										</Stack>
									))}
							</Stack>
						</Stack>
					</Timeline.Item>
				))}
			</Timeline>
		</Stack>
	);
};
