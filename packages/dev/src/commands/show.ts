import { MarkdownFormatter, DiscordFormatter, PlainTextFormatter } from "@evnt/pretty";

export default async function (
	event: unknown,
	flags: { format?: string; lang?: string; timezone?: string },
) {
	const format = flags.format ?? "markdown";
	const lang = flags.lang ?? "en";
	const timezone = flags.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

	let output: string;

	switch (format) {
		case "plain":
			output = new PlainTextFormatter({
				...PlainTextFormatter.defaults,
				language: lang,
				timezone,
			}).formatEvent(event as any);
			break;
		case "discord":
			output = new DiscordFormatter({
				...DiscordFormatter.discordDefaults,
				language: lang,
				timezone,
			}).formatEvent(event as any);
			break;
		case "markdown":
		default:
			output = new MarkdownFormatter({
				...MarkdownFormatter.markdownDefaults,
				language: lang,
				timezone,
			}).formatEvent(event as any);
			break;
	}

	console.log(output);
}
