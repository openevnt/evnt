import { PartialDateUtil } from "@evnt/partial-date";
import type { EventStatus, PartialDate, Venue } from "@evnt/types";
import type { DateGroup, VenueGroup } from "../types.js";
import type { FormatOptions } from "./base.js";
import { PlainTextFormatter } from "./base.js";

export interface EmojiFormatOptions extends FormatOptions {
	emoji: Record<string, string> | false;
	statusIcons: Record<EventStatus, string>;
}

export type EmojiFormatInput = Partial<EmojiFormatOptions> & {
	emoji?: Record<string, string> | false;
};

const hasTime = (pd: PartialDate) => PartialDateUtil.has(pd, "time");

export class EmojiFormatter extends PlainTextFormatter {
	static readonly emojiDefaults: EmojiFormatOptions = {
		...PlainTextFormatter.defaultOptions,
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

	constructor(options: EmojiFormatInput = EmojiFormatter.emojiDefaults) {
		const merged = { ...EmojiFormatter.emojiDefaults, ...options };
		if (merged.emoji === false) {
			merged.emoji = {};
			merged.statusIcons = {
				planned: "",
				uncertain: "",
				postponed: "",
				cancelled: "",
				suspended: "",
			};
		}
		super(merged);
	}

	private get emojiMap(): Record<string, string> {
		const cfg = this.options as EmojiFormatOptions;
		return cfg.emoji === false ? {} : cfg.emoji;
	}

	private get statusIconMap(): Record<EventStatus, string> {
		return (this.options as EmojiFormatOptions).statusIcons;
	}

	override formatStatus(status: EventStatus, text: string): string {
		const icon = this.statusIconMap[status] ?? "";
		return [icon, text].filter(Boolean).join(" ");
	}

	protected override formatVenueGroup(
		venueGroup: VenueGroup,
		venueMap: Map<string, Venue>,
	): string {
		const venueStr = this.formatGroupVenues(venueGroup.venueIds, venueMap);
		const dateLines = venueGroup.groups.map((g) => this.formatDateGroup(g));
		if (venueStr) return [venueStr, dateLines.join("\n\n")].join("\n");
		return dateLines.join("\n\n");
	}

	protected override formatDateGroup(group: DateGroup): string {
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

	protected override formatLink(url: string, name?: string): string {
		const icon = this.emojiMap.link ?? "";
		return [icon, super.formatLink(url, name)].filter(Boolean).join(" ");
	}
}
