import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const docsDir = path.resolve(rootDir, "docs");
const distDir = path.resolve(rootDir, "dist");
const port = Number(process.env.PORT ?? 4173);

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
};

function safeJoin(baseDir, relPath) {
  const target = path.resolve(baseDir, "." + relPath);
  const baseWithSep = baseDir.endsWith(path.sep) ? baseDir : baseDir + path.sep;
  if (target !== baseDir && !target.startsWith(baseWithSep)) {
    return null;
  }
  return target;
}

const server = http.createServer((req, res) => {
  const urlPath = new URL(req.url ?? "/", `http://localhost:${port}`).pathname;

  if (urlPath === "/dist" || urlPath.startsWith("/dist/")) {
    const filePath = safeJoin(distDir, urlPath.slice("/dist".length));
    if (!filePath || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      res.writeHead(404);
      res.end("Not Found");
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { "Content-Type": MIME_TYPES[ext] ?? "application/octet-stream" });
    fs.createReadStream(filePath).pipe(res);
    return;
  }

  const rel = urlPath === "/" ? "/index.html" : urlPath;
  const filePath = safeJoin(docsDir, rel);
  if (!filePath || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404);
    res.end("Not Found");
    return;
  }

  const ext = path.extname(filePath);
  res.writeHead(200, { "Content-Type": MIME_TYPES[ext] ?? "application/octet-stream" });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Playground berjalan di http://127.0.0.1:${port}`);
});
