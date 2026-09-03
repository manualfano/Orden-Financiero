# INFORME — Sistema de assets y estados de superficie
## ordenfinanciero.com · Fases 0-1 completas + propuesta de Fase 2 (pendiente de aprobación)

Fecha: 02/09/2026 · Master prompt v3 · Sitio: `index.html` estático (3.808 líneas), servido local en `http://localhost:8123` para las mediciones.

---

## 1. Correctitud del argumento (Fase 0)

Inventario completo de afirmaciones cuantitativas y verificables del sitio:

| Afirmación | Dónde | Fuente / respaldo | Veredicto |
|---|---|---|---|
| "12 preguntas", "3 por eslabón", "4 eslabones" | hero-trust, cómo-funciona, FAQ, cta-final | El código del diagnóstico: 12 preguntas reales, 4 eslabones (`#diag-overlay`) | ✔ Verificado en código |
| "Puntaje de 0 a 36" | qué-recibís | 12 preguntas × 3 puntos máx. — consistente con el scoring | ✔ Verificado |
| "Resultado al instante" / "en 3 minutos" | hero, cómo-funciona, cta-final | El diagnóstico es client-side, resultado inmediato ✔; "3 minutos" es estimación razonable de 12 preguntas | ✔ / estimación razonable, no promete resultado de negocio |
| "100% gratis" / "¿Es realmente gratis?" | hero-trust, FAQ | No hay paywall en el flujo | ✔ Verificado |
| Cinta de 17 clientes con nombre y rubro | logos-band | Autorizada por el dueño (31/08/2026). Powermix NO es cliente y no está — correcto | ✔ Autorizada |
| "Las frases que escuchamos todas las semanas… ninguna es inventada" | te-suena | Frases provistas por el dueño de reuniones reales (Drive, 31/08) | ✔ Respaldo del dueño |
| "12+ años en gastronomía propia" | manuel | Biografía real provista por el dueño | ✔ Respaldo del dueño |
| "Máximo 3 negocios nuevos por mes" | método, manuel | `oferta_orden_financiero.pdf` del dueño; el copy además lo justifica operativamente | ✔ Respaldo del dueño |
| Garantía de 90 días | método | Ídem oferta del dueño | ✔ Respaldo del dueño |
| "5 pilares / 3 fases / 90 días" | método | `Metodo_Orden_Financiero.pptx` del dueño | ✔ Respaldo del dueño |
| Mock "Ejemplo de resultado 21/36" | qué-recibís | Datos ilustrativos **etiquetados "EJEMPLO DE RESULTADO"** en el propio bloque | ✔ Declarado como ejemplo |
| "30 minutos gratis con Manuel" | cómo-funciona, manuel | Oferta vigente del dueño | ✔ Respaldo del dueño |

