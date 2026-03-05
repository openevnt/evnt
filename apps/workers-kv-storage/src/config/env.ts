import z from "zod";

export let ENV: z.infer<typeof configSchema>;

const configSchema = z.object({
	// OAuth settings
	GITHUB_CLIENT_ID: z.string(),
	GITHUB_CLIENT_SECRET: z.string(),
	DISCORD_CLIENT_ID: z.string(),
	DISCORD_CLIENT_SECRET: z.string(),
	// JWT settings
	JWT_SECRET: z.string(),
});

export const loadConfig = (env: any) => ENV = configSchema.parse(env);
