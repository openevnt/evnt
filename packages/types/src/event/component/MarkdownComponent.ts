export interface MarkdownComponent {
	$type: "directory.evnt.component.markdown";
	content: string;
	flavor?: "commonmark" | "gfm" | (string & {});
	version?: string;
};
