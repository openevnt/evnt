export interface AnalyzeConfig {
	/** Group consecutive days with the same times into ranges ("Oct 12–14").
	 *  Non-consecutive days with the same time are grouped as a list ("Jul 1, 8, 15"). */
	mergeInstances: boolean;
}

export const defaultAnalyzeConfig: AnalyzeConfig = {
	mergeInstances: true,
};
