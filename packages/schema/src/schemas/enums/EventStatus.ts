import z from "zod";
import type { EventStatus } from "@evnt/types";

export const EventStatusSchema = z.union([
    z.literal("planned").meta({ description: "No disruptions - event is planned or has already occurred" }),
    z.literal("uncertain").meta({ description: "Event is not finalized" }),
    z.literal("postponed").meta({ description: "The event has been postponed to an unknown later date" }),
    z.literal("cancelled").meta({ description: "The event has been cancelled" }),
    z.literal("suspended").meta({ description: "The event may be postponed or cancelled" }),
]).meta({
    id: "EventStatus",
}) satisfies z.ZodType<EventStatus>;
