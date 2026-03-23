import { useIntent } from "./ui-stores";
import { parseResourceUri } from "@atcute/lexicons";
import { instances } from "virtual:instances";
import type { Intent } from "../../lib/intent";

export interface Redirectable {
	url?: string;
	title?: string;
	label?: string;
	faviconUrl?: string;
	faviconRadius?: number;
}

const tryParseResourceUri = (uri: string) => {
	const r = parseResourceUri(uri);
	if (!r.ok) return null;
	return r.value;
};

export const getRedirectablesForIntent = (intent: Intent | null): Redirectable[] => {
	const intentType = intent?.type ?? null;
	const hasUrl = intent?.type == "event" && !!intent.url;
	const hasAt = intent?.type == "event" && !!intent.at;
	const { repo, collection, rkey } = tryParseResourceUri(intent?.at || "") || {};

	const replaceMap: Partial<Record<string, string>> = {
		intent: intent ? new URLSearchParams(intent as Record<string, string>).toString() : "",
		aturi: intent?.at || "",
		"aturi-repo": repo || "",
		"aturi-collection": collection || "",
		"aturi-rkey": rkey || "",
	};

	return instances.instances.filter(instance => {
		if (!intent && instance.capabilities.includes("home")) return true;

		return instance.capabilities.some(cap => {
			const [type, ...rest] = cap.split(":");
			const args = rest.join(":");

			if (type === "event" && intentType === "event") {
				const [sourceKey, sourceParams] = args.split("?");
				if (sourceKey === "at" && hasAt) {
					if (!sourceParams) return true;
					const params = new URLSearchParams(sourceParams);
					if (params.get("collection") !== collection) return false;
					if (params.get("repo") && params.get("repo") !== repo) return false;
					if (params.get("rkey") && params.get("rkey") !== rkey) return false;
					return true;
				} else if (sourceKey.startsWith("http") && hasUrl) return true;
			}

			return false;
		});
	}).map(instance => ({
		title: instance.name || new URL(instance.url).host,
		label: new URL(instance.url).host,
		url: ((intent ? instance.redirectTo : false) || instance.url).replace(/{([^}]+)}/g, (_, key: string) => replaceMap[key] || ""),
		faviconUrl: instance.faviconUrl ?? `${instance.url.replace(/\/$/, "")}/favicon.ico`,
		faviconRadius: instance.faviconRadius,
	}));
};

export const usePublicInstances = () => {
	const intent = useIntent();
	return getRedirectablesForIntent(intent);
}

