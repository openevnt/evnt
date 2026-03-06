/// <reference types="@cloudflare/workers-types" />
/// <reference types="@atcute/atproto" />

import { Client, simpleFetchHandler } from "@atcute/client";
import { CompositeDidDocumentResolver, CompositeHandleResolver, DohJsonHandleResolver, LocalActorResolver, PlcDidDocumentResolver, WebDidDocumentResolver, WellKnownHandleResolver } from "@atcute/identity-resolver";
import { parseResourceUri } from "@atcute/lexicons";
import { type EventData, EventDataSchema, type KnownEventComponent, type Translations } from "@evnt/schema";
import { snippetToMarkdown } from "@evnt/pretty/markdown";
import { snippetEvent } from "@evnt/pretty";

interface Env { }

const actorResolver = new LocalActorResolver({
	handleResolver: new CompositeHandleResolver({
		methods: {
			dns: new DohJsonHandleResolver({ dohUrl: 'https://mozilla.cloudflare-dns.com/dns-query' }),
			http: new WellKnownHandleResolver(),
		},
	}),
	didDocumentResolver: new CompositeDidDocumentResolver({
		methods: {
			plc: new PlcDidDocumentResolver(),
			web: new WebDidDocumentResolver(),
		},
	}),
})

// Throws errors, beware!
const fetchEventData = async (source: string): Promise<EventData | null> => {
	if (source.startsWith("at://")) {
		const parsed = parseResourceUri(source);
		if (!parsed.ok || !parsed.value.collection || !parsed.value.rkey) return null;

		const { pds } = await actorResolver.resolve(parsed.value.repo);

		const rpc = new Client({
			handler: simpleFetchHandler({
				service: pds,
			}),
		});

		const res = await rpc.get("com.atproto.repo.getRecord", {
			params: {
				repo: parsed.value.repo,
				collection: parsed.value.collection,
				rkey: parsed.value.rkey,
			},
		});

		if (!res.ok) return null;
		return EventDataSchema.parse(res.data.value);
	} else if (source.startsWith("http://") || source.startsWith("https://")) {
		const res = await fetch(source);
		if (!res.ok) return null;
		const json = await res.json();
		return EventDataSchema.parse(json);
	} else return null;
};

export const onRequest: PagesFunction<Env> = async (ctx) => {
	const url = new URL(ctx.request.url);
	const response = await ctx.next();

	let data: EventData | null = null;

	try {
		let source = url.searchParams.get("source") ?? url.searchParams.get("url");
		if (
			url.searchParams.get("action") === "view-event"
			&& source
		) {
			console.log("Fetching event data for source:", source);
			data = await fetchEventData(source);
		}
	} catch (err) {
		console.error("Error fetching event data:", err);
	}

	const t = (translations: Translations): string =>
		translations["en"] || translations[Object.keys(translations)[0]] || "";

	let title = t(data?.name ?? {}) ?? null;

	let markdown = data ? snippetEvent(data).map(snip => snippetToMarkdown(snip)).join("\n") : "";

	let splashMediaComponents = data?.components
		?.filter((c): c is KnownEventComponent & { type: "splashMedia" } => c.type === "splashMedia")
		.map(c => c.data)
	let selected = splashMediaComponents?.find(c => c.roles.includes("ogembed"))
		?? splashMediaComponents?.find(c => c.roles.includes("embed"))
		?? splashMediaComponents?.find(c => c.roles.includes("poster"))
		?? splashMediaComponents?.[0];
	let image = selected?.media.sources[0];

	return new HTMLRewriter()
		.on('head', {
			element(element) {
				if (data) {
					element.append(`<meta property="twitter:card" content="summary"/>`, { html: true });
					element.append(`<meta property="twitter:site" content="Evnt Event"/>`, { html: true });
					element.append(`<meta property="og:title" content="${title!}" />`, { html: true });
					if (markdown) element.append(`<meta property="og:description" content="${markdown.slice(0, 200)}" />`, { html: true });
					if (image) {
						element.append(`<meta property="og:image" content="${image.url}" />`, { html: true });
						element.append(`<meta property="twitter:image" content="${image.url}" />`, { html: true });
						if (image.dimensions) {
							element.append(`<meta property="og:image:width" content="${image.dimensions.width}" />`, { html: true });
							element.append(`<meta property="og:image:height" content="${image.dimensions.height}" />`, { html: true });
						}
					}
				}
			},
		})
		.transform(response);
};
