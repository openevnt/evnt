import type { Translations } from "./Translations.js";

export interface Media {
	sources: MediaSource[];
	alt?: Translations;
	presentation?: MediaPresentation;
}

export interface MediaDimensions {
	width: number;
	height: number;
}

export interface MediaSource {
	url: string;
	mimeType?: string;
	dimensions?: MediaDimensions;
}

export interface MediaPresentation {
	blurhash?: string;
	dominantColor?: `#${string}`;
}
