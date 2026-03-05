import { EventDataSchema } from "@evnt/schema";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import z from "zod";
import { userCreateEvent, userModifyEvent } from "./events";
import { APP_ORIGIN, REDIRECTOR_ORIGIN, VANTAGE_ORIGIN } from "../config/constants";

// Vantage Events Viewer has a /form page where we can define ?redirect-to= parameter
// When the user clicks submit, the app redirects to the specified URL with the event data in ?data= parameter
// We use these endpoints to handle these hooks and make the user redirect to actual API endpoints with the event data in the request body instead of query parameters

const querySchema = z.object({
	data: z.preprocess((val) => {
		if (typeof val !== "string") return null;
		try {
			const parsed = JSON.parse(val);
			return EventDataSchema.parse(parsed);
		} catch {
			return null;
		}
	}, EventDataSchema).meta({ description: "The event data in JSON format" }),
})

export const eventHooks = new Hono<{ Bindings: CloudflareBindings }>()
	.get(
		"/:id/view",
		(c) => {
			return c.redirect(REDIRECTOR_ORIGIN + "/?" + new URLSearchParams({
				action: "view-event",
				source: `${c.req.url.replace("/view", "")}`,
			}))
		},
	)
	.get(
		"/:id/form-update",
		(c) => {
			return c.redirect(VANTAGE_ORIGIN + "/form?" + new URLSearchParams({
				"redirect-to": `${APP_ORIGIN}/api/v1/events/hook/update/${c.req.param("id")}`,
				"source": `${c.req.url.replace("/form-update", "")}`,
			}))
		},
	)
	.get(
		"/hook/new",
		zValidator("query", querySchema),
		async (c) => {
			const email = c.get("email");
			if (!email) return c.json({ error: "Unauthorized" }, 401);
			const data = c.req.valid("query").data;
			const id = await userCreateEvent(c, data, email);
			return c.redirect(`/api/v1/events/${id}`);
		},
	)
	.get(
		"/hook/update/:id",
		zValidator("query", querySchema),
		async (c) => {
			const id = c.req.param("id");
			const data = c.req.valid("query").data;
			const email = c.get("email");
			if (!email) return c.json({ error: "Unauthorized" }, 401);

			const err = await userModifyEvent(c, id, data, email);
			if (err) return err;

			return c.redirect(`/api/v1/events/${id}`);
		},
	)
