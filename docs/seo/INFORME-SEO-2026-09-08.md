# INFORME SEO TÉCNICO E INDEXACIÓN — ordenfinanciero.com

**Fecha:** 2026-09-08 · **Alcance:** SEO técnico e indexación, sin cambios visibles · **Auditoría previa:** `docs/seo/AUDITORIA-SEO-2026-09-08.md` · **Evidencia:** `docs/seo/baseline/2026-09-08/`

Índice: 1 Proyecto y stack · 2 Auditoría y rutas · 3 Baseline · 4 Scores y las tres peores cosas · 5 Tesis y dirección · 6 Rutas × estados y metadatos por ruta · 7 Implementación por fase · 8 Diff del `<head>` · 9 Performance antes/después · 10 Validaciones · **11 Para el dueño** · 12 Deuda y decisiones pendientes

---

## 1. Proyecto y stack identificados

Sitio estático de tres archivos HTML a mano (`index.html`, `privacidad.html`, `404.html`), CSS y JS inline, servido por Vercel (proyecto `orden-financiero`, `cleanUrls`, `trailingSlash: false`). Sin framework, sin build, sin `package.json`, sin variables de entorno. DNS en DonWeb (apex A `76.76.21.21`; `www` y `diagnostico` CNAME a Vercel). Tres dominios en el proyecto: `ordenfinanciero.com`, `www.ordenfinanciero.com`, `diagnostico.ordenfinanciero.com`. Deploy a producción por push a `master` (integración GitHub). Portal de clientes: repo y proyecto aparte, no tocado. Detalle completo en la auditoría §1.

**Corrección a la premisa del prompt:** no es Next.js, y el `<head>` con marca, canonical, OG, `lang="es-AR"`, JSON-LD, `robots.txt` y `sitemap.xml` ya existía desde el rediseño del 07/09. El diagnóstico no genera rutas: es un overlay en `/#diagnostico` con los datos en JS.

## 2. Auditoría con la tabla de rutas

Tabla completa en la auditoría §2. Resumen del estado inicial (08/09, antes de tocar nada):

| URL | Estado inicial | Problema |
|---|---|---|
| `https://ordenfinanciero.com/` | 200, head completo, todo el contenido en el HTML (≈1.770 palabras), 1 h1 | Title de 79 car. (se cortaba), description de 203 car. con "gratis" y promesa de tiempo, sin "Argentina" en texto |
| `https://ordenfinanciero.com/privacidad` | 200, title/description/canonical | Sin OG (menor) |
| Rutas inexistentes | 404 con `404.html` en `noindex` | — |
| `/index`, `/index.html`, `/*.html`, `/*/` | 308 a la URL limpia | — |
| `https://www.ordenfinanciero.com/` | **200, duplicado** | La regla de `vercel.json` no matcheaba la raíz |
| `https://www.ordenfinanciero.com/<path>` | 308 al apex | — |
| `https://diagnostico.ordenfinanciero.com/*` | **200, duplicado funcional** sin `noindex` | Variante para quien ya agendó; debe seguir andando y no indexarse |
| `robots.txt`, `sitemap.xml` | 200, correctos | `lastmod` a actualizar |

**Estado en Google (medido):** `site:ordenfinanciero.com` devolvía **1 URL, la home, con el title y snippet anteriores al 07/09** ("Orden Financiero · Consultora PyME"). Los hosts `www` y `diagnostico` no estaban indexados. Para "orden financiero", tanto desde el navegador del agente como desde el celular del dueño en Argentina (tres capturas, transcritas en `baseline/…/google-brand-query-dueno-argentina-2026-09-08.txt`), la página 1 es contenido de finanzas personales: resumen de IA, `ordenfinanciero.com.ar` primero ("hace 4 días"), Banco Galicia, Perfil, BBVA, "Más preguntas". `ordenfinanciero.com` no aparece.

## 3. Baseline

