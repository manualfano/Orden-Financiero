"""Genera las guias de ordenfinanciero.com (SEO, 14/09/2026).

Fuente: tools/guias/<slug>.html. La primera linea es un comentario con los
metadatos en JSON; el resto es el cuerpo de la guia en HTML.
Salida: guias/<slug>.html, guias/index.html y sitemap.xml completo.

    python tools/build_guias.py

tools/ no se publica (.vercelignore); lo publicado es solo lo generado.
"""
import html
import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / 'tools' / 'guias'
OUT = ROOT / 'guias'
BASE = 'https://ordenfinanciero.com'
MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto',
         'septiembre', 'octubre', 'noviembre', 'diciembre']

# Mismo codigo de GA4 y mismos tokens que privacidad.html: una sola fuente.
PRIV = (ROOT / 'privacidad.html').read_text(encoding='utf-8')
GA = re.search(r'(?s)<!-- Medicion: Google.*?</script>', PRIV).group(0)
# Pixel de Meta (16/09/2026): el codigo base y el noscript tambien salen de privacidad.html.
PIXEL = re.search(r'(?s)<!-- Medicion: Pixel de Meta.*?</script>', PRIV).group(0)
PIXEL_NOSCRIPT = re.search(r'<noscript><img[^>]*facebook\.com/tr[^>]*></noscript>', PRIV).group(0)
# Eventos ViewContent del pixel por guia: slug -> content_name.
VIEW_CONTENT = {'punto-de-equilibrio': 'guia_punto_equilibrio'}
TOKENS = re.search(r'(?s)<style>\s*(@font-face.*?:root \{.*?\})', PRIV).group(1)
BRAND = re.search(r'(?s)<a href="/" class="brand">.*?</a>', PRIV).group(0)
BRAND = BRAND.replace('</span>ordenfinanciero<span class="dot">.</span></a>', '</span><span class="brand-name">ordenfinanciero<span class="dot">.</span></span></a>')
assert 'brand-name' in BRAND, 'Cambió la marca de privacidad.html'

