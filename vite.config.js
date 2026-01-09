import { readFileSync } from "fs";
import { defineConfig } from "vite";

// Lire les rewrites depuis vercel.json
const vercelConfig = JSON.parse(readFileSync("vercel.json", "utf-8"));
const rewrites = vercelConfig.rewrites || [];

export default defineConfig({
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: "./index.html",
        about: "./pages/about.html",
        conseil: "./pages/conseil.html",
        distribution: "./pages/distribution.html",
        equipements: "./pages/equipements.html",
        formation: "./pages/formation.html",
        materiel: "./pages/materiel.html",
        "mentions-legales": "./pages/mentions-legales.html",
        promotion: "./pages/promotion.html",
      },
    },
  },
  server: {
    port: 3000,
    open: "/",
    // Middleware pour gérer les rewrites en dev
    middlewareMode: false,
  },
  plugins: [
    {
      name: "vercel-rewrites",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = req.url?.split("?")[0] || "/";

          // Chercher un rewrite correspondant
          const rewrite = rewrites.find((r) => r.source === url);

          if (rewrite) {
            // Rediriger vers le fichier de destination
            const destination = rewrite.destination.replace(/^\//, "");
            req.url = `/${destination}`;
          }

          next();
        });
      },
    },
  ],
});
