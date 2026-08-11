import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const distRoot = join(projectRoot, "dist");
const host = "127.0.0.1";
const port = Number.parseInt(process.env.PORT ?? "4173", 10);

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

if (!existsSync(join(distRoot, "index.html"))) {
  console.error("No se encontro dist/index.html. La version compilada no esta disponible.");
  process.exit(1);
}

const server = createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url ?? "/", `http://${host}`).pathname);
  const relativePath = normalize(pathname).replace(/^([/\\])+/, "");
  let filePath = resolve(distRoot, relativePath);

  if (!filePath.startsWith(`${distRoot}\\`) && filePath !== distRoot) {
    response.writeHead(403).end("Acceso denegado");
    return;
  }

  if (existsSync(filePath) && statSync(filePath).isDirectory()) {
    filePath = join(filePath, "index.html");
  }

  // React Router necesita volver a index.html en las rutas de la aplicacion.
  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    filePath = join(distRoot, "index.html");
  }

  response.writeHead(200, {
    "Content-Type": contentTypes[extname(filePath).toLowerCase()] ?? "application/octet-stream",
    "Cache-Control": "no-cache",
  });
  createReadStream(filePath).pipe(response);
});

server.listen(port, host, () => {
  console.log("");
  console.log(`PGPTE esta disponible en http://${host}:${port}`);
  console.log("Presione Ctrl+C para detenerlo.");
  console.log("");
});
