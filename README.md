# El Horizonte Express — Vestuario Editorial v12 · Voces Fish Audio

## Nueva pestaña: Voces

Permite generar MP3 directamente desde Fish Audio sin entrar a fish.audio.

### Voces configuradas
- Sofía Garza
- David Torres
- Ivet Serrano
- José Luis Marroquín
- Vanesa Aguilar
- Diego Olivos
- Paulina Cantú
- Javier Castañeda
- Bianca Cortés
- Mauricio Leal
- Renata Lozano

## Environment Variables en Vercel

OBLIGATORIA:
- `FISH_AUDIO_API_KEY`

OPCIONAL:
- `FISH_AUDIO_MODEL`

Si no configuras `FISH_AUDIO_MODEL`, la app usa:
- `s2.1-pro-free`

## Endpoint nuevo
- `POST /api/voz`

La API key nunca se envía al navegador.

## Se conserva
- Vestuario
- Titulares
- generación paralela Vestuario + Titulares
- Clima gráfico exacto
- Cintillo redes exacto
- memoria por pestaña
