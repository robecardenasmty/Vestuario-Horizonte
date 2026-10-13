# El Horizonte Express — Vestuario Editorial v6 FAST

V6 elimina la doble llamada secuencial de V5.

Ahora:
- hace UNA sola llamada a OpenAI;
- mantiene web_search;
- busca sólo clima, divisas y hechos sensibles/dudosos;
- usa search_context_size='low' para reducir latencia.

Variables de entorno:
- OPENAI_API_KEY
- opcional: OPENAI_MODEL=gpt-5.6-sol
