<template>
	<div class="converter">
		<div class="controls">
			<div class="control-group">
				<label for="direction">Direction</label>
				<select id="direction" v-model="direction" class="select">
					<option value="to">Open Evnt → Other Format</option>
					<option value="from">Other Format → Open Evnt</option>
				</select>
			</div>

			<div class="control-group">
				<label for="format">Format</label>
				<select id="format" v-model="selectedFormat" class="select">
					<option v-for="fmt in availableFormats" :key="fmt.id" :value="fmt.id">
						{{ fmt.name }}
					</option>
				</select>
			</div>
		</div>

		<div class="editor-section">
			<label>{{ direction === "to" ? "Open Evnt JSON" : selectedFormatName + " Input" }}</label>
			<div class="presets">
				<button
					v-for="p in presets"
					:key="p.label"
					class="preset-btn"
					@click="input = p.value"
				>{{ p.label }}</button>
			</div>
			<textarea
				v-model="input"
				rows="8"
				spellcheck="false"
				class="code-input"
				placeholder="Paste your event data here…"
			></textarea>
		</div>

		<button class="convert-btn" @click="convert" :disabled="!input.trim()">
			Convert
		</button>

		<div v-if="output !== null" class="editor-section">
			<label>{{ direction === "to" ? selectedFormatName + " Output" : "Open Evnt JSON" }}</label>
			<textarea
				:value="output"
				rows="8"
				spellcheck="false"
				class="code-input"
				readonly
			></textarea>
			<button class="copy-btn" @click="copyOutput">
				{{ copied ? "Copied!" : "Copy to clipboard" }}
			</button>
			<p v-if="error" class="error-text">{{ error }}</p>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { formats, type FormatId } from "@evnt/convert";

type Direction = "to" | "from";

interface FormatOption {
	id: FormatId;
	name: string;
	directions: Direction[];
}

const directions: Record<FormatId, { to: boolean; from: boolean }> = {} as any;
for (const [id, fmt] of Object.entries(formats)) {
	directions[id as FormatId] = {
		to: !!fmt.to,
		from: !!fmt.from,
	};
}

const formatOptions: FormatOption[] = Object.entries(formats).map(([id, fmt]) => ({
	id: id as FormatId,
	name: fmt.name,
	directions: [
		...(fmt.to ? ["to" as const] : []),
		...(fmt.from ? ["from" as const] : []),
	],
}));

const direction = ref<Direction>("to");
const selectedFormat = ref<FormatId>("icalendar");
const input = ref("");
const output = ref<string | null>(null);
const error = ref<string | null>(null);
const copied = ref(false);

const availableFormats = computed(() =>
	formatOptions.filter((f) => f.directions.includes(direction.value)),
);

const selectedFormatName = computed(() => {
	const fmt = formats[selectedFormat.value];
	return fmt?.name ?? selectedFormat.value;
});

// Reset format if current one isn't available for new direction
const resetFormat = () => {
	if (!availableFormats.value.find((f) => f.id === selectedFormat.value)) {
		selectedFormat.value = availableFormats.value[0]?.id ?? "icalendar";
	}
};

const presets = computed(() => {
	if (direction.value === "to") {
		return [
			{
				label: "Simple talk",
				value: JSON.stringify(
					{
						v: "0.1",
						name: { en: "Keynote: The Future of Events" },
						instances: [
							{
								venueIds: [],
								start: "2027-03-08T09:00[UTC]",
								end: "2027-03-08T10:00[UTC]",
							},
						],
					},
					null,
					2,
				),
			},
			{
				label: "Multi-day conference",
				value: JSON.stringify(
					{
						v: "0.1",
						name: { en: "WebDevConf 2027", lt: "WebDevKonferencija 2027" },
						venues: [
							{
								id: "hall",
								$type: "directory.evnt.venue.physical",
								name: { en: "Main Hall" },
							},
						],
						instances: [
							{
								venueIds: ["hall"],
								start: "2027-06-15T09:00[Europe/Vilnius]",
								end: "2027-06-15T18:00[Europe/Vilnius]",
							},
							{
								venueIds: ["hall"],
								start: "2027-06-16T10:00[Europe/Vilnius]",
								end: "2027-06-16T17:00[Europe/Vilnius]",
							},
						],
					},
					null,
					2,
				),
			},
		];
	}

	return [
		{
			label: "iCalendar (.ics)",
			value: [
				"BEGIN:VCALENDAR",
				"VERSION:2.0",
				"PRODID:-//Example//EN",
				"BEGIN:VEVENT",
				"SUMMARY:Community Meetup",
				"DTSTART:20260715T180000Z",
				"DTEND:20260715T210000Z",
				"LOCATION:Main Hall",
				"END:VEVENT",
				"END:VCALENDAR",
			].join("\n"),
		},
		{
			label: "Schema.org JSON-LD",
			value: JSON.stringify(
				{
					"@context": "https://schema.org",
					"@type": "Event",
					name: "WebDevConf 2027",
					startDate: "2027-06-15T09:00[Europe/Vilnius]",
					endDate: "2027-06-15T18:00[Europe/Vilnius]",
					location: {
						"@type": "Place",
						name: "Main Hall",
					},
				},
				null,
				2,
			),
		},
	];
});

