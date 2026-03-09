import { readFileSync, writeFileSync } from "node:fs";

export const postprocessLexicon = (file: URL) => {
	const content = JSON.parse(readFileSync(file, "utf-8"));

	for (let [k, v] of Object.entries(content.defs)) {
		if (k === "main") continue;
		delete content.defs[k];
		let pascal = k[0]!.toUpperCase() + k.slice(1);
		content.defs[pascal] = v;
	}

	writeFileSync(file, JSON.stringify(content, null, 2));
};
