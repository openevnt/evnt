import { PartialDateUtil } from "@evnt/partial-date";
import type { EventStatus, PartialDate, Venue } from "@evnt/types";
import type { DateGroup } from "../types.js";
import type { FormatConfig } from "./base.js";
import { PlainTextFormatter } from "./base.js";

export interface EmojiFormatConfig extends FormatConfig {
	emoji: Record<string, string> | false;
	statusIcons: Record<EventStatus, string>;
}

export type EmojiFormatOptions = Partial<EmojiFormatConfig> & {
	emoji?: Record<string, string> | false;
};

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
		if (config.emoji === false) {
			config = {
				...config,
				emoji: {},
				statusIcons: { planned: "", uncertain: "", postponed: "", cancelled: "", suspended: "" },
			};
		}
		super(config);
	}

	private get emojiMap(): Record<string, string> {
		const cfg = this.config as EmojiFormatConfig;
		return cfg.emoji === false ? {} : cfg.emoji;
	}

	private get statusIconMap(): Record<EventStatus, string> {
		return (this.config as EmojiFormatConfig).statusIcons;
	}

	// == Status ==========================================

	override formatStatus(status: EventStatus, text: string): string {
		const icon = this.statusIconMap[status] ?? "";
		return [icon, text].filter(Boolean).join(" ");
	}

	// == Date groups =====================================

	protected override formatDateGroup(group: DateGroup, venueMap: Map<string, Venue>): string {
		const lines: string[] = [];

		const dateStr = this.formatDateShape(group.dates);
		if (dateStr) lines.push([this.emojiMap.calendar, dateStr].filter(Boolean).join(" "));

		const timeStr = group.times
			.map((t) => this.formatTimeRange(t.start, t.end))
			.filter(Boolean)
			.join(", ");
		if (timeStr) {
			const firstTime = group.times[0]?.start ?? group.times[0]?.end;
			const clockIcon =
				firstTime && hasTime(firstTime) ? this.clockEmoji(firstTime) : this.emojiMap.clock;
			lines.push([clockIcon ?? this.emojiMap.clock ?? "🕐", timeStr].filter(Boolean).join(" "));
		}

		const venueStr = this.formatGroupVenues(group.venueIds, venueMap);
		if (venueStr) lines.push(venueStr);

		return lines.join("\n");
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
		switch ($type) {
			case "directory.evnt.venue.physical":
				return this.emojiMap.physical ?? "";
			case "directory.evnt.venue.online":
				return this.emojiMap.online ?? "";
			default:
				return this.emojiMap.unknown ?? "";
		}
	}

	protected clockEmoji(pd: PartialDate): string {
		const parsed = PartialDateUtil.parse(pd);
		if (parsed.precision !== "time") return this.emojiMap.clock ?? "🕐";
		const hour12 = parsed.hour % 12 || 12;
		const base = parsed.minute >= 30 ? 0x1f55c : 0x1f550;
		return String.fromCodePoint(base + hour12 - 1);
	}

	// == Links ===========================================

	protected override formatLink(url: string, name?: string): string {
		const icon = this.emojiMap.link ?? "";
		return [icon, super.formatLink(url, name)].filter(Boolean).join(" ");
	}
}
