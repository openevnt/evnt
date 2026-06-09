/**
 * Shared text/value helpers for converters.
 * These were copy-pasted across every converter — consolidated here.
 */

export const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === "object" && value !== null;

export const asArray = <T>(value: T | T[] | null | undefined): T[] => {
	if (value === null || value === undefined) return [];
	return Array.isArray(value) ? value : [value];
};

export const asNonEmptyString = (value: unknown): string | undefined => {
	if (typeof value !== "string") return undefined;
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : undefined;
};

export const asNumber = (value: unknown): number | undefined => {
	if (typeof value === "number" && Number.isFinite(value)) return value;
	if (typeof value === "string") {
		const parsed = Number.parseFloat(value);
		if (Number.isFinite(parsed)) return parsed;
	}
	return undefined;
};

/** Try to extract a URL from various common shapes (href/url/id props, or a bare string). */
export const readUrlLike = (value: unknown): string | undefined => {
	if (typeof value === "string") return asNonEmptyString(value);
	if (!isRecord(value)) return undefined;
	return asNonEmptyString(value.href)
		?? asNonEmptyString(value.url)
		?? asNonEmptyString(value.id);
};