CSS = TOKENS + """
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', system-ui, sans-serif; font-size: var(--fs-base); line-height: 1.7; color: var(--tinta); background: var(--bg); }
  /* Barra copiada de la home (index.html, 16/09/2026, pedido del dueño): tira navy-2 de 76 px fija arriba,
     marca | links centrados | botón; hasta 1099 px los links van a un menú de tres líneas. */
  header { position: sticky; top: 0; z-index: 100; background: #143C8C; height: 76px; display: flex; align-items: center; }
  .head-in { width: 100%; max-width: max(1120px, var(--ancho)); margin: 0 auto; padding: 0 var(--s-5); display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: var(--s-6); }
  .brand { display: inline-flex; align-items: center; gap: var(--s-3); text-decoration: none; }
  .brand-mark { width: 42px; height: 42px; border-radius: var(--r-lg); background: var(--marca); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .brand-mark svg { width: 22px; height: 22px; display: block; }
  .brand-name { font-size: var(--fs-h3); font-weight: 600; letter-spacing: -0.01em; color: var(--w); line-height: 1; }
  .dot { color: var(--marca); }
  .head-links { display: flex; align-items: center; justify-content: center; gap: var(--s-2); }
  .head-links a { font-size: var(--fs-base); font-weight: 500; padding: var(--s-2) var(--s-3); border-radius: var(--r); color: rgba(255,255,255,0.92); text-decoration: none; transition: background var(--t-instante); }
  .head-links a:hover { color: var(--w); background: rgba(255,255,255,0.10); }
  .head-right { display: flex; align-items: center; justify-content: flex-end; gap: var(--s-2); }
  .head-cta { display: inline-flex; align-items: center; justify-content: center; min-height: 48px; padding: var(--s-3) var(--s-5); border-radius: var(--r); border: 1.5px solid var(--marca); background: var(--marca); color: var(--w); font-size: var(--fs-base); font-weight: 600; text-decoration: none; white-space: nowrap; transition: background var(--t-instante); }
  .head-cta:hover { background: var(--marca-hover); border-color: var(--marca-hover); }
  .head-burger { display: none; }
  .head-menu[hidden] { display: none; }
  @media (max-width: 1099px) {
    .head-in { grid-template-columns: auto auto; justify-content: space-between; }
    .head-links { display: none; }
    .head-burger { display: inline-flex; align-items: center; justify-content: center; width: 44px; height: 44px; padding: 0; border: 1.5px solid rgba(255,255,255,0.20); border-radius: var(--r); background: transparent; color: var(--w); cursor: pointer; }
    .head-burger:hover { background: rgba(255,255,255,0.10); border-color: rgba(255,255,255,0.92); }
    .head-burger svg { width: 22px; height: 22px; }
    .head-burger .ico-cerrar { display: none; }
    .head-burger[aria-expanded="true"] .ico-abrir { display: none; }
    .head-burger[aria-expanded="true"] .ico-cerrar { display: block; }
    .head-menu { position: absolute; top: 100%; left: 0; right: 0; display: flex; flex-direction: column; padding: var(--s-2) var(--s-4) var(--s-4); background: #143C8C; border-top: 1px solid rgba(255,255,255,0.10); box-shadow: 0 12px 24px rgba(0,0,0,0.25); }
    .head-menu a { display: flex; align-items: center; min-height: 48px; padding: 0 var(--s-2); border-bottom: 1px solid rgba(255,255,255,0.10); color: rgba(255,255,255,0.92); font-size: var(--fs-lead); font-weight: 500; text-decoration: none; }
    .head-menu a:last-child { border-bottom: 0; }
    .head-menu a:hover { color: var(--w); background: rgba(255,255,255,0.10); }
  }
  @media (max-width: 960px) {
    header { height: 64px; }
    .brand-mark { width: 36px; height: 36px; border-radius: var(--r); }
    .brand-mark svg { width: 18px; height: 18px; }
    .brand-name { font-size: var(--fs-lead); }
    .head-cta { min-height: 44px; padding: var(--s-2) var(--s-4); font-size: var(--fs-sm); }
  }
  @media (max-width: 640px) {
    .brand-name { display: none; }
    .head-in { padding: 0 var(--s-3); gap: var(--s-2); }
    .head-cta { padding: var(--s-2) var(--s-3); }
  }
  main { max-width: 720px; margin: 0 auto; padding: var(--s-6) var(--s-5) var(--s-7); }
  .migas { font-size: var(--fs-sm); color: var(--tinta-3); margin-bottom: var(--s-5); }
  .migas a { color: var(--tinta-3); }
  .eyebrow { font-size: var(--fs-meta); font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: var(--marca); margin-bottom: var(--s-3); }
  h1 { font-size: var(--fs-h2); font-weight: 600; color: var(--navy); line-height: 1.15; letter-spacing: -0.02em; margin-bottom: var(--s-4); }
  h2 { font-size: var(--fs-h3); font-weight: 600; color: var(--navy); line-height: 1.3; margin: var(--s-6) 0 var(--s-3); }
  h3 { font-size: var(--fs-lead); font-weight: 600; color: var(--navy); margin: var(--s-5) 0 var(--s-2); }
  p, li { color: var(--tinta-2); }
  article p, article ul, article ol { margin-bottom: var(--s-3); }
  article li { margin-bottom: var(--s-2); }
  ul, ol { padding-left: var(--s-5); }
  strong { color: var(--tinta); font-weight: 600; }
  a { color: var(--marca); }
  .bajada { font-size: var(--fs-lead); }
  .autor { font-size: var(--fs-sm); color: var(--tinta-3); margin-top: var(--s-4); padding-bottom: var(--s-5); margin-bottom: var(--s-5); border-bottom: 1px solid var(--borde); }
  .formula { background: var(--lienzo); border-left: 3px solid var(--marca); border-radius: var(--r); padding: var(--s-3) var(--s-4); margin: var(--s-4) 0; font-weight: 600; color: var(--navy); }
  /* Fórmula como en un libro (16/09/2026): ecuación con raya de fracción y siglas, referencias abajo */
  .ecuacion { background: var(--lienzo); border-left: 3px solid var(--marca); border-radius: var(--r); padding: var(--s-4) var(--s-5); margin: var(--s-4) 0; }
  .ec-t { font-size: var(--fs-sm); font-weight: 600; color: var(--navy); margin: var(--s-3) 0 0 !important; }
  .ec-t:first-child { margin-top: 0 !important; }
  .ec-linea { font-family: 'Cambria Math', Cambria, 'STIX Two Math', 'Times New Roman', Georgia, serif; font-size: 1.45em; line-height: 1.2; color: var(--navy); display: flex; flex-wrap: wrap; align-items: center; column-gap: 0.28em; row-gap: var(--s-2); margin: var(--s-2) 0 var(--s-3); overflow-x: auto; }
  .ec-v { font-style: italic; white-space: nowrap; }
  .ec-n { white-space: nowrap; }
  .ec-op { padding-left: 0.1em; }
  .ec-g { display: inline-flex; align-items: center; column-gap: 0.28em; min-width: 0; }
  .ec-p { font-style: normal; }
  .ec-frac { display: inline-flex; flex-direction: column; align-items: stretch; text-align: center; vertical-align: middle; }
  .ec-w { font-family: 'Inter', system-ui, sans-serif; font-size: 0.8em; font-weight: 600; }
  .ec-num, .ec-den { display: flex; flex-wrap: wrap; justify-content: center; align-items: center; column-gap: 0.28em; padding: 0.08em 0.3em; }
  .ec-frac { max-width: 100%; }
  .ec-linea:has(.ec-w) { font-size: 1.3em; row-gap: 4px; }
  .ec-num { border-bottom: 1.5px solid currentColor; }
  .ec-frac .ec-frac { font-size: 0.85em; }
  .ec-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
  .ec-ref { display: grid; grid-template-columns: max-content 1fr; column-gap: var(--s-4); row-gap: 4px; margin: 0; padding-top: var(--s-3); border-top: 1px solid var(--borde); font-size: var(--fs-sm); line-height: 1.45; }
  .ec-ref > div { display: contents; }
  .ec-ref dt { font-family: 'Cambria Math', Cambria, 'STIX Two Math', 'Times New Roman', Georgia, serif; font-style: italic; font-size: 1.1em; color: var(--navy); }
  .ec-ref dd { margin: 0; color: var(--tinta-2); }
  .ec-u { color: var(--tinta-3); }
  .ec-u::before { content: "· "; }
  .tabla { overflow-x: auto; margin: var(--s-4) 0; }
  table { border-collapse: collapse; width: 100%; font-size: var(--fs-sm); }
  .tabla table:has(tr > :nth-child(4)) { min-width: 520px; }
  th, td { text-align: left; padding: 8px 10px; border-bottom: 1px solid var(--borde); color: var(--tinta-2); }
  th { color: var(--navy); font-weight: 600; background: var(--lienzo); }
  .n { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
  th.n { white-space: normal; }
  td code { overflow-wrap: anywhere; }
  tr.total td { font-weight: 600; color: var(--navy); }
  .nota { font-size: var(--fs-sm); color: var(--tinta-3); }
  .grafico { margin: var(--s-4) 0; padding: var(--s-4); background: var(--lienzo); border-radius: var(--r-lg); }
  .grafico svg { display: block; width: 100%; height: auto; font-family: 'Inter', system-ui, sans-serif; }
  .cta { margin: var(--s-7) 0 var(--s-6); background: var(--navy); border-radius: var(--r-lg); padding: var(--s-6) var(--s-5); }
  .cta p { color: rgba(255,255,255,0.88); }
  .cta .cta-t { font-size: var(--fs-h3); font-weight: 600; line-height: 1.3; color: var(--w); margin-bottom: var(--s-2); }
  .btn { display: inline-flex; align-items: center; gap: 10px; min-height: 44px; padding: var(--s-3) var(--s-5); border-radius: var(--r); background: var(--marca); color: var(--w); font-weight: 600; text-decoration: none; margin-top: var(--s-4); transition: background var(--t-instante); }
  .btn:hover { background: var(--marca-hover); }
  .lista-guias { list-style: none; padding: 0; }
  .lista-guias li { border: 1px solid var(--borde); border-radius: var(--r-lg); padding: var(--s-4) var(--s-5); margin-bottom: var(--s-3); }
  .lista-guias a { font-weight: 600; font-size: var(--fs-lead); text-decoration: none; line-height: 1.4; }
  .lista-guias p { margin-top: var(--s-2); font-size: var(--fs-sm); }
  /* Paleta oficial de la home (14/09/2026): azul marca para acción, navy para fondos oscuros,
     lima solo en toques chicos sobre fondos oscuros (nunca sobre claro ni en botones). */
  :root { --navy-2: #143C8C; --secondary-dark: #A3ADC2; --lienzo-2: #F0F1F2; --seleccion-bg: #E9F2FF; --lima: #A3E635; --w-08: rgba(255,255,255,0.08); --w-18: rgba(255,255,255,0.18); --w-72: rgba(255,255,255,0.72); --w-88: rgba(255,255,255,0.88); }
  html { scroll-behavior: smooth; }
  @media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }
  body:has(main.ancho) { background: var(--lienzo); }
  main.ancho { max-width: var(--ancho); }
  .circulos { position: absolute; width: 320px; height: 320px; right: -80px; top: -90px; color: var(--w); opacity: 0.06; pointer-events: none; }
  /* Fondos navy: portada del índice y cabecera de cada guía */
  .portada, .guia-cab { position: relative; overflow: hidden; background: var(--navy); border-radius: var(--r-lg); padding: var(--s-6) var(--s-5); color: var(--w); }
  .portada > :not(.circulos), .guia-cab > :not(.circulos) { position: relative; }
  .portada .migas, .guia-cab .migas { color: var(--secondary-dark); }
  .portada .migas a, .guia-cab .migas a { color: var(--w); }
  .portada .eyebrow { display: inline-flex; align-items: center; gap: var(--s-2); color: var(--w-72); }
  .punto { width: 6px; height: 6px; border-radius: 50%; background: var(--lima); flex-shrink: 0; }
  .guia-cab .eyebrow { color: var(--lima); }
  .portada h1, .guia-cab h1 { color: var(--w); max-width: 780px; }
  .portada h1 em { font-style: normal; color: var(--lima); }
  .portada .bajada, .guia-cab .bajada { color: var(--w-88); max-width: 700px; }
  .portada .autor, .guia-cab .autor { color: var(--secondary-dark); border-bottom-color: var(--w-18); }
  .portada .autor a, .guia-cab .autor a { color: var(--w); }
  .guia-cab .autor { border-bottom: 0; padding-bottom: 0; margin-bottom: 0; }
  .guia-cab { margin-bottom: var(--s-6); }
  /* Pastillas blancas translúcidas: atajos de la portada y chips de la cabecera */
  .atajos-t { font-size: var(--fs-meta); font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--secondary-dark); margin-bottom: var(--s-2); }
  .atajos { display: flex; flex-wrap: wrap; gap: var(--s-2); }
  .atajos a { display: inline-flex; align-items: center; gap: var(--s-2); min-height: 44px; padding: 0 var(--s-4) 0 7px; border-radius: 999px; background: var(--w-08); border: 1px solid var(--w-18); color: var(--w); font-size: var(--fs-sm); font-weight: 600; text-decoration: none; transition: background var(--t-instante); }
  .atajos a:hover { background: var(--w-18); }
  .atajos .n-mini { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 999px; background: var(--w-18); font-size: var(--fs-meta); }
  .guia-cab .meta { margin-top: var(--s-3); }
  .guia-cab .meta span { background: var(--w-08); border: 1px solid var(--w-18); color: var(--w); }
  /* Índice: grupos por problema */
  .problema { margin-top: var(--s-7); scroll-margin-top: calc(76px + var(--s-5)); }
  .problema-cab { display: flex; gap: var(--s-4); align-items: flex-start; margin-bottom: var(--s-4); }
  .problema-num { font-size: 44px; font-weight: 600; line-height: 1; color: var(--marca); letter-spacing: -0.02em; min-width: 32px; }
  .problema-cab h2 { margin: 2px 0 4px; color: var(--navy); }
  .problema-cab p { color: var(--tinta-2); }
  .tarjetas { list-style: none; padding: 0; display: grid; gap: var(--s-3); grid-template-columns: repeat(auto-fill, minmax(min(300px, 100%), 1fr)); }
  .tarjetas a { display: flex; flex-direction: column; gap: var(--s-2); height: 100%; padding: var(--s-5); background: var(--w); border: 1px solid var(--borde); border-radius: var(--r-lg); text-decoration: none; transition: border-color var(--t-instante), transform var(--t-instante); }
  .tarjetas a:hover { border-color: var(--marca); transform: translateY(-2px); }
  .tarjetas .ico { width: 40px; height: 40px; border-radius: var(--r); background: var(--seleccion-bg); color: var(--marca); display: inline-flex; align-items: center; justify-content: center; margin-bottom: 4px; }
  .tarjetas .ico svg { width: 20px; height: 20px; }
  .tarjetas strong { color: var(--navy); font-size: var(--fs-lead); font-weight: 600; line-height: 1.35; transition: color var(--t-instante); }
  .tarjetas a:hover strong { color: var(--marca); }
  .tarjetas .desc { color: var(--tinta-2); font-size: var(--fs-sm); line-height: 1.55; }
  .meta { display: flex; flex-wrap: wrap; gap: var(--s-2); margin-top: auto; padding-top: var(--s-2); }
  .meta span { font-size: var(--fs-meta); font-weight: 600; color: var(--tinta-2); background: var(--lienzo-2); border-radius: 999px; padding: 2px 10px; }
  @media (prefers-reduced-motion: reduce) { .tarjetas a:hover { transform: none; } }
  @media (max-width: 640px) { .problema-num { font-size: 34px; min-width: 24px; } .problema-cab { gap: var(--s-3); } }
  .cifras { color: var(--w-88); font-size: var(--fs-sm); margin-top: var(--s-2); }
  .cifras strong { color: var(--w); }
  .buscador { margin-top: var(--s-5); max-width: 560px; }
  .buscador label { display: block; font-size: var(--fs-meta); font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--secondary-dark); margin-bottom: var(--s-2); }
  .buscador input { width: 100%; min-height: 48px; padding: 0 var(--s-4); border: 0; border-radius: var(--r); font: inherit; font-size: var(--fs-base); color: var(--tinta); background: var(--w); }
  .buscador input:focus-visible { outline: 3px solid var(--w); outline-offset: 2px; }
  /* Portada en dos columnas (14/09/2026, Manu: "esta todo muy sobre la
     izquierda"): texto a la izquierda; a la derecha un panel con los cuatro
     problemas apilados y el buscador. Debajo de 1024 px se apila como antes. */
  .atajo-txt { flex: 1; }
  .atajos .flecha { display: none; }
  @media (min-width: 1024px) {
    .portada { padding: var(--s-7) var(--s-6); }
    .portada-grid { display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(360px, 1fr); gap: var(--s-7); align-items: center; }
    .portada .autor { border-bottom: 0; padding-bottom: 0; margin-bottom: 0; }
    /* Fondo solido (navy-2): translucido dejaba ver los circulos de atras. */
    .portada-panel { background: var(--navy-2); border: 1px solid var(--w-18); border-radius: var(--r-lg); padding: var(--s-5); }
    .portada-panel .atajos { flex-direction: column; flex-wrap: nowrap; }
    .portada-panel .atajos a { width: 100%; min-height: 52px; border-radius: var(--r); padding: 0 var(--s-4) 0 var(--s-2); background: var(--w-08); font-size: var(--fs-base); }
    .portada-panel .atajos a:hover { background: var(--w-18); }
    .portada-panel .atajos .flecha { display: inline; color: var(--w-72); font-weight: 600; transition: transform var(--t-instante); }
    .portada-panel .atajos a:hover .flecha { transform: translateX(3px); }
    .portada-panel .buscador { max-width: none; }
  }
  .sin-resultados { margin-top: var(--s-6); padding: var(--s-5); background: var(--w); border: 1px solid var(--borde); border-radius: var(--r-lg); }
  /* Banda azul marca al cierre, como .cta-final de la home: título lima (26 px a 600, texto grande) y botón blanco */
  .cta { background: var(--marca); }
  .cta p { color: var(--w); }
  .cta .cta-t { font-size: 26px; font-weight: 600; line-height: 1.2; letter-spacing: -0.01em; color: var(--lima); }
  .cta .btn { background: var(--w); color: var(--marca); }
  .cta .btn:hover { background: var(--seleccion-bg); }
  main.ancho .cta { text-align: center; padding: var(--s-7) var(--s-5); }
  main.ancho .cta .cta-t { font-size: clamp(26px, 3vw, 34px); text-wrap: balance; }
  /* Página de guía */
  main.guia { max-width: var(--ancho); }
  .guia-cuerpo { display: grid; grid-template-columns: minmax(0, 1fr) 250px; gap: var(--s-7); align-items: start; }
  .guia-principal { min-width: 0; max-width: var(--lectura); }
  .indice-guia { position: sticky; top: calc(76px + var(--s-5)); border-left: 1px solid var(--borde); }
  .indice-guia p, .resumen p { font-size: var(--fs-meta); font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: var(--s-2); }
  .indice-guia p { color: var(--tinta-3); padding-left: var(--s-4); }
  .indice-guia ol, .indice-movil ol { list-style: none; padding: 0; }
  .indice-guia li { margin-bottom: 6px; }
  .indice-guia a, .indice-movil a { color: var(--tinta-2); font-size: var(--fs-sm); line-height: 1.4; text-decoration: none; display: block; }
  .indice-guia a { padding-left: var(--s-4); margin-left: -1px; border-left: 2px solid transparent; }
  .indice-guia a:hover, .indice-movil a:hover { color: var(--marca); }
  .indice-guia a.activo { color: var(--marca); border-left-color: var(--marca); font-weight: 600; }
  .indice-movil { display: none; }
  /* Llamado al diagnóstico en el medio de una guía (16/09/2026, pedido del dueño): quien llega desde un
     anuncio en el celular muchas veces no baja hasta la banda final. Caja clara, para no competir con ella. */
  .cta-medio { background: var(--seleccion-bg); border-radius: var(--r-lg); padding: var(--s-5); margin: var(--s-6) 0; }
  .cta-medio .cta-medio-t { font-size: var(--fs-h3); font-weight: 600; line-height: 1.3; color: var(--navy); margin-bottom: var(--s-2); }
  .cta-medio p { color: var(--tinta); }
  .cta-medio .btn { margin-top: var(--s-4); }
  .resumen { background: var(--lienzo); border-left: 4px solid var(--marca); border-radius: var(--r); padding: var(--s-4) var(--s-5); margin-bottom: var(--s-6); }
  .resumen p { color: var(--marca); }
  .resumen ul { padding-left: var(--s-5); }
  .resumen li { color: var(--tinta); margin-bottom: 6px; }
  article h2 { scroll-margin-top: calc(76px + var(--s-5)); }
  .caja-autor { display: flex; gap: var(--s-4); align-items: flex-start; border: 1px solid var(--borde); border-radius: var(--r-lg); padding: var(--s-5); margin-top: var(--s-7); }
  .caja-autor > div { flex: 1; min-width: 0; }
  .caja-autor > img { width: 72px; height: 72px; border-radius: 999px; object-fit: cover; object-position: top; background: var(--lienzo); flex-shrink: 0; }
  .caja-autor strong { color: var(--navy); display: block; }
  .caja-autor p { font-size: var(--fs-sm); margin-top: 4px; }
  .formacion { margin-top: var(--s-3); padding-top: var(--s-3); border-top: 1px solid var(--borde-soft); }
  .caja-autor .formacion-titulo { font-size: 10px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--tinta-3); margin: 0 0 var(--s-2); }
  .formacion ul { list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: var(--s-3); }
  .formacion li { display: flex; flex-direction: column; gap: 4px; }
  .formacion .logo { height: 17px; display: flex; align-items: center; }
  .formacion .logo img { width: auto; max-width: 100%; opacity: 0.9; }
  .formacion li > span:last-child { font-size: 10px; line-height: 1.35; color: var(--tinta-3); }
  @media (max-width: 640px) {
    .caja-autor { display: grid; grid-template-columns: 56px 1fr; column-gap: var(--s-3); padding: var(--s-4); }
    .caja-autor > img { width: 56px; height: 56px; }
    .caja-autor > div { display: contents; }
    .caja-autor strong { align-self: center; }
    .caja-autor p, .formacion { grid-column: 1 / -1; }
    .caja-autor > div > p { margin-top: 4px; }
    .formacion ul { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--s-3); }
  }
  .seguir { margin-top: var(--s-7); }
  .seguir h2 { margin: 0 0 var(--s-3); }
  @media (max-width: 900px) {
    .guia-cuerpo { grid-template-columns: 1fr; }
    .indice-guia { display: none; }
    .indice-movil { display: block; border: 1px solid var(--borde); border-radius: var(--r-lg); padding: 0 var(--s-4); margin-bottom: var(--s-5); }
    .indice-movil summary { min-height: 48px; display: flex; align-items: center; font-weight: 600; color: var(--navy); cursor: pointer; }
    .indice-movil ol { padding-bottom: var(--s-3); }
    .indice-movil li { padding: 6px 0; border-top: 1px solid var(--borde); }
  }
  footer { background: var(--navy-900); padding: var(--s-6) var(--s-5); font-size: var(--fs-sm); }
  .foot-in { max-width: calc(var(--ancho) - 2 * var(--s-5)); margin: 0 auto; display: flex; flex-wrap: wrap; gap: var(--s-3) var(--s-5); justify-content: space-between; color: rgba(255,255,255,0.75); }
  .foot-in nav { display: flex; flex-wrap: wrap; gap: var(--s-2) var(--s-5); }
  .foot-in a { color: var(--w); text-decoration: none; }
  :focus-visible { outline: 2px solid var(--marca); outline-offset: 2px; }
  /* Descarga a cambio del WhatsApp (DESCARGAS): caja --seleccion-bg, formulario en tarjeta blanca,
     botón azul marca con texto blanco. Sin lima: la caja es clara. */
  :root { --riesgo: #C5311A; }
  /* Caja de descarga (16/09/2026, rediseño pedido por Manu: "le falta diseño"). Navy como la
     portada, etiqueta en lima, vista previa con aspecto de planilla de Excel y formulario en
     tarjeta blanca. Lima solo sobre navy; el botón sigue en azul marca. */
  .descarga { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr); grid-template-areas: 'arriba form' 'abajo form'; column-gap: var(--s-6); row-gap: var(--s-4); align-items: start; background: var(--navy); color: var(--w); border-radius: var(--r-lg); padding: var(--s-6); margin: var(--s-7) 0; }
  .descarga-arriba { grid-area: arriba; min-width: 0; }
  .descarga-abajo { grid-area: abajo; min-width: 0; }
  .descarga-form { grid-area: form; align-self: center; min-width: 0; }
  @media (max-width: 860px) { .descarga { grid-template-columns: minmax(0, 1fr); grid-template-areas: 'arriba' 'form' 'abajo'; row-gap: var(--s-5); padding: var(--s-5); } }
  .descarga-tipo { display: inline-flex; align-items: center; gap: var(--s-2); font-size: var(--fs-meta); font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: #A3E635; margin-bottom: var(--s-2); }
  .descarga-tipo svg { width: 16px; height: 16px; }
  article .descarga .descarga-t { font-size: clamp(22px, 2.4vw, 28px); line-height: 1.2; color: var(--w); margin: 0 0 var(--s-2); letter-spacing: -0.01em; }
  article .descarga .descarga-linea { color: rgba(255,255,255,0.82); margin-bottom: 0; }
  .descarga-hoja { background: var(--w); border-radius: var(--r); overflow: hidden; font-size: var(--fs-meta); line-height: 1.4; font-variant-numeric: tabular-nums; box-shadow: 0 2px 8px rgba(0,0,0,0.18); color: var(--tinta); }
  .descarga-hoja .barra { display: flex; align-items: center; gap: 6px; background: #1E6C41; color: var(--w); padding: 6px 10px; font-size: 11.5px; font-weight: 600; }
  .descarga-hoja .barra i { width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,0.38); flex-shrink: 0; }
  .descarga-hoja .barra span { margin-left: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .descarga-hoja .fila { display: grid; grid-template-columns: 26px minmax(0, 1fr) 62px 112px; }
  .descarga-hoja .fila span { padding: 5px 8px; border-bottom: 1px solid var(--borde); border-left: 1px solid var(--borde); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--tinta); }
  .descarga-hoja .fila span:nth-child(n+3) { text-align: right; }
  .descarga-hoja .fila span:first-child { border-left: 0; background: var(--lienzo-2); color: var(--tinta-3); text-align: center; padding: 5px 0; }
  .descarga-hoja .letras span { background: var(--lienzo-2); color: var(--tinta-3); text-align: center !important; padding: 3px 8px; }
  .descarga-hoja .cab span:not(:first-child) { background: var(--navy); color: var(--w); font-weight: 600; }
  .descarga-hoja .total span:not(:first-child) { color: var(--navy); font-weight: 600; background: #E9F2FF; }
  .descarga-hoja .pestanas { display: flex; padding: 0 6px; background: var(--lienzo-2); border-top: 1px solid var(--borde); overflow: hidden; }
  .descarga-hoja .pestanas span { padding: 5px 10px; color: var(--tinta-2); white-space: nowrap; border-right: 1px solid var(--borde); }
  .descarga-hoja .pestanas .on { background: var(--w); color: #1E6C41; font-weight: 600; box-shadow: inset 0 -2px 0 #1E6C41; }
  article ul.descarga-trae { list-style: none; padding: 0; margin: var(--s-4) 0 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(min(220px, 100%), 1fr)); gap: 6px var(--s-4); }
  article .descarga .descarga-trae li { font-size: var(--fs-sm); line-height: 1.45; margin: 0; padding-left: 22px; position: relative; color: rgba(255,255,255,0.88); }
  .descarga-trae li::before { content: ""; position: absolute; left: 2px; top: 5px; width: 12px; height: 7px; border-left: 2px solid #93C5FD; border-bottom: 2px solid #93C5FD; transform: rotate(-45deg); }
  .descarga-form { background: var(--w); color: var(--tinta); border-radius: var(--r-lg); padding: var(--s-5); }
  article .descarga .form-t { font-size: var(--fs-lead); font-weight: 600; color: var(--navy); margin: 0 0 4px; }
  article .descarga .form-sub { font-size: var(--fs-sm); color: var(--tinta-2); margin: 0 0 var(--s-4); }
  .descarga-form label { display: block; font-size: var(--fs-sm); font-weight: 600; color: var(--navy); margin-bottom: 6px; }
  .descarga-form input[type="tel"] { width: 100%; min-height: 50px; padding: 0 var(--s-3); border: 1px solid rgba(11,18,14,0.28); border-radius: var(--r); font: inherit; font-size: 17px; color: var(--tinta); background: var(--w); }
  .descarga-form input[type="tel"]:focus-visible { outline: 2px solid var(--marca); outline-offset: 1px; border-color: var(--marca); }
  .descarga-form input[aria-invalid="true"] { border-color: var(--riesgo); }
  article .descarga-hint { font-size: var(--fs-meta); color: var(--tinta-2); margin: 6px 0 0; }
  article .descarga-error { font-size: var(--fs-sm); color: var(--riesgo); font-weight: 600; margin: 6px 0 0; }
  article .descarga-error:empty { display: none; }
  .campo-extra { position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden; }
  .descarga-btn { display: inline-flex; align-items: center; justify-content: center; gap: var(--s-2); width: 100%; min-height: 52px; margin-top: var(--s-4); padding: 0 var(--s-5); border: 0; border-radius: var(--r); background: var(--marca); color: var(--w); font: inherit; font-size: var(--fs-base); font-weight: 600; white-space: nowrap; text-decoration: none; cursor: pointer; transition: background var(--t-instante); }
  .descarga-btn:hover { background: var(--marca-hover); }
  .descarga-btn:focus-visible { outline: 3px solid var(--navy); outline-offset: 2px; }
  .descarga-btn[disabled] { opacity: 0.75; cursor: progress; }
  article .descarga-priv { font-size: var(--fs-meta); color: var(--tinta-2); margin: var(--s-3) 0 0; line-height: 1.5; text-align: center; }
  article .descarga-listo { margin: 0; }
  article .descarga-listo:empty { display: none; }
  .descarga-listo { font-size: var(--fs-sm); color: var(--tinta); }
  .descarga-listo strong { display: block; font-size: var(--fs-lead); color: var(--navy); margin-bottom: 4px; }
  .descarga-listo a:not(.descarga-btn) { font-weight: 600; }
  /* Escala para pantallas grandes (14/09/2026, Manu: "se ve un poco estrecho").
     Mismos cuatro escalones que la home: crecen a la vez el ancho de header,
     contenido y footer, y la letra. La columna de lectura de cada guia crece
     menos, para que las lineas no pasen de ~75 caracteres. */
  :root { --ancho: 1080px; --lectura: 720px; }
  @media (min-width: 1400px) {
    :root { --ancho: 1200px; --lectura: 760px; --fs-base: 15.5px; --fs-lead: 17.5px; --fs-h3: 22px; --fs-h2: clamp(42px, 3.4vw, 45px); }
    .portada h1, .guia-cab h1 { max-width: 860px; }
    .portada .bajada, .guia-cab .bajada { max-width: 760px; }
    .guia-cuerpo { grid-template-columns: minmax(0, 1fr) 270px; }
  }
  @media (min-width: 1600px) {
    :root { --ancho: 1320px; --lectura: 800px; --fs-sm: 15px; --fs-base: 16px; --fs-lead: 18px; --fs-h3: 23px; --fs-h2: clamp(45px, 3.2vw, 48px); }
    .portada h1, .guia-cab h1 { max-width: 940px; }
    .portada .bajada, .guia-cab .bajada { max-width: 800px; }
    .buscador { max-width: 640px; }
    .guia-cuerpo { grid-template-columns: minmax(0, 1fr) 290px; }
  }
  @media (min-width: 1800px) {
    :root { --ancho: 1440px; --lectura: 830px; --fs-base: 16.5px; --fs-lead: 18.5px; --fs-h2: clamp(48px, 3vw, 52px); }
    .portada h1, .guia-cab h1 { max-width: 1000px; }
    .guia-cuerpo { grid-template-columns: minmax(0, 1fr) 300px; }
  }
  @media (min-width: 2000px) {
    :root { --ancho: 1520px; --lectura: 860px; --fs-base: 17px; --fs-lead: 19px; --fs-h3: 24px; --fs-h2: clamp(52px, 2.9vw, 56px); }
    .portada .bajada, .guia-cab .bajada { max-width: 860px; }
    .buscador { max-width: 700px; }
  }
"""


