import z from "zod";
import type { SplashMediaComponent } from "@evnt/types";
import { MediaSchema } from "../../types/Media.js";

export type SplashMediaRole = "background" | (string & {});
export const SplashMediaRoleSchema = z.string() as z.ZodType<SplashMediaRole>;

export const SplashMediaComponentSchema = z.object({
	$type: z
		.literal("directory.evnt.component.splashMedia")
		.meta({ description: "The type of the component" }),
	roles: SplashMediaRoleSchema.array(),
	media: MediaSchema,
}) satisfies z.ZodType<SplashMediaComponent>;
