import { isCanonicalResourceUri, type CanonicalResourceUri, type Did, type Nsid, type RecordKey } from "@atcute/lexicons";
import z from "zod";
import { trynull } from "../../lib/util/trynull";

export namespace EventSource {
	export type Type = "local" | "http" | "https" | "at";

	export type Local = `local://${string}`;
	export type Http = `http://${string}`;
	export type Https = `https://${string}`;
	export type At = CanonicalResourceUri;
};

export type EventSource = EventSource.At | EventSource.Http | EventSource.Https | EventSource.Local;
export type RemoteEventSource = Exclude<EventSource, EventSource.Local>;

export const EventSourceAtSchema = z.string().refine(s => isCanonicalResourceUri(s), { message: "Invalid at URI" }) as z.ZodType<EventSource.At>;
export const EventSourceHttpSchema = z.url({ protocol: /^(https?)$/ }) as z.ZodType<EventSource.Http>;
export const EventSourceLocalSchema = z.string().refine(s => s.startsWith("local://"), { message: "Invalid local URI" }) as z.ZodType<EventSource.Local>;

export const EventSourceSchema = z.union([
	EventSourceAtSchema,
	EventSourceHttpSchema,
	EventSourceLocalSchema,
]) as z.ZodType<EventSource>;

export const RemoteEventSourceSchema = z.union([
	EventSourceAtSchema,
	EventSourceHttpSchema,
]) as z.ZodType<RemoteEventSource>;

export class UtilEventSource {
	static parse(str: string, client: boolean): EventSource {
		const parsed = EventSourceSchema.parse(str);
		if (!client && this.isLocal(parsed)) throw new Error("local:// not allowed in this context");
		return parsed;
	}

	static is(str: string, client: boolean): str is EventSource {
		return trynull(() => this.parse(str, client)) != null;
	}

	static local(uuid: string): EventSource.Local {
		return `local://${uuid}`;
	}

	static localRandom(): EventSource.Local {
		return this.local(crypto.randomUUID());
	}

	static https(url: string): EventSource.Https {
		return `https://${url}`;
	}

	static at(did: Did, collection: Nsid, rkey: RecordKey): EventSource.At {
		return `at://${did}/${collection}/${rkey}`;
	}

	static isAt(source: EventSource): source is EventSource.At {
		return source.startsWith("at://");
	}

	static isHttp(source: EventSource): source is EventSource.Http {
		return source.startsWith("http://");
	}

	static isHttps(source: EventSource): source is EventSource.Https {
		return source.startsWith("https://");
	}

	static isHttpLike(source: EventSource): source is EventSource.Http | EventSource.Https {
		return this.isHttp(source) || this.isHttps(source);
	}

	static isLocal(source: EventSource): source is EventSource.Local {
		return source.startsWith("local://");
	}

	static isFromNetwork(source: EventSource): source is EventSource.Http | EventSource.Https | EventSource.At {
		return source.startsWith("http://")
			|| source.startsWith("https://")
			|| source.startsWith("at://");
	}

	static getType(source: EventSource): EventSource.Type {
		return source.split("://", 1)[0] as EventSource.Type;
	}

	static fromOld(source: { type: "local"; uuid: string } | { type: "remote"; url: string }): EventSource {
		if (source.type === "local") {
			return this.local(source.uuid);
		} else {
			return source.url as EventSource;
		}
	}

	static isEditable(source: EventSource): source is EventSource.Local | EventSource.At {
		return this.isLocal(source) || (this.isAt(source) && !source.includes("community.lexicon.calendar.event"));
	}
};