# Íconos por tema (los de los pilares de la home), en azul marca sobre caja --seleccion-bg.
ICONOS = {
    'Costos y precios': '<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>',
    'Resultado económico': '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
    'Flujo de caja': '<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>',
    'Indicadores de gestión': '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
}
CIRCULOS = ('<svg class="circulos" viewBox="0 0 200 200" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">'
            '<circle cx="100" cy="100" r="96"/><circle cx="100" cy="100" r="66"/><circle cx="100" cy="100" r="36"/></svg>')

# Índice ordenado por el problema que resuelve cada guía, en la voz del dueño (14/09/2026).
# 'corto' va en el eyebrow de la guía y de su imagen; 'atajo' en las pastillas de la portada.
# 'pendientes': guías futuras; aparecen solas cuando exista tools/guias/<slug>.html.
PROBLEMAS = [
    {'id': 'no-se-cuanto-me-cuesta', 'titulo': 'No sé cuánto me cuesta lo que vendo', 'atajo': 'No sé cuánto me cuesta',
     'corto': 'Costos', 'linea': 'Calculá el costo real de cada plato y de todo lo que vendés.',
     'slugs': ['costo-de-un-plato', 'planilla-de-costos', 'food-cost', 'costos-fijos-y-variables']},
    {'id': 'no-se-que-precio-poner', 'titulo': 'No sé qué precio poner', 'atajo': 'No sé qué precio poner',
     'corto': 'Precios', 'linea': 'Poné precios que cubran todos tus costos y te dejen ganancia.',
     'slugs': ['precio-de-venta', 'margen-de-ganancia']},
    {'id': 'vendo-bien-pero-no-me-queda-plata', 'titulo': 'Vendo bien pero no me queda plata', 'atajo': 'No me queda plata',
     'corto': 'Ganancia', 'linea': 'Mirá cuánto ganó de verdad el negocio y cuánto tenés que vender para no perder.',
     'slugs': ['estado-de-resultados', 'punto-de-equilibrio', 'rentabilidad-de-un-negocio']},
    {'id': 'nunca-llego-con-la-plata', 'titulo': 'Nunca llego con la plata para pagar', 'atajo': 'No llego a pagar',
     'corto': 'Caja', 'linea': 'Sabé cuánta plata necesitás para pagar todo a tiempo mientras esperás cobrar.',
     'slugs': ['flujo-de-caja', 'capital-de-trabajo']},
]


