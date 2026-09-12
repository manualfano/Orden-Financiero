# Proyecto: Fase 2 del sitio público — migración a Astro y rediseño de la página de venta

Rama de trabajo: `staging-fase-dos` (sale de `master`, que ya tiene toda la Fase 1 integrada).

## Cómo se trabaja

1. Todos los cambios se commitean en `staging-fase-dos`, **un commit por fase** del plan.
2. Cada push genera una vista previa en Vercel:
   `orden-financiero-git-staging-fase-dos-manualfanos-projects.vercel.app`
3. El dueño revisa la vista previa (en el celular, desde Instagram) y da el OK.
4. Recién ahí se integra a `master`, que es lo que sirve ordenfinanciero.com.

Nada de esta rama llega a ordenfinanciero.com sin el OK explícito del dueño.

## Qué es

El `index.html` escrito a mano (5.692 líneas) se reemplaza por un proyecto **Astro + Tailwind**,
100 % estático, con layout compartido, tokens definidos una sola vez, colección de contenido
lista para las guías y sitemap generado. La página de venta se reconstruye con la secuencia
atención → problema → mecanismo → oferta → prueba → objeciones → acción, un solo CTA (el
diagnóstico) y tres momentos expresivos (degradé del hero, el método con el scroll, el mockup
del entregable). El informe de trabajo es `LANDING-REPORT-2026-09.md` (no se commitea).

## Decisiones del dueño (11/09/2026)

- Dirección de arte **A + retrato**: hero tipográfico sobre el degradé, con la foto a la derecha.
- Se quedan la cinta del header con los tres links y la prueba social con los logos.
- Inter 500 para el display; el degradé del hero como está.
- Ningún botón toca un borde: 40 px de aire por lado en escritorio, 24 en celular, 14 arriba y abajo en la cinta.

## Fases

| # | Fase | Estado |
|---|---|---|
| 0 | Auditoría y baseline | Hecha (informe) |
| 1 | Tesis y direcciones de arte | Hecha, dirección elegida |
| 2 | Proyecto Astro, estructura y contenido, sin efectos | Hecha |
| 3 | Diagnóstico portado, cero diferencias en 531.441 combinaciones | Hecha (JS byte-idéntico, `public/js/diagnostico.js`; lead real probado) |
| 3b | Página post-agenda (`/diagnostico`, servida por `diagnostico.ordenfinanciero.com`) | Hecha (regla de host en `vercel.json`) |
| 4–9 | Sistema visual, mockups, momentos expresivos, motion, mobile, performance e informe | Pendientes |

## Cómo se corre

```
npm install
npm run dev       # http://localhost:4321
npm run build     # genera dist/ (index.html, privacidad.html, 404.html, sitemap)
```

Vercel builda con `npm run build` y publica `dist/` (configurado en `vercel.json`, sin tocar el dashboard).

## Notas técnicas

- Salida `format: 'file'`: las URLs no cambian (`/`, `/privacidad`); `/sitemap.xml` redirige al generado.
- GA4 y `track()` viven en el layout; el diagnóstico (overlay, puntaje, envío del lead, eventos) es `public/js/diagnostico.js`, portado sin cambios y cargado después del `load`.
- `src/components/Diagnostico/overlay.html` es el markup del overlay tal cual; `src/styles/diagnostico.css` sus estilos, scoped a `#diag-overlay` y leyendo los tokens nuevos. Se rediseñan en la Fase 4.
