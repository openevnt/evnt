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
			{ text: "Specification", link: "/README" },
			{ text: "Quickstart", link: "/getting-started" },
			{ text: "Playground", link: "/playground" },
			{ text: "Convert", link: "/convert" },
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
			{ text: "Specification", link: "/README" },
			{ text: "Quickstart", link: "/getting-started" },
			{ text: "Playground", link: "/playground" },
			{ text: "Convert", link: "/convert" },
			{
				text: "Design & Motivation",
				items: [
					{ text: "Why Open Evnt", link: "/why/" },
					{ text: "Translations", link: "/why/translations" },
					{ text: "Partial Dates", link: "/why/partial-date" },
					{ text: "Instances", link: "/why/instances" },
					{ text: "Components", link: "/why/components" },
					{ text: "Venues", link: "/why/venues" },
				],
			},
			{
				text: "Compared to",
				items: [
					{ text: "iCalendar", link: "/formats/icalendar" },
					{ text: "Schema.org", link: "/formats/schema-org" },
					{ text: "Lexicon Community", link: "/formats/community-lexicon" },
					{ text: "ActivityStreams", link: "/formats/activitystreams" },
				],
			},
			{
				text: "Protocols",
				items: [
					{ text: "AT Protocol", link: "/protocols/atproto" },
					{ text: "HTTPS", link: "/protocols/http" },
				],
			},
			{
				text: "Packages",
				items: [
					{ text: "Packages", link: "/packages/" },
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
