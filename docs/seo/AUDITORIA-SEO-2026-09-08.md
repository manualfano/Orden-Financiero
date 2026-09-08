# AUDITORÍA SEO TÉCNICA E INDEXACIÓN — ordenfinanciero.com

**Fecha:** 2026-09-08 · **Fase:** 1 (auditoría, sin cambios de código) · **Repo:** `C:\Users\usuario\Desktop\orden-financiero` (rama `master`, HEAD `6a2a5ac`, 07/09/2026 22:17)
**Evidencia cruda:** `docs/seo/baseline/2026-09-08/` (HTML de cada ruta tal como lo recibe Googlebot, cabeceras, combinaciones de host, Lighthouse, texto de las SERP, benchmark).

---

## 0. Lo primero: en qué choca este repo con el master prompt

Antes de cualquier tabla, cinco cosas que el prompt asumía y que la realidad del repo contradice. Ninguna impide el trabajo, pero cambian cómo se hace.

1. **No es Next.js ni hay framework.** Es un sitio estático de tres archivos HTML escritos a mano (`index.html`, `privacidad.html`, `404.html`) servidos por Vercel con `cleanUrls`. No hay `package.json`, ni build, ni tipos, ni lint. No existe `metadata`, `robots.ts` ni `sitemap.ts`: `robots.txt` y `sitemap.xml` son archivos planos. El "sistema central de metadatos" del §13 no puede ser una función: sin build, o se genera con un script (estructura nueva, prohibida por §21) o se mantiene a mano en tres `<head>` con una checklist. Propongo lo segundo.
2. **El `<head>` que el prompt pide ya existe.** El rediseño del 07/09/2026 (Fase 6, commit `29cc539` y siguientes) dejó title con "Orden Financiero", description, canonical, OG 1200×630, `lang="es-AR"`, `og:locale es_AR`, JSON-LD `ProfessionalService`+`Organization`, `robots.txt`, `sitemap.xml`, 404 con `noindex` y un redirect de `www`. Producción es **byte a byte idéntica** al HEAD local (diff vacío, ETag `9e9ff865…`). El trabajo pendiente es más chico y más específico de lo que el prompt suponía.
3. **No hay "rutas del diagnóstico".** El diagnóstico es un overlay dentro de `index.html` que se abre con el fragmento `/#diagnostico`. Un fragmento no es una URL distinta para Google: las 12 preguntas, las 36 reacciones y los 72 textos de resultado viven en constantes de JS (`PREGUNTAS`, `TEXTOS_RESULTADO`, líneas 4734 y 4910) y nunca son HTML indexable. No hay contenido delgado que poner en `noindex`. **Lo que sí existe** es un host duplicado funcional: `diagnostico.ordenfinanciero.com` sirve el mismo `index.html` con una variante de copy por JS para quien ya agendó (línea 5655). Ese host es el equivalente real del "resultado del diagnóstico" del prompt y es el que hay que sacar del índice.
4. **El sitio está indexado.** `site:ordenfinanciero.com` devuelve la home (captura y texto en `baseline/2026-09-08/google-site-query-2026-09-08.txt`). El problema no es que Google no lo tenga: es que tiene la **versión anterior al rediseño** (title "Orden Financiero · Consultora PyME", snippet "El primer paso para ordenar tu negocio empieza acá · ¿Trabajás todo el mes y no sabés bien cuánto ganaste?"). Google no volvió a rastrear desde el deploy del 07/09 y no hay Search Console para avisarle.
5. **Tres decisiones del Anexo A ya fueron tomadas por el dueño el 07/09 en sentido distinto al que recomienda el prompt.** A9 fijó el descriptor "Programa de consultoría financiera para gastronomía **y servicios**" (el prompt pide "negocios gastronómicos"); A17 puso dirección La Plata en el JSON-LD (el prompt recomienda solo `areaServed: AR`); la description aprobada dice "Diagnóstico **gratis**" (el §20 pide no llamarlo gratis en metadatos). No toco ninguna de las tres sin tu palabra: están en el Anexo A actualizado (§12) como decisiones a reconfirmar.

Y una sexta que no es del repo sino del mercado: **"orden financiero" es una frase genérica del español.** Desde el navegador del agente, con `gl=ar`, la página 1 de Google es enteramente contenido educativo de finanzas personales (BBVA, Principal, YouTube, Google Play, Meer, presupuestofamiliar.com.ar) y un bloque de "Más preguntas" ("¿Qué es un orden financiero?"). Google trata la consulta como **informativa**, no como marca. Ni `ordenfinanciero.com` ni `ordenfinanciero.com.ar` aparecen en esa SERP; el dueño ve el `.com.ar` desde Argentina por su TLD de país. Lo técnico de este trabajo es necesario pero no suficiente para ser primer resultado: hacen falta señales de entidad que se construyen fuera del repo (§11).

---

## 1. Proyecto y stack identificados (§4.1)

