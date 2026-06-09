import { h } from "vue";
import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import DataValidator from "./components/DataValidator.vue";

export default {
	extends: DefaultTheme,
	Layout: () => h(DefaultTheme.Layout, null, {}),
	enhanceApp({ app }) {
		app.component("DataValidator", DataValidator);
	},
} satisfies Theme;
