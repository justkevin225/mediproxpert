import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
} from "fs";
import { join } from "path";
import { defineConfig } from "vite";

// Lire les rewrites depuis vercel.json
const vercelConfig = JSON.parse(readFileSync("vercel.json", "utf-8"));
const rewrites = vercelConfig.rewrites || [];

// Fonction pour copier récursivement un dossier
function copyDir(src, dest) {
  if (!existsSync(dest)) {
    mkdirSync(dest, { recursive: true });
  }
  const entries = readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}

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
    {
      name: "copy-assets",
      writeBundle() {
        // Copier le dossier assets après le build
        const assetsSrc = join(process.cwd(), "assets");
        const assetsDest = join(process.cwd(), "dist", "assets");
        if (existsSync(assetsSrc)) {
          copyDir(assetsSrc, assetsDest);
          console.log("✅ Assets copiés dans dist/assets");
        }
      },
    },
  ],
});
