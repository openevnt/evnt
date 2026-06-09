import { MarkdownFormatter } from "./markdown";

export class DiscordFormatter extends MarkdownFormatter {
	// Discord uses <url> for links (no markdown link syntax)
	protected override mdLink(text: string, url: string): string {
		return `${text} (<${url}>)`;
	}

	// Discord uses # for blockquotes
	protected override mdSubtext(text: string): string {
		return text.split("\n").map(line => `-# ${line}`).join("\n");
	}
}
