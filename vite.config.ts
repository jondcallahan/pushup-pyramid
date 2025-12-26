import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

function fontPreload(): Plugin {
  return {
    name: "font-preload",
    transformIndexHtml: {
      order: "post",
      handler(html, ctx) {
        const preloads: string[] = [];

        if (ctx.bundle) {
          // Production: scan bundle for .woff2 files
          for (const fileName of Object.keys(ctx.bundle)) {
            if (
              fileName.endsWith(".woff2") &&
              fileName.includes("latin") &&
              !fileName.includes("latin-ext")
            ) {
              preloads.push(
                `<link rel="preload" href="/${fileName}" as="font" type="font/woff2" crossorigin>`
              );
            }
          }
        }

        if (preloads.length === 0) {
          return html;
        }

        return html.replace(
          "</head>",
          `    ${preloads.join("\n    ")}\n  </head>`
        );
      },
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), fontPreload()],
});
