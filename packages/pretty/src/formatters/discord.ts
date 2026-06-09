import { PartialDateUtil } from "@evnt/partial-date";
import type { PartialDate } from "@evnt/types";
import type { FormatConfig, TimestampStyle } from "./base";
import { PlainTextFormatter } from "./base";
import { MarkdownFormatter } from "./markdown";

// == Config ==============================================

export interface DiscordFormatConfig extends FormatConfig {
	timestampStyle: TimestampStyle;
}

export class DiscordFormatter extends MarkdownFormatter {
	static defaults: DiscordFormatConfig = {
		...PlainTextFormatter.defaults,
		timestampStyle: "off",
	};

	constructor(config: DiscordFormatConfig) {
		super(config);
	}
	// == Links ===========================================

	// Discord supports [text](url) for masked links
	protected override mdLink(text: string, url: string): string {
		return `[${text}](${url})`;
	}

	// Discord uses # for blockquotes
	protected override mdSubtext(text: string): string {
		return text.split("\n").map(line => `-# ${line}`).join("\n");
	}

	// == Timestamps ======================================

	private get tsStyle(): TimestampStyle {
		return (this.config as DiscordFormatConfig).timestampStyle ?? "off";
	}

	/** Convert a PartialDate to a Unix seconds timestamp for Discord syntax. */
	private unixTs(pd: PartialDate): number {
		return PartialDateUtil.toInstant(pd, "low").epochMilliseconds / 1000;
	}

	/** Pick a Discord timestamp style character based on precision. */
	private tsChar(pd: PartialDate): string {
		return PartialDateUtil.has(pd, "time") ? "f" : "D";
	}

	/** Format as Discord inline timestamp, e.g. `<t:1718460000:f>`. */
	private discordTs(pd: PartialDate): string {
		return `<t:${Math.floor(this.unixTs(pd))}:${this.tsChar(pd)}>`;
	}

	// Override date/time formatting when timestamps are enabled

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

	protected override formatTimeRange(start: PartialDate | undefined, end: PartialDate | undefined): string {
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

	// Override clock emoji since the timestamp already shows time
	protected override clockEmoji(pd: PartialDate): string {
		if (this.tsStyle !== "off") return "";
		return super.clockEmoji(pd);
	}

	// Override calendar emoji since the timestamp already shows date
	protected override formatDateGroup(group: import("../types").DateGroup): string {
		if (this.tsStyle === "only") {
			// Just timestamps, no emoji
			const dateStr = this.formatDateEntries(group.entries);
			const timeStr = group.timeRanges.map(tr => this.formatTimeRange(tr.start, tr.end)).filter(Boolean).join(", ");
			return [dateStr, timeStr].filter(Boolean).join(" · ");
		}
		return super.formatDateGroup(group);
	}
}