def svg_icono(eje):
    return ('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" '
            f'stroke-linejoin="round" aria-hidden="true">{ICONOS[eje]}</svg>')


def grupos_con(guias):
    """Cada guía en exactamente un problema; devuelve [(problema, [guías])] y el problema de cada slug."""
    por_slug = {g['slug']: g for g in guias}
    todos = [s for p in PROBLEMAS for s in p['slugs']]
    repetidas = sorted({s for s in todos if todos.count(s) > 1})
    assert not repetidas, f'Guías en más de un problema: {repetidas}'
    faltan = [s for s in todos if s not in por_slug]
    assert not faltan, f'Slugs del índice sin guía: {faltan}'
    pendientes = [s for p in PROBLEMAS for s in p.get('pendientes', [])]
    huerfanas = [g['slug'] for g in guias if g['slug'] not in todos and g['slug'] not in pendientes]
    assert not huerfanas, f'Guías sin problema en el índice: {huerfanas}'
    grupos, de = [], {}
    for p in PROBLEMAS:
        lista = [por_slug[s] for s in p['slugs'] + p.get('pendientes', []) if s in por_slug]
        for g in lista:
            de[g['slug']] = p
        grupos.append((p, lista))
    return grupos, de


# Fórmulas como en un libro (16/09/2026, pedido de Manu): siglas, fracción con raya y referencias
# abajo que dicen qué es cada sigla y en qué se mide (unidades, pesos, %). En la fuente se escribe:
#   <formula>
#   > Título opcional de la fórmula que sigue
#   PE = CF / (P − CVu)
#   PE: Punto de equilibrio | unidades que tenés que vender por mes
#   CF: Costos fijos | pesos por mes
#   </formula>
# Las líneas con "=" son ecuaciones; "/" o "÷" arman la fracción. Las líneas "SIGLA: texto | unidad" son referencias.
_OPS = {'+': '+', '−': '−', '-': '−', '×': '×', '=': '='}


def _tokens(s):
    out, buf = [], ''
    for ch in s:
        if ch in '()/÷' or ch in _OPS:
            if buf.strip():
                out.append(buf.strip())
            buf = ''
            out.append('/' if ch == '÷' else ch)
        else:
            buf += ch
    if buf.strip():
        out.append(buf.strip())
    return out


def _expr(tk, i):
    nodos = []
    nodo, i = _termino(tk, i)
    nodos.append(nodo)
    while i < len(tk) and tk[i] in _OPS:
        op = _OPS[tk[i]]
        nodo, i = _termino(tk, i + 1)
        nodos += [('op', op), nodo]
    return ('seq', nodos), i


def _termino(tk, i):
    nodo, i = _factor(tk, i)
    while i < len(tk) and tk[i] == '/':
        den, i = _factor(tk, i + 1)
        nodo = ('frac', nodo, den)
    return nodo, i


def _factor(tk, i):
    if tk[i] == '(':
        dentro, i = _expr(tk, i + 1)
        assert i < len(tk) and tk[i] == ')', 'Fórmula con paréntesis sin cerrar'
        return ('grupo', dentro), i + 1
    if tk[i] in ('−', '-'):
        # Signo negativo de un resultado (−$3.200.000, −18 días): va pegado al número.
        nodo, i = _factor(tk, i + 1)
        if nodo[0] == 'atomo':
            return ('atomo', '−' + nodo[1]), i
        return ('seq', [('op', '−'), nodo]), i
    return ('atomo', tk[i]), i + 1


