import swc from "unplugin-swc";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [
		tsconfigPaths(),
		swc.vite({
			module: { type: "es6" },
		}),
	],
	test: {
		include: ["test/**/*.e2e-spec.ts"],
		environment: "node",
		globals: true,
		testTimeout: 10_000,
	},
});
