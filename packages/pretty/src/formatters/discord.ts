import { PartialDateUtil } from "@evnt/partial-date";
import type { PartialDate, Venue } from "@evnt/types";
import type { DateGroup } from "../types";
import { MarkdownFormatter } from "./markdown";
import type { EmojiFormatConfig } from "./emoji";

// == Config ==============================================

export type TimestampStyle = "off" | "both" | "only";

export interface DiscordFormatConfig extends EmojiFormatConfig {
	timestampStyle: TimestampStyle;
}

export class DiscordFormatter extends MarkdownFormatter {
	static discordDefaults: DiscordFormatConfig = {
		...MarkdownFormatter.markdownDefaults,
		timestampStyle: "off",
	};

	constructor(config: DiscordFormatConfig) {
		super(config);
	}

	// == Links ===========================================

	protected override mdLink(text: string, url: string): string {
		return `[${text}](${url})`;
	}

	protected override mdSubtext(text: string): string {
		return text.split("\n").map(line => `-# ${line}`).join("\n");
	}

	// == Timestamps ======================================

	private get tsStyle(): TimestampStyle {
		return (this.config as DiscordFormatConfig).timestampStyle ?? "off";
	}

	private unixTs(pd: PartialDate): number {
		return PartialDateUtil.toInstant(pd, "low").epochMilliseconds / 1000;
	}

	private tsChar(pd: PartialDate): string {
		return PartialDateUtil.has(pd, "time") ? "f" : "D";
	}

	private discordTs(pd: PartialDate): string {
		return `<t:${Math.floor(this.unixTs(pd))}:${this.tsChar(pd)}>`;
	}

	protected override formatDate(pd: PartialDate): string {
		if (this.tsStyle === "off") return super.formatDate(pd);
		const ts = this.discordTs(pd);
		if (this.tsStyle === "both") return `${ts} (${super.formatDate(pd)})`;
		return ts;
	}

	protected override formatTime(pd: PartialDate): string {
		if (this.tsStyle === "off") return super.formatTime(pd);
		const ts = this.discordTs(pd);
		if (this.tsStyle === "both") return `${ts} (${super.formatTime(pd)})`;
		return ts;
	}

	protected override formatDateRange(start: PartialDate, end: PartialDate): string {
		if (this.tsStyle === "off") return super.formatDateRange(start, end);
		const ts = `${this.discordTs(start)}–${this.discordTs(end)}`;
		if (this.tsStyle === "both") return `${ts} (${super.formatDateRange(start, end)})`;
		return ts;
	}

	protected override formatTimeRange(start?: PartialDate, end?: PartialDate): string {
		if (this.tsStyle === "off") return super.formatTimeRange(start, end);

		if (start && end) {
			const ts = `${this.discordTs(start)}–${this.discordTs(end)}`;
			if (this.tsStyle === "both") return `${ts} (${super.formatTimeRange(start, end)})`;
			return ts;
		}
		if (start) {
			const ts = this.discordTs(start);
			if (this.tsStyle === "both") return `${ts} (${super.formatTime(start)})`;
			return ts;
		}
		return "";
	}

	protected override clockEmoji(_pd: PartialDate): string {
		if (this.tsStyle !== "off") return "";
		return super.clockEmoji(_pd);
	}

	protected override formatDateGroup(group: DateGroup, venueMap: Map<string, Venue>): string {
		if (this.tsStyle === "only") {
			const dateStr = this.formatDateShape(group.dates);
			const timeStr = group.times.map(t => this.formatTimeRange(t.start, t.end)).filter(Boolean).join(", ");

			const venueNames = group.venueIds
				.map(id => venueMap.get(id))
				.filter(Boolean)
				.map(v => this.resolveText(v!.name));
			const venueStr = venueNames.length > 0 ? venueNames.join(", ") : "";

			return [dateStr, timeStr, venueStr].filter(Boolean).join(" · ");
		}
		return super.formatDateGroup(group, venueMap);
	}
}
