import z from "zod";
import { env } from "cloudflare:workers";

export const config = z.object({
	// OAuth settings
	GITHUB_CLIENT_ID: z.string(),
	GITHUB_CLIENT_SECRET: z.string(),
	DISCORD_CLIENT_ID: z.string(),
	DISCORD_CLIENT_SECRET: z.string(),
	// JWT settings
	JWT_SECRET: z.string(),
}).parse(env);
