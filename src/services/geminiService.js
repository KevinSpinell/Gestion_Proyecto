// ─────────────────────────────────────────────────────────────────────────────
//  geminiService.js
//  Simulated AI service. Replace fetch calls with real Gemini API when ready.
//  Real endpoint: https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent
// ─────────────────────────────────────────────────────────────────────────────

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || null

// Helper to call real API (activates when VITE_GEMINI_API_KEY is set in .env)
async function callGemini(prompt) {
  if (!GEMINI_API_KEY) {
    // Simulation mode — return realistic fake response
    return null
  }
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
  )
  const data = await res.json()
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || null
}

// ── TOPIC DETECTION ───────────────────────────────────────────────────────────
const TOPIC_SIMULATIONS = [
  ['Algoritmos de grafos', 'Dijkstra', 'Camino más corto', 'Complejidad O(E log V)', 'Cola de prioridades'],
  ['Bases de datos NoSQL', 'MongoDB', 'Colecciones y documentos', 'Índices', 'CRUD operations'],
  ['Programación funcional', 'Map y Filter', 'Funciones puras', 'Inmutabilidad', 'Reducers'],
  ['Estructuras de datos', 'Árboles binarios', 'Pilas y colas', 'Listas enlazadas', 'Tablas hash'],
]

export async function identifyTopics(transcriptionText) {
  const topicsArr = TOPIC_SIMULATIONS[Math.floor(Math.random() * TOPIC_SIMULATIONS.length)]

  const real = await callGemini(
    `Analiza esta transcripción de clase y lista los 4-5 temas principales en viñetas cortas (máximo 5 palabras cada uno):\n\n"${transcriptionText}"`
  )
  if (real) return real

  await delay(1200)
  return topicsArr.map(t => `• ${t}`).join('\n')
}

// ── SUMMARIZE ─────────────────────────────────────────────────────────────────
const SUMMARY_SIMULATIONS = [
  `**Resumen de la sesión:**\n\nDurante esta clase se abordaron los conceptos fundamentales del algoritmo de Dijkstra para encontrar el camino más corto en grafos ponderados. El profesor explicó la complejidad temporal O((V+E) log V) utilizando colas de prioridad (min-heap). Se discutieron casos de uso reales como sistemas de navegación GPS y redes de telecomunicaciones. Los estudiantes trabajaron en ejemplos con grafos de 6 nodos. Se destacó la diferencia con BFS y cuándo usar cada algoritmo según el tipo de grafo.`,
  `**Resumen de la sesión:**\n\nLa clase cubrió los fundamentos de MongoDB como base de datos NoSQL orientada a documentos. Se explicó la diferencia entre esquemas rígidos (SQL) y flexibles (NoSQL), el uso de BSON, colecciones, índices simples y compuestos. El profesor demostró operaciones CRUD básicas y operaciones de agregación con el pipeline. Se discutieron ventajas de escalabilidad horizontal y casos de uso ideales para MongoDB Atlas.`,
]

export async function summarizeTranscription(transcriptionText) {
  const real = await callGemini(
    `Genera un resumen estructurado en markdown de esta transcripción de clase universitaria. Incluye: temas principales, conceptos clave y puntos importantes. Sé conciso pero completo:\n\n"${transcriptionText}"`
  )
  if (real) return real

  await delay(1800)
  return SUMMARY_SIMULATIONS[Math.floor(Math.random() * SUMMARY_SIMULATIONS.length)]
}

// ── PARTIAL SUMMARY ───────────────────────────────────────────────────────────
export async function partialSummary(transcriptionText) {
  const real = await callGemini(
    `Resume en 3-4 oraciones lo que se ha explicado hasta ahora en esta clase:\n\n"${transcriptionText}"`
  )
  if (real) return real

  await delay(1000)
  return `Hasta el momento se han abordado los conceptos iniciales del tema. El profesor ha explicado los fundamentos teóricos y ha mencionado varios ejemplos prácticos. Los puntos clave incluyen definiciones esenciales y su aplicación en el contexto del curso. La clase continúa con los elementos más avanzados del tema.`
}

// ── Q&A ABOUT TRANSCRIPTION ───────────────────────────────────────────────────
const QA_SIMULATIONS = {
  default: `Basándome en la transcripción de la clase, puedo indicarte que el profesor ha explicado los conceptos fundamentales del tema con claridad. Si tienes dudas específicas sobre algún punto, te recomiendo revisar la sección de la transcripción donde se menciona ese concepto o reformular tu pregunta de manera más específica.`,
  repetir: `El profesor mencionó que el concepto central involucra un proceso iterativo donde cada paso reduce el problema a un subproblema más pequeño. La idea clave es que cada iteración garantiza una propiedad específica hasta llegar a la solución óptima.`,
  ejemplo: `Un ejemplo práctico mencionado en clase: considera un mapa de ciudades donde cada camino tiene un peso (tiempo o distancia). El algoritmo encuentra el camino más eficiente entre dos puntos, procesando nodo por nodo en orden de distancia acumulada.`,
  complejo: `La complejidad del algoritmo explicado es O(E log V) cuando se usa una cola de prioridad (heap). Esto significa que para grafos con V vértices y E aristas, el tiempo crece de manera logarítmica respecto al número de nodos, lo que lo hace eficiente para grafos grandes.`,
}

export async function askAboutTranscription(transcriptionText, userQuestion) {
  const real = await callGemini(
    `Eres un asistente educativo. Basándote ÚNICAMENTE en esta transcripción de clase:\n\n"${transcriptionText}"\n\nResponde esta pregunta de forma clara y educativa (máximo 4 oraciones): "${userQuestion}"`
  )
  if (real) return real

  await delay(1400)
  const q = userQuestion.toLowerCase()
  if (q.includes('repetir') || q.includes('explicar')) return QA_SIMULATIONS.repetir
  if (q.includes('ejemplo') || q.includes('caso')) return QA_SIMULATIONS.ejemplo
  if (q.includes('complej') || q.includes('eficien')) return QA_SIMULATIONS.complejo
  return QA_SIMULATIONS.default
}

// helper
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
