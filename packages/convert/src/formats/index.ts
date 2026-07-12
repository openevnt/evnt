import type { FormatConverter } from "../types.js";
import { icalendar } from "./icalendar.js";
import { activitystreams } from "./activitystreams.js";
import { schemaOrg } from "./schema-org.js";
import { google } from "./google.js";
import { communityLexicon } from "./community-lexicon.js";

export const formats = {
	icalendar,
	activitystreams,
	schemaOrg,
	google,
	communityLexicon,
} as const;

export type FormatId = keyof typeof formats;

/** Look up a format by file extension (with or without dot). */
export const findByExtension = (ext: string): FormatConverter | undefined => {
	const clean = ext.startsWith(".") ? ext.slice(1) : ext;
	for (const fmt of Object.values(formats)) {
		if (fmt.extensions.includes(clean)) return fmt;
	}
	return undefined;
};

/** Look up a format by MIME type. */
export const findByMimeType = (mime: string): FormatConverter | undefined => {
	const clean = mime.split(";")[0]!.trim();
	for (const fmt of Object.values(formats)) {
		if (fmt.mimeTypes.includes(clean)) return fmt;
	}
	return undefined;
};
