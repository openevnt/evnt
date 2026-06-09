import type { LinkSummary } from "../types";
import type { FormatConfig } from "./base";
import { PlainTextFormatter } from "./base";
import { EmojiFormatter } from "./emoji";

export class MarkdownFormatter extends EmojiFormatter {
	static defaults: FormatConfig = PlainTextFormatter.defaults;

	constructor(config: FormatConfig) {
		super(config);
	}

	// == Sections ========================================

	protected override formatHeader(text: string): string {
		return `**${text}**`;
	}

	protected override formatSubHeader(text: string): string {
		return `*${text}*`;
	}

	// == Venues ==========================================

	protected override formatVenue(venue: import("../types").VenueSummary): string {
		const icon = this.config.emoji[venue.type] ?? "";
		let name = venue.name;

		if (venue.type === "online" && venue.detail) {
			name = this.mdLink(venue.name, venue.detail);
		}

		const parts = [icon, name].filter(Boolean);

		if (venue.type === "physical" && venue.detail) {
			parts.push("·", this.mdSubtext(venue.detail));
		}

		return parts.join(" ");
	}

	// == Links ===========================================

	protected override formatLink(link: LinkSummary): string {
		const icon = this.config.emoji.link ?? "";
		const text = link.name ? this.mdLink(link.name, link.url) : link.url;
		return [icon, text].filter(Boolean).join(" ");
	}

	// == Description =====================================

	protected override formatDescription(text: string): string {
		const firstPara = text.split("\n\n")[0] ?? text;
		return firstPara.length > 200 ? firstPara.slice(0, 200) + "…" : firstPara;
	}

	// == Markdown helpers ================================

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
