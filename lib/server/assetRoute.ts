import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";

const MIME_BY_EXT: Record<string, string> = {
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".wasm": "application/wasm",
  ".onnx": "application/octet-stream",
};

function mimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_BY_EXT[ext] ?? "application/octet-stream";
}

function sanitizeSegments(parts: string[]): string[] {
  return parts.filter((part) => part.length > 0 && part !== "." && part !== "..");
}

function resolveSafePath(root: string, parts: string[]): string {
  const safeParts = sanitizeSegments(parts);
  const target = path.resolve(root, ...safeParts);
  const relative = path.relative(root, target);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("Invalid path");
  }
  return target;
}

export async function serveAsset(rootDir: string, parts: string[], method: string): Promise<Response> {
  let filePath: string;
  try {
    filePath = resolveSafePath(rootDir, parts);
  } catch {
    return new Response("Bad Request", { status: 400 });
  }

  let fileStat;
  try {
    fileStat = await stat(filePath);
    if (!fileStat.isFile()) {
      return new Response("Not Found", { status: 404 });
    }
  } catch {
    return new Response("Not Found", { status: 404 });
  }

  const headers = new Headers({
    "Content-Type": mimeType(filePath),
    "Content-Length": String(fileStat.size),
    "Cache-Control": "public, max-age=31536000, immutable",
  });

  if (method === "HEAD") {
    return new Response(null, { status: 200, headers });
  }

  const stream = createReadStream(filePath);
  return new Response(Readable.toWeb(stream) as ReadableStream, {
    status: 200,
    headers,
  });
}
