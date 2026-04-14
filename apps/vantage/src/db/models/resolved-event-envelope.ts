import { $NSID, EventDataSchema, type EventData } from "@evnt/schema";
import { EventEnvelopeUtil, type EventEnvelope } from "./event-envelope";
import { convertFromLexicon as convertFromCommunityLexicon } from "@evnt/convert/community-lexicon";
import { convertFromVEvent } from "@evnt/convert/icalendar";
import ICAL from "ical.js";

export interface ResolvedEventEnvelope extends EventEnvelope.Metadata {
	data: EventData | null;
}

export class ResolvedEventEnvelopeUtil {
	static fromEnvelope(envelope: EventEnvelope): ResolvedEventEnvelope {
		const { data, dataType = EventEnvelopeUtil.inferDataType(data), err, rev } = envelope;
		if (!data) return { data: null, err, rev };

		switch (dataType) {
			case "blue.deniz.event": { if (envelope.data) (envelope.data as any).$type = $NSID }
			case $NSID: return this.#parseOpenEvnt(envelope);
			case "community.lexicon.calendar.event": return this.#parseCommunityLexicon(envelope);
			case "com.apple.icalendar": return this.#parseICalendar(envelope);
			default: return { data: null, err: { kind: "unknown-data-type", dataType } };
		}
	}

	static fromJsonObject(obj: unknown): ResolvedEventEnvelope {
		const envelope = EventEnvelopeUtil.create(obj);
		return this.fromEnvelope(envelope);
	}

	static #parseOpenEvnt(stored: EventEnvelope): ResolvedEventEnvelope {
		const { data, err, rev } = stored;
		const parseResult = EventDataSchema.safeParse(data);
		if (!parseResult.success) return { data: null, err: EventEnvelopeUtil.createError(parseResult.error), rev };
		return { data: parseResult.data, err, rev };
	}

	static #parseCommunityLexicon(stored: EventEnvelope): ResolvedEventEnvelope {
		const { data, err, rev } = stored;
		const converted = convertFromCommunityLexicon(data as any);
		return { data: converted, err, rev };
	}

	static #parseICalendar(stored: EventEnvelope): ResolvedEventEnvelope {
		const { data, err, rev } = stored;
		const jCalData = ICAL.parse((data as { value: string }).value);
		const vEvent = new ICAL.Component(jCalData);
		const converted = convertFromVEvent(vEvent);
		console.log("Converted iCalendar event data:", (data as { value: string }).value, converted);
		return { data: converted, err, rev };
	}
}
