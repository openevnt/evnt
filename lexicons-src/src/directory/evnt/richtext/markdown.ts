import { document, object, required, string } from '@atcute/lexicon-doc/builder';

export default document({
	id: "directory.evnt.richtext.markdown",
	revision: 1,
	defs: {
		main: object({
			properties: {
				markdown: required(string()),
				language: string({
					format: "language",
				}),
			},
		}),
	},
});