| Medición | Valor inicial (08/09, producción) |
|---|---|
| HTML de cada ruta como lo recibe Googlebot mobile | `baseline/2026-09-08/prod-*.html` + cabeceras |
| Home: 214.224 B sin comprimir, 49,5 KB brotli; JS externo: 0 (Vercel Analytics responde 404 porque no está habilitado) | `curl` |
| Cuatro combinaciones de host | `http://apex` 308 → https ✔ · `http://www` 308 → `https://www` · `https://apex` 200 ✔ · **`https://www` 200 ✗** |
| Lighthouse mobile (2 corridas, Lighthouse 13.4.1, simulado) | Performance 97 / 98 · **LCP 2,0 / 1,8 s** · CLS 0 / 0 · TBT 30 / 20 ms · FCP 1,6 / 1,4 s |
| INP | No medido (métrica de campo; no hay datos de campo sin Analytics/CrUX) |

## 4. Scores y las tres peores cosas

Scores iniciales (evidencia en la auditoría §6): Indexabilidad 7 · Renderizado 10 · Metadatos 7 · Datos estructurados 7 · Canonicalización 4 · País e idioma 7 · Semántica 9 · Performance 9 · Política de indexación 6.

Las tres peores cosas, en orden: (1) Google tenía la home vieja y nadie podía pedirle un rastreo porque no hay Search Console; (2) la home se servía con 200 desde tres hosts; (3) "orden financiero" es una consulta informativa genérica y el dominio no tiene señales de entidad (propiedad verificada, Business Profile, enlaces desde Instagram y LinkedIn).

Después de las Fases 3 y 4: Canonicalización **9** (un solo host con 200; `http://www` llega al apex en dos saltos 308), Política de indexación **9** (`diagnostico.*` con `X-Robots-Tag: noindex, follow`), Metadatos **9** (title 70 car., description 149 car. con país, OG completo en las dos páginas), Datos estructurados **8** (`@graph` con `Organization` + `WebSite`; falta LinkedIn). Indexabilidad y País siguen en 7 hasta que exista Search Console: eso es del dueño (§11).

## 5. Tesis y dirección elegida

**Tesis.** El sitio está indexado, pero Google conserva la versión anterior al rediseño porque nadie le pidió un nuevo rastreo. El HTML inicial ya entrega marca, servicio e idioma-país, así que no había problema de renderizado; faltaba cerrar la canonicalización (raíz de `www` y host `diagnostico.` en 200) y que los metadatos dijeran Argentina y enlazaran la entidad. El diagnóstico no genera URLs, así que no había contenido delgado: lo que se excluye es el host `diagnostico.*`, por cabecera. Y como "orden financiero" es una frase genérica, ganar la búsqueda de marca depende de señales que se construyen fuera del repo.

**Dirección elegida: A, "todo en el repo, verificable con curl"** (auditoría §10): regla explícita de redirect para la raíz de `www` y cabecera `noindex` para `diagnostico.*` en `vercel.json`; metadatos a mano en los `<head>`. La dirección "renderizado en servidor" no aplicaba (Renderizado 10/10).

## 6. Rutas × estados (final) y metadatos por ruta

| URL | Estado final | Mecanismo | Verificado con |
|---|---|---|---|
| `https://ordenfinanciero.com/` | Indexable, canónica | — | `curl` §10 |
| `https://ordenfinanciero.com/privacidad` | Indexable | — | `curl` §10 |
| `http://ordenfinanciero.com/*` | 308 → https apex | Vercel | `curl -I` |
| `http://www.ordenfinanciero.com/*` | 308 → `https://www` → 308 → apex | Vercel + `vercel.json` | `curl -IL` |
| `https://www.ordenfinanciero.com/` | **308 → apex** | `vercel.json` regla `source: "/"` + host | `curl -I` |
| `https://www.ordenfinanciero.com/<path>` | 308 → apex | regla `/:path*` | `curl -I` |
| `https://diagnostico.ordenfinanciero.com/*` | 200 + **`X-Robots-Tag: noindex, follow`**; sigue funcionando | `vercel.json` `headers` + host | `curl -I`; prueba manual |
| `/404` directo | 200 + `<meta robots noindex>` | sin cambio | `curl` |
| Rutas inexistentes | 404 + `noindex` | sin cambio | `curl -I` |
| `/docs/**` | 404 (no se publica) | `.vercelignore` | `curl -I` |
| `robots.txt`, `sitemap.xml` | 200 solo desde el apex | — | `curl` |