def _html_nodo(n, suelto=False):
    tipo = n[0]
    if tipo == 'atomo':
        t = n[1]
        # Siglas cortas (CF, CMV) en cursiva, como en un libro; nombres con palabras en letra normal.
        if not re.search(r'[A-Za-zÁÉÍÓÚáéíóúñÑ]', t):
            clase = 'ec-n'
        elif ' ' in t or len(t) > 5:
            clase = 'ec-w'
        else:
            clase = 'ec-v'
        return f'<span class="{clase}">{html.escape(t)}</span>'
    if tipo == 'op':
        return f'<span class="ec-op">{n[1]}</span>'
    if tipo == 'seq':
        # El "=" viaja pegado a lo que sigue: si la línea no entra, no queda colgado al final del renglón.
        partes, xs = [], n[1]
        for k, x in enumerate(xs):
            if k and xs[k - 1] == ('op', '='):
                partes[-1] = f'<span class="ec-g">{partes[-1]}{_html_nodo(x)}</span>'
            else:
                partes.append(_html_nodo(x))
        return ''.join(partes)
    if tipo == 'grupo':
        # Numerador y denominador no llevan paréntesis: la raya ya agrupa.
        return _html_nodo(n[1]) if suelto else f'<span class="ec-p">(</span>{_html_nodo(n[1])}<span class="ec-p">)</span>'
    if tipo == 'frac':
        return (f'<span class="ec-frac"><span class="ec-num">{_html_nodo(n[1], True)}</span>'
                f'<span class="ec-sr"> dividido por </span><span class="ec-den">{_html_nodo(n[2], True)}</span></span>')
    raise ValueError(tipo)


def formula_html(fuente):
    lineas, refs = [], []
    for linea in [x.strip() for x in fuente.strip().splitlines() if x.strip()]:
        if linea.startswith('>'):
            lineas.append(f'<p class="ec-t">{html.escape(linea[1:].strip())}</p>')
        elif '=' in linea:
            tk = _tokens(linea)
            arbol, fin = _expr(tk, 0)
            assert fin == len(tk), f'No pude leer la fórmula: {linea}'
            lineas.append(f'<div class="ec-linea">{_html_nodo(arbol)}</div>')
        else:
            m = re.match(r'([^:]+):\s*(.+)', linea)
            assert m, f'Línea de fórmula sin "=" ni "SIGLA: texto": {linea}'
            texto, _, unidad = m.group(2).partition('|')
            u = f' <span class="ec-u">{html.escape(unidad.strip())}</span>' if unidad.strip() else ''
            refs.append(f'<div><dt>{html.escape(m.group(1).strip())}</dt><dd>{html.escape(texto.strip())}{u}</dd></div>')
    dl = f'<dl class="ec-ref">{"".join(refs)}</dl>' if refs else ''
    return f'<figure class="ecuacion">{"".join(lineas)}{dl}</figure>'


def con_formulas(cuerpo):
    return re.sub(r'<formula>(.*?)</formula>', lambda m: formula_html(m.group(1)), cuerpo, flags=re.S)


def minutos(g):
    texto = re.sub(r'<[^>]+>', ' ', g['cuerpo']) + ' ' + ' '.join(x['q'] + ' ' + x['a'] for x in g.get('faq', []))
    return max(1, round(len(texto.split()) / 200))


def incluye(g):
    c = g['cuerpo']
    out = []
    if 'class="formula"' in c or 'class="ecuacion"' in c:
        out.append('Fórmula')
    if re.search(r'<h[23]>Ejemplo', c):
        out.append('Ejemplo')
    if 'Excel</h2>' in c:
        out.append('Excel')
    return out


def slug_texto(t):
    import unicodedata
    t = unicodedata.normalize('NFD', t)
    t = ''.join(c for c in t if unicodedata.category(c) != 'Mn').lower()
    return re.sub(r'[^a-z0-9]+', '-', t).strip('-')[:60]


def con_ids(cuerpo):
    """Pone id a cada h2 y devuelve la lista para el índice de la guía."""
    vistos, toc = set(), []

    def poner(m):
        texto = re.sub(r'<[^>]+>', '', m.group(1))
        base = slug_texto(texto) or 'seccion'
        ident, n = base, 2
        while ident in vistos:
            ident, n = f'{base}-{n}', n + 1
        vistos.add(ident)
        toc.append((ident, texto))
        return f'<h2 id="{ident}">{m.group(1)}</h2>'

    return re.sub(r'<h2>(.*?)</h2>', poner, cuerpo), toc


def tarjeta(g, problema=None):
    etiquetas = ''.join(f'<span>{x}</span>' for x in incluye(g))
    claves = ' '.join(g.get('resumen', []) + [x['q'] for x in g.get('faq', [])] + [g['h1'], g['eje']]
                      + ([problema['titulo']] if problema else []))
    return (f'      <li data-claves="{html.escape(claves)}">'
            f'<a href="/guias/{g["slug"]}"><span class="ico">{svg_icono(g["eje"])}</span>'
            f'<strong>{html.escape(g["miga"])}</strong>'
            f'<span class="desc">{html.escape(g["description"])}</span>'
            f'<span class="meta">{etiquetas}<span>{minutos(g)} min</span></span></a></li>\n')


OG_DIR = ROOT / 'tools' / 'og'

# Índice lateral de la guía: marca en azul la sección que se está leyendo.
SCROLLSPY = """  <script>
  (function () {
    var links = [].slice.call(document.querySelectorAll('.indice-guia a'));
    if (!links.length || !('IntersectionObserver' in window)) return;
    var mapa = {};
    links.forEach(function (a) { mapa[a.getAttribute('href').slice(1)] = a; });
    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (!e.isIntersecting || !mapa[e.target.id]) return;
        links.forEach(function (a) { a.classList.remove('activo'); });
        mapa[e.target.id].classList.add('activo');
      });
    }, { rootMargin: '0px 0px -70% 0px' });
    Object.keys(mapa).forEach(function (id) { var h = document.getElementById(id); if (h) obs.observe(h); });
  })();
  </script>"""


# Descargas a cambio del WhatsApp. Una guía la activa con "descarga": "<clave>" en su META
# y el bloque va justo después de la sección "...Excel</h2>". El lead viaja al mismo Apps Script
# que el diagnóstico (index.html, SHEET_WEBHOOK_URL) con origen guia-<slug>-excel.
# El archivo queda en una URL pública: el WhatsApp se pide, pero no es un bloqueo real.
DESCARGAS = {
    'ficha-costo-plato': {
        'titulo': 'Descargá la calculadora de costos en Excel',
        'linea': 'Insumos con la merma ya cargada, recetas, márgenes sin IVA y control de desperdicio.',
        'archivo': '/descargas/calculadora-de-costos-y-margenes.xlsx',
        'nombre': 'Calculadora-de-costos-y-margenes-Orden-Financiero.xlsx',
        'evento': 'calculadora_excel_descarga',
        'tipo': 'Excel gratis · 6 hojas',
        # Mermas reales de la hoja "Mermas por producto" (papa 15 %, lomo 20 %, salmón entero 50 %)
        'hoja': {'cab': ('Insumo', 'Merma', 'Para 200 g'),
                 'filas': [('Papa', '15 %', '235 g'), ('Lomo (vacuno)', '20 %', '250 g'), ('Salmón (entero)', '50 %', '400 g')],
                 'total': ('Y 273 más', '', ''),
                 'pestanas': ['Insumos', 'Recetas', 'Márgenes', 'Mermas', 'Desperdicio']},
        'trae': ['276 insumos con la merma de referencia ya cargada.',
                 'Recetas con costo por porción: la merma se suma sola.',
                 'Márgenes por producto sin IVA, si sos responsable inscripto o monotributista.',
                 'Control de desperdicio en pesos e instrucciones paso a paso.'],
    },
}