**Sin respaldo: ninguna.** No hay cifras de industria, benchmarks ni testimonios con texto. No hay nada que retirar ni reformular (Anexo A #2: vacío).
Regla para la Fase 5: si un render 3D muestra números o gráficos, entra a esta tabla como afirmación.

---

## 2. Inventario técnico real (Fase 1)

**Stack**: un solo `index.html` (3.808 líneas, 172KB), CSS embebido con tokens en `:root` (líneas 29-61), JS vanilla embebido. Sin build, sin dependencias. Deploy: Vercel (repo `manualfano/Orden-Financiero`, branch `master`).

**Bloques de la home, en orden (con línea):**

| # | Bloque | Línea | Pregunta que responde | CTA |
|---|---|---|---|---|
| 1 | `nav` fijo | 2552 | — | "Hacer el diagnóstico" (abre overlay) + "Ingresar al portal" |
| 2 | `#hero` | 2578 | ¿Esto es para mí? | "Quiero saber dónde está el problema" |
| 3 | `logos-band` (cinta 17 clientes) | 2637 | ¿Alguien más confía? | — |
| 4 | `#te-suena` (frases reales) | 2647 | ¿Me pasa a mí? | "Ponerle un número" |
| 5 | `#que-analizamos` (los 4 eslabones) | 2676 | ¿Qué mide el diagnóstico? | **ninguno — cards muertas** |
| 6 | `#como-funciona` (3 pasos) | 2733 | ¿Cuánto esfuerzo me cuesta? | — |
| 7 | `#que-recibis` + mock de resultado | 2761 | ¿Qué me llevo? | — |
| 8 | `#metodo` (banda navy: 5 pilares, 3 fases, garantía) | 2842 | ¿Y después del diagnóstico? | — |
| 9 | `#manuel` (bio + foto) | 2934 | ¿Quién está detrás? | "Hacer el diagnóstico gratis" + "Agendar llamada" |
| 10 | `#para-quien` | 2969 | ¿Es para mí / no es para mí? | — |
| 11 | `#preguntas-frecuentes` | 2999 | Objeciones | — |
| 12 | `cta-final` | 3032 | Cierre | "Hacer el diagnóstico gratis" |
| 13 | `#diag-overlay` (el diagnóstico, modal full-screen) | 3070 | — | — |

**Camino al diagnóstico**: 5 puntos de entrada (`openDiagnostico()` en líneas 2566, 2606, 2670, 2960, 3039) — **1 toque desde cualquier scroll**. La fila de eslabones (bloque 5) NO es uno de ellos.

**Tokens `:root` (29-61) → correspondencia con el sistema vigente:**

| Sitio hoy | Valor | Token vigente | Estado |
|---|---|---|---|
| `--blue` | `#0C66E4` | `marca` | ✔ igual |
| `--blue-hover` | `#0B5FD0` | `marca-hover #0055CC` | ✗ migrar |
| `--navy` / `--navy-900` | `#1B3A6B` / `#0E2140` | (fondo de marca del sitio — banda navy/hero) | conservar como token propio del sitio, nombrado |
| `--ink` | `#172B4D` | `tinta #292A2E` | ✗ migrar |
| `--text-2` | `#44546F` | `tinta-2 #505258` | ✗ migrar |
| `--muted` | `#626F86` | `tinta-3 #6B6E76` | ✗ migrar |
| `--bg-soft` / `--bg-inset` | `#F7F8FA` / `#EEF0F3` | `lienzo #F8F8F8` / `lienzo-2 #F0F1F2` | ✗ migrar |
| `--border` | `#E3E8EF` | `borde rgba(11,18,14,.14)` | ✗ migrar |
| `--success` (bg) | `#1F845A` (`#DFFCF0`) | `positivo #4C6B1F` (`#EFFFD6`) | ✗ migrar |
| `--warning` (bg) | `#B38600` (`#FFF3D6`) | `alerta #9E4C00` (`#FFF5DB`) | ✗ migrar |
| `--danger` (bg) | `#C9372C` (`#FFECEB`) | `riesgo #AE2E24` (`#FFECEB`) | ✗ migrar |
| `--r` / `--r-lg` | 10 / 16px | radios 8 / 12 | ✗ migrar |
| `--ease` | (0.4,0,0.2,1) | `estandar` ✔ + falta `salida` | completar |
| (no existen) | — | tokens de estado de superficie, `--eslabon`, on-dark | crear (Fase 4) |

**Deriva medida (baseline de la auditoría 01/09, verificada hoy):** 46 hex fuera de `:root` (los 4 pasteles on-dark a mano incluidos) · 19 duraciones de motion inline · **19 usos de peso 700** (Google Fonts carga 400/500/600/700) · cuerpo 16px · 27 tamaños tipográficos · 4 degradés = máscaras de fade (permitidos).

**Estados interactivos hoy:** 17 reglas `:hover` (botones, links del nav, FAQ, marquee-pause). Elementos clickeables sin ningún feedback: 0 — pero **el bloque central (los 4 eslabones) no es clickeable en absoluto**, y las cards de te-suena/qué-recibís/método tampoco responden al tacto. `:focus-visible` global existe (línea 79). `prefers-reduced-motion` cubierto (línea 103).

**Mapeo de color por eslabón: NO existe.** Las cards del overlay (`.eslabon-card`, 2305-2393) usan `--blue` para todos los íconos y colores **semánticos por resultado** (ok/warn/crit → success/warning/danger). Identidad por eslabón: no hay. → Anexo A #1: propuesta en §8.

---

## 3. Baseline medido (Fase 1)

**Lighthouse** (mobile emulado, headless Chrome, throttling default de Lighthouse 10.x vía `npx lighthouse`, sitio servido local — sin latencia de red real; el número absoluto es comparativo, no de producción):

| Métrica | Valor |
|---|---|
| Performance score | **80** |
| LCP | **3,4 s** |
| FCP | 3,4 s |
| CLS | **0,132** |
| TBT | 0 ms |
| Peso total transferido | 298 KB |

**Elemento LCP: no capturado** (el audit `largest-contentful-paint-element` volvió vacío en esta corrida). FCP = LCP sugiere que es el primer render del hero (texto o foto). **Queda para nombrar en la corrida de la Fase 3** — hasta entonces, `fetchpriority` no se toca.

**El hallazgo de performance #1:** el hero referencia `foto-manuel-cutout.png` — **1.875 KB** — con `fetchpriority="high"` (línea 2622), y la sección Manuel la repite (línea 2943, lazy). El `foto-manuel-cutout.webp` de **64 KB ya existe en el repo y no se usa**. El "peso total 298 KB" de Lighthouse no cuadra con ese PNG — hipótesis: la corrida terminó la observación antes de completar la descarga del PNG (TTFB local ≈ 0 pero decode largo), o el clip del viewport. Se verifica en la Fase 3; el fix (apuntar al WebP) es la primera línea de la Fase 5… y probablemente el mayor salto de LCP del proyecto entero.

**CLS 0,132**: culpable probable el swap de Google Fonts + bloques `.reveal` (culpables exactos no capturados en el JSON; se identifican en la corrida de la Fase 3).

**Imágenes hoy**: 1 foto real del dueño (PNG 1.875KB en uso + WebP 64KB huérfano + 2 PNG viejos de 1.827/1.523KB sin referenciar + `ChatGPT Image….png` 1.827KB sin referenciar — 5MB de repo muerto para limpiar), 17 logos JPG de 2-8KB (cinta), og-image 23KB. Cero stock ✔.

**Capturas** (1440 / 1280 / 768 / 390, hero + cinta; tomadas en el browser de esta sesión, primer viewport):
- 1440/1280: hero navy con foto a la derecha, promesa + CTA visibles sin scroll ✔.
- 768: la foto desaparece; el hero queda centrado, correcto.
- 390: **una idea y un CTA** en el primer scroll ✔ — pero con tres defectos visibles (ver §4).

---

## 4. Auditoría visual con scores (Fase 1)

| Categoría | Score | Evidencia |
|---|---|---|
| Cumplimiento del sistema | 4/10 | Tokens de la generación anterior en todo el `:root` (29-61); 46 hex sueltos; 19×700 |
| Deriva contra el portal | 5/10 | Misma marca y estructura de tokens, pero el portal ya migró (tinta/semánticos nuevos) y el sitio quedó en la generación vieja |
| Jerarquía | 7/10 | La promesa es lo primero (hero 390 ✔); pero el bloque-producto (eslabones) está 5º y mudo |
| Estados interactivos | 3/10 | 17 hovers en controles; las cards de contenido (eslabones, te-suena, qué-recibís, pilares) no responden a nada |
| Densidad y aire | 7/10 | 390px: una idea por scroll ✔; el hero tiene aire de más arriba del eyebrow (≈300px vacíos, captura 390) |
| Tipografía | 5/10 | 19×700; 27 tamaños; cuerpo 16 ≠ 15 del sistema |
| Peso visual de imágenes | 6/10 | Todo propio ✔; pero el asset principal pesa 29× su versión optimizada ya existente |
| Camino al diagnóstico | 8/10 | 1 toque desde 5 lugares; falta el 6º que importa: las cards del producto |

**Las tres peores cosas, sin diplomacia:**
1. **La fila de los 4 eslabones — el producto según la tesis — es la única zona muerta de la página** (2676-2731): sin link, sin hover, sin ordinal protagonista, sin color propio. El bloque que debería vender está decorando.
2. ~~El hero carga un PNG de 1,9MB con el WebP huérfano~~ **CORRECCIÓN (02/09, Fase 3):** el hallazgo estaba mal encuadrado — el hero ya usa `<picture>` con el WebP de 64KB como `<source>`; el PNG de 1,9MB es solo el fallback para navegadores sin WebP (por eso Lighthouse midió 298KB totales). No hay swap pendiente. Queda real el **CLS 0,132** (probable swap de fuente), a raíz-causar en la Fase 7.
3. **Bug visible en todos los anchos: las frases rotativas del hero se superponen** — la frase saliente queda como texto fantasma legible detrás de la entrante (capturas 390/768; `.hero-quote` 2594-2599). Además el botón del nav se recorta contra el borde derecho a 390px.

---

## 5. Auditoría bloque por bloque + test Cookdata (Fase 1)

| Bloque | ¿Podría estar igual en Cookdata? | Qué le falta para ser nuestro | Relación con la fila de eslabones |
|---|---|---|---|
| nav | Sí (genérico) | El wordmark ya es nuestro; el resto es estándar aceptable | neutral |
| hero | **No** — foto real del dueño + frases reales de dueños, no ilustración SaaS | Arreglar ghosting; es nuestro por contenido | le manda tráfico (CTA) |
| cinta clientes | A medias — el mecanismo es genérico, los nombres+rubros PyME reales no | Nada estructural | contexto |
| te-suena | **No** — frases verbatim de dueños con ancla a su eslabón | Ya ancla a eslabones: pide el color del mapeo | alimenta directo |
| **que-analizamos** | **Sí — y es el problema.** 4 cards grises informativas que cualquier BI podría tener | Ordinal protagonista, color por eslabón, click al diagnóstico, estados | **ES la fila** |
| como-funciona | Sí (3 pasos numerados genéricos) | El contenido ya es específico (12 preguntas/rubro); forma genérica tolerable | contexto |
| que-recibis + mock | **No** — el mock 21/36 con eslabón débil es único | El mock es HTML (texto indexable) ✔ — mantener, no reemplazar por render | es la evidencia del resultado |
| metodo | A medias — pilares/fases es formato consultora | Garantía + cupo 3/mes lo hacen propio | postventa del diagnóstico |
| manuel | **No** — 12 años de gastronomía propia, foto real | Nada | credibilidad |
| para-quien / FAQ / cta-final | Sí (formato) / contenido propio | Aceptable | contexto/cierre |

---

## 6. Tesis (Fase 2 — propuesta)

Sostiene el punto de partida del prompt, con una precisión:

> Esta página existe para que un dueño de PyME **le ponga nombre a lo que no le cierra, sin hablar con nadie**. El diagnóstico es el producto, y la fila de los 4 eslabones es el producto **visible**: hoy es el único bloque de la home que no se puede tocar, y este trabajo la convierte en la puerta de entrada con más intención — quien toca "Cash flow" ya está diciendo qué le duele. Todo lo demás (cinta, método, bio) es evidencia de que el veredicto viene de alguien real. Los assets 3D existen para darle cuerpo a los 4 eslabones, no para decorar bloques que ya funcionan con texto.

---

## 7. Benchmark — principio → aplicación → qué NO copiamos (Fase 2)

| Referencia | Principio | Cómo se aplica acá | Qué NO copiamos |
|---|---|---|---|
| Atlassian | Un color entero por sección, rotando | Cada eslabón un color del subconjunto AA; el resto de la página sigue mono-marca | Su densidad, su paleta nueva (los neutros ya los tenemos; la marca es nuestra) |
| Linear | El hover informa posición, no adorna | Halo del color del eslabón = "estás por entrar acá"; 120ms | Estética oscura, tipografía |
| Stripe | El asset es metáfora integrada al layout | Render por eslabón, chico, dentro de la card, fondo del canvas | Degradés animados |
| Cookdata | El ordinal como jerarquía de lectura | 01-04 protagonistas en las cards | Todo lo demás: crema/magenta, capas, estructura, dona de hero |

---

## 8. Direcciones de experiencia (Fase 2 — elegir una, Anexo A #3)

**Dirección A — "La cadena es la home" (recomendada).** La fila de eslabones se convierte en el bloque protagonista inmediatamente después del hero: cards-link con ordinal grande, color propio, render 3D chico y los cinco estados. Te-suena queda después, anclando frases a cards ya vistas. La cinta baja un lugar. *Sacrifica:* la prueba social aparece un scroll más tarde. *Riesgo:* bajo — reordena 2 bloques, no cambia ninguno por dentro.

**Dirección B — "El veredicto de ejemplo primero".** El mock 21/36 (qué-recibís) sube al segundo lugar como evidencia inmediata del producto (coherencia literal con "el veredicto primero" del sistema), y los eslabones lo siguen. *Sacrifica:* el prospecto ve el resultado antes de entender qué se mide; más movimiento de estructura (3 bloques). *Riesgo:* medio.

**Recomendación: A.** La tesis dice que la fila es el producto; B pone la foto del premio antes que la puerta.

**Mapeo de color por eslabón (Anexo A #1 — no existe en el código, propongo):**

| Eslabón | Token | Por qué |
|---|---|---|
| 01 Costos y precios | `marca #0C66E4` | El eslabón de gestión pura — el azul de la casa |
| 02 Resultado económico | `positivo #4C6B1F` | La ganancia |
| 03 Cash flow | `alerta #9E4C00` | La caja aprieta — urgencia sin ser error |
| 04 Indicadores de gestión | `hallazgo #803FA5` | El descubrimiento — decidir con data |

`riesgo` queda reservado a la semántica de resultado ("tu eslabón más débil"), que ya existe en el overlay y no se pisa. Los 4 pasan AA como texto sobre blanco (verificado en el sistema).

---

## 9. Especificación de assets (Fase 2 — tabla del §12.2, Anexo A #4)

Criterio: **la mínima cantidad que sostenga el argumento** — 4 renders, uno por eslabón, dentro de su card. El hero NO lleva render (la foto real de Manuel es el asset y probablemente el LCP); el mock de resultado NO se reemplaza (es HTML indexable); el método NO lleva (los pilares funcionan en texto).

| Campo | Render 01-04 (uno por eslabón) |
|---|---|
| Bloque destino | Cards de `#que-analizamos` (una imagen por card) |
| Rol en el argumento | Darle cuerpo distinguible a cada eslabón — hoy las 4 cards son visualmente idénticas y el prospecto no retiene cuál es cuál |
| Metáfora sugerida (el dueño decide el objeto) | 01: etiqueta de precio / balanza · 02: la "o" dona con porción que falta · 03: canilla/embudo con monedas · 04: dial/medidor |
| Relación de aspecto | **1:1**, la misma en todos los breakpoints |
| Dimensiones renderizadas (CSS px) | 1440: 120×120 · 1280: 112×112 · 768: 96×96 · 390: 88×88 |
| Dimensiones de archivo | **240×240** (2× de la mayor) |
| Peso máximo | **30 KB c/u** (WebP) — presupuesto total de renders: 120 KB |
| Fondo | **Transparente** (se apoyan sobre blanco de la card y sobre `lienzo`) |
| Color | Un protagonista por render = el token de su eslabón (§8); acentos neutros permitidos |
| Carga | `loading="lazy" decoding="async"` (ninguno es LCP) |
| `alt` | `alt="" aria-hidden="true"` — el nombre y número del eslabón ya son texto; el render es refuerzo visual |
| Prohibido en el render | Texto, cifras, glow/neón, reflejos fuertes, degradé de fondo |

**Presupuesto total de página tras Fase 5:** hoy ~298KB medidos (a re-verificar por la anomalía del PNG); objetivo ≤ 450KB transferidos en mobile con los 4 renders, y LCP ≤ baseline (el cambio PNG→WebP del hero debería mejorarlo aunque sumemos 120KB lazy).

---

## 10. Implementación por fase (log de ejecución)

**Decisiones del dueño, todas aprobadas el 02/09/2026:** dirección A · mapeo de color 01-marca/02-positivo/03-alerta/04-hallazgo · tabla de assets del §9 · limpieza de PNGs.

| Fase | Commit | Qué se tocó |
|---|---|---|
| 0-1 | `acd7578` | Este informe |
| 3 — migración de tokens (neutra) | `be17620` | `:root` completo al sistema; 326+ reemplazos (hex→tokens, rgba→tripletes, 700→600, cuerpo 15px, radios 8/12, motion→3 tokens, anillos estáticos). Greps: 700=0 · hex fuera de `:root` = 5 SVG del isotipo · duraciones fuera de token = funcionales documentadas (marquee, countdown, progreso, pulse del nodo activo) |
| 3b — bugs del baseline | `b291ce7` | Ghosting de `.hero-quote` (salida rápida + delay de entrada) · nav-cta recortado ≤480px |
| Limpieza | `73e53bc` | −5MB de PNGs sin referenciar |
| 4 — sistema de estados | `c6e2a11` | `.pillar` como `<a>` al diagnóstico (fallback sin JS: subdominio diagnostico.) con `--eslabon`/`--eslabon-rgb`; halo teñido + chip ordinal invertido en hover/focus/active; `t-instante`; reduced-motion solo color; reorden dirección A (hero→eslabones→cinta); marco "Lo que dicen nuestros clientes" en el hero (pedido del dueño) |

**Validación post F3+F4** (mismas condiciones que el baseline): Perf **79-80** · LCP **3,4s (= baseline)** · FCP 3,4s · CLS **0,135 (≈ baseline)** · TBT 0ms. Una corrida intermedia dio 60/5,1s y se descartó por repetición (ruido de corrida local — anotado por honestidad). Verificación en browser: hover/focus/active con halo e inversión de chip, teclado con anillo `foco`, 390px apilado con afordancia táctil, consola limpia, un solo `h1`.

## 11. Fase 5 (assets) — resuelta por decisión del dueño: SIN GRÁFICO

Se exploraron con el dueño: renders 3D por IA (5 generaciones GPT/Gemini — techo de calidad por debajo de sus referencias), stock (candidata de dona clay), y cuatro piezas en código vivo (dona interactiva, cascada/waterfall, pulso ECG, puente de tramos — las dos últimas solo bocetadas). **Decisión (02/09/2026): la sección queda sin gráfico** — las cards con su sistema de estados sostienen el bloque solas. "Mejor cero imágenes que imágenes pobres" (§5 del master prompt). La Enmienda 2 (renders) queda autorizada y **sin uso**; si aparece una pieza que al dueño le guste, se integra con la spec del §9.

## 12-13. Fases 6-7 — cierre de mobile/a11y y performance

- Verificado en browser durante la F4: teclado completo con anillo `foco`, `:active` en touch, 390px apilado con afordancia, `prefers-reduced-motion` sin transform.
- **CLS raíz-causado y corregido**: el 100% del shift (0,135) era el hero — dominado por el swap del webfont. Fix doble sin build: `min-height` reservado en `.hero-quotes` (el `fitHeight()` por JS movía el hero) + **fallback con métricas de Inter** (`@font-face 'Inter-fallback'` sobre Arial con `size-adjust/ascent/descent-override`). Resultado, mismas condiciones que el baseline: **CLS 0,135 → 0,001 · Perf 79 → 84 · LCP 3,4s (igual)**.

## 14. Deuda restante

- El capturador del browser de trabajo falla en zonas scrolleadas (las verificaciones se hicieron con el hero oculto); capturas full-page de regresión quedan como pendiente de tooling, no de la página.
- `.reveal` sin JS deja contenido en `opacity: 0` (patrón previo a este trabajo) — verificar y resolver con una clase `no-js` en un trabajo futuro.
- Duraciones funcionales del diagnóstico documentadas como excepciones (marquee 60s, countdown 4s, barras de progreso 0,9/1,3s, pulso del nodo activo 2s, ciclo de quotes 4s).

## 15. Decisiones pendientes del dueño

Ninguna abierta. El gráfico de la sección queda en pausa indefinida a criterio del dueño.
