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
	url?: string;
	blob?: {
		$type: "blob";
		ref: {
			$link: string; // CID
		};
		size: number;
		mimeType: string;
	};
}

export interface MediaPresentation {
	blurhash?: string;
	dominantColor?: `#${string}`;
}