# Mismo endpoint y validación de WhatsApp que el diagnóstico de index.html. El payload va
# marcado con tipo "descarga": el Apps Script (versión 2026-09-15-descargas) lo guarda en la
# pestaña "Descarga de Excel", manda un mail corto y no arma presentación.
DESCARGA_JS = r"""  <script>
  (function () {
    var WEBHOOK = 'https://script.google.com/macros/s/AKfycbw_4OP8ve0fKfP9M3VtCvRvmDG395PVzHUNOYqAH55FmVxaD93VNg8QfjDayOK-xVr_Ng/exec';
    var TIMEOUT_MS = 6000;
    var HINT = 'Código de área y número, sin el 0 ni el 15.';
    var MSGS = {
      vacio: 'Escribí tu WhatsApp para descargar la calculadora.',
      cero: 'Sacá el 0 del código de área: por ejemplo 221 555 0000.',
      quince: 'Sacá el 15 del número: por ejemplo 221 555 0000.',
      largo: 'Revisá el número: código de área y número, 10 dígitos en total (ej. 221 555 0000).'
    };
    function track(ev, props) { try { if (typeof gtag === 'function') gtag('event', ev, props || {}); } catch (e) {} }
    // Igual que parseWhatsApp de index.html
    function parseWhatsApp(raw) {
      var d = String(raw || '').replace(/\D/g, '');
      if (!d) return { ok: false, motivo: 'vacio' };
      if (d.indexOf('54') === 0) d = d.slice(2);
      if (d.length === 11 && d.charAt(0) === '9') d = d.slice(1);
      if (d.charAt(0) === '0') return { ok: false, motivo: 'cero' };
      if (d.length === 12 && d.slice(2, 4) === '15') return { ok: false, motivo: 'quince' };
      if (d.length === 12 && d.slice(3, 5) === '15') return { ok: false, motivo: 'quince' };
      if (d.length !== 10) return { ok: false, motivo: 'largo' };
      var area = d.indexOf('11') === 0 ? d.slice(0, 2) : d.slice(0, 3);
      var resto = d.slice(area.length);
      return { ok: true, digits: '549' + d, display: '+54 9 ' + area + ' ' + resto.slice(0, resto.length - 4) + '-' + resto.slice(-4) };
    }
    // Misma atribución que la home (clave of_atrib_v1 por pestaña)
    function atribucion() {
      var KEY = 'of_atrib_v1';
      try { var a = JSON.parse(sessionStorage.getItem(KEY) || 'null'); if (a) return a; } catch (e) {}
      var q = new URLSearchParams(location.search);
      var limpio = function (v) { return (v || '').trim().slice(0, 100); };
      var referrer = '';
      try { if (document.referrer) { var u = new URL(document.referrer); if (u.hostname !== location.hostname) referrer = u.origin; } } catch (e) {}
      var b = { utm_source: limpio(q.get('utm_source')), utm_medium: limpio(q.get('utm_medium')), utm_campaign: limpio(q.get('utm_campaign')),
                utm_content: limpio(q.get('utm_content')), origen: limpio(q.get('origen')), referrer: referrer };
      try { sessionStorage.setItem(KEY, JSON.stringify(b)); } catch (e) {}
      return b;
    }
    function armarPayload(wa, origen, archivo, trampa) {
      var at = atribucion();
      return {
        tipo: 'descarga',
        leadId: Date.now() + '-' + Math.random().toString(36).slice(2, 8),
        timestamp: new Date().toISOString(),
        whatsapp: wa, origen: origen, archivo: archivo,
        campo_extra: trampa,
        utm_source: at.utm_source, utm_medium: at.utm_medium, utm_campaign: at.utm_campaign,
        utm_content: at.utm_content, referrer: at.referrer
      };
    }
    // Un intento con tiempo máximo; {ok:true} o {ok:false, tipo} como enviarUnaVez de la home
    function enviar(payload) {
      var ctrl = ('AbortController' in window) ? new AbortController() : null;
      var reloj = setTimeout(function () { if (ctrl) ctrl.abort(); }, TIMEOUT_MS);
      return fetch(WEBHOOK, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify(payload), signal: ctrl ? ctrl.signal : undefined })
        .then(function (r) { return r.ok ? r.json().catch(function () { return Promise.reject({ tipo: 'respuesta_invalida' }); }) : Promise.reject({ tipo: 'respuesta_invalida' }); })
        .then(function (j) { return (j && j.ok === true) ? { ok: true } : Promise.reject({ tipo: (j && j.error) ? 'rechazado' : 'respuesta_invalida' }); })
        .catch(function (e) { return { ok: false, tipo: (e && e.tipo) || (e && e.name === 'AbortError' ? 'timeout' : 'red') }; })
        .then(function (res) { clearTimeout(reloj); return res; });
    }
    function bajar(url, nombre) {
      var a = document.createElement('a');
      a.href = url; a.download = nombre; a.hidden = true;
      document.body.appendChild(a); a.click();
      setTimeout(function () { a.remove(); }, 1000);
    }
    function recordada(clave) { try { return localStorage.getItem(clave) === '1'; } catch (e) { return false; } }
    function recordar(clave) { try { localStorage.setItem(clave, '1'); } catch (e) {} }
    function link(caja, texto, clase) {
      var a = document.createElement('a');
      a.href = caja.dataset.archivo; a.download = caja.dataset.nombre; a.textContent = texto;
      if (clase) a.className = clase;
      return a;
    }

    [].slice.call(document.querySelectorAll('.descarga[data-descarga]')).forEach(function (caja) {
      var clave = 'of_descarga_' + caja.dataset.descarga;
      var form = caja.querySelector('.descarga-campos');
      var input = caja.querySelector('input[type="tel"]');
      var hint = caja.querySelector('.descarga-hint');
      var err = caja.querySelector('.descarga-error');
      var btn = caja.querySelector('.descarga-btn');
      var listo = caja.querySelector('.descarga-listo');

      function mostrarListo(repetida) {
        form.hidden = true;
        listo.textContent = '';
        var t = document.createElement('strong');
        var p = document.createElement('p');
        if (repetida) {
          t.textContent = 'Ya descargaste la calculadora en esta computadora.';
          var b = link(caja, 'Descargar de nuevo', 'descarga-btn');
          b.addEventListener('click', function () { track(caja.dataset.evento, { descarga: caja.dataset.descarga, modo: 'repetida' }); });
          listo.appendChild(t); listo.appendChild(b);
          return;
        }
        t.textContent = '¡Listo!';
        p.appendChild(document.createTextNode('Si no se bajó, '));
        p.appendChild(link(caja, 'tocá acá'));
        p.appendChild(document.createTextNode('.'));
        listo.appendChild(t); listo.appendChild(p);
      }

      if (recordada(clave)) { mostrarListo(true); return; }

      input.addEventListener('input', function () {
        var p = parseWhatsApp(input.value);
        input.removeAttribute('aria-invalid');
        err.textContent = '';
        hint.textContent = p.ok ? 'Se guarda como ' + p.display : HINT;
      });

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var p = parseWhatsApp(input.value);
        if (!p.ok) {
          input.setAttribute('aria-invalid', 'true');
          err.textContent = MSGS[p.motivo] || MSGS.largo;
          input.focus();
          return;
        }
        var trampa = (form.querySelector('.campo-extra') || {}).value || '';
        btn.disabled = true; input.disabled = true;
        btn.textContent = 'Preparando la descarga…';
        enviar(armarPayload(p.digits, caja.dataset.origen, caja.dataset.nombre, trampa)).then(function (res) {
          // Si el lead no se guardó, igual se descarga: se mide el error, no se castiga al usuario
          if (!res.ok) track('descarga_lead_error', { descarga: caja.dataset.descarga, tipo: res.tipo });
          bajar(caja.dataset.archivo, caja.dataset.nombre);
          track(caja.dataset.evento, { descarga: caja.dataset.descarga, modo: 'nueva', lead: res.ok ? 'guardado' : 'error' });
          recordar(clave);
          mostrarListo(false);
        });
      });
    });
  })();
  </script>"""


def bloque_descarga(clave, slug):
    d = DESCARGAS[clave]
    e = html.escape
    uid = f'descarga-{clave}'
    h = d['hoja']
    fila = lambda cls, n, celdas: (f'<div class="fila{cls}"><span>{n}</span>'
                                   + ''.join(f'<span>{e(c)}</span>' for c in celdas) + '</div>')
    filas = [h['cab']] + h['filas'] + [h['total']]
    hoja = (f'<div class="barra"><i></i><i></i><i></i><span>{e(d["nombre"])}</span></div>'
            + fila(' letras', '', ('A', 'B', 'C'))
            + ''.join(fila(' cab' if i == 0 else (' total' if i == len(filas) - 1 else ''), i + 1, f) for i, f in enumerate(filas))
            + '<div class="pestanas">' + ''.join(('<span class="on">' if i == 0 else '<span>') + e(p) + '</span>'
                                                 for i, p in enumerate(h['pestanas'])) + '</div>')
    trae = ''.join(f'<li>{e(x)}</li>' for x in d['trae'])
    icono = ('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" '
             'stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>'
             '<polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>')
    return f"""<aside class="descarga" id="{uid}" aria-labelledby="{uid}-t" data-descarga="{e(clave)}" data-archivo="{e(d['archivo'])}" data-nombre="{e(d['nombre'])}" data-origen="guia-{e(slug)}-excel" data-evento="{e(d['evento'])}">
      <div class="descarga-arriba">
        <p class="descarga-tipo">{icono}{e(d['tipo'])}</p>
        <h3 class="descarga-t" id="{uid}-t">{e(d['titulo'])}</h3>
        <p class="descarga-linea">{e(d['linea'])}</p>
      </div>
      <div class="descarga-abajo">
        <div class="descarga-hoja" aria-hidden="true">{hoja}</div>
        <ul class="descarga-trae" aria-label="Qué trae el archivo">{trae}</ul>
      </div>
      <div class="descarga-form">
        <form class="descarga-campos" novalidate>
          <p class="form-t">Bajala ahora</p>
          <p class="form-sub">Dejanos tu WhatsApp y se descarga al instante.</p>
          <label for="{uid}-wa">Tu WhatsApp</label>
          <input type="tel" id="{uid}-wa" name="tel" autocomplete="tel" inputmode="tel" placeholder="221 555 0000" required aria-describedby="{uid}-hint {uid}-err">
          <p class="descarga-hint" id="{uid}-hint">Código de área y número, sin el 0 ni el 15.</p>
          <p class="descarga-error" id="{uid}-err" role="alert"></p>
          <input class="campo-extra" type="text" name="campo_extra" tabindex="-1" autocomplete="off" aria-hidden="true">
          <button type="submit" class="descarga-btn">Descargar Excel gratis <span aria-hidden="true">↓</span></button>
          <p class="descarga-priv">Te escribimos solo por temas de tu negocio. Nada de spam. <a href="/privacidad">Privacidad</a></p>
        </form>
        <div class="descarga-listo" aria-live="polite"></div>
      </div>
    </aside>"""


def con_descarga(g):
    """Inserta el bloque de descarga después de la sección de Excel. Devuelve (cuerpo, script)."""
    cuerpo, clave = g['cuerpo'], g.get('descarga')
    if not clave:
        return cuerpo, ''
    assert clave in DESCARGAS, f"{g['slug']}: descarga desconocida {clave}"
    m = re.search(r'<h2>[^<]*Excel</h2>', cuerpo)
    assert m, f"{g['slug']}: la descarga necesita una sección '...Excel</h2>'"
    sig = cuerpo.find('<h2>', m.end())
    pos = sig if sig > -1 else len(cuerpo)
    return cuerpo[:pos] + bloque_descarga(clave, g['slug']) + '\n\n    ' + cuerpo[pos:], '\n' + DESCARGA_JS


