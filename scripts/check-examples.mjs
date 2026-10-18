import { readdirSync, readFileSync } from "node:fs";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const notCheckedBySchema = new Set([
	"translations-keys-differ-in-case.evnt.json",
	"start-after-end.evnt.json",
	"partialdate-unknown-timezone.evnt.json",
]);

const readJson = (path) => JSON.parse(readFileSync(new URL(path, import.meta.url), "utf8"));
const ajv = new Ajv2020({ strict: true, allErrors: true });
addFormats(ajv);
const validate = ajv.compile(readJson("../docs/public/openevnt.schema.json"));

const problems = [];
for (const kind of ["valid", "invalid"]) {
	for (const file of readdirSync(new URL(`../examples/${kind}/`, import.meta.url))) {
		const passes = validate(readJson(`../examples/${kind}/${file}`));
		const shouldPass = kind === "valid" || notCheckedBySchema.has(file);
		if (passes !== shouldPass)
			problems.push(`${kind}/${file} ${passes ? "passes" : "fails"} the schema`);
	}
}

for (const problem of problems) console.error(problem);
process.exit(problems.length ? 1 : 0);
