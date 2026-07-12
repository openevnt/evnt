export interface RichTextBlueskyComponent {
	$type: "directory.evnt.richtext.bluesky";
	text: string;
	facets: {
		index: { byteStart: number; byteEnd: number };
		features: { $type: string }[];
	}[];
}
