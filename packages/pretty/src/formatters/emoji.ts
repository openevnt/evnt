import { PartialDateUtil } from "@evnt/partial-date";
import type { EventStatus, PartialDate } from "@evnt/types";
import type { DateGroup, VenueSummary, ActivitySummary, LinkSummary } from "../types";
import type { FormatConfig } from "./base";
import { PlainTextFormatter } from "./base";

const hasTime = (pd: PartialDate) => PartialDateUtil.has(pd, "time");

export class EmojiFormatter extends PlainTextFormatter {
	constructor(config: FormatConfig) {
		super(config);
	}

	// == Status ==========================================

	override formatStatus(status: EventStatus, text: string): string {
		const icon = this.config.statusIcons[status] ?? "";
		return [icon, text].filter(Boolean).join(" ");
	}

	// == Date groups =====================================

	protected override formatDateGroup(group: DateGroup): string {
		const dateStr = this.formatDateEntries(group.entries);
		const timeStr = group.timeRanges.map(tr => this.formatTimeRange(tr.start, tr.end)).filter(Boolean).join(", ");

		const parts = [this.config.emoji.calendar, dateStr].filter(Boolean);

		if (timeStr) {
			const firstTime = group.timeRanges[0]?.start ?? group.timeRanges[0]?.end;
			const clockIcon = firstTime && hasTime(firstTime)
				? this.clockEmoji(firstTime as PartialDate)
				: this.config.emoji.clock;
			parts.push("·", clockIcon ?? this.config.emoji.clock ?? "🕐", timeStr);
		}

		return parts.filter(Boolean).join(" ");
	}

	protected clockEmoji(pd: PartialDate): string {
		const parsed = PartialDateUtil.parse(pd);
		if (parsed.precision !== "time") return this.config.emoji.clock ?? "🕐";
		const hour12 = (parsed.hour % 12) || 12;
		const base = parsed.minute >= 30 ? 0x1F55C : 0x1F550;
		return String.fromCodePoint(base + hour12 - 1);
	}

	// == Venues ==========================================

	protected override formatVenue(venue: VenueSummary): string {
		const icon = this.config.emoji[venue.type] ?? "";
		return [icon, super.formatVenue(venue)].filter(Boolean).join(" ");
	}

	// == Activities ======================================

	protected override formatActivity(activity: ActivitySummary): string {
		const icon = this.config.emoji.activity ?? "";
		return [icon, super.formatActivity(activity)].filter(Boolean).join(" ");
	}

	// == Links ===========================================

	protected override formatLink(link: LinkSummary): string {
		const icon = this.config.emoji.link ?? "";
		return [icon, super.formatLink(link)].filter(Boolean).join(" ");
	}
}
