import { object, document, string } from "@atcute/lexicon-doc/builder";

export const partialDate = () =>
	string({
		description: "A PartialDate where some components may not be known",
	});

export default document({
	id: "directory.evnt.event.instance",
	defs: {
		main: object({
			description: "An instance of an event",
			properties: {
				start: partialDate(),
				end: partialDate(),
			},
		}),
	},
});
