import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { SimpleSSG } from "@deniz-blue/vite-plugins";

export default defineConfig({
	plugins: [
		react(),
		SimpleSSG(),
	],

	build: {
		ssr: false,
	},
})
