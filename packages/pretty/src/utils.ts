import { PartialDateUtil } from "@evnt/partial-date";
import type { OpenEvnt } from "@evnt/types";

export class EventUtil {
	static allTimezones(event: OpenEvnt): string[] {
		const timezones: string[] = [];

		for (const instance of event.instances ?? []) {
			if (instance.start)
				timezones.push(PartialDateUtil.parse(instance.start).timezone);
			if (instance.end)
				timezones.push(PartialDateUtil.parse(instance.end).timezone);
		}

		return timezones;
	}

	static majorityTimezone(event: OpenEvnt): string | null {
		const timezones = this.allTimezones(event);
		if (timezones.length === 0) return null;
		const counts: Record<string, number> = {};
		for (const tz of timezones) counts[tz] = (counts[tz] ?? 0) + 1;
		// @ts-ignore - this is fine, we know there is at least one timezone
		return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
	}
}
