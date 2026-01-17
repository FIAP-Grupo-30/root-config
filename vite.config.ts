import federation from "@originjs/vite-plugin-federation";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [
		react(),
		tailwindcss(),
		federation({
			name: "@bytebank/root",
			exposes: {
				"./bytebank-store": "./src/exposes/bytebank-store.ts",
			},
			remotes: {
				"@bytebank/base": "http://localhost:9001/assets/remoteEntry.js",
				"@bytebank/financeiro": "http://localhost:9002/assets/remoteEntry.js",
				"@bytebank/dashboard": "http://localhost:9003/assets/remoteEntry.js",
			},
			shared: ["react", "react-dom", "react-router-dom"],
		}),
	],
	build: {
		modulePreload: false,
		target: "esnext",
		minify: false,
		cssCodeSplit: false,
	},
	server: {
		port: 9000,
		fs: {
			allow: ["."],
		},
	},
	preview: {
		port: 9000,
	},
});
