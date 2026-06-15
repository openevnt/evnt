/** Add a duration (HH:mm) to a time (HH:mm) and return the resulting time. */
export const addDuration = (time: string, duration: string): string => {
	const [th, tm] = time.split(":").map(Number);
	const [dh, dm] = duration.split(":").map(Number);
	const totalMinutes = (th ?? 0) * 60 + (tm ?? 0) + (dh ?? 0) * 60 + (dm ?? 0);
	const h = Math.floor(totalMinutes / 60);
	const m = totalMinutes % 60;
	return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};
