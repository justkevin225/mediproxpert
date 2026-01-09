const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;

// Routes avec rewrites (comme dans vercel.json)
const rewrites = {
  '/mentions-legales': '/pages/mentions-legales.html',
  '/about': '/pages/about.html',
  '/a-propos': '/pages/about.html',
  '/conseil': '/pages/conseil.html',
  '/distribution': '/pages/distribution.html',
  '/equipements': '/pages/equipements.html',
  '/formation': '/pages/formation.html',
  '/materiel': '/pages/materiel.html',
  '/promotion': '/pages/promotion.html'
};

// Déterminer le type MIME
function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const types = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
  };
  return types[ext] || 'application/octet-stream';
}

// Servir un fichier
function serveFile(filePath, res) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<h1>404 - Fichier non trouvé</h1>');
      return;
    }
    
    res.writeHead(200, { 'Content-Type': getContentType(filePath) });
    res.end(data);
  });
}

// Créer le serveur
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  let pathname = parsedUrl.pathname;

  // Gérer les rewrites
  if (rewrites[pathname]) {
    pathname = rewrites[pathname];
  }

  // Route pour la page d'accueil
  if (pathname === '/') {
    pathname = '/index.html';
  }

  // Construire le chemin complet du fichier
  const filePath = path.join(__dirname, pathname);

  // Vérifier si le fichier existe
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<h1>404 - Fichier non trouvé</h1>');
      return;
    }

    serveFile(filePath, res);
  });
});

// Démarrer le serveur
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
  console.log(`📝 Routes disponibles:`);
  Object.keys(rewrites).forEach(route => {
    console.log(`   ${route} → ${rewrites[route]}`);
  });
  console.log(`\n✨ Ouvrez http://localhost:${PORT} dans votre navigateur\n`);
});
