import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
    base: "/workflow-automation-builder/",
    build: {
        sourcemap: false,
    },
    plugins: [react()],
});