def plantilla_og(g, problema):
    """HTML de 1200x630 para sacar la imagen de la guía con Chrome headless.
    Fondo navy liso; un solo toque lima (el eyebrow)."""
    etiquetas = ' · '.join(incluye(g) + [f'{minutos(g)} min de lectura'])
    return f"""<!DOCTYPE html>
<html lang="es-AR"><head><meta charset="UTF-8"><style>
{TOKENS}
  :root {{ --lima: #A3E635; --secondary-dark: #A3ADC2; }}
  * {{ margin: 0; padding: 0; box-sizing: border-box; }}
  html, body {{ width: 1200px; height: 630px; overflow: hidden; }}
  body {{ font-family: 'Inter', system-ui, sans-serif; background: var(--navy); color: var(--w); position: relative; }}
  .marca {{ position: absolute; left: 80px; top: 72px; display: flex; align-items: center; gap: 16px; font-size: 34px; font-weight: 600; letter-spacing: -0.01em; }}
  .isotipo {{ width: 56px; height: 56px; border-radius: 12px; background: var(--w); display: flex; align-items: center; justify-content: center; }}
  .isotipo svg {{ width: 30px; height: 30px; }}
  .contenido {{ position: absolute; left: 80px; right: 150px; top: 200px; }}
  .eyebrow {{ font-size: 22px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; margin-bottom: 22px; color: var(--lima); }}
  h1 {{ font-size: 64px; line-height: 1.08; font-weight: 600; letter-spacing: -0.02em; }}
  .pie {{ position: absolute; left: 80px; right: 80px; bottom: 64px; display: flex; justify-content: space-between; align-items: center; font-size: 24px; font-weight: 600; }}
  .chip {{ background: rgba(255,255,255,0.08); border: 2px solid rgba(255,255,255,0.18); border-radius: 999px; padding: 8px 20px; }}
  .url {{ color: var(--secondary-dark); }}
</style></head><body>
  <div class="marca"><span class="isotipo"><svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="7" stroke="#7DB1F4" stroke-width="4"/><circle cx="12" cy="12" r="7" stroke="#0C66E4" stroke-width="4" stroke-dasharray="33 44" transform="rotate(-90 12 12)"/></svg></span>ordenfinanciero.</div>
  <div class="contenido">
    <p class="eyebrow">Guía · {html.escape(problema['corto'])}</p>
    <h1>{html.escape(g['title'])}</h1>
  </div>
  <div class="pie"><span class="chip">{html.escape(etiquetas)}</span><span class="url">ordenfinanciero.com/guias</span></div>
</body></html>
"""


def fecha_larga(iso):
    a, m, d = iso.split('-')
    return f'{int(d)} de {MESES[int(m) - 1]} de {a}'


def leer_guias():
    guias = []
    for f in sorted(SRC.glob('*.html')):
        texto = f.read_text(encoding='utf-8')
        meta = json.loads(re.match(r'<!--META\s*(\{.*?\})\s*-->', texto, re.S).group(1))
        meta['slug'] = f.stem
        meta['cuerpo'] = con_formulas(texto.split('-->', 1)[1].strip())
        guias.append(meta)
    guias.sort(key=lambda g: g['orden'])
    return guias


def pagina(*, title, description, path, og_type, ld, cuerpo, cta_origen, cta_general=False, main_clase='', og_image=None, view_content=None):
    url = BASE + path
    e = html.escape
    og = BASE + (og_image or '/og-image.png')
    pixel = PIXEL
    if view_content:
        pixel += f"\n<script>if (typeof fbq === 'function') fbq('track', 'ViewContent', {{ content_name: '{view_content}' }});</script>"
    main_attr = f' class="{main_clase}"' if main_clase else ''
    guias_actual = ' aria-current="page"' if path == '/guias' else ' aria-current="true"'
    # La oferta es gastronomica (decision del dueño, 14/09): las guias generales lo dicen en el cierre.
    if cta_general:
        cta_t = '¿Tenés un negocio gastronómico?'
        cta_p = 'En 3 minutos sabés por dónde se le escapa la plata: 12 preguntas gratis y el puntaje de los cuatro eslabones al instante.'
    else:
        cta_t = '¿Por dónde se le escapa la plata a tu negocio?'
        cta_p = 'Hacé el diagnóstico gratis: 12 preguntas, 3 minutos y el puntaje de los cuatro eslabones al instante.'
    return f"""<!DOCTYPE html>
<html lang="es-AR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{e(title)}</title>
<meta name="description" content="{e(description)}">
<link rel="canonical" href="{url}">
<meta property="og:type" content="{og_type}">
<meta property="og:title" content="{e(title)}">
<meta property="og:description" content="{e(description)}">
<meta property="og:url" content="{url}">
<meta property="og:locale" content="es_AR">
<meta property="og:site_name" content="Orden Financiero">
<meta property="og:image" content="{og}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="{og}">
<meta name="theme-color" content="#0D2B6B">
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preload" href="/fonts/inter-latin.woff2" as="font" type="font/woff2" crossorigin>
{GA}
{pixel}
<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>
<style>
{CSS}</style>
</head>
<body>
{PIXEL_NOSCRIPT}
<!-- Generado por tools/build_guias.py: editar la fuente en tools/guias/, no este archivo -->
<header>
  <div class="head-in">
    {BRAND}
    <nav class="head-links" aria-label="Principal">
      <a href="/#que-analizamos">El diagnóstico</a>
      <a href="/#metodo">El programa</a>
      <a href="/#manuel">Quién está detrás</a>
      <a href="/guias"{guias_actual}>Guías</a>
    </nav>
    <div class="head-right">
      <a class="head-cta" href="/?origen={cta_origen}#diagnostico">Hacer el diagnóstico · 3 min</a>
      <button class="head-burger" id="head-burger" type="button" aria-label="Abrir menú" aria-expanded="false" aria-controls="head-menu">
        <svg class="ico-abrir" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></svg>
        <svg class="ico-cerrar" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>
      </button>
    </div>
  </div>
  <div class="head-menu" id="head-menu" hidden>
    <a href="/#que-analizamos">El diagnóstico</a>
    <a href="/#metodo">El programa</a>
    <a href="/#manuel">Quién está detrás</a>
    <a href="/guias"{guias_actual}>Guías</a>
  </div>
<script>
(function () {{
  var boton = document.getElementById('head-burger'), menu = document.getElementById('head-menu');
  if (!boton || !menu) return;
  function track(ev, props) {{ try {{ if (typeof gtag === 'function') gtag('event', ev, props || {{}}); }} catch (e) {{}} }}
  function cerrar() {{ if (menu.hidden) return; menu.hidden = true; boton.setAttribute('aria-expanded', 'false'); boton.setAttribute('aria-label', 'Abrir menú'); }}
  boton.addEventListener('click', function (e) {{
    e.stopPropagation();
    var abrir = menu.hidden;
    menu.hidden = !abrir;
    boton.setAttribute('aria-expanded', String(abrir));
    boton.setAttribute('aria-label', abrir ? 'Cerrar menú' : 'Abrir menú');
    if (abrir) track('nav_menu_open', {{ desde: 'guias' }});
  }});
  document.addEventListener('click', function (e) {{ if (!e.target.closest('header')) cerrar(); }});
  document.addEventListener('keydown', function (e) {{ if (e.key === 'Escape') cerrar(); }});
  window.addEventListener('resize', function () {{ if (window.innerWidth > 1099) cerrar(); }});
  [].slice.call(document.querySelectorAll('header a[href^="/#"]')).forEach(function (a) {{
    a.addEventListener('click', function () {{ track('nav_home_desde_guias', {{ destino: a.getAttribute('href') }}); }});
  }});
}})();
</script>
</header>
<main{main_attr}>
{cuerpo}
  <aside class="cta">
    <p class="cta-t">{cta_t}</p>
    <p>{cta_p}</p>
    <a class="btn" href="/?origen={cta_origen}#diagnostico">Hacer el diagnóstico · 3 min <span aria-hidden="true">→</span></a>
  </aside>
</main>
<footer>
  <div class="foot-in">
    <nav aria-label="Pie">
      <a href="/">Inicio</a>
      <a href="/guias">Guías</a>
      <a href="/#manuel">Quién está detrás</a>
      <a href="/privacidad">Privacidad</a>
    </nav>
    <span>© 2026 Orden Financiero · Programa de consultoría financiera para gastronomía</span>
  </div>
</footer>
</body>
</html>
"""


def migas(items):
    partes = [f'<a href="{p}">{html.escape(n)}</a>' if p else f'<span>{html.escape(n)}</span>' for n, p in items]
    return '  <nav class="migas" aria-label="Ruta">' + ' › '.join(partes) + '</nav>'


def breadcrumb_ld(items):
    return {"@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": i + 1, "name": n, **({"item": BASE + p} if p else {})}
        for i, (n, p) in enumerate(items)]}


# Formación de Manuel: logos en /logos/formacion (caja del autor y alumniOf del JSON-LD)
FORMACION = [
    {"logo": "unlp.png", "ancho": 36, "alto": 17, "institucion": "Universidad Nacional de La Plata", "titulo": "Licenciatura en Administración", "web": "https://unlp.edu.ar"},
    {"logo": "ditella.svg", "ancho": 17, "alto": 17, "institucion": "Universidad Torcuato Di Tella", "titulo": "Gestión de restaurantes", "web": "https://www.utdt.edu"},
    {"logo": "iae.png", "ancho": 17, "alto": 17, "institucion": "IAE Business School", "titulo": "Presupuesto y tablero de control", "web": "https://www.iae.edu.ar"},
    {"logo": "coderhouse.svg", "ancho": 58, "alto": 7, "institucion": "Coderhouse", "titulo": "Análisis de datos", "web": "https://www.coderhouse.com"},
]
FORMACION_HTML = '<div class="formacion"><p class="formacion-titulo">Formación</p><ul>' + ''.join(
    f'<li><span class="logo"><img src="/logos/formacion/{f["logo"]}" alt="{f["institucion"]}" width="{f["ancho"]}" height="{f["alto"]}" loading="lazy"></span><span>{f["titulo"]}</span></li>'
    for f in FORMACION) + '</ul></div>'

MAX_MINUTOS = 15  # regla del dueño (16/09/2026): ninguna guía puede pasar de 15 min de lectura


