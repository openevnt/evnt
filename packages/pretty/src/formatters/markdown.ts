import type { Venue } from "@evnt/types";
import { EmojiFormatter, type EmojiFormatInput, type EmojiFormatOptions } from "./emoji.js";

export class MarkdownFormatter extends EmojiFormatter {
	static readonly markdownDefaults: EmojiFormatOptions = {
		...EmojiFormatter.emojiDefaults,
	};

	constructor(options: EmojiFormatInput = MarkdownFormatter.markdownDefaults) {
		super(options);
	}

	protected override formatHeader(text: string): string {
		return `**${text}**`;
	}

	protected override formatSubHeader(text: string): string {
		return `*${text}*`;
	}

	protected override formatGroupVenues(venueIds: string[], venueMap: Map<string, Venue>): string {
		const names: string[] = [];

		for (const id of venueIds) {
			const venue = venueMap.get(id);
			if (!venue) continue;

			const icon = this.venueIcon(venue.$type);
			const baseName = this.resolveText(venue.name);
			let display = [icon, baseName].filter(Boolean).join(" ");

			if (venue.$type === "directory.evnt.venue.online" && "url" in venue && venue.url) {
				display = [icon, this.mdLink(baseName, venue.url as string)].filter(Boolean).join(" ");
			}

			names.push(display);
		}

		return names.join(", ");
	}

	protected override formatLink(url: string, name?: string): string {
		const emoji = (this.options as EmojiFormatOptions).emoji;
		const icon = emoji === false ? "" : (emoji.link ?? "");
		const text = name ? this.mdLink(name, url) : url;
		return [icon, text].filter(Boolean).join(" ");
	}

	protected mdLink(text: string, url: string): string {
		return `[${text}](${url})`;
	}

	protected mdBold(text: string): string {
		return `**${text}**`;
	}

	protected mdItalic(text: string): string {
		return `*${text}*`;
	}

	protected mdStrikethrough(text: string): string {
		return `~~${text}~~`;
	}

	protected mdSubtext(text: string): string {
		return text;
	}
}
