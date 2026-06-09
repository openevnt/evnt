export interface AnalyzeConfig {
	/** Language to resolve translations to (BCP47). */
	language: string;
	/**
	 * When true, consecutive days with the same times are merged into ranges
	 * ("Oct 12–14" instead of "Oct 12, Oct 13, Oct 14").
	 * Non-consecutive days with the same time pattern are grouped as a list
	 * ("Jul 1, 8, 15").
	 */
	mergeInstances: boolean;
	/** Maximum venues to show individually before collapsing to "3 locations". */
	maxVenues: number;
	/** Maximum date groups before collapsing to earliest–latest. */
	maxDates: number;
}

export const defaultAnalyzeConfig: AnalyzeConfig = {
	language: "en",
	mergeInstances: true,
	maxVenues: 3,
	maxDates: 5,
};
