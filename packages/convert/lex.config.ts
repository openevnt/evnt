import { defineLexiconConfig } from "@atcute/lex-cli";

export default defineLexiconConfig({
	files: ["lexicons/**/*.json"],
	outdir: "src/lexicons/",
	pull: {
		outdir: "lexicons/",
		sources: [
			{
				type: "atproto",
				mode: "nsids",
				nsids: [
					"community.lexicon.calendar.event",
					"community.lexicon.location.address",
					"community.lexicon.location.fsq",
					"community.lexicon.location.geo",
					"community.lexicon.location.hthree",
				],
			},
		],
	},
});
