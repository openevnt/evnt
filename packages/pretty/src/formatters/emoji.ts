import { PartialDateUtil } from "@evnt/partial-date";
import type { EventStatus, PartialDate, Venue } from "@evnt/types";
import type { DateGroup } from "../types";
import type { FormatConfig } from "./base";
import { PlainTextFormatter } from "./base";

export interface EmojiFormatConfig extends FormatConfig {
	emoji: Record<string, string>;
	statusIcons: Record<EventStatus, string>;
}

const hasTime = (pd: PartialDate) => PartialDateUtil.has(pd, "time");

export class EmojiFormatter extends PlainTextFormatter {
	static emojiDefaults: EmojiFormatConfig = {
		...PlainTextFormatter.defaults,
		emoji: {
			calendar: "📅",
			clock: "🕐",
			online: "🌐",
			physical: "📍",
			unknown: "📍",
			link: "🔗",
		},
		statusIcons: {
			planned: "",
			uncertain: "🟡",
			postponed: "🟡",
			cancelled: "🔴",
			suspended: "🟠",
		},
	};

	constructor(config: EmojiFormatConfig) {
		super(config);
	}

	// == Status ==========================================

	override formatStatus(status: EventStatus, text: string): string {
		const icon = (this.config as EmojiFormatConfig).statusIcons[status] ?? "";
		return [icon, text].filter(Boolean).join(" ");
	}

	// == Date groups =====================================

	protected override formatDateGroup(group: DateGroup, venueMap: Map<string, Venue>): string {
		const dateStr = this.formatDateShape(group.dates);
		const timeStr = group.times.map(t => this.formatTimeRange(t.start, t.end)).filter(Boolean).join(", ");

		const parts = [(this.config as EmojiFormatConfig).emoji.calendar, dateStr].filter(Boolean);

		if (timeStr) {
			const firstTime = group.times[0]?.start ?? group.times[0]?.end;
			const clockIcon = firstTime && hasTime(firstTime)
				? this.clockEmoji(firstTime)
				: (this.config as EmojiFormatConfig).emoji.clock;
			parts.push("·", clockIcon ?? (this.config as EmojiFormatConfig).emoji.clock ?? "🕐", timeStr);
		}

		const venueStr = this.formatGroupVenues(group.venueIds, venueMap);
		if (venueStr) parts.push("·", venueStr);

		return parts.filter(Boolean).join(" ");
	}

	protected override formatGroupVenues(venueIds: string[], venueMap: Map<string, Venue>): string {
		const names: string[] = [];
		for (const id of venueIds) {
			const venue = venueMap.get(id);
			if (venue) {
				const icon = this.venueIcon(venue.$type);
				const name = this.resolveText(venue.name);
				names.push([icon, name].filter(Boolean).join(" "));
			}
		}
		return names.join(", ");
	}

	protected venueIcon($type: string): string {
		const cfg = this.config as EmojiFormatConfig;
		switch ($type) {
			case "directory.evnt.venue.physical": return cfg.emoji.physical ?? "";
			case "directory.evnt.venue.online": return cfg.emoji.online ?? "";
			default: return cfg.emoji.unknown ?? "";
		}
	}

	protected clockEmoji(pd: PartialDate): string {
		const parsed = PartialDateUtil.parse(pd);
		if (parsed.precision !== "time") return (this.config as EmojiFormatConfig).emoji.clock ?? "🕐";
		const hour12 = (parsed.hour % 12) || 12;
		const base = parsed.minute >= 30 ? 0x1F55C : 0x1F550;
		return String.fromCodePoint(base + hour12 - 1);
	}

	// == Links ===========================================

	protected override formatLink(url: string, name?: string): string {
		const icon = (this.config as EmojiFormatConfig).emoji.link ?? "";
		return [icon, super.formatLink(url, name)].filter(Boolean).join(" ");
	}
}
