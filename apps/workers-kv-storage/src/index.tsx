import { Hono } from "hono";
import { prettyJSON } from "hono/pretty-json";
import { events } from "./routes/events";
import { auth, authMiddleware } from "./routes/auth";
import { eventHooks } from "./routes/hook";
import { APP_ORIGIN, VANTAGE_ORIGIN } from "./config/constants";
import { loadConfig } from "./config/env";

const app = new Hono<{ Bindings: CloudflareBindings }>()
	.use("*", (c, next) => {
		loadConfig(c.env);
		return next();
	})
	.use(prettyJSON())
	.use(authMiddleware)
	.get(
		"/",
		(c) => {
			return c.text("Hello! You are " + (c.get("email") ?? "unknown"));
		},
	)
	.get(
		"/new",
		c => {
			return c.redirect(VANTAGE_ORIGIN + "/form?" + new URLSearchParams({
				"redirect-to": `${APP_ORIGIN}/api/v1/events/hook/new`,
			}));
		},
	)
	.route("/auth", auth)
	.route("/api/v1/events", events)
	.route("/api/v1/events", eventHooks)

app.onError((err, c) => {
	console.error(err);
	return c.json({ error: "Internal Server Error", details: err.message, stack: err.stack }, 500);
});

export default app;
