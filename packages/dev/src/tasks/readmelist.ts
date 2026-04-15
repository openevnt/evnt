import path from "node:path";
import type { EventEntry } from "./build";
import * as github from "@actions/github";
import * as core from "@actions/core";
import { readFileSync, writeFileSync } from "node:fs";
import { getOctokit } from "@actions/github";

export const readmelist = async (md: string, entries: EventEntry[]) => {
	const htmlUrl = await getHtmlUrl();

	if (!htmlUrl) return;

	const contents = readFileSync(md).toString();

	const list = eventslist(entries, htmlUrl);

	const newcontents = contents.replace(/<!-- EVENTS LIST START -->([\s\S]*?)<!-- EVENTS LIST END -->/m, `<!-- EVENTS LIST START -->
${list}
<!-- EVENTS LIST END -->`);

	writeFileSync(md, newcontents);
};

export const getHtmlUrl = async () => {
	try {
		const token = process.env.GITHUB_TOKEN || core.getInput("github-token");
		const octokit = getOctokit(token);
		const { owner, repo } = github.context.repo;
		const { data: pages } = await octokit.rest.repos.getPages({
			owner,
			repo,
		});
		// http -> https
		return pages.html_url ? (
			pages.html_url.replace(/^http:/, "https:")
		) : null;
	} catch (e) {
		return null;
	}
};

export const eventlink = (entry: EventEntry, htmlUrl: string) => {
	return `https://eventsl.ink/e?${new URLSearchParams({
		url: `${htmlUrl.replace(/\/$/, "")}/${entry.relativepath}`,
	}).toString()}`;
};

export const eventslist = (events: EventEntry[], htmlUrl: string) => {
	return events.map(entry => (
		`- [${path.basename(entry.relativepath)}](${eventlink(entry, htmlUrl)})`
	)).join("\n");
}
