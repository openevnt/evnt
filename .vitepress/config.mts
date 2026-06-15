import { defineConfig } from "vitepress";

export default defineConfig({
	srcDir: "./docs",
	title: "Open Evnt",
	description: "An event data format with native multilingual support, partial real-world dates, and a component system that never needs a fork.",
	lang: "en",
	lastUpdated: true,

	ignoreDeadLinks: true,

	head: [
		["link", { rel: "icon", href: "/favicon.ico" }],
		["meta", { property: "og:title", content: "Open Evnt: a data format for events" }],
		["meta", { property: "og:description", content: "An event data format with native multilingual support, partial real-world dates, and a component system that never needs a fork." }],
		["meta", { property: "og:image", content: "https://evnt.directory/og.png" }],
		["meta", { property: "og:url", content: "https://evnt.directory" }],
		["meta", { property: "og:type", content: "website" }],
		["meta", { name: "twitter:card", content: "summary_large_image" }],
		["meta", { name: "twitter:title", content: "Open Evnt: a data format for events" }],
		["meta", { name: "twitter:description", content: "An event data format with native multilingual support, partial real-world dates, and a component system that never needs a fork." }],
		["meta", { name: "twitter:image", content: "https://evnt.directory/og.png" }],
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
			{
				text: "Design & Motivation",
				items: [
					{ text: "Ethos", link: "/guide/ethos" },
					{ text: "The Root Object", link: "/guide/root" },
					{ text: "Translations", link: "/guide/translations" },
					{ text: "Partial Dates", link: "/guide/partial-date" },
					{ text: "Venues", link: "/guide/venues" },
					{ text: "Instances", link: "/guide/instances" },
					{ text: "Components", link: "/guide/components" },
				],
			},
			{
				text: "Tools",
				items: [
					{ text: "Playground", link: "/playground" },
					{ text: "Convert", link: "/convert" },
				],
			},
			{
				text: "Reference",
				items: [
					{ text: "Specification", link: "/spec/" },
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

		footer: {
			message: "Open Evnt - open source data format for events",
			copyright: 'MIT Licensed - <a href="https://deniz.blue">deniz.blue</a>',
		},
	},
});
