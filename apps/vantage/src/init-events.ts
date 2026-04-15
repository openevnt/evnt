import { createJetstream } from "./lib/atproto/jetstream";
import { DataDB } from "./db/data-db";
import { eventQueryKey } from "./db/useEventQuery";
import { useLayersStore } from "./db/useLayersStore";
import { useATProtoAuthStore } from "./lib/atproto/useATProtoStore";
import { useCacheEventsStore } from "./lib/cache/useCacheEventsStore";
import { queryClient } from "./query-client";
import { useHomeStore } from "./stores/useHomeStore";

window.addEventListener("storage", (event) => {
	if (event.key === useLayersStore.persist.getOptions().name) useLayersStore.persist.rehydrate();
	if (event.key === useHomeStore.persist.getOptions().name) useHomeStore.persist.rehydrate();
});

useATProtoAuthStore.getState().initialize();
(async () => {
	console.time("Cache initialization");
	await useCacheEventsStore.getState().init();
	console.timeEnd("Cache initialization");
})();

DataDB.onUpdate((source) => {
	queryClient.invalidateQueries({ queryKey: eventQueryKey(source) });
});

DataDB.onUpdate((source) => {
	useCacheEventsStore.getState().hydrateSource(source);
});

createJetstream({
	onUpdate: async (source, record, event) => {
		if (!(await DataDB.has(source))) return console.debug("Skipped jetstream event because not in db"); // if not in db skip (otherwise we might download every event on atproto lol)
		console.debug("Jetstream event commit", { source, record, event });
		await DataDB.put(source, {
			data: record,
		});
	},
});
