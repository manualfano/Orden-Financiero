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
GA = re.search(r'(?s)<!-- Medicion:.*?</script>', PRIV).group(0)
TOKENS = re.search(r'(?s)<style>\s*(@font-face.*?:root \{.*?\})', PRIV).group(1)
BRAND = re.search(r'(?s)<a href="/" class="brand">.*?</a>', PRIV).group(0)

CSS = TOKENS + """
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', system-ui, sans-serif; font-size: var(--fs-base); line-height: 1.7; color: var(--tinta); background: var(--bg); }
  header { background: var(--navy-900); padding: var(--s-3) var(--s-5); }
  .head-in { max-width: 960px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; gap: var(--s-3); flex-wrap: wrap; }
  .brand { display: inline-flex; align-items: center; gap: 10px; text-decoration: none; color: var(--w); font-weight: 600; font-size: var(--fs-lead); letter-spacing: -0.01em; min-height: 44px; }
  .brand-mark { width: 34px; height: 34px; border-radius: var(--r); background: var(--marca-logo); display: inline-flex; align-items: center; justify-content: center; }
  .brand-mark svg { width: 18px; height: 18px; }
  .dot { color: var(--marca-logo); }
  ::selection { background: var(--lila); }
  .head-nav { display: flex; align-items: center; gap: var(--s-4); }
  .head-nav a { color: var(--w); text-decoration: none; font-size: var(--fs-sm); font-weight: 500; min-height: 44px; display: inline-flex; align-items: center; }
  .head-nav .head-cta { background: var(--marca); padding: 0 var(--s-4); border-radius: var(--r); font-weight: 600; }
  .head-nav .head-cta:hover { background: var(--marca-hover); }
  main { max-width: 720px; margin: 0 auto; padding: var(--s-6) var(--s-5) var(--s-7); }
  .migas { font-size: var(--fs-sm); color: var(--tinta-3); margin-bottom: var(--s-5); }
  .migas a { color: var(--tinta-3); }
  .eyebrow { font-size: var(--fs-meta); font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: var(--marca-hover); margin-bottom: var(--s-3); }
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
  .formula { background: var(--lienzo); border-left: 4px solid var(--lima); border-radius: var(--r); padding: var(--s-3) var(--s-4); margin: var(--s-4) 0; font-weight: 600; color: var(--navy); }
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
  /* Paleta navy + lima + violeta (14/09/2026): el tema se distingue por ícono y nombre, no por color.
     Pares AA: lima/navy 8,84 · navy-claro/navy 8,55 · violeta hover/blanco 6,30 · violeta hover/lila 5,16 */
  body:has(main.ancho) { background: var(--lienzo); }
  main.ancho { max-width: 1040px; }
  .portada { background: var(--navy-900); border-radius: var(--r-lg); padding: var(--s-6) var(--s-5); color: var(--w); }
  .portada .migas, .portada .migas a { color: var(--navy-claro); }
  .portada .eyebrow { color: var(--lima); }
  .portada h1 { color: var(--w); max-width: 760px; }
  .portada h1 em { font-style: normal; color: var(--lima); }
  .portada .bajada { color: rgba(255,255,255,0.9); max-width: 660px; }
  .portada .autor { color: var(--navy-claro); border-bottom-color: rgba(255,255,255,0.16); }
  .portada .autor a { color: var(--w); }
  .temas { display: flex; flex-wrap: wrap; gap: var(--s-2); }
  .temas a { display: inline-flex; align-items: center; gap: var(--s-2); min-height: 44px; padding: 0 var(--s-4) 0 var(--s-3); border-radius: 999px; background: var(--w); border: 1.5px solid var(--navy); color: var(--navy); font-size: var(--fs-sm); font-weight: 600; text-decoration: none; transition: background var(--t-instante), color var(--t-instante), border-color var(--t-instante); }
  .temas svg { width: 18px; height: 18px; color: var(--marca-hover); }
  .temas a:hover, .temas a:focus-visible { background: var(--navy); color: var(--w); border-color: rgba(255,255,255,0.6); }
  .temas a:hover svg, .temas a:focus-visible svg { color: var(--lima); }
  .empeza { margin: var(--s-7) 0 0; }
  .empeza > p { margin-bottom: var(--s-4); }
  .pasos, .tarjetas { list-style: none; padding: 0; display: grid; gap: var(--s-3); }
  .pasos { grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); }
  .tarjetas { grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); }
  .pasos a, .tarjetas a { display: flex; flex-direction: column; gap: var(--s-2); height: 100%; padding: var(--s-5); background: var(--w); border: 1px solid var(--borde); border-radius: var(--r-lg); text-decoration: none; transition: border-color var(--t-instante), transform var(--t-instante); }
  .pasos a:hover, .tarjetas a:hover { border-color: var(--marca); transform: translateY(-2px); }
  .paso { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 999px; background: var(--navy); color: var(--lima); font-size: var(--fs-sm); font-weight: 600; }
  .t-cab { display: flex; align-items: center; gap: var(--s-3); }
  .t-ico { width: 36px; height: 36px; border-radius: var(--r); background: var(--lila); color: var(--marca-hover); display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .t-ico svg { width: 18px; height: 18px; }
  .paso-eje { font-size: var(--fs-meta); font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--tinta-3); }
  .pasos strong, .tarjetas strong { color: var(--navy); font-size: var(--fs-lead); font-weight: 600; line-height: 1.35; }
  .pasos a:hover strong, .tarjetas a:hover strong { color: var(--marca-hover); }
  .paso-txt, .tarjetas .desc { color: var(--tinta-2); font-size: var(--fs-sm); line-height: 1.55; }
  .tema { margin-top: var(--s-7); }
  .tema-cab { display: flex; gap: var(--s-4); align-items: center; padding-bottom: var(--s-4); margin-bottom: var(--s-4); border-bottom: 1px solid var(--borde); }
  .tema-cab .ico { width: 52px; height: 52px; border-radius: var(--r); background: var(--lila); color: var(--marca-hover); display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .tema-cab .ico svg { width: 26px; height: 26px; }
  .tema-cab h2 { margin: 0 0 4px; color: var(--navy); scroll-margin-top: var(--s-5); }
  .tema-cab p { color: var(--tinta-2); }
  .tema-num { margin-left: auto; font-size: var(--fs-sm); font-weight: 600; color: var(--tinta-3); white-space: nowrap; }
  .meta { display: flex; flex-wrap: wrap; gap: var(--s-2); margin-top: auto; padding-top: var(--s-2); }
  .meta span { font-size: var(--fs-meta); font-weight: 600; color: var(--tinta-3); background: var(--lienzo); border-radius: 999px; padding: 2px 10px; }
  @media (max-width: 640px) { .tema-num { display: none; } .tema-cab { align-items: flex-start; } }
  @media (prefers-reduced-motion: reduce) { .pasos a:hover, .tarjetas a:hover { transform: none; } }
  /* Índice: cifras, buscador y tarjetas cortas */
  .cifras { color: rgba(255,255,255,0.9); font-size: var(--fs-sm); margin-top: var(--s-2); }
  .cifras strong { color: var(--w); }
  .buscador { margin-top: var(--s-5); max-width: 560px; }
  .buscador label { display: block; font-size: var(--fs-meta); font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--lima); margin-bottom: var(--s-2); }
  .buscador input { width: 100%; min-height: 48px; padding: 0 var(--s-4); border: 0; border-radius: var(--r); font: inherit; font-size: var(--fs-base); color: var(--tinta); background: var(--w); }
  .buscador input:focus-visible { outline: 3px solid var(--lima); outline-offset: 2px; }
  .sin-resultados { margin-top: var(--s-6); padding: var(--s-5); background: var(--w); border: 1px solid var(--borde); border-radius: var(--r-lg); }
  .tema .tarjetas .paso-eje { display: none; }
  .meta { flex-wrap: nowrap; overflow: hidden; }
  /* Página de guía */
  main.guia { max-width: 1080px; }
  .guia-cab { background: var(--navy); color: var(--w); border-radius: var(--r-lg); padding: var(--s-6) var(--s-5); margin-bottom: var(--s-6); }
  .guia-cab .migas, .guia-cab .migas a { color: var(--navy-claro); }
  .guia-cab .eyebrow { color: var(--lima); }
  .guia-cab h1 { color: var(--w); max-width: 780px; }
  .guia-cab .bajada { color: rgba(255,255,255,0.9); max-width: 700px; }
  .guia-cab .autor { color: var(--navy-claro); border-bottom: 0; padding-bottom: 0; margin-bottom: 0; }
  .guia-cab .autor a { color: var(--w); }
  .guia-cab .meta { margin-top: var(--s-4); }
  .guia-cab .meta span { background: var(--lima); color: var(--navy); }
  .guia-cab .meta .min { background: rgba(255,255,255,0.12); color: var(--w); }
  .guia-cuerpo { display: grid; grid-template-columns: minmax(0, 1fr) 250px; gap: var(--s-7); align-items: start; }
  .guia-principal { min-width: 0; max-width: 720px; }
  .indice-guia { position: sticky; top: var(--s-5); border-left: 3px solid var(--borde); padding-left: var(--s-4); }
  .indice-guia p, .resumen p { font-size: var(--fs-meta); font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: var(--s-2); }
  .indice-guia p { color: var(--tinta-3); }
  .indice-guia ol, .indice-movil ol { list-style: none; padding: 0; }
  .indice-guia li { margin-bottom: 6px; }
  .indice-guia a, .indice-movil a { color: var(--tinta-2); font-size: var(--fs-sm); line-height: 1.4; text-decoration: none; display: block; }
  .indice-guia a:hover, .indice-movil a:hover, .indice-guia a[aria-current="true"] { color: var(--marca-hover); }
  .indice-guia a[aria-current="true"] { font-weight: 600; }
  .indice-movil { display: none; }
  .resumen { background: var(--lila); border-radius: var(--r-lg); padding: var(--s-4) var(--s-5); margin-bottom: var(--s-6); }
  .resumen p { color: var(--marca-hover); }
  .resumen ul { padding-left: var(--s-5); }
  .resumen li { color: var(--tinta); margin-bottom: 6px; }
  article h2 { scroll-margin-top: var(--s-5); }
  .caja-autor { display: flex; gap: var(--s-4); align-items: center; border: 1px solid var(--borde); border-radius: var(--r-lg); padding: var(--s-5); margin-top: var(--s-7); }
  .caja-autor img { width: 72px; height: 72px; border-radius: 999px; object-fit: cover; object-position: top; background: var(--lienzo); flex-shrink: 0; }
  .caja-autor strong { color: var(--navy); display: block; }
  .caja-autor p { font-size: var(--fs-sm); margin-top: 4px; }
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
  .foot-in { max-width: 960px; margin: 0 auto; display: flex; flex-wrap: wrap; gap: var(--s-3) var(--s-5); justify-content: space-between; color: rgba(255,255,255,0.75); }
  .foot-in nav { display: flex; flex-wrap: wrap; gap: var(--s-2) var(--s-5); }
  .foot-in a { color: var(--w); text-decoration: none; }
  :focus-visible { outline: 2px solid var(--marca); outline-offset: 2px; }
  header :focus-visible, footer :focus-visible, .portada :focus-visible, .guia-cab :focus-visible, .cta :focus-visible { outline-color: var(--lima); }
"""


