import type { Address, PartialDate, Translations } from "@evnt/schema";

export type Range<T> = { start: T; end: T };

export type PlaceholderHint =
	| "unknown"
	| "unnamed" // Used for venues without names

export type SnippetLabel =
	| { type: "text"; value: string }
	| { type: "placeholder"; hint: PlaceholderHint }
	| { type: "translations"; value: Translations }
	| { type: "external-link"; url: string; name?: string }
	| { type: "address"; value: Address }
	| { type: "partial-date"; value: PartialDate }
	| { type: "time"; value: string; day?: PartialDate.Day }
	| { type: "time-range"; value: Range<{ value: string; day?: PartialDate.Day }> }
	| { type: "date-time"; value: PartialDate }
	| { type: "date-time-range"; value: Range<PartialDate> }

export type SnippetLabelProps<T extends SnippetLabel["type"]> = Omit<Extract<SnippetLabel, { type: T }>, "type">;

export type SnippetIcon =
	| "venue-online"
	| "venue-physical"
	| "venue-mixed"
	| "venue-unknown"
	| "calendar"
	| "clock"

export interface TSnippet {
	icon?: SnippetIcon;
	label?: SnippetLabel;
	sublabel?: SnippetLabel;
	children?: TSnippet[];
};