| Ítem | Valor | Evidencia |
|---|---|---|
| Qué sirve `https://ordenfinanciero.com` | Este repo. Proyecto Vercel `orden-financiero` (`prj_uHRAoWP6SxqfjwEkJRwj03iLIEGt`, equipo `manualfanos-projects`) | `.vercel/project.json`; `vercel domains inspect` |
| Dominios asignados al proyecto | `ordenfinanciero.com`, `www.ordenfinanciero.com`, `diagnostico.ordenfinanciero.com` | `vercel domains inspect ordenfinanciero.com` |
| DNS | Nameservers en **DonWeb** (`ns1/ns2.donweb.com`), no en Vercel. Apex → A `76.76.21.21`; `www` y `diagnostico` → CNAME `cname.vercel-dns.com` | `nslookup`; `vercel domains inspect` |
| Stack | HTML estático. Sin framework, sin bundler, sin `package.json`. CSS y JS inline en `index.html` (5.675 líneas, 214.224 B; 49,5 KB con brotli). Fuente Inter self-hosted (`fonts/inter-latin.woff2`, 48 KB) | `ls`, `curl --compressed` |
| Config de hosting | `vercel.json`: `cleanUrls: true`, `trailingSlash: false`, un redirect `www` → apex (`/:path*`, permanent), `Cache-Control` para `/fonts` y `/logos` | `vercel.json` |
| Variables de entorno | Ninguna (`vercel env ls`: "No Environment Variables found") | CLI |
| Tracking existente | Loader de **Vercel Web Analytics** en `index.html:28-35` (solo en `*.ordenfinanciero.com`). El script `/_vercel/insights/script.js` responde **404**: Analytics no está habilitado en el dashboard; `track()` no envía nada. No hay GA, Meta Pixel ni Plausible (el comentario de `privacidad.html` habla de "medición sin cookies": es esto) | `curl` → 404 |
| Portal de clientes | Repo y proyecto **aparte** (`orden-financiero-portal.vercel.app`); `portal.ordenfinanciero.com` no resuelve. La web pública lo enlaza en nav y footer ("Ingresar", "Portal de clientes"). No se toca | `index.html:3792, 4297` |
| Envío del diagnóstico | `fetch` POST a Apps Script (`index.html:5469`), mail a `manuel@ordenfinanciero.com` desde el script, WhatsApp `WHATSAPP_NUMERO` (`5478`). No se toca | grep |
| Servidor local | `.claude/launch.json` → `npx -y serve -l 5173 .`. **`serve` no aplica `vercel.json`**: redirects por host y headers solo se verifican con `vercel dev` o en un deploy | `launch.json` |
| Deploy | Producción idéntica al HEAD local (diff vacío). `Last-Modified: Tue, 08 Sep 2026 14:42:54 GMT` en el edge | `diff -q baseline/prod-home.html index.html` |

**Comandos reales del repo (§23):** no hay `build`, `typecheck` ni `lint`. Lo verificable es: `curl` contra producción, `vercel dev` para probar `vercel.json` en local, `npx lighthouse` (13.4.1 disponible vía `npx --no-install`), y un parseo del JSON-LD con Python (`json.loads`). Eso es lo que se corre después de cada fase.

---

## 2. Inventario de rutas públicas (§4.2) y lo que recibe Googlebot (§4.3)

Todo medido contra producción con user-agent Googlebot mobile, sin JavaScript, el 08/09/2026. Archivos en `baseline/2026-09-08/prod-*.html` y `*.headers.txt`.

| URL | Qué es | Render | ¿Indexar? | Código | title | description | canonical | robots | OG | JSON-LD | h1 | lang |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `https://ordenfinanciero.com/` | Home + overlay del diagnóstico | Estático completo | **Sí** | 200 | "Orden Financiero · Programa de consultoría financiera para gastronomía y servicios" (79 car.) | 203 car., empieza "En 3 minutos sabés…", incluye "Diagnóstico gratis" | `https://ordenfinanciero.com/` | — (indexable) | type, title, description, url, locale `es_AR`, image 1200×630 + alt, twitter `summary_large_image` | `["ProfessionalService","Organization"]` válido | 1 ("El primer paso para hacer tu negocio más rentable empieza acá") | `es-AR` |
| `https://ordenfinanciero.com/privacidad` | Política de privacidad | Estático | Sí (está en el sitemap) | 200 | "Privacidad · Orden Financiero" | 84 car. | `…/privacidad` | — | **no** | no | 1 | `es-AR` |
| `/#diagnostico` | Fragmento que abre el overlay | Mismo documento que `/` | n/a (no es URL para Google) | 200 | = home | = home | = home | | | | | |
| `https://ordenfinanciero.com/404` | El `404.html` accedido directo | Estático | No | **200** | "Página no encontrada · Orden Financiero" | no | no | `noindex` | no | no | 1 | `es-AR` |
| `/ruta-inexistente`, `/diagnostico`, `/gracias` | Inexistentes | `404.html` | No | **404** ✔ | ídem 404 | | | `noindex` ✔ | | | | |
| `/index`, `/index.html` | Alias de la home | — | No | **308 → `/`** ✔ | | | | | | | | |
| `/privacidad.html`, `/privacidad/` | Alias | — | No | **308 → `/privacidad`** ✔ | | | | | | | | |
| `/?utm_source=instagram` | Home con parámetro | = home | Se consolida por canonical | 200 | = home | | canonical a `/` ✔ | | | | | |
| `/robots.txt` | | | | 200 `text/plain` | `Allow: /` + `Sitemap:` | | | | | | | |
| `/sitemap.xml` | | | | 200 `application/xml` | 2 URLs: `/` (lastmod 2026-09-07) y `/privacidad` | | | | | | | |
| `https://www.ordenfinanciero.com/` | **Duplicado de la home** | = home | No | **200** ✗ | = home | | canonical a apex (mitiga) | | | | | |
| `https://www.ordenfinanciero.com/privacidad` (y `/robots.txt`, `/sitemap.xml`) | | | | **308 → apex** ✔ | | | | | | | | |
| `https://diagnostico.ordenfinanciero.com/` **y todas sus rutas** | **Duplicado funcional** (variante para quien ya agendó, copy cambiado por JS) | = home | **No** | **200** ✗ | = home | | canonical a apex (mitiga) | **sin noindex** | | | | |
| `/og-image.png` (1200×630, 71 KB), `/apple-touch-icon.png` (180×180), `/foto-manuel-cutout.webp` (65 KB), `/fonts/inter-latin.woff2` (48 KB, immutable), `/logos/*.jpg` ×17 | Assets | | n/a | 200 | | | | | | | | |

