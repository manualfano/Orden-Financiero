# tools/ — archivos auxiliares, desactualizados

Estos dos archivos **no son fuente de verdad** del diagnóstico. Se movieron acá el 07/09/2026 (Fase 6 del rediseño) para sacarlos de la raíz del sitio.

- `export_preguntas_xlsx.py` — exportador de las preguntas a Excel. Sus textos de reacción y las opciones difieren de los que usa `index.html` (por ejemplo, la pregunta 11 dice "CMV" y el sitio dice "contribución marginal, punto de equilibrio"). Si se vuelve a usar, hay que regenerarlo desde `PREGUNTAS` en `index.html`.
- `preguntas_diagnostico.xlsx` — salida del script anterior, con el mismo desfase.

La fuente de verdad de las 12 preguntas, las 36 reacciones y los 72 textos de resultado es el bloque de JS de `index.html` (`PREGUNTAS`, `TEXTOS_RESULTADO`, `TITULO_DIAGNOSTICO`, `PRIMER_PASO`).

`tools/` está en `.vercelignore`: nada de esto se publica.
