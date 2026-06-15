export * from "./analyze-config";
export type * from "./types";
export * from "./date";
export * from "./duration";
export * from "./analyze";
export * from "./formatters/base";
export * from "./formatters/emoji";
export * from "./formatters/markdown";
export * from "./formatters/discord";

import type { OpenEvnt } from "@evnt/types";
import type { AnalyzeConfig } from "./analyze-config";
import type { EmojiFormatConfig } from "./formatters/emoji";
import { defaultAnalyzeConfig } from "./analyze-config";
import { MarkdownFormatter } from "./formatters/markdown";

export interface PrettyOptions extends AnalyzeConfig, EmojiFormatConfig {}

export const renderMarkdown = (
	event: OpenEvnt,
	options?: Partial<PrettyOptions>,
): string => {
	const merged: PrettyOptions = {
		...defaultAnalyzeConfig,
		...MarkdownFormatter.markdownDefaults,
		...options,
	};
	const formatter = new MarkdownFormatter(merged);
	return formatter.formatEvent(event);
};
