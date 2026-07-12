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
	id: "directory.evnt.media",
	revision: 1,
	defs: {
		main: object({
			properties: {
				sources: required(
					array({
						items: ref({
							ref: "directory.evnt.media.source",
						}),
					}),
				),
				alt: unknown(),
				presentation: ref({
					ref: "directory.evnt.media#presentation",
				}),
			},
		}),
		presentation: object({
			properties: {
				blurhash: string(),
				dominantColor: string(),
			},
		}),
	},
});
