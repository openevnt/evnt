import z from "zod";
import type { MediaSource, MediaDimensions } from "@evnt/types";

export const MediaDimensionsSchema = z
	.object({
		width: z.number().int().nonnegative().meta({ description: "The width of the media in pixels" }),
		height: z
			.number()
			.int()
			.nonnegative()
			.meta({ description: "The height of the media in pixels" }),
	})
	.meta({
		id: "MediaDimensions",
		title: "Media Dimensions",
		description: "The dimensions of a media item",
	}) satisfies z.ZodType<MediaDimensions>;

const BaseMediaSourceSchema = z.object({
	dimensions: MediaDimensionsSchema.optional().meta({
		description: "The dimensions of the media in pixels",
	}),
	mimeType: z.string().optional().meta({ description: "The MIME type of the media" }),
});

export const MediaSourceSchema = z
	.object({
		url: z.url().optional().meta({ description: "The URL of the media source" }),
		blob: z
			.object({
				$type: z.literal("blob"),
				ref: z.object({
					$link: z.string().meta({ description: "CID" }),
				}),
				size: z.number().int().nonnegative().meta({ description: "The size of the blob in bytes" }),
				mimeType: z.string().meta({ description: "The MIME type of the blob" }),
			})
			.optional()
			.meta({ description: "AT Protocol Blob" }),
	})
	.extend(BaseMediaSourceSchema.shape)
	.refine((src) => src.url || src.blob, {
		message: "MediaSource must have either a url or a blob",
	})
	.meta({
		id: "MediaSource",
		title: "Media Source",
		description: "A source for a media item.",
	}) satisfies z.ZodType<MediaSource>;
