# El Horizonte Express — Vestuario Editorial v5

## Corrección principal
El logo de El Horizonte ahora va **embebido directamente dentro del HTML** en formato base64.

Esto evita que la splash screen dependa de una ruta relativa como `/assets/elhorizonte_logo.png`,
por lo que el logo no se rompe aunque Vercel cambie la forma de servir los archivos estáticos.

## Incluye
- Splash animada
- Logo real de El Horizonte
- Tagline: VESTUARIO EDITORIAL
- Interfaz tipo app
- Vestuario completo
- Cintillos de titulares
- Investigación web obligatoria desde la API de OpenAI

## Vercel
Configura:
- OPENAI_API_KEY
- opcional: OPENAI_MODEL=gpt-5.6-sol
