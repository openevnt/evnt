import { TranslationsUtil } from "@evnt/translations";
import type { EventStatus, OpenEvnt, PartialDate, Venue } from "@evnt/types";
import type { DateGroup } from "../types";
import { groupDates } from "../analyze";
import { formatDate, formatDateRange, formatTime, formatTimeRange } from "../date";

// == Config ==============================================

export interface FormatConfig {
	language: string;
	timezone: string;
	mergeInstances: boolean;
	showStatus: boolean;
	showLinks: boolean;
	compactDates: boolean;
	maxDates: number;
}

const statusTexts: Record<string, string> = {
	planned: "Planned",
	uncertain: "Uncertain",
	postponed: "Postponed",
	cancelled: "Cancelled",
	suspended: "Suspended",
};

// == Base formatter =======================================

export class PlainTextFormatter {
	static defaults: FormatConfig = {
		language: "en",
		timezone: "UTC",
		mergeInstances: true,
		showStatus: false,
		showLinks: false,
		compactDates: true,
		maxDates: 5,
	};

	constructor(protected config: FormatConfig) {}

	// == Top-level =======================================

	formatEvent(event: OpenEvnt): string {
		const lines: string[] = [];

		const name = this.resolveText(event.name);
		lines.push(this.formatHeader(name));

		if (event.label) {
			lines.push(this.formatSubHeader(this.resolveText(event.label)));
		}

		if (this.config.showStatus && event.status) {
			const text = statusTexts[event.status] ?? event.status;
			lines.push(this.formatStatus(event.status, text));
		}

		const byId = new Map<string, Venue>();
		for (const v of event.venues ?? []) byId.set(v.id, v);

		const groups = groupDates(event.instances ?? [], this.config.mergeInstances);
		const shownCount = this.config.maxDates > 0 ? Math.min(groups.length, this.config.maxDates) : groups.length;
		for (let i = 0; i < shownCount; i++) {
			lines.push(this.formatDateGroup(groups[i]!, byId));
		}
		if (groups.length > shownCount) {
			lines.push(`+ ${groups.length - shownCount} more dates`);
		}

		if (this.config.showLinks) {
			for (const comp of event.components ?? []) {
				if (comp.$type === "directory.evnt.component.link" || comp.$type === "directory.evnt.component.source") {
					const c = comp as { url: string; name?: Record<string, string> };
					lines.push(this.formatLink(c.url, c.name ? this.resolveText(c.name) : undefined));
				}
			}
		}

		return lines.filter(Boolean).join("\n");
	}

	// == Sections ========================================

	protected formatHeader(text: string): string {
		return text;
	}

	protected formatSubHeader(text: string): string {
		return text;
	}

	formatStatus(_status: EventStatus, text: string): string {
		return text;
	}

	// == Date groups =====================================

	protected formatDateGroup(group: DateGroup, venueMap: Map<string, Venue>): string {
		const dateStr = this.formatDateShape(group.dates);
		const timeStr = group.times.map(t => this.formatTimeRange(t.start, t.end)).filter(Boolean).join(", ");

		const parts = [dateStr, timeStr].filter(Boolean);

		const venueNames = this.formatGroupVenues(group.venueIds, venueMap);
		if (venueNames) parts.push("·", venueNames);

		return parts.filter(Boolean).join(" ");
	}

	protected formatGroupVenues(venueIds: string[], venueMap: Map<string, Venue>): string {
		const names: string[] = [];
		for (const id of venueIds) {
			const venue = venueMap.get(id);
			if (venue) names.push(this.resolveText(venue.name));
		}
		return names.join(", ");
	}

	protected formatDateShape(shape: DateGroup["dates"]): string {
		switch (shape.type) {
			case "single":
				return this.formatDate(shape.date);
			case "range":
				return this.formatDateRange(shape.from, shape.to);
			case "list":
				return shape.dates.map(d => this.formatDate(d)).join(", ");
		}
	}

	// == Dates & times ===================================

	protected formatDate(pd: PartialDate): string {
		return formatDate(pd, this.config);
	}

	protected formatDateRange(start: PartialDate, end: PartialDate): string {
		return formatDateRange(start, end, this.config);
	}

	protected formatTimeRange(start?: PartialDate, end?: PartialDate): string {
		return formatTimeRange(start, end, this.config);
	}

	protected formatTime(pd: PartialDate): string {
		return formatTime(pd, this.config);
	}

	// == Links ===========================================

	protected formatLink(url: string, name?: string): string {
		return name ?? url;
	}

	// == Helpers =========================================

	protected resolveText(translations: Record<string, string>): string {
		return TranslationsUtil.translate(translations, [this.config.language]);
	}
}
