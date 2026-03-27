import path from "node:path";
import { serveAsset } from "@/lib/server/assetRoute";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SHERPA_ROOT = path.join(process.cwd(), "..", "models", "sherpa");

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> }
): Promise<Response> {
  const { path: fileParts } = await params;
  return serveAsset(SHERPA_ROOT, fileParts, "GET");
}

export async function HEAD(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> }
): Promise<Response> {
  const { path: fileParts } = await params;
  return serveAsset(SHERPA_ROOT, fileParts, "HEAD");
}