| Ruta | title | description | canonical | robots | OG | JSON-LD | lang |
|---|---|---|---|---|---|---|---|
| `/` | Orden Financiero · Consultoría financiera para gastronomía y servicios (70) | Programa de consultoría financiera con datos para negocios de gastronomía y servicios en Argentina. El primer paso es un diagnóstico de 12 preguntas. (149) | `https://ordenfinanciero.com/` | indexable | type, title (h1), description, url, locale `es_AR`, image 1200×630 + alt, twitter `summary_large_image` | `@graph`: `ProfessionalService`+`Organization` (`@id`, `alternateName`, `founder`, `areaServed` AR, `address` La Plata, `sameAs` Instagram) + `WebSite` (`inLanguage es-AR`) | `es-AR` |
| `/privacidad` | Privacidad · Orden Financiero | Qué datos pide ordenfinanciero.com, para qué se usan y cómo pedir que se borren. | `…/privacidad` | indexable | type, title, description, url, locale, image | no (correcto) | `es-AR` |
| `/404` | Página no encontrada · Orden Financiero | — | — | `noindex` | — | — | `es-AR` |

## 7. Implementación por fase, archivos tocados y commits

| Fase | Commit | Archivos | Qué |
|---|---|---|---|
| 1 Auditoría | `e202ab9` | `docs/seo/AUDITORIA-SEO-2026-09-08.md`, `docs/seo/baseline/2026-09-08/*`, `.gitignore` (excluye los `.report.html` de Lighthouse) | Solo documentación |
| 2 Tesis y especificación | (en la auditoría §9-§11) | — | Aprobada por el dueño ("dale avanza con todo", 08/09) |
| 3 Canonicalización | `3cc31ee` | `vercel.json`, `.vercelignore` | Redirect explícito `/` con host `www` → apex (308); `X-Robots-Tag: noindex, follow` para host `diagnostico.*`; `docs/` fuera del deploy |
| 4 Metadatos y schema | `47df2e0` | `index.html` (líneas 6, 7, 11, 36-39), `privacidad.html` (líneas 9-16), `sitemap.xml` | Title corto, description con país y sin "gratis", `og:description` alineada, JSON-LD `@graph`, OG en privacidad, `lastmod` 2026-09-08. **Solo `<head>`** (`git diff -U0`: hunks en 6-7, 11 y 36-39) |
| 5 Renderizado | no se ejecuta | — | Todo el contenido ya estaba en el HTML inicial |
| 6 Semántica y performance | sin commit | — | h1 único, landmarks y `alt` ya correctos; ninguna optimización sin efecto visual que baje un LCP de 1,5-2,0 s. Se midió antes/después (§9) |
| 7 Informe | este archivo | `docs/seo/INFORME-SEO-2026-09-08.md` | — |

Deploy: push a `master` (integración GitHub). El primer deploy de la Fase 3 se duplicó con un `vercel --prod` de CLI, sin efecto; los siguientes solo por push. `vercel dev` no aplica las reglas `has` (lo avisa), y los previews están detrás de SSO, así que la verificación de host se hizo directamente en producción con `curl` inmediatamente después de cada deploy.

## 8. Diff del `<head>` antes/después

Archivos: `baseline/2026-09-08/diff-head-home.txt`, `diff-head-privacidad.txt`. Todas las diferencias son intencionales:

**Home**
- `<title>`: "Orden Financiero · Programa de consultoría financiera para gastronomía y servicios" → "Orden Financiero · Consultoría financiera para gastronomía y servicios".
- `description`: "En 3 minutos sabés por dónde se le escapa la plata a tu negocio. Diagnóstico gratis de 12 preguntas, el paso 1 de un programa de tres meses…" → "Programa de consultoría financiera con datos para negocios de gastronomía y servicios en Argentina. El primer paso es un diagnóstico de 12 preguntas."
- `og:description`: "Diagnóstico financiero gratis: 12 preguntas, resultado al instante…" → "Programa de consultoría financiera con datos para negocios de gastronomía y servicios en Argentina. El paso 1 es un diagnóstico de 12 preguntas con resultado al instante."
- JSON-LD: de un objeto a `@graph` con `Organization` (`@id`, `alternateName: "ordenfinanciero"`, description nueva) + `WebSite` (`inLanguage: "es-AR"`, `publisher` → `@id`). `og:title` (el h1), canonical, `lang`, OG image, twitter, favicon, preload: sin cambio.

**Privacidad**: se agregan `og:type`, `og:title`, `og:description`, `og:url`, `og:locale`, `og:image` (+ ancho/alto). Nada más.

