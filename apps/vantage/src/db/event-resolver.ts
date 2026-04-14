import { UtilEventSource, type EventSource } from "./models/event-source";
import { DataDB } from "./data-db";
import { Client, simpleFetchHandler } from "@atcute/client";
import { parseCanonicalResourceUri, type Did } from "@atcute/lexicons/syntax";
import { type EventEnvelope, EventEnvelopeUtil } from "./models/event-envelope";
import { ResolvedEventEnvelopeUtil, type ResolvedEventEnvelope } from "./models/resolved-event-envelope";
import { tryCatch, tryCatchAsync } from "../lib/util/trynull";
import { didDocumentResolver } from "../lib/atproto/atproto-services";
import { getPdsEndpoint } from "@atcute/identity";

export class EventResolver {
	static async resolve(source: EventSource): Promise<ResolvedEventEnvelope> {
		const cached = await DataDB.get(source);
		if (cached != null) return ResolvedEventEnvelopeUtil.fromEnvelope(cached);

		const stored = await this.#fetch(source);
		await DataDB.put(source, stored);
		const envelope = ResolvedEventEnvelopeUtil.fromEnvelope(stored);
		console.log(`EventResolver: resolved event source ${source} from network, success: ${!!envelope.data}, err: ${!!envelope.err}`);
		return envelope;
	}

	static async update(source: EventSource) {
		const cached = await DataDB.get(source);
		if (!cached) return;
		if (UtilEventSource.isLocal(source)) return;
		const updated = await this.#update(source, cached);
		if (updated !== cached) await DataDB.put(source, updated);
	}

	static async #fetch(source: EventSource): Promise<EventEnvelope> {
		if (UtilEventSource.isLocal(source)) throw new Error(`Cannot fetch local event source: ${source}`);
		if (UtilEventSource.isHttpLike(source)) return await this.#fetchHttp(source);
		if (UtilEventSource.isAt(source)) return await this.#fetchAtProto(source);
		throw new Error(`Unsupported event source: ${source}`);
	}

	static async #update(source: Exclude<EventSource, EventSource.Local>, envelope: EventEnvelope): Promise<EventEnvelope> {
		if (UtilEventSource.isHttpLike(source)) return await this.#updateHttp(source, envelope);
		if (UtilEventSource.isAt(source)) return await this.#updateAtProto(source, envelope);
		return envelope;
	}

	static async #updateHttp(source: EventSource.Http | EventSource.Https, envelope: EventEnvelope): Promise<EventEnvelope> {
		const etag = envelope.rev?.etag;
		if (etag) {
			const [res, fetchError] = await tryCatchAsync(() => fetch(source, {
				headers: [
					["If-None-Match", etag],
				],
			}));

			if (fetchError) return {
				data: envelope.data,
				dataType: envelope.dataType,
				rev: envelope.rev,
				err: EventEnvelopeUtil.createError(fetchError as TypeError),
			};

			const notModified = res.status === 304;
			if (notModified) return envelope;

			const newEnvelope = await this.fromResponse(res);

			return {
				...envelope,
				...newEnvelope,
				data: newEnvelope.data ?? envelope.data,
				dataType: newEnvelope.dataType ?? envelope.dataType,
			};
		} else {
			return await this.#fetchHttp(source);
		}
	}

	static async #updateAtProto(source: EventSource.At, envelope: EventEnvelope): Promise<EventEnvelope> {
		const newEnvelope = await this.#fetchAtProto(source);
		return {
			...envelope,
			...newEnvelope,
			data: newEnvelope.data ?? envelope.data,
			dataType: newEnvelope.dataType ?? envelope.dataType,
		};
	}

	static async #fetchHttp(source: EventSource.Http | EventSource.Https): Promise<EventEnvelope> {
		const [res, fetchError] = await tryCatchAsync(() => fetch(source));
		if (fetchError) return EventEnvelopeUtil.fromError(fetchError as TypeError);
		return await this.fromResponse(res);
	}

	static async fromResponse(res: Response): Promise<EventEnvelope> {
		if (!res.ok) return EventEnvelopeUtil.fromError(res);

		const [json, jsonParseError] = await tryCatchAsync(() => res.json());
		if (jsonParseError) return EventEnvelopeUtil.fromError(jsonParseError as TypeError);

		return {
			data: json,
			dataType: EventEnvelopeUtil.inferDataType(json),
			rev: {
				etag: res.headers.get("ETag") ?? undefined,
			},
		};
	}

	static fromJsonText(jsontext: string): EventEnvelope {
		const [json, jsonParseError] = tryCatch(() => JSON.parse(jsontext));
		if (jsonParseError) return EventEnvelopeUtil.fromError(jsonParseError as SyntaxError);
		return EventEnvelopeUtil.create(json);
	}

	static async #fetchAtProto(source: EventSource.At): Promise<EventEnvelope> {
		const parsed = parseCanonicalResourceUri(source);
		if (!parsed.ok) throw new Error(`Invalid at-uri: ${parsed.error}`);

		const didDocument = await didDocumentResolver.resolve(parsed.value.repo as Did<"plc" | "web">);
		const pds = getPdsEndpoint(didDocument) ?? "https://bsky.social";

		const rpc = new Client({
			handler: simpleFetchHandler({
				service: pds,
			}),
		});

		const [res, fetchError] = await tryCatchAsync(() => rpc.get("com.atproto.repo.getRecord", {
			params: {
				repo: parsed.value.repo,
				collection: parsed.value.collection,
				rkey: parsed.value.rkey,
			},
		}));

		if (fetchError) return EventEnvelopeUtil.fromError(fetchError as TypeError);
		if (!res.ok) return EventEnvelopeUtil.fromError(res);

		return {
			data: res.data.value,
			dataType: EventEnvelopeUtil.inferDataType(res.data.value),
			rev: {
				cid: res.data.cid,
			},
		};
	}
}
