import federation from "@originjs/vite-plugin-federation";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import { z } from "zod";

const schema = z.object({
	VITE_API_BASE_URL: z.url(),
	VITE_REMOTE_ROOT_URL: z.url(),
	VITE_REMOTE_FINANCEIRO_URL: z.url(),
	VITE_REMOTE_DASHBOARD_URL: z.url(),
	VITE_REMOTE_BASE_URL: z.url(),
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
	const ENV = schema.parse(loadEnv(mode, process.cwd(), ""));

	return {
		plugins: [
			react(),
			tailwindcss(),
			federation({
				name: "@bytebank/root",
				exposes: {
					"./bytebank-store": "./src/exposes/bytebank-store.ts",
				},
				remotes: {
					"@bytebank/base": ENV.VITE_REMOTE_BASE_URL,
					"@bytebank/financeiro": ENV.VITE_REMOTE_FINANCEIRO_URL,
					"@bytebank/dashboard": ENV.VITE_REMOTE_DASHBOARD_URL,
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
	};
});
