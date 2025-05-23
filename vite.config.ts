import { defineConfig } from "vite";
import deno from "@deno/vite-plugin";

export default defineConfig({
  root: "./client",
  server: {
    port: 3000,
  },
  plugins: [
    deno(),
  ],
  optimizeDeps: {
    include: [],
  },
  esbuild: {
    jsx: "transform",
    jsxDev: false,
    jsxImportSource: "didact",
    jsxInject: `import didact from 'didact'`,
    jsxFactory: "didact.jsx",
    jsxFragment: "didact.fragment",
  },
  build: {
    minify: false,
  },
});