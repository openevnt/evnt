import { defineConfig } from "vitepress";

const title = "Open Evnt Documentation";
const description = "Data format for detailed & accurate events";

export default defineConfig({
	srcDir: "./docs",
	title,
	description,
	lang: "en",
	lastUpdated: true,

	ignoreDeadLinks: true,

	head: [
		["link", { rel: "icon", href: "/favicon.ico" }],
		["meta", { property: "og:title", content: title }],
		["meta", { property: "og:description", content: description }],
		["meta", { property: "og:url", content: "https://evnt.directory" }],
		["meta", { property: "og:type", content: "website" }],
		["meta", { name: "twitter:title", content: title }],
		["meta", { name: "twitter:description", content: description }],
		[
			"meta",
			{ name: "keywords", content: "event, events, data format, multilingual, partial dates" },
		],
		["meta", { name: "author", content: "Open Evnt Contributors" }],
	],

	themeConfig: {
		logo: "/favicon.ico",
		siteTitle: "Open Evnt",

		nav: [
			{ text: "Home", link: "/" },
			{ text: "Quickstart", link: "/guide/getting-started" },
			{ text: "Specification", link: "/spec/" },
			{
				text: "Community",
				items: [
					{ text: "GitHub", link: "https://github.com/openevnt/evnt" },
					{ text: "BlueSky", link: "https://bsky.app/profile/evnt.directory" },
					{ text: "Discord", link: "https://deniz.blue/discord-invite?id=1493641727980994710" },
					{ text: "Matrix", link: "https://matrix.to/#/#evnt:catgirl.cloud" },
				],
			},
		],

		sidebar: [
			{ text: "Home", link: "/" },
			{ text: "Quickstart", link: "/guide/getting-started" },
			{ text: "Playground", link: "/playground" },
			{ text: "Convert", link: "/convert" },
			{
				text: "Reference",
				items: [{ text: "Specification", link: "/spec/" }],
			},
			{
				text: "Design & Motivation",
				items: [
					{ text: "Ethos", link: "/guide/ethos" },
					{ text: "Open Evnt Object", link: "/guide/root" },
					{ text: "Translations", link: "/guide/translations" },
					{ text: "Partial Dates", link: "/guide/partial-date" },
					{ text: "Venues", link: "/guide/venues" },
					{ text: "Instances", link: "/guide/instances" },
					{ text: "Components", link: "/guide/components" },
				],
			},
			{
				text: "Protocols",
				items: [
					{ text: "HTTP", link: "/protocol/http" },
					{ text: "AT Protocol", link: "/protocol/atproto" },
				],
			},
		],

		socialLinks: [
			{ icon: "github", link: "https://github.com/openevnt/evnt" },
			{ icon: "bluesky", link: "https://bsky.app/profile/evnt.directory" },
			{ icon: "discord", link: "https://deniz.blue/discord-invite?id=1493641727980994710" },
		],

		editLink: {
			pattern: "https://github.com/openevnt/evnt/edit/main/docs/:path",
		},
	},
});
