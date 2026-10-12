import { createHash } from "node:crypto";

export class RequestProblem extends Error {
  constructor(message: string, public status: number) { super(message); }
}

/** Defence in depth only: memory is per server instance, not a paid-user quota. */
const buckets = new Map<string, { count: number; expires: number }>();
export function limitAIRequest(request: Request, now = Date.now()): Response | null {
  for (const [key, value] of buckets) if (value.expires <= now) buckets.delete(key);
  const address = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const key = createHash("sha256").update(address).digest("hex");
  const bucket = buckets.get(key) ?? { count: 0, expires: now + 60_000 };
  if (bucket.count >= 12 || (!buckets.has(key) && buckets.size >= 2000)) {
    return Response.json({ error: "Hiciste varias consultas seguidas. Espera un minuto y vuelve a intentar; tu práctica sigue guardada." }, {
      status: 429, headers: { "Retry-After": "60", "Cache-Control": "no-store" },
    });
  }
  bucket.count += 1;
  buckets.set(key, bucket);
  return null;
}

export async function readLimitedJSON(request: Request, maxBytes = 64 * 1024): Promise<unknown> {
  const origin = request.headers.get("origin");
  // Next.js may expose its internal hostname in request.url (e.g. localhost),
  // while Host is the public browser address (127.0.0.1 or a deployment alias).
  // Browsers cannot override Host. This remains a CSRF check, not API auth.
  const publicURL = new URL(request.url);
  const host = request.headers.get("host");
  if (host) {
    if (!/^[a-z0-9.:[\]-]+$/i.test(host)) throw new RequestProblem("Solicitud inválida.", 400);
    publicURL.host = host;
  }
  if ((origin && origin !== publicURL.origin) || request.headers.get("sec-fetch-site") === "cross-site") {
    throw new RequestProblem("Esta consulta debe hacerse desde el aplicativo.", 403);
  }
  const length = Number(request.headers.get("content-length") ?? 0);
  if (!Number.isFinite(length) || length < 0) throw new RequestProblem("Solicitud inválida.", 400);
  if (length > maxBytes) throw new RequestProblem("La respuesta es demasiado grande. Reduce el texto o la duración del audio.", 413);
  const reader = request.body?.getReader();
  if (!reader) throw new RequestProblem("Falta el contenido de la solicitud.", 400);
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        await reader.cancel();
        throw new RequestProblem("La respuesta es demasiado grande. Reduce el texto o la duración del audio.", 413);
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch (error) {
    if (error instanceof RequestProblem) throw error;
    throw new RequestProblem("Cuerpo de la solicitud inválido.", 400);
  } finally { reader.releaseLock(); }
}

export function requestProblemResponse(error: unknown): Response {
  return Response.json({ error: error instanceof RequestProblem ? error.message : "Solicitud inválida." }, {
    status: error instanceof RequestProblem ? error.status : 400,
    headers: { "Cache-Control": "no-store" },
  });
}