def main():
    guias = leer_guias()
    for g in guias:
        n = minutos(g)
        if n > MAX_MINUTOS:
            raise SystemExit(f"La guía {g['slug']} marca {n} min: el máximo es {MAX_MINUTOS}. Recortala antes de generar.")
    OUT.mkdir(exist_ok=True)
    org = {"@id": BASE + "/#organization"}
    autor = {"@type": "Person", "@id": BASE + "/#manuel", "name": "Manuel Alfano", "url": BASE + "/#manuel",
             "alumniOf": [{"@type": "EducationalOrganization", "name": f["institucion"], "url": f["web"]} for f in FORMACION]}

    por_slug = {g['slug']: g for g in guias}
    grupos, problema_de = grupos_con(guias)
    OG_DIR.mkdir(exist_ok=True)
    for g in guias:
        (OG_DIR / f"{g['slug']}.html").write_text(plantilla_og(g, problema_de[g['slug']]), encoding='utf-8', newline='\n')
        path = '/guias/' + g['slug']
        items = [("Inicio", "/"), ("Guías", "/guias"), (g['miga'], None)]
        rel = [por_slug[x] for x in g.get('relacionadas', []) if x in por_slug]
        rel_html = ''
        if rel:
            rel_html = ('\n      <section class="seguir"><h2>Seguí leyendo</h2><ul class="tarjetas">\n'
                        + ''.join(tarjeta(x, problema_de[x['slug']]) for x in rel) + '      </ul></section>')
        faq = g.get('faq', [])
        faq_html = ''
        if faq:
            # "formula" opcional: se dibuja debajo de la respuesta; el JSON-LD usa solo el texto.
            faq_html = '\n    <h2>Preguntas frecuentes</h2>\n' + ''.join(
                f'    <h3>{html.escape(x["q"])}</h3>\n    <p>{html.escape(x["a"])}</p>\n'
                + (f'    {formula_html(x["formula"])}\n' if x.get('formula') else '') for x in faq)
        cuerpo_guia, descarga_js = con_descarga(g)
        cuerpo_art, toc = con_ids(cuerpo_guia + faq_html)
        toc_html = ''.join(f'<li><a href="#{i}">{html.escape(t)}</a></li>' for i, t in toc)
        resumen = ''.join(f'<li>{html.escape(x)}</li>' for x in g.get('resumen', []))
        assert resumen, f"{g['slug']}: falta el resumen"
        etiquetas = ''.join(f'<span>{x}</span>' for x in incluye(g))
        cuerpo = f"""  <section class="guia-cab">
    {CIRCULOS}
{migas(items)}
    <p class="eyebrow">Guía · {html.escape(problema_de[g['slug']]['corto'])}</p>
    <h1>{html.escape(g['h1'])}</h1>
    <p class="bajada">{html.escape(g['description'])}</p>
    <p class="autor">Por <a href="/#manuel">Manuel Alfano</a>, fundador de Orden Financiero · Actualizada el {fecha_larga(g['actualizada'])}</p>
    <div class="meta">{etiquetas}<span>{minutos(g)} min de lectura</span></div>
  </section>
  <div class="guia-cuerpo">
    <div class="guia-principal">
      <aside class="resumen"><p>Lo más importante</p><ul>{resumen}</ul></aside>
      <details class="indice-movil"><summary>En esta guía</summary><ol>{toc_html}</ol></details>
      <article>
{cuerpo_art}
      </article>
      <aside class="caja-autor"><img src="/foto-manuel-cutout.webp" alt="Manuel Alfano" width="72" height="72" loading="lazy"><div><strong>Manuel Alfano</strong><p>Fundador de Orden Financiero. Licenciado en Administración (UNLP) y más de 12 años en la gastronomía con negocio propio; hoy trabaja mano a mano con dueños de negocios gastronómicos para hacerlos más rentables.</p>{FORMACION_HTML}</div></aside>{rel_html}
    </div>
    <nav class="indice-guia" aria-label="En esta guía"><p>En esta guía</p><ol>{toc_html}</ol></nav>
  </div>
{SCROLLSPY}{descarga_js}"""
        ld = {"@context": "https://schema.org", "@graph": [
            {"@type": "Article", "@id": BASE + path + "#article", "headline": g['h1'], "description": g['description'],
             "image": BASE + f"/guias/og/{g['slug']}.png", "inLanguage": "es-AR", "datePublished": g['publicada'],
             "dateModified": g['actualizada'], "author": autor, "publisher": org,
             "mainEntityOfPage": BASE + path, "isPartOf": {"@id": BASE + "/guias#coleccion"}},
            breadcrumb_ld(items)]}
        if faq:
            ld['@graph'].append({"@type": "FAQPage", "@id": BASE + path + "#faq", "mainEntity": [
                {"@type": "Question", "name": x['q'], "acceptedAnswer": {"@type": "Answer", "text": x['a']}} for x in faq]})
        (OUT / f"{g['slug']}.html").write_text(pagina(
            title=g['title'] + ' · Orden Financiero', description=g['description'], path=path,
            og_type='article', ld=ld, cuerpo=cuerpo, cta_origen='guia-' + g['slug'], main_clase='guia',
            og_image=f"/guias/og/{g['slug']}.png", view_content=VIEW_CONTENT.get(g['slug']),
            cta_general=g.get('cta_general', False)), encoding='utf-8', newline='\n')

    # Indice /guias
    items = [("Inicio", "/"), ("Guías", None)]
    # 16/09/2026, pedido del dueño: el público es el dueño de negocio gastronómico
    desc = ('Guías prácticas para dueños de negocio gastronómico: precios, costos, márgenes y rentabilidad, '
            'con fórmulas y ejemplos en pesos.')
    # Agrupadas por el problema que resuelven (PROBLEMAS), en el orden en que le pasan al dueño.
    visibles = [(i + 1, p, lista) for i, (p, lista) in enumerate(grupos) if lista]
    # Atajos del panel derecho de la portada: la frase completa del problema y una flecha.
    atajos = ''.join(
        f'<a href="#{p["id"]}"><span class="n-mini" aria-hidden="true">{n}</span>'
        f'<span class="atajo-txt">{html.escape(p["titulo"])}</span><span class="flecha" aria-hidden="true">→</span></a>'
        for n, p, _ in visibles)
    secciones = ''
    for n, p, lista in visibles:
        secciones += (f'  <section class="problema" id="{p["id"]}" aria-labelledby="{p["id"]}-t">\n'
                      f'    <div class="problema-cab"><span class="problema-num" aria-hidden="true">{n}</span>'
                      f'<div><h2 id="{p["id"]}-t">{html.escape(p["titulo"])}</h2><p>{html.escape(p["linea"])}</p></div></div>\n'
                      '    <ul class="tarjetas">\n'
                      + ''.join(tarjeta(g, p) for g in lista)
                      + '    </ul>\n  </section>\n')
    guias = [g for _, _, lista in visibles for g in lista]

    cuerpo = f"""  <section class="portada">
    {CIRCULOS}
{migas(items)}
    <div class="portada-grid">
      <div class="portada-texto">
        <p class="eyebrow"><span class="punto" aria-hidden="true"></span>Guías</p>
        <h1>Guías de finanzas para <em>dueños de negocio gastronómico</em></h1>
        <p class="bajada">{desc}</p>
        <p class="cifras"><strong>{len(guias)} guías</strong> · fórmula, ejemplo en pesos y cómo armarlo en Excel en cada una</p>
        <p class="autor">Escritas por <a href="/#manuel">Manuel Alfano</a>, con más de 12 años en la gastronomía con negocio propio.</p>
      </div>
      <div class="portada-panel">
        <p class="atajos-t" id="atajos-t">¿Qué te pasa con los números?</p>
        <nav class="atajos" aria-labelledby="atajos-t">{atajos}</nav>
        <div class="buscador"><label for="buscar-guia">O buscá una guía</label><input id="buscar-guia" type="search" placeholder="Ej.: merma, IVA, precio" autocomplete="off"></div>
      </div>
    </div>
  </section>
  <p class="sin-resultados" id="sin-resultados" hidden>No encontramos guías con esa palabra. Probá con otra, o <a href="/?origen=guias-busqueda#diagnostico">hacé el diagnóstico</a> y te decimos por dónde empezar.</p>
{secciones}  <script>
  (function () {{
    var campo = document.getElementById('buscar-guia');
    if (!campo) return;
    var norm = function (t) {{ return t.toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g, ''); }};
    var tarjetas = [].slice.call(document.querySelectorAll('.problema .tarjetas li'));
    tarjetas.forEach(function (li) {{ li._texto = norm(li.textContent + ' ' + (li.getAttribute('data-claves') || '')); }});
    var grupos = [].slice.call(document.querySelectorAll('.problema'));
    var nada = document.getElementById('sin-resultados');
    var espera;
    campo.addEventListener('input', function () {{
      var q = norm(campo.value.trim());
      var total = 0;
      tarjetas.forEach(function (li) {{ var ok = !q || li._texto.indexOf(q) > -1; li.hidden = !ok; if (ok) total++; }});
      grupos.forEach(function (t) {{ t.hidden = !t.querySelector('.tarjetas li:not([hidden])'); }});
      nada.hidden = !(q && total === 0);
      clearTimeout(espera);
      if (q && window.gtag) espera = setTimeout(function () {{ gtag('event', 'guias_busqueda', {{ termino: q.slice(0, 40), resultados: total }}); }}, 900);
    }});
  }})();
  </script>"""
    ld = {"@context": "https://schema.org", "@graph": [
        {"@type": "CollectionPage", "@id": BASE + "/guias#coleccion", "url": BASE + "/guias",
         "name": "Guías de finanzas para dueños de negocio gastronómico", "description": desc, "inLanguage": "es-AR",
         "isPartOf": {"@id": BASE + "/#website"}, "publisher": org,
         "mainEntity": {"@type": "ItemList", "itemListElement": [
             {"@type": "ListItem", "position": i + 1, "url": BASE + "/guias/" + g['slug'], "name": g['h1']}
             for i, g in enumerate(guias)]}},
        breadcrumb_ld(items)]}
    (OUT / 'index.html').write_text(pagina(
        title='Guías de finanzas para dueños de negocio gastronómico · Orden Financiero', description=desc, path='/guias',
        og_type='website', ld=ld, cuerpo=cuerpo, cta_origen='guias', main_clase='ancho'), encoding='utf-8', newline='\n')

    # sitemap.xml completo
    ultima = max(g['actualizada'] for g in guias)
    urls = [('/', HOME_LASTMOD, 'monthly', '1.0'), ('/guias', ultima, 'weekly', '0.8')]
    urls += [('/guias/' + g['slug'], g['actualizada'], 'monthly', '0.7') for g in guias]
    urls += [('/privacidad', '2026-09-14', 'yearly', '0.2')]
    xml = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for p, lm, cf, pr in urls:
        xml += ['  <url>', f'    <loc>{BASE}{p}</loc>', f'    <lastmod>{lm}</lastmod>',
                f'    <changefreq>{cf}</changefreq>', f'    <priority>{pr}</priority>', '  </url>']
    xml.append('</urlset>')
    (ROOT / 'sitemap.xml').write_text('\n'.join(xml) + '\n', encoding='utf-8', newline='\n')
    print(f'{len(guias)} guias, indice y sitemap ({len(urls)} URLs)')


# Fecha del ultimo cambio de index.html que importa a Google (head o contenido).
HOME_LASTMOD = '2026-09-14'

if __name__ == '__main__':
    main()
