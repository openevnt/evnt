import { writeFileSync } from "node:fs";
import { convertSchemas, formatModelsAsMarkdown } from "zod2md";

export const genMarkdownDocs = async (dest: string | URL) => {
	const module = await import("@evnt/schema");
	const { $ID, $NSID, ...schemas } = module;
	const namedModels = Object.entries(schemas).map(([name, schema]) => ({
		name,
		schema,
		path: `schemas/${name}`,
	}));

	const list = convertSchemas(namedModels);
	list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
	// Put OpenEvntSchema first
	const openEvntIndex = list.findIndex((m) => m.name === "OpenEvntSchema");
	if (openEvntIndex !== -1) {
		const [openEvntModel] = list.splice(openEvntIndex, 1);
		list.unshift(openEvntModel!);
	}
	writeFileSync(
		dest,
		formatModelsAsMarkdown(list, {
			title: "Event Data Schema",
		}),
	);
};
