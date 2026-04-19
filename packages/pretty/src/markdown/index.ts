import type { PartialDate, Translations } from "@evnt/schema";
import { PartialDateUtil } from "@evnt/partial-date";
import type { Range, SnippetIcon, SnippetLabel, TSnippet } from "../core/snippet";
import { TranslationsUtil } from "@evnt/translations";

export class Emojis {
	static clock(time: string) {
		const [hours, minutes] = time.split(":").map(Number);
		let hour12 = (hours ?? 0) % 12 || 12;
		const base = ((minutes ?? 0) >= 30) ? 0x1F55C : 0x1F550;
		return String.fromCodePoint(base + hour12 - 1);
	}

	static country(countryCode: string) {
		return String.fromCodePoint(...countryCode.toUpperCase()
			.split("")
			.map(char => 127397 + char.charCodeAt(0)));
	}
}

export class MarkdownSnippets {
	language: string = "en";
	timezone: string = "UTC";
	flavor: null | "github" | "discord" = null;

	translate(text: Translations) {
		return TranslationsUtil.translate(text, [this.language]);
	}

	link(url: string, name?: string) {
		return name ? `[${name}](${url})` : url;
	}

	subtext(str: string) {
		if (this.flavor === "discord")
			return str.split("\n").map(line => `-# ${line}`).join("\n");
		return str;
	}

	icon(icon: SnippetIcon, label?: SnippetLabel) {
		if (icon === "clock" && label?.type === "time")
			return Emojis.clock(label.value); // TODO: timezones...
		if (icon === "calendar") return "📅";
		if (icon === "venue-online") return "🌐";
		if (icon === "venue-physical" || icon === "venue-mixed" || icon === "venue-unknown")
			return "📍";
		return "";
	}

	snippet(snippet: TSnippet) {
		const emoji = snippet.icon ? this.icon(snippet.icon, snippet.label) : "";
		const label = snippet.label ? this.label(snippet.label) : "";
		return [emoji, label].filter(Boolean).join(" ");
	}

	label(label: SnippetLabel): string {
		if (label.type === "text") return label.value;

		if (label.type === "placeholder") switch (label.hint) {
			case "unknown": return "Unknown";
			case "unnamed": return "Unnamed";
			default: return "";
		}

		if (label.type === "translations")
			return this.translate(label.value);

		if (label.type === "external-link")
			return this.link(label.url, label.name);

		if (label.type === "address")
			return (label.value.addr ?? "") + (label.value.countryCode ? (" " + Emojis.country(label.value.countryCode)) : "");

		if (label.type === "partial-date" || label.type === "date-time")
			return this.partialDate(label.value);

		if (label.type === "time")
			return this.time(label.value);

		if (label.type === "time-range")
			return this.timeRange(label.value);

		if (label.type === "date-time-range")
			return this.partialDateRange(label.value);

		const _exhaustiveCheck: never = label;
		return "";
	}

	partialDate(value: PartialDate) {
		const parsed = PartialDateUtil.parse(value);
		const temporal = PartialDateUtil.asFormattableTemporal(parsed);

		const fmt = new Intl.DateTimeFormat(this.language, {
			year: "numeric",
			month: PartialDateUtil.has(value, "month") ? "long" : undefined,
			day: PartialDateUtil.has(value, "day") ? "numeric" : undefined,
			hour: PartialDateUtil.has(value, "time") ? "numeric" : undefined,
			minute: PartialDateUtil.has(value, "time") ? "numeric" : undefined,
			calendar: "iso8601",
			hour12: false,
			timeZone: parsed.timezone,
		});

		const str = fmt.format(temporal);

		if (parsed.precision === "time" && parsed.timezone !== this.timezone) {
			const localizedFmt = new Intl.DateTimeFormat(this.language, {
				hour: "numeric",
				minute: "numeric",
				hour12: false,
				timeZone: this.timezone,
			});
			const localizedTime = localizedFmt.format(PartialDateUtil.asZonedDateTime(parsed).toInstant());
			return `${str} (${localizedTime})`;
		}

		return str;
	}

	partialDateRange(value: Range<PartialDate>) {
		return this.partialDate(value.start) + " - " + this.partialDate(value.end);
	}

	time(value: PartialDate.YearMonthDayTime) {
		const parsed = PartialDateUtil.parse(value);
		const sameTimezone = parsed.timezone === this.timezone;
		const time = PartialDateUtil.asPlainDateTime(parsed).toLocaleString(this.language, {
			hour: "2-digit",
			minute: "2-digit",
			hour12: false,
		});
		const localizedTime = PartialDateUtil.asZonedDateTime(parsed).toInstant().toLocaleString(this.language, {
			hour: "2-digit",
			minute: "2-digit",
			hour12: false,
			timeZone: this.timezone,
		});
		return `${time}${!sameTimezone && (time !== localizedTime) ? ` (${localizedTime})` : ""}`;
	}

	timeRange(value: Range<PartialDate.YearMonthDayTime>) {
		return this.time(value.start) + " - " + this.time(value.end);
	}
}
