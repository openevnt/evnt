import { $NSID, type EventData } from "@evnt/schema";
import { useLayersStore } from "../../db/useLayersStore";
import { UtilEventSource, type EventSource } from "../../db/models/event-source";
import { DataDB } from "../../db/data-db";
import { useTasksStore } from "../../stores/useTasksStore";
import { EVENT_REDIRECTOR_URL } from "../../constants";
import { useATProtoAuthStore } from "../atproto/useATProtoStore";
import * as TID from "@atcute/tid";

export class EventActions {
	static async createLocalEvent(data: EventData, layerId?: string) {
		return await useTasksStore.getState().addTask({
			title: "Creating local event",
			notify: true,
		}, async () => {
			const source = UtilEventSource.localRandom();
			await DataDB.put(source, { data });
			useLayersStore.getState().addEventSource(source, layerId);
			return source;
		});
	}

	static async createEventFromSource(source: EventSource, layerId?: string) {
		return await useTasksStore.getState().addTask({
			title: "Creating event from source",
			notify: true,
		}, async () => {
			useLayersStore.getState().addEventSource(source, layerId);
			return source;
		});
	}

	static async updateLocalEvent(source: EventSource, data: EventData) {
		return await useTasksStore.getState().addTask({
			title: "Updating local event",
			notify: true,
		}, async () => {
			if (!UtilEventSource.isLocal(source)) throw new Error("Can only update local events");
			await DataDB.put(source, { data });
			return source;
		});
	}

	static async createATProtoEvent(data: EventData, layerId?: string) {
		return await useTasksStore.getState().addTask({
			title: "Creating ATProto event",
			notify: true,
		}, async () => {
			const { rpc, agent } = useATProtoAuthStore.getState();
			if (!rpc || !agent) throw new Error("Not authenticated with ATProto");
			const res = await rpc.post("com.atproto.repo.putRecord", {
				input: {
					collection: $NSID,
					record: {
						...data,
						"$type": $NSID,
					},
					repo: agent.sub,
					rkey: TID.now(),
				},
			});
			if (!res.ok) throw new Error(res.data.error + ": " + res.data.message);
			const source = res.data.uri as EventSource.At;
			useLayersStore.getState().addEventSource(source, layerId);
			return source;
		});
	}

	static async deleteEvent(source: EventSource, layerId?: string) {
		return await useTasksStore.getState().addTask({
			title: "Deleting event from layer",
			notify: true,
		}, async () => {
			useLayersStore.getState().removeEventSource(source, layerId);
		});
	}

	static getShareLink(source: EventSource) {
		const p = new URLSearchParams();
		if (UtilEventSource.isAt(source)) p.set("at", source);
		else p.set("url", source);
		return `${EVENT_REDIRECTOR_URL}/e?${p.toString()}`;
	}

	static getEmbedLink(source: EventSource) {
		return `${window.location.origin}/embed?${new URLSearchParams({
			source,
		}).toString()}`;
	}
};
