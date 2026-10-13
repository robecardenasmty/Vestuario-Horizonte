// /api/generar.js
// EL HORIZONTE EXPRESS — Motor editorial v2
// Usa únicamente OpenAI Responses API + la herramienta integrada web_search.
// NO requiere WeatherAPI, Banxico API, Google API ni otra API externa.
//
// Variables de entorno:
// OPENAI_API_KEY=...
// OPENAI_MODEL=gpt-5.6-sol   (opcional)

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-5.6-sol";

function commonRules(fecha) {
  return `
Eres el editor de vestuario de EL HORIZONTE EXPRESS, noticiero de Monterrey, Nuevo León.
Fecha editorial: ${fecha}.

REGLAS FIJAS
- Español de México, estilo profesional de newsroom.
- No inventes datos.
- No conviertas acusaciones en hechos.
- Distingue claramente: hecho confirmado / declaración / denuncia / encuesta / proyección.
- Si una cifra o afirmación actual no puede comprobarse, dilo.
- Para información cambiante usa únicamente datos actuales localizados mediante web search.
- Prioriza fuentes oficiales, institucionales, medios reconocidos y fuentes primarias.
- Para hechos políticos usa lenguaje neutral y atribuido.
- Para clima usa información correspondiente a la fecha editorial, no pronósticos viejos.
- Para divisas se requieren SIEMPRE cuatro valores:
  DÓLAR COMPRA
  DÓLAR VENTA
  EURO COMPRA
  EURO VENTA
- Para divisas NO aceptes como sustituto una sola cotización interbancaria.
- Si no existe compra/venta actual confiable para una moneda, usa la última referencia confiable disponible y etiquétala explícitamente como "última referencia disponible".
- No mezcles dos valores incompatibles sin identificar claramente su fuente.
`;
}

function researchPrompt(mode, fecha, contenido) {
  return `
${commonRules(fecha)}

FASE 1 — INVESTIGACIÓN OBLIGATORIA

Antes de redactar cualquier vestuario debes INVESTIGAR EN LA WEB.

El material del usuario es:
<<<
${contenido}
>>>

Tu trabajo en esta fase es producir un BRIEF DE INVESTIGACIÓN, no el producto final.

A) VERIFICACIÓN DE NOTAS
- Revisa las afirmaciones que sean actuales, políticas, judiciales, meteorológicas, deportivas, financieras, empresariales, de salud pública o potencialmente controvertidas.
- Señala qué está confirmado y qué requiere matiz/corrección.
- Conserva datos exactos útiles para cintillos.
- Para encuestas, identifica fecha, población y margen/alcance si está disponible.
- Para acusaciones, conserva la atribución.

B) CLIMA OBLIGATORIO (sólo si mode = "vestuario")
Busca información ACTUAL para ${fecha}:
1. Panorama nacional de México:
   - ciclones/huracanes/tormentas activos
   - frentes fríos
   - lluvias intensas
   - calor extremo u otros fenómenos relevantes
2. Monterrey / Nuevo León:
   - máxima
   - mínima
   - probabilidad o condición de lluvia
   - alertas relevantes
Usa sólo datos de hoy o pronósticos explícitamente correspondientes a ${fecha}.

C) MERCADO CAMBIARIO OBLIGATORIO (sólo si mode = "vestuario")
Busca referencias actuales en México para:
- DÓLAR: COMPRA y VENTA
- EURO: COMPRA y VENTA

Preferencia:
1. Banco o institución financiera con tabla explícita de compra/venta.
2. Fuente financiera reconocida que reproduzca la tabla bancaria.
3. Última referencia disponible claramente fechada.

REGLA CRÍTICA:
No entregues una sola tasa media/interbancaria como si fuera compra/venta.
No inventes un lado faltante.
Escribe fuente y fecha/hora o "última referencia disponible" cuando corresponda.

D) FRASE DEL DÍA (sólo si mode = "vestuario")
- Elige una cita auténtica y verificable relacionada conceptualmente con una de las notas fuertes.
- Evita frases sin fuente o atribuciones dudosas.

Devuelve únicamente este esquema:

# BRIEF DE INVESTIGACIÓN

## VERIFICACIÓN DE NOTAS
...

## CLIMA ACTUAL
...

## DIVISAS ACTUALES
DÓLAR — COMPRA: ...
DÓLAR — VENTA: ...
EURO — COMPRA: ...
EURO — VENTA: ...
FUENTE(S): ...

## FRASE VERIFICADA
AUTOR:
CITA:
CONTEXTO/FUENTE:

Si el modo es titulares, puedes omitir CLIMA, DIVISAS y FRASE.
`;
}

