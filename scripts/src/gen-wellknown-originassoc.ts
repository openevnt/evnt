import { writeFileSync } from "node:fs";
import type { InstancesJson } from "./types";

export const genWellKnownOriginAssoc = async (data: InstancesJson, dest: string | URL) => {
	const web_apps: {
		web_app_identity: string;
	}[] = [];

	for (const instance of data.instances) {
		web_apps.push({
			web_app_identity: instance.url,
		});
	}

	writeFileSync(dest, JSON.stringify({ web_apps }, null, 2));
};
