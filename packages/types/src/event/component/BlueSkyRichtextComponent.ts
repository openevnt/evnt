export interface BlueSkyRichtextComponent {
	$type: "directory.evnt.component.blueSkyRichtext";
	text: string;
	facets: {
		index: { byteStart: number; byteEnd: number };
		features: { $type: string }[];
	}[];
};
