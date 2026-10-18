<template>
	<div class="validator">
		<div class="editor-section">
			<label for="json-input">Event JSON</label>
			<div class="presets">
				<button v-for="p in presets" :key="p.label" class="preset-btn" @click="raw = p.json">
					{{ p.label }}
				</button>
			</div>
			<textarea
				id="json-input"
				v-model="raw"
				rows="12"
				spellcheck="false"
				class="json-input"
				:class="{ 'has-error': error }"
				@blur="formatJson"
			></textarea>
			<p v-if="error" class="error-text">{{ error }}</p>
			<p v-else class="valid-text">Valid Open Evnt 0.2 event</p>
		</div>

		<div v-if="previewUrl" class="preview-section">
			<h3>Preview</h3>
			<div class="iframe-wrapper">
				<iframe
					v-if="raw.length < 2000"
					:src="previewUrl"
					:key="previewUrl"
					title="Event Preview"
				></iframe>
				<p v-else class="dimmed">Preview disabled for large payloads</p>
			</div>
			<p class="caption">Rendered using Vantage</p>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import Ajv2020, { type ErrorObject } from "ajv/dist/2020";
import addFormats from "ajv-formats";
import schema from "../../../docs/public/openevnt.schema.json";
import minimal from "../../../examples/valid/minimal.evnt.json";
import weeklySeries from "../../../examples/valid/weekly-series.evnt.json";
import venueNotAnnounced from "../../../examples/valid/venue-not-announced.evnt.json";
import cancelledParts from "../../../examples/valid/cancelled-occurrence-and-activity.evnt.json";
import everyComponent from "../../../examples/valid/every-component.evnt.json";

const ajv = new Ajv2020({ allErrors: true });
addFormats(ajv);
const validate = ajv.compile(schema);

const presets = [
	{ label: "Minimal", event: minimal },
	{ label: "Weekly series", event: weeklySeries },
	{ label: "Venue not announced", event: venueNotAnnounced },
	{ label: "Cancelled parts", event: cancelledParts },
	{ label: "Every component", event: everyComponent },
].map(({ label, event }) => ({ label, json: JSON.stringify(event, null, 2) }));

function describeError(error: ErrorObject) {
	const where = error.instancePath || "(root)";
	switch (error.keyword) {
		case "additionalProperties":
			return `${where}: ${error.message}: ${error.params.additionalProperty}`;
		case "const":
			return `${where}: ${error.message} ${JSON.stringify(error.params.allowedValue)}`;
		case "enum":
			return `${where}: ${error.message} ${error.params.allowedValues.map((v: unknown) => JSON.stringify(v)).join(", ")}`;
		default:
			return `${where}: ${error.message}`;
	}
}

const raw = ref(presets[0].json);

const error = computed(() => {
	try {
		if (validate(JSON.parse(raw.value))) return null;
		return (validate.errors ?? [])
			.filter((e) => e.keyword !== "if")
			.map(describeError)
			.join("\n");
	} catch (e: any) {
		return e.message;
	}
});

const previewUrl = computed(() => {
	try {
		JSON.parse(raw.value);
		return `https://vantage.deniz.blue/embed?${new URLSearchParams({
			data: raw.value,
		})}`;
	} catch {
		return null;
	}
});

function formatJson() {
	try {
		const obj = JSON.parse(raw.value);
		raw.value = JSON.stringify(obj, null, 2);
	} catch {
		// leave as-is
	}
}
</script>

<style scoped>
.validator {
	display: flex;
	flex-direction: column;
	gap: 1.5rem;
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
	transition:
		background 0.15s,
		color 0.15s;
}

.preset-btn:hover {
	background: var(--vp-c-brand-1);
	color: var(--vp-c-bg);
}

.json-input {
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
}

.json-input:focus {
	outline: none;
	border-color: var(--vp-c-brand-1);
}

.json-input.has-error {
	border-color: var(--vp-c-danger-1);
}

.error-text {
	color: var(--vp-c-danger-1);
	font-size: 0.8125rem;
	white-space: pre-wrap;
	margin: 0.25rem 0 0;
}

.valid-text {
	color: var(--vp-c-brand-2);
	font-size: 0.8125rem;
	margin: 0.25rem 0 0;
}

.preview-section h3 {
	font-size: 1rem;
	margin: 0 0 0.5rem;
}

.iframe-wrapper {
	border: 1px solid var(--vp-c-divider);
	border-radius: 6px;
	height: 300px;
	overflow: hidden;
	resize: both;
}

.iframe-wrapper iframe {
	width: 100%;
	height: 100%;
	border: none;
}

.caption {
	font-size: 0.75rem;
	color: var(--vp-c-text-2);
	margin: 0.25rem 0 0;
}

.dimmed {
	color: var(--vp-c-text-2);
	font-size: 0.875rem;
	padding: 1rem;
}
</style>
