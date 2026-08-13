import { TranslationsUtil } from "@evnt/translations";
import type { EventStatus, OpenEvnt, PartialDate, Venue } from "@evnt/types";
import type { DateGroup, VenueGroup } from "../types.js";
import { groupDates } from "../analyze.js";
import { formatDate, formatDateRange, formatTime, formatTimeRange } from "../date.js";

export interface FormatOptions {
	language: string;
	timezone: string | null;
	groupConsecutiveDates: boolean;
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

export class PlainTextFormatter {
	static readonly defaultOptions: FormatOptions = {
		language: "en",
		timezone: null,
		groupConsecutiveDates: true,
		showStatus: false,
		showLinks: false,
		compactDates: true,
		maxDates: 5,
	};

	constructor(protected options: FormatOptions = PlainTextFormatter.defaultOptions) {}

	formatEvent(event: OpenEvnt): string {
		const lines: string[] = [];

		const name = this.resolveText(event.name);
		lines.push(this.formatHeader(name));

		if (event.label) {
			lines.push(this.formatSubHeader(this.resolveText(event.label)));
		}

		if (this.options.showStatus && event.status) {
			const text = statusTexts[event.status] ?? event.status;
			lines.push(this.formatStatus(event.status, text));
		}

		const byId = new Map<string, Venue>();
		for (const v of event.venues ?? []) byId.set(v.id, v);

		const venueGroups = groupDates(event.instances ?? [], this.options.groupConsecutiveDates);
		const totalDates = venueGroups.reduce((n, vg) => n + vg.groups.length, 0);
		const shownCount =
			this.options.maxDates > 0 ? Math.min(totalDates, this.options.maxDates) : totalDates;

		const blocks: string[] = [];
		let rendered = 0;
		for (const vg of venueGroups) {
			if (rendered >= shownCount) break;
			const slice: DateGroup[] = [];
			for (const g of vg.groups) {
				if (rendered >= shownCount) break;
				slice.push(g);
				rendered++;
			}
			blocks.push(this.formatVenueGroup({ venueIds: vg.venueIds, groups: slice }, byId));
		}

		if (blocks.length > 0) lines.push(blocks.join("\n\n"));
		if (totalDates > shownCount) {
			lines.push(`+ ${totalDates - shownCount} more dates`);
		}

		if (this.options.showLinks) {
			for (const comp of event.components ?? []) {
				if (
					comp.$type === "directory.evnt.component.link" ||
					comp.$type === "directory.evnt.component.source"
				) {
					const c = comp as { url: string; name?: Record<string, string> };
					lines.push(this.formatLink(c.url, c.name ? this.resolveText(c.name) : undefined));
				}
			}
		}

		return lines.filter(Boolean).join("\n");
	}

	protected formatHeader(text: string): string {
		return text;
	}

	protected formatSubHeader(text: string): string {
		return text;
	}

	formatStatus(_status: EventStatus, text: string): string {
		return text;
	}

	protected formatVenueGroup(venueGroup: VenueGroup, venueMap: Map<string, Venue>): string {
		const venueStr = this.formatGroupVenues(venueGroup.venueIds, venueMap);
		const dateLines = venueGroup.groups.map((g) => this.formatDateGroup(g));
		if (venueStr) return [venueStr, dateLines.join("\n\n")].join("\n");
		return dateLines.join("\n\n");
	}

	protected formatDateGroup(group: DateGroup): string {
		const lines: string[] = [];

		const dateStr = this.formatDateShape(group.dates);
		if (dateStr) lines.push(dateStr);

		const timeStr = group.times
			.map((t) => this.formatTimeRange(t.start, t.end))
			.filter(Boolean)
			.join(", ");
		if (timeStr) lines.push(timeStr);

		return lines.join("\n");
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
				return shape.dates.map((d) => this.formatDate(d)).join(", ");
		}
	}

	protected formatDate(pd: PartialDate): string {
		return formatDate(pd, this.options);
	}

	protected formatDateRange(start: PartialDate, end: PartialDate): string {
		return formatDateRange(start, end, this.options);
	}

	protected formatTimeRange(start?: PartialDate, end?: PartialDate): string {
		return formatTimeRange(start, end, this.options);
	}

	protected formatTime(pd: PartialDate): string {
		return formatTime(pd, this.options);
	}

	protected formatLink(url: string, name?: string): string {
		return name ?? url;
	}

	protected resolveText(translations: Record<string, string>): string {
		return TranslationsUtil.translate(translations, [this.options.language]);
	}
}