watch(direction, resetFormat);

function convert() {
	error.value = null;
	output.value = null;

	try {
		if (direction.value === "to") {
			const event = JSON.parse(input.value);
			const fmt = formats[selectedFormat.value];
			if (!fmt?.to) {
				error.value = "This format doesn't support conversion from Open Evnt.";
				return;
			}
			output.value = fmt.to(event as any);
		} else {
			const fmt = formats[selectedFormat.value];
			if (!fmt?.from) {
				error.value = "This format doesn't support conversion to Open Evnt.";
				return;
			}
			const result = fmt.from(input.value);
			output.value = JSON.stringify(result, null, 2);
		}
	} catch (e: any) {
		error.value = e.message ?? String(e);
	}
}

async function copyOutput() {
	if (output.value === null) return;
	try {
		await navigator.clipboard.writeText(output.value);
		copied.value = true;
		setTimeout(() => (copied.value = false), 2000);
	} catch {
		// fallback: select the textarea
	}
}

// Need to import watch
import { watch } from "vue";
</script>

<style scoped>
.converter {
	display: flex;
	flex-direction: column;
	gap: 1rem;
}

.controls {
	display: flex;
	gap: 1rem;
	flex-wrap: wrap;
}

.control-group {
	flex: 1;
	min-width: 200px;
}

.control-group label {
	font-weight: 600;
	font-size: 0.875rem;
	margin-bottom: 0.25rem;
	display: block;
}

.select {
	width: 100%;
	padding: 0.5rem 0.625rem;
	border: 1px solid var(--vp-c-divider);
	border-radius: 6px;
	background: var(--vp-c-bg);
	color: var(--vp-c-text-1);
	font-size: 0.875rem;
	cursor: pointer;
}

.select:focus {
	outline: none;
	border-color: var(--vp-c-brand-1);
}

.editor-section label {
	font-weight: 600;
	font-size: 0.875rem;
	margin-bottom: 0.5rem;
	display: block;
}

.presets {
	display: flex;
	flex-wrap: wrap;
	gap: 0.375rem;
	margin-bottom: 0.5rem;
}

.preset-btn {
	font-size: 0.75rem;
	padding: 0.25rem 0.625rem;
	border: 1px solid var(--vp-c-brand-1);
	border-radius: 4px;
	background: transparent;
	color: var(--vp-c-brand-1);
	cursor: pointer;
	white-space: nowrap;
	transition: background 0.15s, color 0.15s;
}

.preset-btn:hover {
	background: var(--vp-c-brand-1);
	color: var(--vp-c-bg);
}

.code-input {
	width: 100%;
	font-family: ui-monospace, "JetBrains Mono", "Fira Code", monospace;
	font-size: 0.8125rem;
	line-height: 1.5;
	padding: 0.75rem;
	border: 1px solid var(--vp-c-divider);
	border-radius: 6px;
	background: var(--vp-code-block-bg);
	color: var(--vp-c-text-1);
	resize: vertical;
	tab-size: 2;
	box-sizing: border-box;
}

.code-input:focus {
	outline: none;
	border-color: var(--vp-c-brand-1);
}

.convert-btn {
	align-self: flex-start;
	padding: 0.5rem 1.25rem;
	background: var(--vp-c-brand-1);
	color: var(--vp-c-bg);
	border: none;
	border-radius: 6px;
	font-size: 0.875rem;
	font-weight: 600;
	cursor: pointer;
	transition: background 0.15s;
}

.convert-btn:hover:not(:disabled) {
	background: var(--vp-c-brand-2);
}

.convert-btn:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}

.copy-btn {
	margin-top: 0.5rem;
	padding: 0.375rem 0.875rem;
	background: transparent;
	color: var(--vp-c-brand-1);
	border: 1px solid var(--vp-c-brand-1);
	border-radius: 4px;
	font-size: 0.8125rem;
	cursor: pointer;
	transition: background 0.15s, color 0.15s;
}

.copy-btn:hover {
	background: var(--vp-c-brand-1);
	color: var(--vp-c-bg);
}

.error-text {
	color: var(--vp-c-danger-1);
	font-size: 0.8125rem;
	white-space: pre-wrap;
	margin: 0.5rem 0 0;
}
</style>
