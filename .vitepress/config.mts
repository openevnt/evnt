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
			{
				text: "Use cases",
				items: [
					{ text: "Calendar app", link: "/use-cases/calendar-app" },
					{ text: "Convention website", link: "/use-cases/convention-website" },
					{ text: "Ticketing site", link: "/use-cases/ticketing-site" },
					{ text: "Event directory", link: "/use-cases/event-directory" },
				],
			},
			{
				text: "Ecosystem",
				items: [
					{ text: "Libraries", link: "/libraries" },
					{ text: "Applications", link: "/applications" },
				],
			},
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
			{ text: "Playground", link: "/playground" },
			{ text: "Convert", link: "/convert" },
			{
				text: "Use cases",
				items: [
					{ text: "Calendar app", link: "/use-cases/calendar-app" },
					{ text: "Convention website", link: "/use-cases/convention-website" },
					{ text: "Ticketing site", link: "/use-cases/ticketing-site" },
					{ text: "Event directory", link: "/use-cases/event-directory" },
				],
			},
			{
				text: "Ecosystem",
				items: [
					{ text: "Libraries", link: "/libraries" },
					{ text: "Applications", link: "/applications" },
				],
			},
			{
				text: "Reference",
				items: [
					{ text: "Event", link: "/spec/open-evnt-event" },
					{ text: "Components", link: "/spec/open-evnt-event-components" },
					{ text: "Partial Date", link: "/spec/open-evnt-partialdate" },
					{ text: "Translations", link: "/spec/open-evnt-translations" },
					{
						text: "Manifest",
						link: "/spec/open-evnt-manifest",
					},
					{
						text: "Index",
						link: "/spec/open-evnt-index",
					},
				],
			},
			{
				text: "Protocols",
				items: [{ text: "HTTP", link: "/protocol/http" }],
			},
			{
				text: "Discovery",
				items: [{ text: "Link Discovery", link: "/protocol/link-discovery" }],
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