**Cuerpo y CSS**: sin diferencias (el diff de `index.html` tiene hunks solo en las líneas 6-7, 11 y 36-39). La regresión visual es cero por construcción; igual se abrió producción a 390 px después del deploy y se probó el diagnóstico a mano (§10).

**JSON-LD final (para validar en https://validator.schema.org o en la prueba de resultados enriquecidos de Google):**

```json
{"@context": "https://schema.org", "@graph": [{"@type": ["ProfessionalService", "Organization"], "@id": "https://ordenfinanciero.com/#organization", "name": "Orden Financiero", "alternateName": "ordenfinanciero", "url": "https://ordenfinanciero.com/", "logo": "https://ordenfinanciero.com/apple-touch-icon.png", "image": "https://ordenfinanciero.com/og-image.png", "description": "Programa de consultoría financiera con datos para negocios de gastronomía y servicios en Argentina. El primer paso es un diagnóstico de 12 preguntas.", "email": "manuel@ordenfinanciero.com", "areaServed": {"@type": "Country", "name": "Argentina"}, "founder": {"@type": "Person", "name": "Manuel Alfano"}, "sameAs": ["https://www.instagram.com/orden.financiero/"], "address": {"@type": "PostalAddress", "addressLocality": "La Plata", "addressRegion": "Buenos Aires", "addressCountry": "AR"}}, {"@type": "WebSite", "@id": "https://ordenfinanciero.com/#website", "url": "https://ordenfinanciero.com/", "name": "Orden Financiero", "inLanguage": "es-AR", "publisher": {"@id": "https://ordenfinanciero.com/#organization"}}]}
```

Parseado con `json.loads` sin error. No afirma nada que la página no muestre: nombre, fundador, mail, Instagram, ciudad (A17) y servicio están en la home o en el footer.

## 9. Performance antes/después (mismo método)

`npx lighthouse https://ordenfinanciero.com/ --preset=perf --form-factor=mobile --screenEmulation.mobile --throttling-method=simulate --only-categories=performance`, Lighthouse 13.4.1, Chrome headless, dos corridas cada vez. Reportes JSON en `baseline/2026-09-08/lh-prod-mobile-{run,final-run}{1,2}.report.json`.

| | Antes (run 1 / run 2) | Después (run 1 / run 2) |
|---|---|---|
| Performance | 97 / 98 | 97 / 94 |
| **LCP** | **2,0 s / 1,8 s** | **2,0 s / 1,5 s** |
| CLS | 0 / 0 | 0 / 0,04 |
| TBT | 30 / 20 ms | 18 / 26 ms |
| FCP | 1,6 / 1,4 s | 1,5 / 1,5 s |

El LCP no empeoró. El CLS 0,04 de la segunda corrida final es variación de laboratorio (el diff no toca CSS ni cuerpo; la primera corrida final dio 0, igual que las dos del baseline). El peso del HTML subió 0,3 KB por el `@graph` y las OG de privacidad.

## 10. Validaciones (salidas guardadas)

`baseline/2026-09-08/verificacion-fase3-prod.txt` (17:17 UTC) y `verificacion-fase4-prod.txt` (17:20 UTC). Extracto:

```
http://ordenfinanciero.com/          308 → https://ordenfinanciero.com/
http://www.ordenfinanciero.com/      308 → https://www.ordenfinanciero.com/ → 308 → https://ordenfinanciero.com/ → 200
https://ordenfinanciero.com/         200
https://www.ordenfinanciero.com/     308 → https://ordenfinanciero.com/        (antes: 200)
https://www.ordenfinanciero.com/?x=7006  308 → https://ordenfinanciero.com/?x=7006
https://www.ordenfinanciero.com/privacidad  308 → https://ordenfinanciero.com/privacidad
https://diagnostico.ordenfinanciero.com/            200  X-Robots-Tag: noindex, follow   (antes: sin cabecera)
https://diagnostico.ordenfinanciero.com/privacidad  200  X-Robots-Tag: noindex, follow
https://ordenfinanciero.com/docs/seo/AUDITORIA-SEO-2026-09-08.md  404
https://ordenfinanciero.com/ruta-x   404  (title "Página no encontrada · Orden Financiero", meta robots noindex)
https://ordenfinanciero.com/robots.txt   200  User-agent: * / Allow: / / Sitemap: https://ordenfinanciero.com/sitemap.xml
https://ordenfinanciero.com/sitemap.xml  200  2 URLs, lastmod 2026-09-08
```

`curl -s -A "<Googlebot mobile>" https://ordenfinanciero.com/ | grep -iE "<html|<title|description|canonical|og:|ld\+json"` muestra `lang="es-AR"`, el title nuevo, la description nueva, canonical, OG completo y el JSON-LD (texto completo en el archivo). `curl` de `/privacidad` muestra title, description, canonical y las OG nuevas. Producción es byte a byte igual al HEAD (`diff -q` vacío).

**Prueba manual del diagnóstico en producción, 375 px, después del deploy final:** abrir con el CTA del hero → overlay activo, `location.hash = #diagnostico`, pantalla de rubro → tocar "Gastronomía" → "Pregunta 1 de 12" con 3 opciones → tocar la opción C → reacción visible, "1 / 12", botón Siguiente habilitado → autoavance a "Pregunta 2 de 12" a los 4 s. En `https://diagnostico.ordenfinanciero.com/` la variante post-agenda sigue activa (eyebrow "Ya agendaste tu llamada", h1 "Antes de tu llamada, completá este diagnóstico", canonical al apex). Nada del flujo cambió.

**Build, tipos, lint:** no existen en este repo (HTML plano). Lo que se corrió: parseo del JSON-LD, `git diff -U0` para confirmar que solo cambió el `<head>`, `curl` y Lighthouse.

---

## 11. Para el dueño, en lenguaje llano

### Qué pasaba

Tu sitio **sí estaba en Google**, pero con la versión de antes del rediseño: Google todavía mostraba "Orden Financiero · Consultora PyME" y el texto viejo, porque desde el 7/9 no volvió a pasar por la página y no había forma de avisarle. Además la página se servía desde tres direcciones distintas (`ordenfinanciero.com`, `www.ordenfinanciero.com` y `diagnostico.ordenfinanciero.com`), que para Google son tres copias compitiendo entre sí. Y, lo más importante: cuando alguien busca "orden financiero", Google entiende que quiere aprender a ordenar sus finanzas personales, no que busca una marca. Por eso aparecen bancos, notas y el sitio `.com.ar`.

### Qué se corrigió (ya está en producción)

- `www.ordenfinanciero.com` ahora manda a `ordenfinanciero.com`. Queda una sola dirección oficial.
- `diagnostico.ordenfinanciero.com` sigue funcionando igual para quien ya agendó, pero le dice a Google que no la muestre en resultados.
- El título que va a ver Google es más corto y entra entero en el celular: **"Orden Financiero · Consultoría financiera para gastronomía y servicios"**. La descripción nombra Argentina y describe el programa sin promesas.
- La ficha de datos para Google (el "schema") ahora dice que "ordenfinanciero" y "Orden Financiero" son lo mismo, y que el sitio está en español de Argentina.
- Los informes internos (`docs/`) ya no se publican aunque se deployen.
- No cambió nada de lo que se ve, ni el diagnóstico, ni el envío del WhatsApp.

### Qué tenés que hacer vos (en este orden; 30 a 45 minutos en total)

**1. Search Console (es lo que más pesa; sin esto Google puede tardar semanas en ver los cambios).**
1. Entrá a https://search.google.com/search-console con tu cuenta de Google.
2. "Agregar propiedad" → elegí **Dominio** (la opción de la izquierda) y escribí `ordenfinanciero.com`.
3. Google te va a dar un registro **TXT** (un texto tipo `google-site-verification=…`). Copialo.
4. Entrá al panel de **DonWeb** (ahí están los DNS del dominio) → zona DNS de `ordenfinanciero.com` → agregar registro → tipo **TXT**, nombre `@` (o vacío), valor: el texto copiado. Guardá.
5. Volvé a Search Console y tocá "Verificar". Si dice que no encuentra el registro, esperá 15 a 60 minutos y probá de nuevo.
6. Una vez verificado: menú **Sitemaps** → escribí `sitemap.xml` → Enviar.
7. Menú **Inspección de URLs** (la barra de arriba) → pegá `https://ordenfinanciero.com/` → esperá el análisis → tocá **"Solicitar indexación"**. Esto es lo que hace que Google vuelva a leer la página en horas o días en vez de semanas.
8. Repetí el paso 7 con `https://ordenfinanciero.com/privacidad` (opcional).

Sobre la "orientación a Argentina": Search Console **ya no tiene** ese ajuste (Google lo retiró en 2022). Hoy el país se infiere del idioma (`es-AR`, ya puesto), de la ficha de datos (`areaServed: Argentina`, ya puesta), del Business Profile (punto 2) y de quién enlaza al sitio. No hay una casilla que marcar.

**2. Google Business Profile.** Es la señal más fuerte para que Google entienda que "Orden Financiero" es un negocio real en Argentina. Entrá a https://business.google.com, creá el perfil con el nombre **Orden Financiero**, categoría "Consultora de empresas" (o "Consultor financiero"), **tipo "empresa de servicios a domicilio / sin local"** con área de servicio La Plata y Buenos Aires (coincide con lo que dice el schema; no hace falta calle), sitio web `https://ordenfinanciero.com`, mail y el Instagram. Google te va a pedir verificar (video, teléfono o carta). Hacelo: un perfil sin verificar no cuenta.

**3. Instagram.** En la bio de @orden.financiero, el link tiene que ser **`https://ordenfinanciero.com`** (sin `www`, sin acortadores tipo Linktree si podés evitarlo). Es el enlace más importante que tiene el dominio hoy.

**4. LinkedIn.** Pasame la URL de tu perfil de LinkedIn para agregarla al schema (`sameAs`), y en tu perfil poné el sitio web `https://ordenfinanciero.com`. Si el mail de la firma o cualquier otra red nombran el dominio, mismo criterio: siempre `ordenfinanciero.com`.

**5. Vercel Analytics (opcional, sin código).** En Vercel → proyecto `orden-financiero` → pestaña Analytics → "Enable". El sitio ya tiene el script preparado; hasta que lo habilites no mide nada.

### Cómo verificar en dos semanas que funcionó

1. Buscá `site:ordenfinanciero.com` en Google. Tiene que aparecer la home con el título **"Orden Financiero · Consultoría financiera para gastronomía y servicios"** (si todavía dice "Consultora PyME", Google no volvió a pasar: repetí "Solicitar indexación").
2. En Search Console → **Páginas**: la home tiene que figurar como "Indexada"; `www` y `diagnostico` no tienen que aparecer como indexadas (si aparecen como "Página con redirección" o "Excluida por noindex", está bien).
3. En Search Console → **Rendimiento**: filtrá por la consulta "orden financiero" y mirá impresiones y posición. La primera meta realista es aparecer en la página 1 para búsquedas que incluyan la marca más algo tuyo ("orden financiero gastronomía", "orden financiero manuel alfano", "orden financiero diagnóstico"). Ser primero para "orden financiero" a secas, contra la intención informativa y el `.com.ar`, depende del Business Profile, del Instagram y del tiempo; no lo prometo con fecha.
4. Buscá "orden financiero" desde tu celular y mandame captura, como hoy. Comparamos con las de hoy (están transcritas en `docs/seo/baseline/2026-09-08/`).

---

## 11-bis. Adenda 08/09 17:40 UTC — LinkedIn agregado y firewall de Vercel activo

- **LinkedIn**: el dueño pasó la página de empresa (ID 106909356). `sameAs` ahora incluye `https://www.linkedin.com/company/106909356/` (commit `6909ef2`, deploy por CLI `3mnp7akzd`, verificado en producción desde un navegador real: el JSON-LD lo muestra). Se usó la URL por ID porque el Chrome del dueño no tiene sesión de LinkedIn y la URL "bonita" no se pudo leer sin login; la URL por ID es pública y permanente.
- **Hallazgo nuevo, urgente**: desde ~17:30 UTC, `https://ordenfinanciero.com/*` responde **403 con `X-Vercel-Mitigated: challenge`** y la página "Vercel Security Checkpoint" a todo cliente que no sea un navegador con JavaScript: `curl`, WebFetch desde otra red, y **también `/robots.txt`**. Los navegadores pasan el checkpoint y ven el sitio normal. A las 17:20 UTC todo respondía 200 (`verificacion-fase4-prod.txt`). El token del CLI no tiene permiso para leer la configuración del firewall (`invalidToken`), así que no se pudo confirmar la causa desde acá. **Causa confirmada con la captura del Firewall que mandó el dueño (17:45 UTC):** Attack Challenge Mode y Bot Protection están inactivos y no hay reglas propias. Es la **mitigación automática de Vercel ("System Rule · Challenge")** aplicada a una sola IP, `181.191.65.245`, la del dueño, desde las 14:32 hora local: es la IP desde la que el agente hizo los ~150 `curl` y 4 corridas de Lighthouse. Afecta solo a esa IP; Googlebot y los previews de WhatsApp/Instagram no vienen de ahí. Se levanta sola o desde el menú "…" de la fila "Persistent Actions". El WebFetch externo que dio 403 corrió desde infraestructura de nube y cayó en la misma heurística. **Además**, la regla "DDoS Mitigation" muestra 1.300 pedidos denegados en ráfagas de ~277 cada 6 horas (20:30, 02:30, 08:30, 14:15) desde cinco IPs de Google Cloud (`34.15.141.219`, `34.35.64.146`, `35.236.164.212`, `35.236.193.137`, `34.38.178.180`). Sus PTR son `*.bc.googleusercontent.com` (máquinas de clientes de Google Cloud) y **ninguna figura en las listas oficiales de IPs de Googlebot, special-crawlers ni user-triggered-fetchers** (verificado contra los cuatro JSON de `developers.google.com/search/apis/ipranges`). Es un scraper o monitor de terceros programado, no Google; que Vercel lo deniegue no afecta la indexación.
- **Qué puede y qué no puede hacer el agente desde el Chrome del dueño**: la extensión bloquea la navegación a Google (Search Console, Business Profile), Instagram, DonWeb y Vercel ("Navigation to this domain is not allowed"). Ninguna de las cuatro tareas de §11 se puede operar desde acá; sí todo lo que viva en el repo o en el CLI de Vercel.

## 11-ter. Adenda 08/09 ~18:00 UTC — Search Console creada: la home NO estaba indexada

El dueño creó la propiedad de dominio `ordenfinanciero.com`; Google la verificó **automáticamente vía el registrador (DonWeb)**, sin registro TXT. Sitemap enviado (`https://ordenfinanciero.com/sitemap.xml`; en las propiedades de dominio hay que poner la URL completa). Inspección de `https://ordenfinanciero.com/`:

- **"La URL no está en Google" · "Rastreada: actualmente sin indexar"**. Último rastreo: **12 ago 2026 23:33**, robot para smartphones. Rastreo permitido, obtención correcta, indexación permitida, canónica declarada: "Nada" (en esa versión no había canonical). Páginas de referencia: dos sitios de venta de dominios expirados (`mail.runningwebsites.net`, `all-aged-domains.com`).
- **Corrección a §2 y §9:** el resultado de `site:ordenfinanciero.com` era un resto del índice; según Search Console la home **no está indexada** desde que Google la rastreó el 12/08 (versión previa al rediseño, con mucho menos texto) y la clasificó como "sin indexar" por decisión de calidad, no por bloqueo técnico. Eso explica por qué no aparece para ninguna consulta. La versión actual (1.770 palabras, marca, servicio, país, schema) es la que Google va a evaluar cuando vuelva.
- **Hecho por el dueño (18:05 UTC):** "Solicitar indexación" enviado para la home ("Se ha añadido la URL a una cola de rastreo prioritaria") y para `/privacidad` (estado previo: "Descubierta: actualmente sin indexar", nunca rastreada). Verificación en 24-72 h: la inspección tiene que pasar a "La URL está en Google" con rastreo nuevo, y `site:` tiene que mostrar el title nuevo.

## 12. Deuda restante y decisiones pendientes (Anexo A actualizado)

| # | Decisión | Estado |
|---|---|---|
| 1 | Host canónico apex | **Hecho** (308 desde `www` raíz y paths) |
| 2 | `diagnostico.*` fuera del índice | **Hecho** (cabecera `noindex, follow`; sigue funcionando) |
| 3 | Dirección La Plata en el schema | **Se mantuvo** (A17 del 07/09). Coherente solo si el Business Profile declara La Plata como área de servicio; si no vas a crearlo, avisá y la saco dejando `areaServed: AR` |
| 4 | Imagen OG | Se usa la existente (1200×630) |
| 5 | Analytics | No se agregó nada; Vercel Analytics sigue deshabilitado (tu decisión, un click en Vercel) |
| 6 | Search Console | **Pendiente tuya**: propiedad de dominio por DNS TXT en DonWeb (§11). No hay meta desde env porque no hay build ni env; no se commiteó ningún código de verificación |
| 7 | Trailing slash | Sin trailing slash, consistente |
| 8 | Description sin "gratis" y con Argentina | **Hecho** según tu OK |
| 9 | LinkedIn en `sameAs` | **Hecho** con la página de empresa (ID 106909356). Si además querés el perfil personal de Manuel, pasá la URL |
| 15 | Challenge del firewall de Vercel | **Resuelto como falsa alarma**: mitigación automática solo contra la IP del dueño por las pruebas del agente (§11-bis). Opcional: quitar la "Persistent Action" desde "…" |
| 10 | Title corto | **Hecho** |
| 11 | Deploys | Hechos por push a `master` (Fase 3 y 4). El de CLI duplicado no tuvo efecto |
| 12 | `http://www` llega al apex en dos saltos (308 + 308) | Aceptable para Google. Si querés un solo salto: Vercel → Domains → `www.ordenfinanciero.com` → "Redirect to ordenfinanciero.com" (sin código) |
| 13 | Google Business Profile | **Pendiente tuya** (§11, punto 2) |
| 16 | Link de la bio de Instagram | **Ya estaba**: @orden.financiero enlaza directo a `ordenfinanciero.com` (captura del dueño, 08/09). Nota de coherencia, no SEO: la bio dice "negocio gastronómico / 12 semanas / 5 min al día"; la web, "gastronomía y servicios / tres meses / 3 minutos" |
| 17 | Search Console | **Hecho por el dueño el 08/09**: propiedad de dominio verificada vía DonWeb, sitemap enviado, indexación solicitada para `/` y `/privacidad` (§11-ter) |
| 14 | Wordmark visible "ordenfinanciero." en una palabra | No se toca (decisión de marca). Cubierto por `alternateName` en el schema |

**Lo que NO se hizo, a propósito:** ni blog ni páginas nuevas; ni librerías ni scripts de terceros; ni cambios en el diagnóstico, el scoring, los 72 textos, el mail o el Sheet; ni mención al portal en metadatos; ni `hreflang`; ni FAQ schema (habría sido honesto porque las FAQ existen en la página, pero Google dejó de mostrar ese resultado enriquecido para sitios que no son de gobierno o salud y no cambia la indexación; lo dejo anotado por si querés que lo agregue igual).

### Criterio de excelencia (§25), respondido

1. ¿Sé con certeza por qué no aparecía? **Sí**: estaba indexada la versión vieja sin canal para pedir recrawl, y la consulta es genérica. Medido en `site:` y en la SERP del dueño.
2. ¿Googlebot recibe "Orden Financiero" y el servicio en el HTML inicial? **Sí** (title, JSON-LD, eyebrow, h1, footer; `curl` sin JS).
3. ¿Un solo host canónico con redirección permanente desde los otros? **Sí**: `https://apex` 200; `http://apex`, `http://www`, `https://www` en 308 (Vercel emite 308, equivalente a 301 para Google). `diagnostico.*` en `noindex` por decisión funcional.
4. ¿Cada ruta indexable con title, description, canonical, OG y `lang`? **Sí** (§10).
5. ¿Ninguna ruta del diagnóstico indexable y el diagnóstico funciona igual? **Sí**: no hay rutas; el host `diagnostico.*` lleva `noindex`; probado a mano.
6. ¿JSON-LD válido y honesto? **Sí** (parseado; solo datos que la página muestra).
7. ¿`robots.txt` y `sitemap.xml` en producción y coherentes? **Sí**.
8. ¿LCP mobile no empeoró? **Sí** (2,0/1,8 s → 2,0/1,5 s).
9. ¿El sitio se ve igual? **Sí**: el diff no toca cuerpo ni CSS; producción abierta a 375 px y diagnóstico probado.
10. ¿El dueño sabe qué hacer? **Sí**, §11 paso a paso.
11. ¿Queda algo indexado que no debería, o no indexado que debería? Hoy Google tiene la home vieja (se corrige con "Solicitar indexación", §11.1.7); `www` y `diagnostico` no están indexados y ahora no pueden entrar. Nada más debería estarlo.
