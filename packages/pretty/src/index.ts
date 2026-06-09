export type { AnalyzeConfig } from "./analyze-config";
export { defaultAnalyzeConfig } from "./analyze-config";
export type { FormatConfig } from "./format-config";
export { defaultFormatConfig } from "./format-config";
export type {
	AnalyzedEvent,
	AnalyzedStatus,
	ActivitySummary,
	DateEntry,
	DateGroup,
	LinkSummary,
	VenueSummary,
} from "./types";
export { analyzeEvent, groupDates } from "./analyze";
export { PlainTextFormatter } from "./formatters/base";
export { MarkdownFormatter } from "./formatters/markdown";
export { DiscordFormatter } from "./formatters/discord";

import type { OpenEvnt } from "@evnt/types";
import { defaultAnalyzeConfig } from "./analyze-config";
import { defaultFormatConfig } from "./format-config";
import type { AnalyzeConfig } from "./analyze-config";
import type { FormatConfig } from "./format-config";
import { analyzeEvent } from "./analyze";
import { MarkdownFormatter } from "./formatters/markdown";

export type PrettyOptions = AnalyzeConfig & FormatConfig;

/**
 * Convenience — analyze and render an OpenEvnt event to markdown in one call.
 * Merge your preferred options; missing fields use defaults.
 */
export const renderMarkdown = (
	event: OpenEvnt,
	options?: Partial<PrettyOptions>,
): string => {
	const merged = { ...defaultAnalyzeConfig, ...defaultFormatConfig, ...options } as PrettyOptions;
	const analyzed = analyzeEvent(event, merged);
	const formatter = new MarkdownFormatter(merged);
	return formatter.formatEvent(analyzed);
};
