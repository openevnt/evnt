import type { FailedClientResponse } from "@atcute/client";
import { $NSID } from "@evnt/schema";
import { ZodError } from "zod";
import type { $ZodIssue } from "zod/v4/core";

export namespace EventEnvelope {
	export interface Metadata {
		rev?: Rev;
		err?: Error;
	};

	export type Rev = {
		// http/https sources
		etag?: string;

		// atproto sources
		cid?: string;
	};

	export type Error =
		| Error.JSONParse
		| Error.Validation
		| Error.Fetch
		| Error.XRPC
		| Error.UnknownDataType;

	export namespace Error {
		export interface JSONParse {
			kind: "json-parse";
			message: string;
		};

		export interface Validation {
			kind: "validation";
			issues: $ZodIssue[];
		};

		export interface Fetch {
			kind: "fetch";
			message: string;
			status?: number;
		};

		export interface XRPC {
			kind: "xrpc";
			error: string;
			message?: string;
			status: number;
		};

		export interface UnknownDataType {
			kind: "unknown-data-type";
			dataType?: string;
		};
	}

	export type DataType =
		| "directory.evnt.event"
		| "community.lexicon.calendar.event"
		| (string & {});
};

export interface EventEnvelope extends EventEnvelope.Metadata {
	data: unknown | null;
	dataType?: EventEnvelope.DataType;
};

export class EventEnvelopeUtil {
	static inferDataType(data: unknown): EventEnvelope.DataType | undefined {
		if (!data || typeof data !== "object") return undefined;
		const obj = data as Record<string, unknown>;
		if (typeof obj.$type === "string") return obj.$type;
		if ("v" in obj && "name" in obj) return $NSID;
		return undefined;
	}

	static create(data: unknown): EventEnvelope {
		return {
			data,
			dataType: this.inferDataType(data),
		};
	}

	static fromError(error: TypeError | SyntaxError | Response | ZodError | FailedClientResponse): EventEnvelope {
		return {
			data: null,
			err: this.createError(error),
		};
	}

	static createError(err: TypeError | SyntaxError | Response | ZodError | FailedClientResponse): EventEnvelope.Error {
		switch (true) {
			case err instanceof TypeError: return {
				kind: "fetch",
				message: err.message,
			};
			case err instanceof SyntaxError: return {
				kind: "json-parse",
				message: err.message,
			};
			case err instanceof Response: return {
				kind: "fetch",
				message: `HTTP error: ${err.status} ${err.statusText}`,
				status: err.status,
			};
			case err instanceof ZodError: return {
				kind: "validation",
				issues: err.issues,
			};
			case (!(err as FailedClientResponse).ok && !!(err as FailedClientResponse).data): return {
				kind: "xrpc",
				error: err.data.error,
				message: err.data.message,
				status: err.status,
			};
			default: throw new Error(`Unrecognized error type: ${JSON.stringify(err)}`, { cause: err });
		}
	}
}
