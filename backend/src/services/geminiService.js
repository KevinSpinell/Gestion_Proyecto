// ─────────────────────────────────────────────────────────────────────────────
//  backend/src/services/geminiService.js
//  Server-side AI service — API key is kept in process.env (never exposed
//  to the browser).
// ─────────────────────────────────────────────────────────────────────────────

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || null;

/** Internal helper — calls the Gemini REST API */
async function callGemini(prompt) {
  if (!GEMINI_API_KEY) return null; // fallback to simulation
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
      }),
    }
  );
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
}

// ── Simulated data (used when GEMINI_API_KEY is not set) ──────────────────────
const TOPIC_SIMULATIONS = [
  ['Algoritmos de grafos', 'Dijkstra', 'Camino más corto', 'Complejidad O(E log V)', 'Cola de prioridades'],
  ['Bases de datos NoSQL', 'MongoDB', 'Colecciones y documentos', 'Índices', 'CRUD operations'],
  ['Programación funcional', 'Map y Filter', 'Funciones puras', 'Inmutabilidad', 'Reducers'],
];

const SUMMARY_SIMULATIONS = [
  `**Resumen:** Se abordaron los conceptos fundamentales del algoritmo de Dijkstra. El profesor explicó la complejidad temporal O((V+E) log V) con colas de prioridad y casos de uso reales (GPS, redes).`,
  `**Resumen:** La clase cubrió MongoDB como base de datos NoSQL. Se explicaron CRUD, agregaciones, índices y escalabilidad horizontal con MongoDB Atlas.`,
];

// ── Exports ───────────────────────────────────────────────────────────────────
async function identifyTopics(transcriptionText) {
  const real = await callGemini(
    `Analiza esta transcripción de clase y lista los 4-5 temas principales en viñetas cortas (máximo 5 palabras cada uno):\n\n"${transcriptionText}"`
  );
  if (real) return real;
  const arr = TOPIC_SIMULATIONS[Math.floor(Math.random() * TOPIC_SIMULATIONS.length)];
  return arr.map(t => `• ${t}`).join('\n');
}

async function summarizeTranscription(transcriptionText) {
  const real = await callGemini(
    `Genera un resumen estructurado en markdown de esta transcripción de clase universitaria. Incluye: temas principales, conceptos clave y puntos importantes:\n\n"${transcriptionText}"`
  );
  if (real) return real;
  return SUMMARY_SIMULATIONS[Math.floor(Math.random() * SUMMARY_SIMULATIONS.length)];
}

async function partialSummary(transcriptionText) {
  const real = await callGemini(
    `Resume en 3-4 oraciones lo que se ha explicado hasta ahora en esta clase:\n\n"${transcriptionText}"`
  );
  if (real) return real;
  return `Hasta el momento se han abordado los conceptos iniciales del tema con fundamentos teóricos y ejemplos prácticos.`;
}

async function askAboutTranscription(transcriptionText, userQuestion) {
  const real = await callGemini(
    `Eres un asistente educativo. Basándote ÚNICAMENTE en esta transcripción:\n\n"${transcriptionText}"\n\nResponde esta pregunta (máximo 4 oraciones): "${userQuestion}"`
  );
  if (real) return real;
  return `Basándome en la transcripción, el profesor explicó los conceptos fundamentales del tema con claridad. Si tienes dudas específicas, reformula tu pregunta de manera más detallada.`;
}

module.exports = { identifyTopics, summarizeTranscription, partialSummary, askAboutTranscription };
