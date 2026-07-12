import {
	array,
	document,
	object,
	record,
	ref,
	required,
	string,
	union,
	unknown,
} from "@atcute/lexicon-doc/builder";

export default document({
	id: "directory.evnt.event",
	revision: 1,
	defs: {
		main: record({
			key: "tid",
			description: "An OpenEvnt event record",
			record: object({
				properties: {
					v: required(string()),
					name: required(unknown()),
					venues: array({
						items: union({
							refs: [
								ref({ ref: "directory.evnt.venue.online" }),
								ref({ ref: "directory.evnt.venue.physical" }),
								ref({ ref: "directory.evnt.venue.unknown" }),
							],
						}),
					}),
					instances: array({
						items: ref({
							ref: "directory.evnt.event.instance",
						}),
					}),
					components: array({
						items: union({
							refs: [
								ref({ ref: "directory.evnt.component.link" }),
								ref({ ref: "directory.evnt.component.source" }),
								ref({ ref: "directory.evnt.component.splashMedia" }),
								ref({ ref: "app.bsky.richtext" }),
							],
						}),
					}),
				},
			}),
		}),
	},
});
