import { EventData, EventDataSchema } from "@evnt/schema";
import { Context, Hono } from "hono";
import { JsonPatchSchema } from "@evnt/json-patch-schema";
import { zValidator } from "@hono/zod-validator";
import { cors } from "hono/cors";

type Email = `${string}@${string}.${string}`;
type Everyone = "*";
type Permission = "r" | "w";
type Permissions = Record<Permission, boolean>;
type KVMetadata = {
	permissions: Record<Email | Everyone, Permissions>;
};

const checkPermissions = (metadata: KVMetadata, method: Permission, email?: Email) => {
	if (metadata.permissions["*"]?.[method]) return true;
	return (email && metadata.permissions[email]?.[method]) || false;
};

export const userCreateEvent = async (
	c: Context<{ Bindings: CloudflareBindings }>,
	data: EventData,
	email: Email,
): Promise<string> => {
	const id = crypto.randomUUID();

	const metadata: KVMetadata = {
		permissions: {
			"*": {
				r: true,
				w: false,
			},
			[email]: {
				r: true,
				w: true,
			},
		},
	};

	await c.env.KV.put(`events:${id}`, JSON.stringify(data), {
		metadata,
	});

	return id;
};

export const userModifyEvent = async (
	c: Context<{ Bindings: CloudflareBindings }>,
	id: string,
	data: EventData,
	email: Email,
): Promise<any> => {
	const existing = await c.env.KV.getWithMetadata<EventData, KVMetadata>(`events:${id}`, "json");

	if (!existing.value || !existing.metadata)
		return c.json({ error: "Event not found" }, 404);

	if (!checkPermissions(existing.metadata, "w", email))
		return c.json({ error: "Access denied" }, 403);

	await c.env.KV.put(`events:${id}`, JSON.stringify(data), {
		metadata: existing.metadata,
	});
};

export const events = new Hono<{ Bindings: CloudflareBindings }>()
	.use(cors())
	.post(
		"/",
		zValidator("json", EventDataSchema),
		async (c) => {
			const email = c.get("email");
			if (!email) return c.json({ error: "Unauthorized" }, 401);

			const data = c.req.valid("json");

			const id = await userCreateEvent(c, data, email);

			return c.json({ success: true, id });
		},
	)
	.get(
		"/:id",
		async (c) => {
			const {
				metadata,
				value: data,
			} = await c.env.KV.getWithMetadata<EventData, KVMetadata>(`events:${c.req.param("id")}`, "json");

			if (!data || !metadata) return c.json({ error: "Event not found" }, 404);

			const email = c.get("email");
			if (!checkPermissions(metadata, "r", email))
				return c.json({ error: "Access denied" }, 403);

			return c.json(data);
		},
	)
	.put(
		"/:id",
		zValidator("json", EventDataSchema),
		async (c) => {
			const id = c.req.param("id");
			const email = c.get("email");
			if (!email) return c.json({ error: "Unauthorized" }, 401);

			const err = await userModifyEvent(c, id, c.req.valid("json"), email);
			if (err) return err;

			return c.json({ success: true, id });
		}
	)
	.patch(
		"/:id",
		zValidator("json", JsonPatchSchema),
		async (c) => {
			const id = c.req.param("id");
			const patches = c.req.valid("json");

			// const existing = await db.getEvent(id);
			// if (!existing) return c.json(Errors.NotFound(), 404);

			// const updated = applyOperations(existing.data, patches);
			// const validated = EventDataSchema.safeParse(updated);

			// if (!validated.success)
			// 	return c.json(Errors.ZodValidation(validated.error), 400);

			// await db.updateEventData(id, validated.data);

			// return c.json(validated.data);
		},
	)
	.delete(
		"/:id",
		async (c) => {
			const id = c.req.param("id");
			const existing = await c.env.KV.getWithMetadata<EventData, KVMetadata>(`events:${id}`, "json");

			if (!existing.value || !existing.metadata)
				return c.json({ error: "Event not found" }, 404);

			const email = c.get("email");
			if (!checkPermissions(existing.metadata, "w", email))
				return c.json({ error: "Access denied" }, 403);

			await c.env.KV.delete(`events:${id}`);

			return c.json({ success: true });
		},
	)
