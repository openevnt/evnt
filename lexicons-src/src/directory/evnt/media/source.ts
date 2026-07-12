import { blob, document, object, ref, string } from "@atcute/lexicon-doc/builder";

export default document({
	id: "directory.evnt.media.source",
	revision: 1,
	defs: {
		main: object({
			properties: {
				url: string(),
				blob: blob(),
				mimeType: string(),
				dimensions: ref({ ref: "directory.evnt.media.source#dimensions" }),
			},
		}),
		dimensions: object({
			properties: {
				width: string(),
				height: string(),
			},
		}),
	},
});
