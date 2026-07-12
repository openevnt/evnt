export * from "./analyze-config.js";
export type * from "./types.js";
export * from "./date.js";
export * from "./duration.js";
export * from "./analyze.js";
export * from "./formatters/base.js";
export * from "./formatters/emoji.js";
export * from "./formatters/markdown.js";
export * from "./formatters/discord.js";

import type { OpenEvnt } from "@evnt/types";
import type { AnalyzeConfig } from "./analyze-config.js";
import type { EmojiFormatConfig, EmojiFormatOptions } from "./formatters/emoji.js";
import { defaultAnalyzeConfig } from "./analyze-config.js";
import { MarkdownFormatter } from "./formatters/markdown.js";

export interface PrettyOptions extends AnalyzeConfig, EmojiFormatConfig {}

export type PrettyOptionsInput = Partial<PrettyOptions> & {
	emoji?: Record<string, string> | false;
};

export const renderMarkdown = (event: OpenEvnt, options?: PrettyOptionsInput): string => {
	const merged: PrettyOptions = {
		...defaultAnalyzeConfig,
		...MarkdownFormatter.markdownDefaults,
		...options,
	};
	const formatter = new MarkdownFormatter(merged as PrettyOptions);
	return formatter.formatEvent(event);
};