**Cabeceras HTML** (`prod-home.headers.txt`): `Content-Type: text/html; charset=utf-8` ✔ · `Cache-Control: public, max-age=0, must-revalidate` ✔ · `Strict-Transport-Security: max-age=63072000` ✔ · sin `X-Robots-Tag` en ningún host.

### 2.1 El test por ruta (§3)

*"Si Google lee solo el HTML inicial, ¿entiende que es Orden Financiero, consultoría financiera para gastronomía, en Argentina?"*

- **Home: sí, con un matiz.** La marca escrita "Orden Financiero" está en `<title>`, JSON-LD, `alt` de la foto ("Manuel Alfano, fundador de Orden Financiero"), `aria-label` de la cinta de logos, "Fundador de Orden Financiero" y el © del footer (6 veces en el cuerpo, sin forzar). El servicio está en el eyebrow, el h1, la sección del programa y los módulos (≈1.770 palabras de texto real en el HTML, sin contar el overlay). **Argentina** aparece solo en el JSON-LD (`areaServed`, `addressCountry`) y en `lang`/`og:locale`; el copy visible no nombra el país (sí "La Plata" en el schema, y los rubros/pesos "plata", "221 555 0000" como pistas débiles). El wordmark visible es texto "ordenfinanciero." en una palabra (nav, footer, overlay): Google lo lee como un token distinto de "orden financiero". No es un error, pero explica por qué conviene que el `<title>` y el schema lleven la forma con espacio, como ya llevan.
- **Privacidad: parcialmente.** Dice "Orden Financiero" en el title y "ordenfinanciero.com" en el cuerpo; no dice qué es el servicio ni el país. Es una página legal: no necesita más.
- **404: no aplica**, está en `noindex`.
- **www y diagnostico.: sí, porque son la misma página**, y ese es el problema: tres hosts idénticos compiten por la misma URL canónica.

### 2.2 Semántica (§17)

Un solo `<h1>`; 12 `<h2>` de sección en orden; `<h3>` solo dentro de los eslabones y del gate del overlay; sin saltos. Landmarks: `<nav>`, `<header class="hero">`, un solo `<main>`, `<footer>`, `<aside>` dentro del overlay (`role="dialog"`). Los 17 logos de clientes llevan `alt=""` con el nombre del negocio como texto adyacente (correcto: son decorativos). La foto del fundador tiene `alt` con la marca. Los tres `h2` del overlay ("Antes de arrancar, contanos de tu negocio", el `q-text` vacío, el gate) están en el HTML aunque el overlay esté oculto por CSS: Google los ve como contenido oculto; no penaliza, solo los devalúa. No requiere acción.

---

## 3. Infraestructura de indexación (§4.4) — las cuatro combinaciones de host

| URL | Código | `Location` | Estado |
|---|---|---|---|
| `http://ordenfinanciero.com/` | 308 | `https://ordenfinanciero.com/` | ✔ |
| `http://www.ordenfinanciero.com/` | 308 | `https://www.ordenfinanciero.com/` | ✗ manda al www en https, no al apex |
| `https://ordenfinanciero.com/` | 200 | — | ✔ canónico |
| `https://www.ordenfinanciero.com/` | **200** | — | ✗ **duplicado** (mismo ETag `9e9ff865…`, 214.224 B) |
| `http://diagnostico.ordenfinanciero.com/` | 308 | `https://diagnostico.ordenfinanciero.com/` | — |
| `https://diagnostico.ordenfinanciero.com/` | **200** | — | ✗ **duplicado** (mismo ETag) |

**Causa del fallo de `www`, verificada:** la regla de `vercel.json` (`"source": "/:path*"` con `has: host = www.ordenfinanciero.com`) **sí funciona para cualquier path** (`/privacidad`, `/robots.txt`, `/sitemap.xml` → 308 al apex) **pero no para la raíz `/`**. Se probó con cache-buster (`/?x=NNNN`), con `Cache-Control: no-cache` y con `/index.html` (que `cleanUrls` reescribe a `https://www.ordenfinanciero.com/`, no al apex): siempre 200. No es cache: `:path*` con cero segmentos no está matcheando en esta plataforma. La corrección es una regla explícita para `"source": "/"` (o, sin código, marcar `www` como "Redirect to ordenfinanciero.com" en Vercel → Domains). Nota: Vercel emite **308** para `permanent: true`, no 301; Google trata 308 como permanente igual que 301.

