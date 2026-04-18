import { create } from "zustand";
import type { EventSource } from "../../db/models/event-source";
import type { EventData } from "@evnt/schema";
import { PartialDateUtil, type PartialDate, type PlainDateString } from "@evnt/partial-date";
import { immer } from "zustand/middleware/immer";
import { useLayersStore } from "../../db/useLayersStore";
import { EventResolver } from "../../db/event-resolver";
import { enableMapSet } from "immer";

enableMapSet();

export interface CacheEventsStore {
	cache: {
		byText: Record<string, Set<EventSource>>;

		byPartialDate: Record<PartialDate, Set<EventSource>>;

		byWallDay: Record<PlainDateString, Set<EventSource>>;
		byWallMonth: Record<`${number}-${number}`, Set<EventSource>>; // "YYYY-MM"
	};

	hydrateSource: (source: EventSource) => Promise<void>;
	hydrate: (source: EventSource, data: EventData) => void;
	uncache: (source: EventSource) => void;
	init: () => Promise<void>;
};

export const useCacheEventsStore = create<CacheEventsStore>()(
	immer((set, get) => ({
		cache: {
			byPartialDate: {},
			byWallDay: {},
			byWallMonth: {},
			byText: {},
		},

		uncache: (source: EventSource) => set((state) => {
			for (const key in state.cache) {
				for (const entry in state.cache[key as keyof CacheEventsStore["cache"]]) {
					(state.cache as any)[key][entry].delete(source);
				}
			}
		}),

		hydrateSource: async (source: EventSource) => {
			const data = await EventResolver.resolve(source);
			get().uncache(source);
			if (data?.data) {
				get().hydrate(source, data.data);
			}
		},

		hydrate: (source: EventSource, data: EventData) => set((state) => {
			// == text ==

			const text = [
				...Object.values(data.name),
				...Object.values(data.label ?? {}),
			].join(" ");
			state.cache.byText[text] ||= new Set();
			state.cache.byText[text].add(source);

			// == dates ==

			for (const instance of data.instances || []) {
				for (const key of ["start", "end"] as const) {
					const partialDate = instance[key];
					if (!partialDate) continue;

					state.cache.byPartialDate[partialDate] ||= new Set();
					state.cache.byPartialDate[partialDate].add(source);

					const parsed = PartialDateUtil.parse(partialDate);

					const pad = (num: number) => num.toString().padStart(2, "0");

					switch (parsed.precision) {
						case "time":
						case "day": {
							const dayKey = [parsed.year, parsed.month, parsed.day].map(pad).join("-") as PlainDateString;
							state.cache.byWallDay[dayKey] ||= new Set();
							state.cache.byWallDay[dayKey].add(source);
						} // Fallthrough intended
						case "month": {
							const monthKey = `${parsed.year}-${pad(parsed.month)}` as `${number}-${number}`;
							state.cache.byWallMonth[monthKey] ||= new Set();
							state.cache.byWallMonth[monthKey].add(source);
						} // Fallthrough intended
						default: break;
					}
				}
			}
		}),

		init: async () => {
			console.time("Cache initialization...");
			const all = useLayersStore.getState().allTrackedSources();
			const { hydrate } = get();
			for (const source of all) {
				const data = await EventResolver.resolve(source);
				if (data?.data) {
					hydrate(source, data.data);
				}
			}
			console.timeEnd("Cache initialization...");
		},
	}))
);
