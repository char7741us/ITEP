/** The objective practice and static audio do not need Gemini. This endpoint
 * only controls whether optional AI grading buttons should be offered. */
export async function GET() {
  const key = process.env.GEMINI_API_KEY ?? "";
  const available = /^AIza[\w-]{30,}$/.test(key);
  return Response.json({ available }, { headers: { "Cache-Control": "no-store" } });
}