**`diagnostico.ordenfinanciero.com`:** no es un error de configuración sino una decisión de producto (variante para quien ya agendó la llamada, `index.html:5655-5672`). Debe seguir funcionando y **no** debe indexarse. Mecanismo que no toca el HTML: cabecera `X-Robots-Tag: noindex, follow` en `vercel.json` con `has: host`. El canonical al apex ya apunta bien.

`robots.txt`: permite todo y declara el sitemap ✔. `sitemap.xml`: 2 URLs, `lastmod` real (07/09) ✔. `trailingSlash: false` aplicado a todas las rutas ✔ (Anexo A #7: se respeta el default del framework).

---

## 4. Estado en Google (§4.5) — medido, no supuesto

Medido desde el panel de navegador del agente el 08/09/2026, sin sesión de Google, con `hl=es-419&gl=ar&pws=0`. Textos completos en `baseline/2026-09-08/google-*.txt`.

| Consulta | Resultado |
|---|---|
| `site:ordenfinanciero.com` | **1 URL: la home.** Title mostrado: "Orden Financiero · Consultora PyME". Snippet: "El primer paso para ordenar tu negocio empieza acá · ¿Trabajás todo el mes y no sabés bien cuánto ganaste?". Ambos son el copy **anterior** al 07/09. Google además ofrece el anuncio "Probar Google Search Console — ¿Eres dueño de ordenfinanciero.com?", señal de que no hay propiedad verificada asociada. |
| `site:www.ordenfinanciero.com OR site:diagnostico.ordenfinanciero.com` | "No se han encontrado resultados". Los duplicados **todavía** no entraron al índice. |
| `orden financiero` | Página 1 sin `ordenfinanciero.com` ni `.com.ar`: BBVA, Principal, reels de Instagram, YouTube (Value School, Mujer Financiera), Revista Tigris, app "Mis Finanzas: Gastos en orden", Meer "Los 7 pasos del orden financiero", presupuestofamiliar.com.ar. "Más preguntas": "¿Qué es un orden financiero?", "¿Cuáles son los 4 pilares financieros?", "¿Cómo juntar $5000 en un mes?". Intención informativa de finanzas personales. |

**Lo que no se pudo medir y por qué:** la SERP exacta que ve el dueño desde una IP argentina (el parámetro `gl=ar` no reemplaza la geolocalización real; el dueño reporta un resumen de IA y el `.com.ar` que acá no aparecen), la fecha del último rastreo de Googlebot y el informe de cobertura: los tres requieren **Search Console**, que no existe. Pedido al dueño: correr `site:ordenfinanciero.com` y `orden financiero` desde su celular en Argentina y pegar capturas; y confirmar si alguna vez creó una propiedad en Search Console.

---

## 5. Baseline (§7)

| Medición | Valor | Método |
|---|---|---|
| HTML inicial de cada ruta | Guardado en `baseline/2026-09-08/prod-*.html` | `curl -s -A "<Googlebot mobile UA>"` |
| Home: peso HTML | 214.224 B sin comprimir · **49.515 B brotli** · 48.450 B gzip | `curl --compressed -w size_download` |
| Home: JS externo | 0 (todo inline). Único script externo: `/_vercel/insights/script.js` → 404 (Analytics no habilitado) | grep `<script`, curl |
| Home: assets críticos | Fuente 48.256 B (preload, immutable) · foto hero WebP 65.252 B (`fetchpriority="high"`) · OG 70.773 B | curl |
| Lighthouse mobile, home, producción (2 corridas) | **Performance 97 / 98 · LCP 2,0 s / 1,8 s · CLS 0 / 0 · TBT 30 / 20 ms · FCP 1,6 / 1,4 s · Speed Index 4,0 / 3,9 s** | `npx lighthouse https://ordenfinanciero.com/ --preset=perf --form-factor=mobile --screenEmulation.mobile --throttling-method=simulate --only-categories=performance` (Lighthouse 13.4.1, Chrome headless). Reportes en `baseline/2026-09-08/lh-prod-mobile-run{1,2}.report.{html,json}` |
| INP | **No medido**: es una métrica de campo; en laboratorio se reporta TBT (arriba). Cuando Analytics/CrUX tengan datos, se lee ahí | — |
| Capturas 390 / 1440 | No tomadas en esta fase: no se cambia nada visible en Fase 3-4. Si la Fase 6 toca algo del HTML, se toman antes y después con el panel de navegador | — |

---

## 6. Scores con evidencia (§8)

| Categoría | Score | Evidencia y por qué no es 10 |
|---|---|---|
| Indexabilidad | **7** | Home indexada (`site:`), `robots.txt` permite, sitemap declarado. Pero Google tiene la versión vieja y no hay canal (Search Console) para pedir el recrawl; dos hosts duplicados son rastreables con 200. |
| Renderizado | **10** | Todo el argumento (eyebrow, h1, programa, módulos, fundador, FAQ) está en el HTML inicial: `prod-home.html:3798-4302`, ≈1.770 palabras. JS solo para overlay, reveal y analytics. **La Fase 5 no se justifica.** |
| Metadatos | **7** | Home completa (`index.html:6-19`). Faltas: description de 203 car. (se corta a ~155), title de 79 car. (se corta a ~60 en mobile: "Orden Financiero · Programa de consultoría financiera para…"), `privacidad.html` sin OG (menor). Copy de metadatos con "gratis" y "En 3 minutos sabés…" (§20: promesa y "gratis"; ver Anexo A). |
| Datos estructurados | **7** | JSON-LD válido (`json.loads` OK), `name: "Orden Financiero"`, `founder`, `areaServed: Argentina`, `sameAs` Instagram, `logo`, `image`, `email`, `address` La Plata (A17). Faltan: `@id`, `sameAs` LinkedIn del fundador, `alternateName: "ordenfinanciero"` (el wordmark en una palabra), `WebSite` con `inLanguage: es-AR`. `logo` es el apple-touch-icon 180×180 (válido para Google, ≥112 px). |
| Canonicalización | **4** | `https` ✔, sin trailing slash ✔, `/index*` ✔, `?utm` con canonical ✔. **Pero**: `www` raíz 200, `http://www` → `https://www` → 200 (nunca llega al apex), `diagnostico.*` 200 en todas las rutas. Tres hosts sirven la home. |
| Señales de país e idioma | **7** | `lang="es-AR"` en las 3 páginas, `og:locale es_AR`, `areaServed` + `addressCountry AR`. Faltan: orientación geográfica en Search Console (no existe), "Argentina" en algún metadato de texto (la description no lo dice), TLD `.com` neutro frente al `.com.ar` del homónimo. |
| Semántica | **9** | 1 h1, jerarquía sin saltos, landmarks correctos, `alt` de marca en la foto. Resta: el `h2#q-text` vacío del overlay en el HTML (`index.html:4443`), inocuo. |
| Performance mobile | **9** | LCP 1,8-2,0 s, CLS 0, TBT ≤30 ms (§5). Speed Index 3,9-4,0 s por la animación de reveal. |
| Política de indexación | **6** | Sin contenido delgado por URL (el diagnóstico no genera URLs) ✔, 404 con `noindex` y código 404 ✔. Pero `diagnostico.*` sin `noindex`, `/404` directo responde 200 (con `noindex`, inocuo), y `privacidad` indexable sin decisión explícita (aceptable). |

### Las tres peores cosas, en orden

1. **Google tiene indexada la home de antes del rediseño y nadie le avisó del cambio.** El title que muestra ("Consultora PyME") y el snippet son los del HEAD anterior al 07/09. No hay Search Console, así que no se puede pedir el rastreo ni ver cobertura, y el anuncio "¿Eres dueño de ordenfinanciero.com?" confirma que Google no tiene propietario verificado. Esto está fuera del repo y es lo único que mueve la aguja en días en vez de semanas.
2. **La home se sirve con 200 desde tres hosts.** `https://www.ordenfinanciero.com/` porque la regla de `vercel.json` no matchea la raíz; `https://diagnostico.ordenfinanciero.com/*` porque es una variante funcional sin `noindex`. Hoy no están indexados (`site:` vacío) y el canonical apunta bien, pero cada rastreo de un duplicado es presupuesto que no va a la canónica, y un link externo al `www` puede meterlo en el índice.
3. **"orden financiero" no es una marca para Google, es una pregunta.** La página 1 es contenido educativo de finanzas personales y un bloque de "Más preguntas". Con un solo documento indexado, sin propiedad verificada, sin Google Business Profile y con el Instagram (el canal real) como única señal, el sitio no tiene entidad. Ningún `<title>` resuelve eso solo: hay que construir la asociación marca → dominio fuera del código (Search Console, Business Profile, link en la bio de @orden.financiero, LinkedIn del fundador con el dominio, `sameAs` recíprocos).

---

## 7. Auditoría ruta por ruta (§9)

| Ruta | Pregunta que responde | ¿Indexar? | Qué le falta en el `<head>` | Relación con la home |
|---|---|---|---|---|
| `/` | "¿Qué es Orden Financiero y qué hago primero?" | Sí, es la única página que importa | Title más corto; description ≤160 con el país; JSON-LD con `alternateName`, `@id`, `WebSite`, LinkedIn; nada visible | Es la home |
| `/privacidad` | "¿Qué hacen con mi WhatsApp?" | Sí (página legal enlazada desde la home y el formulario) | Nada obligatorio. Opcional: `og:title`/`og:image` para que un share no salga vacío | Le aporta confianza, no autoridad; canonical propio ✔ |
| `/404` y cualquier ruta inexistente | — | No (`noindex` ✔) | Nada. Opcional: `/404` directo devuelve 200; inocuo con `noindex` | Enlaza a `/#diagnostico` y a `/` ✔ |
| `/#diagnostico` (overlay) | "Hacer el diagnóstico" | No es URL: no aplica | Nada | Mismo documento |
| `https://www.ordenfinanciero.com/` | — | No | Redirigir 308 al apex (raíz) | Duplicado que compite con la home |
| `https://diagnostico.ordenfinanciero.com/*` | Variante post-agenda | **No**: `noindex, follow` por cabecera | `X-Robots-Tag` en `vercel.json` por host. El HTML no cambia, la variante sigue funcionando | Duplicado funcional; canonical al apex ✔ |

---

## 8. Benchmark verificado con `curl` (§10)

| Referente | Qué se verificó (`baseline/2026-09-08/benchmark-heads.txt`) | Principio | Cómo se aplica acá | Qué NO copiamos |
|---|---|---|---|---|
| **ordenfinanciero.com.ar** (competidor de SERP) | Redirige apex → `www` (un solo host), `lang="es"`, title "Orden Financiero - Sé el dueño de tu dinero", **sin** description, sin h1, sin JSON-LD, ≈1.860 palabras de texto en HTML | Rankea por TLD `.com.ar` + title con la marca exacta + texto real + antigüedad, no por sofisticación técnica | Ya tenemos title con la marca, texto real y `es-AR`; nos falta la señal de país fuerte (Search Console geo AR, Business Profile) | Finanzas personales, "sé el dueño de tu dinero", su copy |
| **ordenfinanciero.co** (homónimo) | `lang="es"`, `og:locale es_ES`, JSON-LD `Organization` + `WebSite` + `ImageObject`, title "Finanzas personales fáciles…" | `WebSite` + `Organization` bien formados | Agregar `WebSite` con `inLanguage: es-AR` y `@id` enlazado a la `Organization` | Su temática y su locale |
| **marval.com** (servicios profesionales, Argentina) | `lang="es"`, `og:locale es_AR`, canonical `www`, JSON-LD `LawFirm` con `PostalAddress` | Un tipo de schema específico y honesto, con dirección solo porque la tienen | `ProfessionalService` (ya está) con dirección solo si el dueño la sostiene (A17) | Un `QuantitativeValue` de "300+ abogados" que no tenemos equivalente |
| **kpmg.com/ar/es** (servicios profesionales, Argentina) | `lang="es"`, canonical propio, `h1` con `class="d-none"` (h1 oculto por CSS) | Contraejemplo parcial: h1 escondido para "cumplir" | Nuestro h1 es el visible del hero: mantener | El h1 oculto |
| **gpsgastronomico.com** (competidor de negocio) | Redirige a `www`, title "GPS Gastronómico — Método GPS para Restaurantes", h1 "Vende igual.", dos `<html lang>` (`en` y `es`, un bug), sin description ni JSON-LD detectados | Nombra el servicio y el rubro en el title | Nuestro title ya lo hace; no competimos por sus términos | Nada de su copy |
| **Contraejemplo**: landing con el término repetido | — | Google lo devalúa y el lector lo nota | Cero repetición: la marca aparece 6 veces en 1.770 palabras y solo donde tiene sentido | Todo |

Sin métricas de tráfico ni posiciones de ninguno: no se midieron.

---

## 9. Tesis (§11)

El sitio **sí está indexado**, pero Google conserva la versión anterior al rediseño del 07/09 (title "Consultora PyME") porque nadie le pidió un nuevo rastreo: no existe Search Console. La home ya entrega en el HTML inicial la marca "Orden Financiero", el servicio y el idioma-país (`es-AR`), así que **no hay problema de renderizado**; lo que falta técnicamente es cerrar la canonicalización (la raíz de `www` y el host `diagnostico.` responden 200) y ajustar metadatos y schema para que digan Argentina y enlacen la entidad (Instagram, LinkedIn, `alternateName`). El diagnóstico no genera URLs (es un overlay con datos en JS), así que no hay contenido delgado que excluir: lo que se excluye es el host `diagnostico.*`, con una cabecera, sin tocar su funcionamiento. Y "orden financiero" es una consulta informativa genérica: para que el sitio gane la búsqueda de marca hacen falta señales de entidad que se construyen fuera del repo (propiedad verificada con orientación a Argentina, Business Profile, link en la bio de Instagram), que son la parte del dueño y la que más pesa.

---

## 10. Direcciones de implementación (§12)

| | Dirección A — "Todo en el repo, verificable con `curl`" | Dirección B — "Infraestructura en el dashboard de Vercel" |
|---|---|---|
| Qué resuelve | `www` raíz → 308 al apex con una regla explícita en `vercel.json`; `X-Robots-Tag: noindex, follow` para `diagnostico.*` por cabecera; metadatos y JSON-LD editados a mano en los tres `<head>`; sitemap con `lastmod` real | El dueño marca `www.ordenfinanciero.com` como "Redirect to ordenfinanciero.com" en Vercel → Domains; el `noindex` de `diagnostico.*` no tiene equivalente en el dashboard (igual va a `vercel.json`) |
| Costo | Un commit por fase; se prueba con `vercel dev` y con un deploy de preview antes de producción | Un click del dueño; nada queda en git |
| Qué sacrifica | Nada visible. Depende de que el deploy se apruebe | La corrección no queda documentada en el repo ni es reproducible; y no cubre `diagnostico.*` |
| Verificación | `curl -I` de las 6 combinaciones de host + `curl -I` de `diagnostico.*` mostrando `X-Robots-Tag` | Solo en producción, después del click |

**Elegida: A.** Es la única que cubre los dos hosts, deja la decisión escrita en `vercel.json` y se verifica con los mismos `curl` del baseline. B queda como alternativa si el dueño prefiere no deployar: se lo indico en el informe final. **La Dirección "Renderizado servidor" del prompt no aplica** (Renderizado 10/10, §6).

---

## 11. Propuesta para la Fase 2 (sujeta a tu aprobación antes de tocar código)

### 11.1 Rutas × estados objetivo (§14)

| URL | Estado objetivo | Mecanismo | Verificación |
|---|---|---|---|
| `https://ordenfinanciero.com/` | Indexable, canónica | Ya lo es | `curl -s -A Googlebot … \| grep -iE "<title\|description\|canonical\|og:\|lang="` |
| `https://ordenfinanciero.com/privacidad` | Indexable | Ya lo es | ídem |
| `http://ordenfinanciero.com/*` | 308 → https apex | Vercel (ya) | `curl -I` |
| `http://www.ordenfinanciero.com/*` | 308 → https www → 308 apex (dos saltos, aceptable) o directo si Vercel lo permite | Vercel + regla | `curl -IL` |
| `https://www.ordenfinanciero.com/` | **308 → apex** | Regla nueva `"source": "/"` con `has: host www` en `vercel.json` | `curl -I https://www.ordenfinanciero.com/` → 308 + `Location` |
| `https://www.ordenfinanciero.com/:path` | 308 → apex | Regla existente | `curl -I …/privacidad` |
| `https://diagnostico.ordenfinanciero.com/*` | **200 + `X-Robots-Tag: noindex, follow`** (sigue funcionando) | `headers` en `vercel.json` con `has: host diagnostico` | `curl -I` muestra la cabecera; el apex **no** la muestra |
| `/404` directo | 200 + `noindex` (como hoy) | Sin cambio | `curl -s …/404 \| grep robots` |
| Rutas inexistentes | 404 + `noindex` | Sin cambio | `curl -I …/x` → 404 |
| `/index`, `/index.html`, `/*.html`, `/*/` | 308 a la limpia | `cleanUrls` + `trailingSlash` (ya) | `curl -I` |
| `/robots.txt`, `/sitemap.xml` | 200 solo desde el apex | Ya (www redirige) | `curl -s` |

### 11.2 Metadatos por ruta (propuesta de copy; decisiones marcadas)

| Ruta | Campo | Hoy | Propuesta | Decisión |
|---|---|---|---|---|
| `/` | `<title>` | "Orden Financiero · Programa de consultoría financiera para gastronomía y servicios" (79 car.; Google corta ≈60) | **"Orden Financiero · Consultoría financiera para gastronomía y servicios"** (68 car.; la marca y el servicio entran antes del corte) o dejar como está | **A9-bis** (el descriptor lo fijaste vos) |
| `/` | `description` | 203 car.: "En 3 minutos sabés por dónde se le escapa la plata a tu negocio. Diagnóstico gratis de 12 preguntas, el paso 1 de un programa de tres meses…" | **"Programa de consultoría financiera con datos para negocios de gastronomía y servicios en Argentina. El primer paso es un diagnóstico de 12 preguntas."** (≈150 car.; dice Argentina; sin "gratis" ni promesa de tiempo, según §20) | **A-nuevo 8**: la description actual la aprobaste el 07/09; el §20 pide otra cosa |
| `/` | `og:title` / `og:description` | h1 del dueño / "Diagnóstico financiero gratis: 12 preguntas…" | Mantener el `og:title` (es lo que se comparte por WhatsApp). `og:description` alineada a la nueva description | ídem 8 |
| `/` | canonical, `lang`, `og:locale`, `og:image` | ✔ | Sin cambio (Anexo A #4: la OG existente respeta la identidad: wordmark, navy, resultado de ejemplo) | cerrada |
| `/` | JSON-LD | `ProfessionalService`+`Organization`, address La Plata, `sameAs` Instagram | Agregar `@id`, `alternateName: "ordenfinanciero"`, `sameAs` + LinkedIn del fundador, `founder.sameAs`, `WebSite` con `inLanguage: "es-AR"` y `publisher` → `@id`. `address`: **según A17** (hoy La Plata; el prompt sugiere solo `areaServed`) | **A17-bis**, **A-nuevo 9** (URL de LinkedIn) |
| `/` | `google-site-verification` | no existe | **No se agrega**: sin build ni env en Vercel, "desde variable de entorno" no es posible en HTML plano; hardcodearlo es commitear el código (prohibido §18). Verificación por **DNS TXT en DonWeb** (propiedad de dominio) | **A-nuevo 6-bis** |
| `/privacidad` | title, description, canonical | ✔ | Sin cambio. Opcional `og:title` + `og:image` (heredar la de la home) | menor, la hago salvo que digas que no |
| `/404` | | `noindex` ✔ | Sin cambio | — |
| `sitemap.xml` | `lastmod` | 2026-09-07 | Se actualiza a la fecha real de cada cambio en cada fase | — |
| `robots.txt` | | `Allow: /` + sitemap | Sin cambio (no hay rutas de API que bloquear) | — |

### 11.3 Fases que quedan y qué toca cada una

- **Fase 3 (canonicalización):** `vercel.json` (regla raíz `www`; cabecera `noindex` para `diagnostico.*`). Verificación con `vercel dev` en local y `curl` en preview. Commit propio.
- **Fase 4 (metadatos y schema):** `index.html:6-19, 37` y `privacidad.html:6-8`, `sitemap.xml`. Solo `<head>`; ni una línea de CSS ni de cuerpo. Commit propio.
- **Fase 5 (renderizado):** **no se ejecuta**, evidencia en §6.
- **Fase 6 (semántica y performance):** nada obligatorio. Único candidato sin efecto visual: nada que baje el LCP (ya 1,8-2,0 s con la foto en `fetchpriority=high`). Se cierra con Lighthouse antes/después, mismo método.
- **Fase 7 (informe):** `docs/seo/INFORME-SEO-<fecha>.md` con la sección para vos: Search Console por DNS en DonWeb paso a paso, orientación a Argentina, envío del sitemap, inspección y "Solicitar indexación" de la home, Google Business Profile, link en la bio de Instagram, y cómo verificar en dos semanas.

---

## 12. Anexo A — decisiones del dueño (actualizado con lo encontrado)

| # | Decisión | Estado / opciones | Recomendación | Qué hago mientras tanto |
|---|---|---|---|---|
| 1 | Host canónico | **Ya decidido de hecho**: apex `ordenfinanciero.com` (canonical, sitemap, robots, redirect de `www` en paths). Solo falla la raíz de `www` | Apex, confirmar | Nada hasta tu OK a la Fase 3 |
| 2 | Indexar el diagnóstico | **No aplica como rutas**. Reformulada: ¿`diagnostico.ordenfinanciero.com` sigue existiendo y va a `noindex`? | Sí existe (sirve a quien agendó), `noindex, follow` por cabecera | Preparo la cabecera en `vercel.json`, no la deployo |
| 3 | Dirección física en el schema | **A17 cerrada el 07/09 con La Plata** (contradice la recomendación del prompt) | Mantener La Plata **solo si** vas a crear Google Business Profile con esa ciudad; si no, dejar `areaServed: AR` | Respeto A17 hasta que digas |
| 4 | Imagen OG | Existe, 1200×630, con wordmark y resultado de ejemplo | Usar la existente | La uso |
| 5 | Analytics | Vercel Web Analytics ya cargado en el HTML, **deshabilitado** en Vercel (404) | No agregar nada. Si querés datos de uso, "Enable" en Vercel → Analytics (sin código) | No toco nada |
| 6 | Search Console | Sin env ni build: solo DNS TXT (DonWeb) o archivo/meta commiteado | **Propiedad de dominio por DNS TXT en DonWeb** | Escribo el paso a paso para DonWeb |
| 7 | Trailing slash | `trailingSlash: false`, ya consistente | Mantener | Nada |
| 8 | Copy de la description (y `og:description`) | Hoy "En 3 minutos sabés… Diagnóstico gratis…" (aprobada 07/09) vs. §20 del prompt (sin "gratis", sin promesa, con país) | La propuesta de §11.2 | No la cambio sin tu OK |
| 9 | LinkedIn del fundador para `sameAs` | Necesito la URL | Incluirla | Sin URL, no la invento |
| 10 | Title de la home | 79 car. (se corta) vs. 68 propuesto | La versión corta | Sin tu OK, queda el actual |
| 11 | Deploys de verificación | Necesito hacer **deploys de preview** (URL `*.vercel.app`, no producción) para verificar `vercel.json` con `curl` reales | Autorizarlos; producción sigue requiriendo tu OK explícito | Sin OK, verifico solo con `vercel dev` en local |

---

## 13. Anexo B — mapa de paths

| Qué | Path | Líneas |
|---|---|---|
| Home (único documento con el diagnóstico) | `index.html` | `<head>` 1-40 (title 6, description 7, canonical 8, OG 9-16, twitter 17-18, theme-color 19, icons 20-21, preload 22, loader Analytics 28-35, JSON-LD 37); CSS 38-3774; `<nav>` 3776; hero/h1 3798-3853; `<main>` 3855-4277; `<footer>` 4280-4302; overlay del diagnóstico 4312-4527; JS 4529-5673 (`PREGUNTAS` 4734, `TEXTOS_RESULTADO` 4910, webhook 5469, `WHATSAPP_NUMERO` 5478, variante `diagnostico.` 5654-5670, apertura por hash 5672) |
| Privacidad | `privacidad.html` | head 1-34, h1 41 |
| 404 | `404.html` | head 1-32 (`noindex` 7) |
| Robots / sitemap | `robots.txt`, `sitemap.xml` | archivos planos |
| Hosting (cleanUrls, trailingSlash, redirect www, headers de cache) | `vercel.json` | redirect 5-16 |
| Lo que no se publica | `.vercelignore` | AUDIT-*, INFORME-*, audit-assets/, .claude/, tools/ — **agregar `docs/`** en la Fase 3 (hoy `docs/seo/` se publicaría) |
| Link a Vercel | `.vercel/project.json` (gitignored) | — |
| Servidor local | `.claude/launch.json` → `npx -y serve -l 5173 .` (sin `vercel.json`); para probar redirects: `vercel dev` | — |
| Evidencia de esta auditoría | `docs/seo/baseline/2026-09-08/` | — |
| Informes anteriores (contexto, no fuente de verdad SEO) | `AUDIT-2026-09-07-web-5-criterios.md` §2.7 y §10.4; `INFORME-rediseno-2026-09-07.md` §8 (Fase 6) y Anexo A (A9, A17, A18, A19) | — |

---

## 14. Criterio de cierre de la Fase 1

- El dueño puede leer §0, §4 y §6 y entender por qué "no aparece": **sí aparece** en `site:`, con la versión vieja; no aparece para "orden financiero" porque Google la trata como pregunta genérica y el dominio no tiene señales de entidad ni propiedad verificada.
- No se tocó código. `git status` muestra solo `docs/seo/` nuevo (y los archivos no versionados que ya estaban).
- Lo que espero de vos antes de la Fase 3: las decisiones 1, 2, 3, 8, 9, 10 y 11 del Anexo A, y las dos capturas de Google desde tu celular (§4).
