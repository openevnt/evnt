import type { EventStatus, PartialDate } from "@evnt/types";

export interface AnalyzedEvent {
	name: string;
	label?: string;
	status?: AnalyzedStatus;
	dates: DateGroup[];
	venues: VenueSummary[];
	activities: ActivitySummary[];
	links: LinkSummary[];
	description?: string;
}

export interface AnalyzedStatus {
	status: EventStatus;
	text: string;
}

/** A set of dates that share venue + time pattern. */
export interface DateGroup {
	entries: DateEntry[];
	/** Deduplicated time ranges that apply to all days in this group. */
	timeRanges: { start?: PartialDate; end?: PartialDate }[];
}

export interface DateEntry {
	start?: PartialDate;
	end?: PartialDate;
}

export interface VenueSummary {
	id: string;
	name: string;
	type: "physical" | "online" | "unknown";
	detail?: string;
}

export interface ActivitySummary {
	name: string;
	day?: number;
	time?: string;
	duration?: string;
}

export interface LinkSummary {
	url: string;
	name?: string;
}
