export interface AnalyzeConfig {
	/** Group consecutive days that share the same times into a single range
	 *  (e.g. "Oct 12–14"). Days with a different time pattern stay separate.
	 *  Set to false to render every instance by itself. */
	groupConsecutiveDates: boolean;
}

export const defaultAnalyzeConfig: AnalyzeConfig = {
	groupConsecutiveDates: true,
};
