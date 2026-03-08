import { readFileSync } from "node:fs";
import { genMarkdownDocs } from "./gen-md";
import { genJsonSchema } from "./gen-schema";
import { genWellKnownOriginAssoc } from "./gen-wellknown-originassoc";

const JSON_SCHEMA_PATH = new URL("../../event-data.schema.json", import.meta.url);
const LEXICON_PATH = new URL("../../event-data.lexicon-beta.json", import.meta.url);
const MD_PATH = new URL("../../docs/SCHEMA.md", import.meta.url);

const INSTANCES_JSON_PATH = new URL("../../data/instances.json", import.meta.url);
const WELL_KNOWN_ORIGIN_ASSOC_PATH = new URL("../../apps/opener/public/.well-known/web-app-origin-association", import.meta.url);

async function main() {
	const jsonSchema = await genJsonSchema(JSON_SCHEMA_PATH);
	console.log("Generated JSON Schema at", JSON_SCHEMA_PATH.href);
	await genMarkdownDocs(MD_PATH);
	console.log("Generated Markdown Docs at", MD_PATH.href);

	const instancesJson = JSON.parse(readFileSync(INSTANCES_JSON_PATH, "utf-8"));

	await genWellKnownOriginAssoc(instancesJson, WELL_KNOWN_ORIGIN_ASSOC_PATH);
	console.log("Generated", WELL_KNOWN_ORIGIN_ASSOC_PATH.href);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
