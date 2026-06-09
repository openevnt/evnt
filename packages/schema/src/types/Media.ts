import z from "zod";
import type { Media, MediaPresentation } from "@evnt/types";
import { TranslationsSchema } from "./Translations";
import { MediaSourceSchema } from "./MediaSource";

export const MediaPresentationSchema = z.object({
	blurhash: z.string().optional().meta({ description: " A BlurHash representation of the media item" }),
	dominantColor: z.string()
		.refine((s): s is `#${string}` => s.startsWith("#") && s.length === 7, { message: "Must be a valid hex color code starting with a hashtag" })
		.optional()
		.meta({ description: "The dominant color of the media item in hex rgb format (must start with a hashtag)" }),
}).meta({
	id: "MediaPresentation",
	title: "Media Presentation",
	description: "The presentation details of a media item",
}) satisfies z.ZodType<MediaPresentation>;

export const MediaSchema = z.object({
	sources: MediaSourceSchema.array().min(1).meta({ description: "The sources for the media item" }),
	alt: TranslationsSchema.optional().meta({ description: "Alternative text for the media item" }),
	presentation: MediaPresentationSchema.optional().meta({ description: "The presentation details of the media item" }),

	// caption: TranslationsSchema.optional().meta({ description: "A caption for the media item" }),
	// kind?: "image" | "video" | "audio"
}).meta({
	id: "Media",
	title: "Media",
	description: "A media item, such as an image or video",
}) satisfies z.ZodType<Media>;
