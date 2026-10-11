/** Objective practice does not need Gemini. This only controls whether the
 * grading buttons should be offered; the grading request checks the key. */
export async function GET() {
  const key = process.env.GEMINI_API_KEY ?? "";
  // Google keys can have different formats. A prefix regex rejected a valid
  // production key even though both grading endpoints worked with it.
  const available = key.trim().length > 0;
  return Response.json({ available }, { headers: { "Cache-Control": "no-store" } });
}
