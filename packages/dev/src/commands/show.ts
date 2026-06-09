import { MarkdownFormatter, DiscordFormatter, PlainTextFormatter } from "@evnt/pretty";

export default async function (event: unknown, flags: { format?: string; lang?: string; timezone?: string }) {
	const format = flags.format ?? "markdown";
	const lang = flags.lang ?? "en";
	const timezone = flags.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

	const { analyzeEvent } = await import("@evnt/pretty");
	const analyzed = analyzeEvent(event as any, {
		language: lang,
		mergeInstances: true,
		maxVenues: 3,
		maxDates: 5,
	});

	let output: string;

	switch (format) {
		case "plain":
			output = new PlainTextFormatter({ ...PlainTextFormatter.defaults, language: lang, timezone }).formatEvent(analyzed);
			break;
		case "discord":
			output = new DiscordFormatter({ ...DiscordFormatter.defaults, language: lang, timezone }).formatEvent(analyzed);
			break;
		case "markdown":
		default:
			output = new MarkdownFormatter({ ...MarkdownFormatter.defaults, language: lang, timezone }).formatEvent(analyzed);
			break;
	}

	console.log(output);
}
