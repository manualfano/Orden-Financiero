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
  .brand-mark { width: 34px; height: 34px; border-radius: var(--r); background: var(--marca); display: inline-flex; align-items: center; justify-content: center; }
  .brand-mark svg { width: 18px; height: 18px; }
  .dot { color: var(--marca); }
  .head-nav { display: flex; align-items: center; gap: var(--s-4); }
  .head-nav a { color: var(--w); text-decoration: none; font-size: var(--fs-sm); font-weight: 500; min-height: 44px; display: inline-flex; align-items: center; }
  .head-nav .head-cta { background: var(--marca); padding: 0 var(--s-4); border-radius: var(--r); font-weight: 600; }
  .head-nav .head-cta:hover { background: var(--marca-hover); }
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
  .tabla { overflow-x: auto; margin: var(--s-4) 0; }
  table { border-collapse: collapse; width: 100%; font-size: var(--fs-sm); }
  .tabla table:has(tr > :nth-child(4)) { min-width: 520px; }
  th, td { text-align: left; padding: 8px 10px; border-bottom: 1px solid var(--borde); color: var(--tinta-2); }
  th { color: var(--navy); font-weight: 600; background: var(--lienzo); }
  .n { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
  th.n { white-space: normal; }
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
  footer { background: var(--navy-900); padding: var(--s-6) var(--s-5); font-size: var(--fs-sm); }
  .foot-in { max-width: 960px; margin: 0 auto; display: flex; flex-wrap: wrap; gap: var(--s-3) var(--s-5); justify-content: space-between; color: rgba(255,255,255,0.75); }
  .foot-in nav { display: flex; flex-wrap: wrap; gap: var(--s-2) var(--s-5); }
  .foot-in a { color: var(--w); text-decoration: none; }
  :focus-visible { outline: 2px solid var(--marca); outline-offset: 2px; }
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


def pagina(*, title, description, path, og_type, ld, cuerpo, cta_origen, cta_general=False):
    url = BASE + path
    e = html.escape
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
<meta property="og:image" content="{BASE}/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
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
<main>
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

    for g in guias:
        path = '/guias/' + g['slug']
        items = [("Inicio", "/"), ("Guías", "/guias"), (g['miga'], None)]
        rel = [x for x in guias if x['slug'] in g.get('relacionadas', [])]
        rel_html = ''
        if rel:
            rel_html = '\n  <h2>Seguí leyendo</h2>\n  <ul class="lista-guias">\n' + ''.join(
                f'    <li><a href="/guias/{x["slug"]}">{html.escape(x["h1"])}</a><p>{html.escape(x["description"])}</p></li>\n'
                for x in rel) + '  </ul>'
        faq = g.get('faq', [])
        faq_html = ''
        if faq:
            faq_html = '\n    <h2>Preguntas frecuentes</h2>\n' + ''.join(
                f'    <h3>{html.escape(x["q"])}</h3>\n    <p>{html.escape(x["a"])}</p>\n' for x in faq)
        cuerpo = f"""{migas(items)}
  <p class="eyebrow">Guía · {html.escape(g['eje'])}</p>
  <h1>{html.escape(g['h1'])}</h1>
  <p class="bajada">{html.escape(g['description'])}</p>
  <p class="autor">Por <a href="/#manuel">Manuel Alfano</a>, fundador de Orden Financiero · Actualizada el {fecha_larga(g['actualizada'])}</p>
  <article>
{g['cuerpo']}{faq_html}
  </article>{rel_html}"""
        ld = {"@context": "https://schema.org", "@graph": [
            {"@type": "Article", "@id": BASE + path + "#article", "headline": g['h1'], "description": g['description'],
             "image": BASE + "/og-image.png", "inLanguage": "es-AR", "datePublished": g['publicada'],
             "dateModified": g['actualizada'], "author": autor, "publisher": org,
             "mainEntityOfPage": BASE + path, "isPartOf": {"@id": BASE + "/guias#coleccion"}},
            breadcrumb_ld(items)]}
        if faq:
            ld['@graph'].append({"@type": "FAQPage", "@id": BASE + path + "#faq", "mainEntity": [
                {"@type": "Question", "name": x['q'], "acceptedAnswer": {"@type": "Answer", "text": x['a']}} for x in faq]})
        (OUT / f"{g['slug']}.html").write_text(pagina(
            title=g['title'] + ' · Orden Financiero', description=g['description'], path=path,
            og_type='article', ld=ld, cuerpo=cuerpo, cta_origen='guia-' + g['slug'],
            cta_general=g.get('cta_general', False)), encoding='utf-8', newline='\n')

    # Indice /guias
    items = [("Inicio", "/"), ("Guías", None)]
    desc = ('Guías prácticas para dueños de negocio: precios, costos, márgenes y rentabilidad, '
            'con fórmulas y ejemplos en pesos. Con foco en gastronomía.')
    lista = ''.join(f'    <li><a href="/guias/{g["slug"]}">{html.escape(g["h1"])}</a><p>{html.escape(g["description"])}</p></li>\n'
                    for g in guias)
    cuerpo = f"""{migas(items)}
  <p class="eyebrow">Guías</p>
  <h1>Guías de finanzas para dueños de negocio</h1>
  <p class="bajada">{desc}</p>
  <p class="autor">Escritas por <a href="/#manuel">Manuel Alfano</a>, con más de 12 años en la gastronomía con negocio propio.</p>
  <ul class="lista-guias">
{lista}  </ul>"""
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
        og_type='website', ld=ld, cuerpo=cuerpo, cta_origen='guias'), encoding='utf-8', newline='\n')

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
