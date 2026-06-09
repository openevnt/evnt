import type { EventStatus } from "@evnt/types";

export interface FormatConfig {
	/** Locale for Intl.DateTimeFormat. */
	language: string;
	/** IANA timezone for local time display / timezone conversion hints. */
	timezone: string;
	/** Show status badges (❌ Cancelled, 🟡 Uncertain, etc.). */
	showStatus: boolean;
	/** Show activities (sub-sessions inside instances). */
	showActivities: boolean;
	/** Show link components. */
	showLinks: boolean;
	/** Show description text (from markdown/richtext components). */
	showDescription: boolean;
	/**
	 * When true, dates are shown compact ("Jun 15").
	 * When false, fuller ("June 15, 2026").
	 */
	compactDates: boolean;
	/** Custom emoji / icon overrides. */
	emoji: Record<string, string>;
	/** Status-specific icon overrides. */
	statusIcons: Record<EventStatus, string>;
}

export const defaultFormatConfig: FormatConfig = {
	language: "en",
	timezone: "UTC",
	showStatus: false,
	showActivities: false,
	showLinks: false,
	showDescription: false,
	compactDates: true,
	emoji: {
		calendar: "📅",
		clock: "🕐",
		online: "🌐",
		physical: "📍",
		unknown: "📍",
		link: "🔗",
		activity: "🎭",
	},
	statusIcons: {
		planned: "",
		uncertain: "🟡",
		postponed: "🟡",
		cancelled: "🔴",
		suspended: "🟠",
	},
};
