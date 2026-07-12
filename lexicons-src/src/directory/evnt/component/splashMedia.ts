import {
	object,
	document,
	string,
	required,
	unknown,
	boolean,
	ref,
	array,
} from "@atcute/lexicon-doc/builder";

export default document({
	id: "directory.evnt.component.splashMedia",
	defs: {
		main: object({
			description:
				"A media item (such as an image or video) that can be used as a splash media for the event",
			properties: {
				media: required(ref({ ref: "directory.evnt.media" })),
				roles: array({
					items: string({
						enum: ["background"],
					}),
				}),
			},
		}),
	},
});