# Eslabones: id del ancla e ícono (los de los pilares de la home). Desde el 14/09/2026 el tema
# se distingue por ícono y nombre, no por color: los bloques de color por tema se retiraron.
ESLABONES = {
    'Costos y precios': ('costos-y-precios',
                         '<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>'),
    'Resultado económico': ('resultado-economico',
                            '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>'),
    'Flujo de caja': ('flujo-de-caja', '<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>'),
    'Indicadores de gestión': ('indicadores-de-gestion',
                               '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>'),
}


def svg_icono(eje):
    return ('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" '
            f'stroke-linejoin="round" aria-hidden="true">{ESLABONES[eje][1]}</svg>')


def minutos(g):
    texto = re.sub(r'<[^>]+>', ' ', g['cuerpo']) + ' ' + ' '.join(x['q'] + ' ' + x['a'] for x in g.get('faq', []))
    return max(1, round(len(texto.split()) / 200))


def incluye(g):
    c = g['cuerpo']
    out = []
    if 'class="formula"' in c:
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


def tarjeta(g):
    etiquetas = ''.join(f'<span>{x}</span>' for x in incluye(g))
    claves = ' '.join(g.get('resumen', []) + [x['q'] for x in g.get('faq', [])] + [g['h1'], g['eje']])
    return (f'      <li data-claves="{html.escape(claves)}">'
            f'<a href="/guias/{g["slug"]}"><span class="t-cab"><span class="t-ico">{svg_icono(g["eje"])}</span>'
            f'<span class="paso-eje">{html.escape(g["eje"])}</span></span>'
            f'<strong>{html.escape(g["miga"])}</strong>'
            f'<span class="desc">{html.escape(g["description"])}</span>'
            f'<span class="meta">{etiquetas}<span>{minutos(g)} min</span></span></a></li>\n')


