import z from "zod";
import type { Activity } from "@evnt/types";
import { TranslationsSchema } from "../../types/Translations";
import { EventComponentSchema } from "../components/EventComponent";

type ActivitySlot = Activity.Slot;
type ActivityTime = Activity.Time;
type ActivityDuration = Activity.Duration;

export const TimeSchema = z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:mm format").meta({ description: "Time in HH:mm format" }) as z.ZodType<ActivityTime>;

export const DurationSchema = z.string().regex(/^\d{1,}:\d{2}$/, "Duration must be in H:mm format").meta({ description: "Duration in HH:mm format, where hours can be more than 24" }) as z.ZodType<ActivityDuration>;

export const ActivitySlotSchema = z.object({
	day: z.number().int().nonnegative().optional().meta({ description: "The day of the activity, starting from 1" }),
	time: TimeSchema.optional().meta({ description: "The time of the activity" }),
	duration: DurationSchema.optional().meta({ description: "The duration of the activity" }),
}) as z.ZodType<ActivitySlot>;

export const EventActivitySchema = z.object({
	name: TranslationsSchema.meta({ description: "The name of the activity" }),
	slot: ActivitySlotSchema.optional().meta({ description: "The time slot of the activity" }),
	components: EventComponentSchema.array().optional().meta({ description: "Additional components of the event instance" }),
}) as z.ZodType<Activity>;
