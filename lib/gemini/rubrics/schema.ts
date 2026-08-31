/** Plain JSON Schema — @google/genai (>=1.9.0) accepts this directly as `responseSchema`. */
export function buildRubricResponseSchema(dimensionKeys: string[]) {
  return {
    type: "object",
    properties: {
      score: { type: "number", description: "Puntaje final de 0.0 a 6.0, en pasos de 0.1" },
      cefrBand: { type: "string", enum: ["Below B2", "B2", "C1", "C2"] },
      dimensionScores: {
        type: "object",
        properties: Object.fromEntries(dimensionKeys.map((key) => [key, { type: "number" }])),
        required: dimensionKeys,
      },
      rationale: { type: "string", description: "Explicación breve del puntaje, en español" },
      strengths: { type: "array", items: { type: "string" }, description: "2-3 fortalezas, en español" },
      improvements: { type: "array", items: { type: "string" }, description: "2-3 mejoras a trabajar, en español" },
    },
    required: ["score", "cefrBand", "dimensionScores", "rationale", "strengths", "improvements"],
  };
}