OG_DIR = ROOT / 'tools' / 'og'


def plantilla_og(g):
    """HTML de 1200x630 para sacar la imagen de la guía con Chrome headless.
    Paleta navy + lima + violeta: fondo navy liso, tema en lima, título blanco."""
    etiquetas = ' · '.join(incluye(g) + [f'{minutos(g)} min de lectura'])
    return f"""<!DOCTYPE html>
<html lang="es-AR"><head><meta charset="UTF-8"><style>
{TOKENS}
  * {{ margin: 0; padding: 0; box-sizing: border-box; }}
  html, body {{ width: 1200px; height: 630px; overflow: hidden; }}
  body {{ font-family: 'Inter', system-ui, sans-serif; background: var(--navy); color: var(--w); position: relative; }}
  .barras {{ position: absolute; right: 80px; top: 72px; height: 96px; display: flex; align-items: flex-end; gap: 12px; }}
  .barras span {{ width: 22px; border-radius: 4px; background: rgba(255,255,255,0.22); }}
  .barras span:nth-child(1) {{ height: 44px; }}
  .barras span:nth-child(2) {{ height: 68px; }}
  .barras span:nth-child(3) {{ height: 96px; background: var(--lima); }}
  .marca {{ position: absolute; left: 80px; top: 72px; display: flex; align-items: center; gap: 16px; font-size: 34px; font-weight: 600; letter-spacing: -0.01em; }}
  .isotipo {{ width: 56px; height: 56px; border-radius: 12px; background: var(--marca-logo); display: flex; align-items: center; justify-content: center; }}
  .isotipo svg {{ width: 30px; height: 30px; }}
  .contenido {{ position: absolute; left: 80px; right: 150px; top: 200px; }}
  .eyebrow {{ font-size: 22px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: var(--lima); margin-bottom: 22px; }}
  h1 {{ font-size: 64px; line-height: 1.08; font-weight: 600; letter-spacing: -0.02em; }}
  .pie {{ position: absolute; left: 80px; right: 80px; bottom: 64px; display: flex; justify-content: space-between; align-items: center; font-size: 24px; font-weight: 600; }}
  .chip {{ background: var(--lima); color: var(--navy); border-radius: 999px; padding: 10px 22px; }}
  .url {{ color: var(--navy-claro); }}
</style></head><body>
  <div class="barras" aria-hidden="true"><span></span><span></span><span></span></div>
  <div class="marca"><span class="isotipo"><svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="7" stroke="#7DB1F4" stroke-width="4"/><circle cx="12" cy="12" r="7" stroke="#ffffff" stroke-width="4" stroke-dasharray="33 44" transform="rotate(-90 12 12)"/></svg></span>ordenfinanciero.</div>
  <div class="contenido">
    <p class="eyebrow">Guía · {html.escape(g['eje'])}</p>
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
        meta['cuerpo'] = texto.split('-->', 1)[1].strip()
        guias.append(meta)
    guias.sort(key=lambda g: g['orden'])
    return guias


def pagina(*, title, description, path, og_type, ld, cuerpo, cta_origen, cta_general=False, main_clase='', og_image=None):
    url = BASE + path
    e = html.escape
    og = BASE + (og_image or '/og-image.png')
    main_attr = f' class="{main_clase}"' if main_clase else ''
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
<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>
<style>
{CSS}</style>
</head>
<body>
<!-- Generado por tools/build_guias.py: editar la fuente en tools/guias/, no este archivo -->
<header>
  <div class="head-in">
    {BRAND}
    <nav class="head-nav" aria-label="Principal">
      <a href="/guias">Guías</a>
      <a class="head-cta" href="/?origen={cta_origen}#diagnostico">Hacer el diagnóstico</a>
    </nav>
  </div>
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


def main():
    guias = leer_guias()
    OUT.mkdir(exist_ok=True)
    org = {"@id": BASE + "/#organization"}
    autor = {"@type": "Person", "@id": BASE + "/#manuel", "name": "Manuel Alfano", "url": BASE + "/#manuel"}

    por_slug = {g['slug']: g for g in guias}
    OG_DIR.mkdir(exist_ok=True)
    for g in guias:
        (OG_DIR / f"{g['slug']}.html").write_text(plantilla_og(g), encoding='utf-8', newline='\n')
        path = '/guias/' + g['slug']
        items = [("Inicio", "/"), ("Guías", "/guias"), (g['miga'], None)]
        rel = [por_slug[x] for x in g.get('relacionadas', []) if x in por_slug]
        rel_html = ''
        if rel:
            rel_html = ('\n      <section class="seguir"><h2>Seguí leyendo</h2><ul class="tarjetas">\n'
                        + ''.join(tarjeta(x) for x in rel) + '      </ul></section>')
        faq = g.get('faq', [])
        faq_html = ''
        if faq:
            faq_html = '\n    <h2>Preguntas frecuentes</h2>\n' + ''.join(
                f'    <h3>{html.escape(x["q"])}</h3>\n    <p>{html.escape(x["a"])}</p>\n' for x in faq)
        cuerpo_art, toc = con_ids(g['cuerpo'] + faq_html)
        toc_html = ''.join(f'<li><a href="#{i}">{html.escape(t)}</a></li>' for i, t in toc)
        resumen = ''.join(f'<li>{html.escape(x)}</li>' for x in g.get('resumen', []))
        assert resumen, f"{g['slug']}: falta el resumen"
        etiquetas = ''.join(f'<span>{x}</span>' for x in incluye(g))
        cuerpo = f"""  <section class="guia-cab">
{migas(items)}
    <p class="eyebrow">Guía · {html.escape(g['eje'])}</p>
    <h1>{html.escape(g['h1'])}</h1>
    <p class="bajada">{html.escape(g['description'])}</p>
    <p class="autor">Por <a href="/#manuel">Manuel Alfano</a>, fundador de Orden Financiero · Actualizada el {fecha_larga(g['actualizada'])}</p>
    <div class="meta">{etiquetas}<span class="min">{minutos(g)} min de lectura</span></div>
  </section>
  <div class="guia-cuerpo">
    <div class="guia-principal">
      <aside class="resumen"><p>Lo más importante</p><ul>{resumen}</ul></aside>
      <details class="indice-movil"><summary>En esta guía</summary><ol>{toc_html}</ol></details>
      <article>
{cuerpo_art}
      </article>
      <aside class="caja-autor"><img src="/foto-manuel-cutout.webp" alt="Manuel Alfano" width="72" height="72" loading="lazy"><div><strong>Manuel Alfano</strong><p>Fundador de Orden Financiero. Más de 12 años en la gastronomía con negocio propio; hoy trabaja mano a mano con dueños de negocios para ordenar sus números.</p></div></aside>{rel_html}
    </div>
    <nav class="indice-guia" aria-label="En esta guía"><p>En esta guía</p><ol>{toc_html}</ol></nav>
  </div>
  <script>
  (function () {{
    var links = [].slice.call(document.querySelectorAll('.indice-guia a'));
    if (!links.length || !('IntersectionObserver' in window)) return;
    var porId = {{}};
    links.forEach(function (a) {{ porId[a.getAttribute('href').slice(1)] = a; }});
    var obs = new IntersectionObserver(function (entradas) {{
      entradas.forEach(function (e) {{
        if (!e.isIntersecting) return;
        links.forEach(function (a) {{ a.removeAttribute('aria-current'); }});
        if (porId[e.target.id]) porId[e.target.id].setAttribute('aria-current', 'true');
      }});
    }}, {{ rootMargin: '0px 0px -70% 0px' }});
    Object.keys(porId).forEach(function (id) {{ var h = document.getElementById(id); if (h) obs.observe(h); }});
  }})();
  </script>"""
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
            og_image=f"/guias/og/{g['slug']}.png",
            cta_general=g.get('cta_general', False)), encoding='utf-8', newline='\n')

    # Indice /guias
    items = [("Inicio", "/"), ("Guías", None)]
    desc = ('Guías prácticas para dueños de negocio: precios, costos, márgenes y rentabilidad, '
            'con fórmulas y ejemplos en pesos. Con foco en gastronomía.')
    lista = ''.join(f'    <li><a href="/guias/{g["slug"]}">{html.escape(g["h1"])}</a><p>{html.escape(g["description"])}</p></li>\n'
                    for g in guias)
    # Agrupadas por los cuatro eslabones del diagnóstico (ícono y nombre, sin color por tema)
    # y un "Empezá por acá" arriba.
    temas = [
        ('Costos y precios', 'El costo real y el precio correcto de cada cosa que se vende.',
         ['costo-de-un-plato', 'food-cost', 'costo-de-mercaderia-vendida', 'costos-fijos-y-variables',
          'precio-de-venta-de-un-plato', 'precio-de-venta-de-un-producto']),
        ('Resultado económico', 'Un cierre por mes: cuánto ganó el negocio de verdad, con gastos e impuestos descontados.',
         ['estado-de-resultados', 'margen-de-ganancia', 'punto-de-equilibrio', 'rentabilidad-de-un-negocio']),
        ('Flujo de caja', 'Pagos, cobranzas y vencimientos a la vista, para que la plata esté cuando hace falta.',
         ['capital-de-trabajo']),
        ('Indicadores de gestión', 'Tres o cuatro números que se miran todos los meses antes de decidir.', []),
    ]
    empeza = [('costo-de-un-plato', 'Sabé cuánto te cuesta de verdad cada plato.'),
              ('precio-de-venta-de-un-plato', 'Poné un precio que te deje plata.'),
              ('estado-de-resultados', 'Mirá cuánto ganó el negocio en el mes.')]
    por_slug = {g['slug']: g for g in guias}
    asignadas = [slug for _, _, slugs in temas for slug in slugs]
    sin_tema = [g['slug'] for g in guias if g['slug'] not in asignadas]
    assert not sin_tema, f'Guías sin tema en el índice: {sin_tema}'
    for nombre, _, slugs in temas:
        for slug in slugs:
            assert por_slug[slug]['eje'] == nombre, f'{slug}: su eje no coincide con la sección {nombre}'
    visibles = [t for t in temas if t[2]]

    botones = ''.join(
        f'<a href="#{ESLABONES[n][0]}">{svg_icono(n)}{html.escape(n)}</a>'
        for n, _, _ in visibles)
    pasos = ''.join(
        f'      <li><a href="/guias/{slug}">'
        f'<span class="paso" aria-hidden="true">{i + 1}</span>'
        f'<span class="paso-eje">{html.escape(por_slug[slug]["eje"])}</span>'
        f'<strong>{html.escape(por_slug[slug]["miga"])}</strong>'
        f'<span class="paso-txt">{html.escape(texto)}</span></a></li>\n'
        for i, (slug, texto) in enumerate(empeza))
    secciones = ('  <section class="empeza" aria-labelledby="empeza">\n'
                 '    <h2 id="empeza">Empezá por acá</h2>\n'
                 '    <p>Si tenés un negocio gastronómico, este es el orden más útil para arrancar.</p>\n'
                 f'    <ol class="pasos">\n{pasos}    </ol>\n'
                 '  </section>\n')
    for nombre, intro, slugs in visibles:
        tid = ESLABONES[nombre][0]
        cantidad = f'{len(slugs)} guía' + ('s' if len(slugs) != 1 else '')
        secciones += (f'  <section class="tema" aria-labelledby="{tid}">\n'
                      f'    <div class="tema-cab"><span class="ico">{svg_icono(nombre)}</span>'
                      f'<div><h2 id="{tid}">{html.escape(nombre)}</h2><p>{html.escape(intro)}</p></div>'
                      f'<span class="tema-num">{cantidad}</span></div>\n'
                      '    <ul class="tarjetas">\n'
                      + ''.join(tarjeta(por_slug[slug]) for slug in slugs)
                      + '    </ul>\n  </section>\n')
    guias = [por_slug[slug] for slug in asignadas]

    cuerpo = f"""  <section class="portada">
{migas(items)}
    <p class="eyebrow">Guías</p>
    <h1>Guías de finanzas para <em>dueños de negocio</em></h1>
    <p class="bajada">{desc}</p>
    <p class="cifras"><strong>{len(guias)} guías</strong> · fórmula, ejemplo en pesos y cómo armarlo en Excel en cada una</p>
    <p class="autor">Escritas por <a href="/#manuel">Manuel Alfano</a>, con más de 12 años en la gastronomía con negocio propio.</p>
    <nav class="temas" aria-label="Temas de las guías">{botones}</nav>
    <div class="buscador"><label for="buscar-guia">Buscá una guía</label><input id="buscar-guia" type="search" placeholder="Ej.: precio, merma, IVA, punto de equilibrio" autocomplete="off"></div>
  </section>
  <p class="sin-resultados" id="sin-resultados" hidden>No encontramos guías con esa palabra. Probá con otra, o <a href="/?origen=guias-busqueda#diagnostico">hacé el diagnóstico</a> y te decimos por dónde empezar.</p>
{secciones}  <script>
  (function () {{
    var campo = document.getElementById('buscar-guia');
    if (!campo) return;
    var norm = function (t) {{ return t.toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g, ''); }};
    var tarjetas = [].slice.call(document.querySelectorAll('.tema .tarjetas li'));
    tarjetas.forEach(function (li) {{ li._texto = norm(li.textContent + ' ' + (li.getAttribute('data-claves') || '')); }});
    var temas = [].slice.call(document.querySelectorAll('.tema'));
    var empeza = document.querySelector('.empeza');
    var nada = document.getElementById('sin-resultados');
    var espera;
    campo.addEventListener('input', function () {{
      var q = norm(campo.value.trim());
      var total = 0;
      tarjetas.forEach(function (li) {{ var ok = !q || li._texto.indexOf(q) > -1; li.hidden = !ok; if (ok) total++; }});
      temas.forEach(function (t) {{ t.hidden = !t.querySelector('.tarjetas li:not([hidden])'); }});
      if (empeza) empeza.hidden = !!q;
      nada.hidden = !(q && total === 0);
      clearTimeout(espera);
      if (q && window.gtag) espera = setTimeout(function () {{ gtag('event', 'guias_busqueda', {{ termino: q.slice(0, 40), resultados: total }}); }}, 900);
    }});
  }})();
  </script>"""
    ld = {"@context": "https://schema.org", "@graph": [
        {"@type": "CollectionPage", "@id": BASE + "/guias#coleccion", "url": BASE + "/guias",
         "name": "Guías de finanzas para dueños de negocio", "description": desc, "inLanguage": "es-AR",
         "isPartOf": {"@id": BASE + "/#website"}, "publisher": org,
         "mainEntity": {"@type": "ItemList", "itemListElement": [
             {"@type": "ListItem", "position": i + 1, "url": BASE + "/guias/" + g['slug'], "name": g['h1']}
             for i, g in enumerate(guias)]}},
        breadcrumb_ld(items)]}
    (OUT / 'index.html').write_text(pagina(
        title='Guías de finanzas para dueños de negocio · Orden Financiero', description=desc, path='/guias',
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
