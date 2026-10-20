
const FISH_AUDIO_API_KEY = process.env.FISH_AUDIO_API_KEY;
const FISH_AUDIO_MODEL = process.env.FISH_AUDIO_MODEL || "s2.1-pro-free";

const VOICES = {
  "David Torres": "6a0b1d562a7644bdbc94e12166c0bccb",
  "Ivet Serrano": "771e4c5eeb274fc4b8ae123c7244bbfa",
  "José Luis Marroquín": "bc42c9eb96dc46abaa8cf8aea92d33ad",
  "Vanesa Aguilar": "b38070d210824c43934a7bc7a317a966",
  "Diego Olivos": "643052dff85843ffb4840bada1925879",
  "Paulina Cantú": "aa29994adcd44098b27b59cb1ca68d51",
  "Javier Castañeda": "c8bed8c949ce478fa479917273d5b074",
  "Bianca Cortés": "17f1dd8260134ab9b0293f2f14a1993a",
  "Mauricio Leal": "e6f80a75818846988ef084c6e7ff78bf",
  "Renata Lozano": "04db0f12a69b49f1a52e3de00336eb08",
  "Sofía Garza": "b6ac3f58d5df46bd947a10c533a3583a",
  "Jared Villarreal": "27a9c5c37b2a4a0894dd1676593dcbbc",
  "Danea Lázaro": "ca1c6a4fa80149888c7b5008a89cd8fa",
  "Humberto Salazar": "fc54ea3d7cfd4b999597e59d8b5135ea",
  "Gladyz Zavaleta": "29b841274101418fbc0f1ad5d78a3b36",
  "Mario Castillo": "cbac43a5159f44849dcbecba0db678e8",
  "Tania Montemayor": "7ac64dddcf744654acd7dd30931b70a2",
  "Carlos Enríquez": "dab2f64f44104020bec1c99bbfab36a9",
  "David Cázares": "1a7733493c964aac84968984f536c4cd",
  "Julieta Guervara": "33bdabd4b1984c019076b36701ebc2a3",
  "Esmeralda Valdez": "8dd36fb5bbfa433495dc5a7b4eb702f4",
  "Olivia Martínez": "d8512b430cbb4daaa070b4310be19d13",
  "Paola Treviño": "2c8827a7b1214f0eb3420eacfcb5d5db",
  "Laura Palacios": "dc4d471edda84939b2d503caf4d8129a"
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Método no permitido." });
  }

  if (!FISH_AUDIO_API_KEY) {
    return res.status(500).json({
      error: "Falta configurar FISH_AUDIO_API_KEY en Vercel."
    });
  }

  const { voice, text } = req.body || {};

  if (!voice || !VOICES[voice]) {
    return res.status(400).json({ error: "Selecciona una voz válida." });
  }

  if (!text || !String(text).trim()) {
    return res.status(400).json({ error: "Escribe el texto que quieres generar." });
  }

  try {
    const fishResponse = await fetch("https://api.fish.audio/v1/tts", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${FISH_AUDIO_API_KEY}`,
        "Content-Type": "application/json",
        "model": FISH_AUDIO_MODEL
      },
      body: JSON.stringify({
        text: String(text).trim(),
        reference_id: VOICES[voice],
        format: "mp3"
      })
    });

    if (!fishResponse.ok) {
      const detail = await fishResponse.text();
      return res.status(fishResponse.status).json({
        error: `Fish Audio respondió ${fishResponse.status}.`,
        detail: detail.slice(0, 1200)
      });
    }

    const audioBuffer = Buffer.from(await fishResponse.arrayBuffer());

    const safeName = voice
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9_-]+/g, "_")
      .replace(/^_+|_+$/g, "");

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Length", audioBuffer.length);
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${safeName || "voz"}.mp3"`
    );
    res.setHeader("Cache-Control", "no-store");

    return res.status(200).send(audioBuffer);
  } catch (error) {
    console.error("Fish Audio TTS error:", error);
    return res.status(500).json({
      error: "No se pudo generar el audio con Fish Audio.",
      detail: error?.message || "Error desconocido"
    });
  }
}