function editorialPrompt(mode, fecha, contenido, research) {
  const common = `
${commonRules(fecha)}

FASE 2 — PRODUCCIÓN EDITORIAL

Usa como base el material original y el BRIEF DE INVESTIGACIÓN.
No contradigas el brief con datos no verificados.

MATERIAL ORIGINAL:
<<<
${contenido}
>>>

BRIEF DE INVESTIGACIÓN:
<<<
${research}
>>>

FORMATO GENERAL DE CINTILLO:
**PALABRA ARRIBA:** categoría breve
**NEGRITAS:** titular principal
**PARTE DE ABAJO:** dato complementario

- No uses tablas.
- Devuelve Markdown limpio.
`;

  if (mode === "titulares") {
    return common + `
MODO TITULARES
- El contenido es un RESUMEN EH con viñetas.
- Genera EXACTAMENTE UN cintillo por cada viñeta.
- Conserva el orden.
- Hazlos cortos y televisivos.
- Un solo dato fuerte por bloque.
- No agregues clima, divisas ni frase del día.
- Si el brief detectó una falsedad o riesgo importante, añade al final:
  # REVISIÓN ANTES DE AIRE
  con una nota breve.
`;
  }

  return common + `
MODO VESTUARIO COMPLETO

Para CADA fulltrack:
1. Encabezado con REPORTERO — TEMA.
2. DOS cintillos realmente diferentes.
3. REVISIÓN EDITORIAL sólo cuando el brief detecte algo que corregir, atribuir o matizar.
4. Si un puente de [CONDUCTORA] contiene una conclusión o afirmación problemática, señálala.
5. No reasignes reporteros.

AL FINAL DEBES INCLUIR OBLIGATORIAMENTE:

# MERCADO CAMBIARIO — ${fecha}

## DÓLAR
**COMPRA $XX.XX | VENTA $XX.XX**

## EURO
**COMPRA $XX.XX | VENTA $XX.XX**

Indica la referencia utilizada.

### [CONDUCTORA]
Debe decir:
"Ahora revisamos el comportamiento del peso frente a las principales monedas internacionales."

Después:
"El dólar estadounidense se compra esta mañana en [cantidad escrita con palabras] y se vende en [cantidad escrita con palabras]."

Después:
"Por su parte, el euro se compra en [cantidad escrita con palabras] y se vende en [cantidad escrita con palabras]."

Cierra:
"Estas cotizaciones pueden presentar variaciones durante la jornada dependiendo de la institución financiera."

NO OMITAS compra ni venta.
NO sustituyas por tipo interbancario.

# CLIMA — ${fecha}

## PANORAMA NACIONAL
Resume sólo los fenómenos meteorológicos relevantes del brief.

## MONTERREY / NUEVO LEÓN
**MÁXIMA:**
**MÍNIMA:**
**CONDICIONES / LLUVIA:**

### [CONDUCTORA]
Texto natural de aproximadamente 80–120 palabras.
Debe cerrar:
"Para más información, visite elhorizonte.mx. ¡Excelente [día de la semana]!"

# FRASE DEL DÍA — [AUTOR]

Usa únicamente la frase verificada en el brief.
Relaciona la reflexión con una de las notas principales.

### [CONDUCTORA]
"Antes de concluir, permítanme compartirles esta reflexión de [autor]:"
"[cita]"
Una reflexión breve y sobria.
"Con esta reflexión llegamos al final de El Horizonte Express."
`;
}

async function callOpenAI({ instructions, input, useWeb = false }) {
  const body = {
    model: OPENAI_MODEL,
    instructions,
    input
  };

  if (useWeb) {
    body.tools = [{
      type: "web_search",
      search_context_size: "medium",
      user_location: {
        type: "approximate",
        city: "Monterrey",
        region: "Nuevo León",
        country: "MX",
        timezone: "America/Monterrey"
      }
    }];
    // El prompt obliga a utilizar la búsqueda para datos actuales.
    // Se deja tool_choice en auto para permitir múltiples búsquedas
    // y razonamiento entre búsquedas.
    body.tool_choice = "auto";
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || "Error al consultar OpenAI.");
  }

  const parts = [];
  for (const item of data.output || []) {
    if (item.type === "message") {
      for (const c of item.content || []) {
        if (c.type === "output_text" && c.text) parts.push(c.text);
      }
    }
  }

  const text = parts.join("\n").trim();
  if (!text) throw new Error("OpenAI no devolvió texto utilizable.");
  return text;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido." });
  }

  if (!OPENAI_API_KEY) {
    return res.status(500).json({
      error: "Falta configurar OPENAI_API_KEY en Vercel."
    });
  }

  const { mode, contenido, fecha } = req.body || {};
  if (!contenido || !["vestuario", "titulares"].includes(mode)) {
    return res.status(400).json({ error: "Solicitud incompleta." });
  }

  try {
    // PASO 1: Investigación web obligatoria.
    const research = await callOpenAI({
      instructions: researchPrompt(mode, fecha, contenido),
      input: "Realiza la investigación obligatoria y entrega el brief.",
      useWeb: true
    });

    // PASO 2: Redacción con base en los hallazgos.
    // No necesita API externa: todo sigue ocurriendo en OpenAI.
    const finalText = await callOpenAI({
      instructions: editorialPrompt(mode, fecha, contenido, research),
      input: "Genera ahora la salida editorial final.",
      useWeb: false
    });

    return res.status(200).json({
      text: finalText,
      meta: {
        research_completed: true,
        web_search_used: true
      }
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Error interno."
    });
  }
}
