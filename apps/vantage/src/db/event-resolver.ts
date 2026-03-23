import { EventDataSchema, type EventData, type Venue } from "@evnt/schema";
import { UtilEventSource, type EventSource } from "./models/event-source";
import { DataDB } from "./data-db";
import { Client, simpleFetchHandler, type FailedClientResponse } from "@atcute/client";
import { parseCanonicalResourceUri, type Did } from "@atcute/lexicons/syntax";
import type { EventEnvelope } from "./models/event-envelope";
import { tryCatch, tryCatchAsync } from "../lib/util/trynull";
import { ZodError } from "zod";
import { didDocumentResolver } from "../lib/atproto/atproto-services";
import { getPdsEndpoint } from "@atcute/identity";
import { convertFromLexicon as convertFromCommunityLexicon } from "@evnt/convert/community-lexicon";

export class EventResolver {
	static async resolve(source: EventSource): Promise<EventEnvelope> {
		const cached = await DataDB.get(source);
		if (cached != null) {
			if (cached.data?.venues) cached.data.venues = cached.data.venues.map((obj: any): Venue => ({
				...obj,
				id: obj.id ?? obj.venueId,
				name: obj.name ?? obj.venueName,
				type: obj.type ?? obj.venueType,
			}));
			return cached;
		}

		const envelope = await this.#fetch(source);
		await DataDB.put(source, envelope);
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
				err: this.#EnvelopeError(fetchError as TypeError),
			};

			const notModified = res.status === 304;
			if (notModified) return envelope;

			const {
				data,
				...newEnvelope
			} = await this.fromResponse(res);

			return {
				...envelope,
				...newEnvelope,
				data: data ?? envelope.data,
			};
		} else {
			return await this.#fetchHttp(source);
		}
	}

	static async #updateAtProto(source: EventSource.At, envelope: EventEnvelope): Promise<EventEnvelope> {
		const {
			data,
			...newEnvelope
		} = await this.#fetchAtProto(source);
		return {
			...envelope,
			...newEnvelope,
			data: data ?? envelope.data,
		};
	}

	static async #fetchHttp(source: EventSource.Http | EventSource.Https): Promise<EventEnvelope> {
		const [res, fetchError] = await tryCatchAsync(() => fetch(source));
		if (fetchError) {
			return {
				data: null,
				err: this.#EnvelopeError(fetchError as TypeError),
			};
		};

		return await this.fromResponse(res);
	}

	static async fromResponse(res: Response): Promise<EventEnvelope> {
		if (!res.ok) {
			return {
				data: null,
				err: this.#EnvelopeError(res),
			};
		};

		const [json, jsonParseError] = await tryCatchAsync(() => res.json());
		if (jsonParseError) {
			return {
				data: null,
				err: this.#EnvelopeError(jsonParseError as SyntaxError),
			};
		};

		const envelope = this.fromJsonObject(json);

		return {
			...envelope,
			rev: {
				etag: res.headers.get("ETag") ?? undefined,
			},
		};
	}

	static fromJsonText(jsontext: string): EventEnvelope {
		const [json, jsonParseError] = tryCatch(() => JSON.parse(jsontext));
		if (jsonParseError) {
			return {
				data: null,
				err: this.#EnvelopeError(jsonParseError as SyntaxError),
			};
		}

		return this.fromJsonObject(json);
	}

	static fromJsonObject(json: unknown): EventEnvelope {
		const result = EventDataSchema.safeParse(json);

		if (!result.success) {
			return {
				data: null,
				err: this.#EnvelopeError(result.error),
			};
		}

		return {
			data: result.data,
			err: undefined,
		};
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

		if (fetchError) {
			return {
				data: null,
				err: this.#EnvelopeError(fetchError as TypeError),
			}
		}

		if (!res.ok) {
			return {
				data: null,
				err: this.#EnvelopeError(res),
			};
		}

		return {
			...this.fromAtProtoRecord(res.data.value),
			rev: {
				cid: res.data.cid,
			},
		};
	}

	static fromAtProtoRecord(record: Record<string, unknown>): EventEnvelope {
		if (record.$type === "community.lexicon.calendar.event") {
			const data = convertFromCommunityLexicon(record as any);
			return {
				data,
				err: undefined,
			};
		};

		return this.fromJsonObject(record);
	}

	static #EnvelopeError(err: TypeError | SyntaxError | Response | ZodError | FailedClientResponse): EventEnvelope.Error {
		if (err instanceof TypeError) return {
			kind: "fetch",
			message: err.message,
		};

		if (err instanceof SyntaxError) return {
			kind: "json-parse",
			message: err.message,
		};

		if (err instanceof Response) return {
			kind: "fetch",
			message: `HTTP error: ${err.status} ${err.statusText}`,
			status: err.status,
			// maybe body too?
		};

		if (err instanceof ZodError) return {
			kind: "validation",
			issues: err.issues,
		};

		// Plain object territory

		if (!err.ok && err.data) return {
			kind: "xrpc",
			error: err.data.error,
			message: err.data.message,
			status: err.status,
		}

		throw new Error(`Unreachable`);
	}
}
