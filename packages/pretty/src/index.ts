export type { AnalyzeConfig } from "./analyze-config";
export { defaultAnalyzeConfig } from "./analyze-config";
export type { FormatConfig, TimestampStyle } from "./formatters/base";
export type { DiscordFormatConfig } from "./formatters/discord";
export type { AnalyzedEvent, AnalyzedStatus, ActivitySummary, DateEntry, DateGroup, LinkSummary, VenueSummary } from "./types";
export { analyzeEvent, groupDates } from "./analyze";
export { PlainTextFormatter } from "./formatters/base";
export { EmojiFormatter } from "./formatters/emoji";
export { MarkdownFormatter } from "./formatters/markdown";
export { DiscordFormatter } from "./formatters/discord";

import type { OpenEvnt } from "@evnt/types";
import type { AnalyzeConfig } from "./analyze-config";
import type { FormatConfig } from "./formatters/base";
import { defaultAnalyzeConfig } from "./analyze-config";
import { analyzeEvent } from "./analyze";
import { PlainTextFormatter } from "./formatters/base";
import { MarkdownFormatter } from "./formatters/markdown";

export type PrettyOptions = AnalyzeConfig & FormatConfig;

export const renderMarkdown = (
	event: OpenEvnt,
	options?: Partial<PrettyOptions>,
): string => {
	const merged = { ...defaultAnalyzeConfig, ...PlainTextFormatter.defaults, ...options } as PrettyOptions;
	const analyzed = analyzeEvent(event, merged);
	const formatter = new MarkdownFormatter(merged);
	return formatter.formatEvent(analyzed);
};
