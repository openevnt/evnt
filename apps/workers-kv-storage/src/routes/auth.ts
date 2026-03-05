import { githubAuth } from "@hono/oauth-providers/github";
import { discordAuth } from "@hono/oauth-providers/discord";
import { Context, Hono } from "hono";
import { createMiddleware } from "hono/factory";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { sign, verify } from "hono/jwt";
import { SignatureAlgorithm } from "hono/utils/jwt/jwa";
import { APP_ORIGIN } from "../config/constants";
import { ENV } from "../config/env";

export type Email = `${string}@${string}.${string}`;

declare module "hono" {
	interface ContextVariableMap {
		email?: Email;
	}
}

const AuthCookieName = "auth_token";
const AuthCookieMethod: SignatureAlgorithm = "HS256";
const MaxAgeSeconds = 60 * 60 * 24 * 7; // 7 days

const createAuthPayload = (email: Email) => {
	return {
		email,
		exp: Date.now() + 1000 * MaxAgeSeconds,
	};
};

const writeAuthCookie = async (c: Context, email: Email) => {
	const payload = createAuthPayload(email);
	const token = await sign(payload, ENV.JWT_SECRET, AuthCookieMethod);
	setCookie(c, AuthCookieName, token, {
		httpOnly: true,
		secure: true,
		sameSite: "Lax",
		maxAge: MaxAgeSeconds,
	});
};

export const authMiddleware = createMiddleware(async (c, next) => {
	const token = getCookie(c, AuthCookieName);

	if (token) {
		try {
			const decodedPayload = await verify(token, ENV.JWT_SECRET, AuthCookieMethod);
			if (typeof decodedPayload === "object" && "email" in decodedPayload) {
				c.set("email", decodedPayload.email as Email);
			}
		} catch (err) {
			deleteCookie(c, AuthCookieName);
		}
	}

	await next();
});

export const auth = new Hono()
	.get(
		"/github",
		githubAuth({
			get client_id() {
				return ENV.GITHUB_CLIENT_ID;
			},
			get client_secret() {
				return ENV.GITHUB_CLIENT_SECRET;
			},
			get redirect_uri() {
				return `${APP_ORIGIN}/auth/github`;
			},
			oauthApp: true,
			scope: [
				"user:email"
			],
		}),
		(c) => {
			const user = c.get("user-github");

			if (user?.email)
				writeAuthCookie(c, user.email as Email);

			return c.redirect("/");
		},
	)
	.get(
		"/discord",
		discordAuth({
			get client_id() {
				return ENV.DISCORD_CLIENT_ID;
			},
			get client_secret() {
				return ENV.DISCORD_CLIENT_SECRET;
			},
			get redirect_uri() {
				return `${APP_ORIGIN}/auth/discord`;
			},
			scope: [
				"identify",
				"email",
			],
		}),
		async (c) => {
			const token = c.get("token");

			if (!token) return c.json({ error: "No token provided" }, 400);

			const res = await fetch("https://discord.com/api/v10/users/@me", {
				headers: {
					"Authorization": `Bearer ${token.token}`
				}
			});

			const json: {
				email?: Email;
				verified?: boolean;
			} = await res.json();

			if (json.email && json.verified) {
				await writeAuthCookie(c, json.email);
			}

			return c.redirect("/");
		},
	)
	.get("/logout", (c) => {
		deleteCookie(c, AuthCookieName);
		return c.redirect("/");
	});
