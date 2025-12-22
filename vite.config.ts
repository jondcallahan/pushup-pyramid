import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import type { Plugin } from "vite";
import { defineConfig } from "vite";

// Plugin to add preload links for font files
function fontPreload(): Plugin {
  return {
    name: "font-preload",
    transformIndexHtml: {
      order: "post",
      handler(html, ctx) {
        // Find all .woff2 font files in the bundle
        const fontFiles: string[] = [];
        if (ctx.bundle) {
          for (const [fileName] of Object.entries(ctx.bundle)) {
            if (fileName.endsWith(".woff2")) {
              fontFiles.push(fileName);
            }
          }
        }

        // Generate preload links for Latin fonts (most important)
        const preloadLinks = fontFiles
          .filter((f) => f.includes("latin") && !f.includes("latin-ext"))
          .map(
            (f) =>
              `<link rel="preload" href="/${f}" as="font" type="font/woff2" crossorigin>`
          )
          .join("\n    ");

        // Inject after <head>
        return html.replace("<head>", `<head>\n    ${preloadLinks}`);
      },
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), fontPreload()],
});
