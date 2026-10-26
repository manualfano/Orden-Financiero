// Vista previa de la presentación sin Google: corre Deck.gs con un SlidesApp
// de mentira que anota cada forma, línea y texto, y dibuja las slides en un HTML.
// Uso: node docs/presentacion/vista-previa.js [salida.html]
// Las medidas son las de Slides (puntos sobre 720×405); el HTML las pasa a
// 1280×720. El fondo de marca (imagen de Drive) se aproxima con un degradé.
const fs = require('fs');
const path = require('path');

const salida = process.argv[2] || path.join(__dirname, 'vista-previa.html');
const K = 1 / 0.5625; // pt → px del lienzo de 1280

let decks = [], deck = null;

function rangoFalso(box, desde, hasta) {
  const estilo = {
    setFontFamilyAndWeight(f, w) { box.runs.push({ desde, hasta, peso: w }); return estilo; },
    setFontSize(s) { box.runs.push({ desde, hasta, size: s }); return estilo; },
    setForegroundColor(c) { box.runs.push({ desde, hasta, color: c }); return estilo; },
    setItalic(i) { box.runs.push({ desde, hasta, italic: i }); return estilo; },
    setBold() { return estilo; }
  };
  const parrafo = {
    setLineSpacing(v) { if (v < 100) throw new Error('Invalid argument: spacing'); box.lh = v; return parrafo; },
    setSpaceAbove() { return parrafo; }, setSpaceBelow() { return parrafo; },
    setParagraphAlignment(a) { box.alin = a; return parrafo; }
  };
  return {
    getTextStyle: () => estilo,
    getParagraphStyle: () => parrafo,
    getRange: (a, b) => rangoFalso(box, a, b),
    setText: t => { box.texto = t; }
  };
}

function rellenoFalso(el) {
  return { setSolidFill(c, a) { el.fill = c; el.fillA = a === undefined ? 1 : a; }, setTransparent() { el.fill = null; } };
}
function bordeFalso(el) {
  const b = {
    setTransparent() { el.borde = null; return b; },
    getLineFill: () => ({ setSolidFill(c, a) { el.borde = c; el.bordeA = a === undefined ? 1 : a; } }),
    setWeight(w) { el.grosor = w; return b; }
  };
  return b;
}

function slideFalsa() {
  const s = { els: [], fondo: '#FFFFFF', notas: '' };
  const api = {
    getBackground: () => ({ setSolidFill(c) { s.fondo = c; } }),
    insertTextBox(str, x, y, w, h) {
      const box = { tipo: 'texto', texto: String(str), x, y, w, h, runs: [], lh: 100, alin: null, medio: false };
      s.els.push(box);
      return { getText: () => rangoFalso(box, 0, box.texto.length), setContentAlignment() { box.medio = true; } };
    },
    insertShape(tipo, x, y, w, h) {
      const el = { tipo: 'forma', forma: String(tipo), x, y, w, h, fill: '#FFFFFF', fillA: 1, borde: '#000', bordeA: 1, grosor: 1 };
      s.els.push(el);
      return { getFill: () => rellenoFalso(el), getBorder: () => bordeFalso(el) };
    },
    insertLine(cat, x1, y1, x2, y2) {
      const el = { tipo: 'linea', x1, y1, x2, y2, color: '#000', alpha: 1, grosor: 1 };
      s.els.push(el);
      return { getLineFill: () => ({ setSolidFill(c, a) { el.color = c; el.alpha = a === undefined ? 1 : a; } }), setWeight(w) { el.grosor = w; } };
    },
    insertImage(src, x, y, w, h) {
      // Sin medidas, Slides la pone en su tamaño natural: acá, 600×375 pt
      const el = { tipo: 'imagen', src: typeof src === 'string' ? src : null, marca: !!(src && src.fondoMarca),
        x: x || 0, y: y || 0, w: w || 600, h: h || 375 };
      s.els.push(el);
      const api = {
        sendToBack() { s.els.splice(s.els.indexOf(el), 1); s.els.unshift(el); return api; },
        getWidth: () => el.w, getHeight: () => el.h,
        setLeft(v) { el.x = v; return api; }, setTop(v) { el.y = v; return api; },
        setWidth(v) { el.w = v; return api; }, setHeight(v) { el.h = v; return api; }
      };
      return api;
    },
    getNotesPage: () => ({ getSpeakerNotesShape: () => ({ getText: () => ({ setText(t) { s.notas = t; } }) }) }),
    remove() {}
  };
  return { s, api };
}

global.SlidesApp = {
  create(titulo) {
    deck = { titulo, slides: [] };
    decks.push(deck);
    return {
      appendSlide() { const n = slideFalsa(); deck.slides.push(n.s); return n.api; },
      getSlides: () => [{ remove() {} }],
      getId: () => 'VISTA-PREVIA',
      saveAndClose() {}
    };
  },
  PredefinedLayout: { BLANK: 'BLANK' },
  ShapeType: { RECTANGLE: 'RECTANGLE', ROUND_RECTANGLE: 'ROUND_RECTANGLE', ELLIPSE: 'ELLIPSE' },
  ParagraphAlignment: { CENTER: 'centro', END: 'der' },
  ContentAlignment: { MIDDLE: 'medio' },
  LineCategory: { STRAIGHT: 'recta' }
};
const nada = () => new Proxy(function () {}, { get: () => nada(), apply: () => nada() });
global.DriveApp = {
  getFileById: () => nada(), getRootFolder: () => nada(),
  // El fondo de marca vuelve como un blob de mentira: la vista previa lo pinta con un degradé
  getFolderById: () => ({ addFile() {}, getFilesByName: n => ({ hasNext: () => true, next: () => ({ getBlob: () => ({ fondoMarca: /fondo/i.test(n) }) }) }) })
};
global.Utilities = {
  formatDate(d, tz, f) {
    d = new Date(d);
    const M = d.getMonth() + 1, D = d.getDate();
    return f.replace('yyyy', d.getFullYear()).replace('MM', String(M).padStart(2, '0'))
      .replace('dd', String(D).padStart(2, '0')).replace(/^M$/, String(M)).replace(/^d$/, String(D));
  }
};
global.formatearWhatsApp = x => x;
console.warn = (...a) => { const t = a.join(' '); if (!/fondo/i.test(t)) process.stderr.write('AVISO: ' + t + '\n'); };

const codigo = fs.readFileSync(path.join(__dirname, '..', 'apps-script', 'Deck.gs'), 'utf8');
eval(codigo + ';global.crearDeck=crearDeck;global.probarDeck=probarDeck;global.ORDEN_CADENA=ORDEN_CADENA;global.PRUEBA=PRUEBA;');
// PRUEBA_VER=1: muestra la slide de prueba aunque el dueño todavía no la confirmó
if (process.env.PRUEBA_VER) global.PRUEBA.confirmado = true;

// Casos: el de prueba del script y uno con respuestas reales de un lead, anónimo (tres eslabones empatados)
const log = console.log; console.log = () => {};
probarDeck();
const sando = {
  leadId: 'VISTA', timestamp: '2026-10-23T19:50:00Z', nombre: '', whatsapp: '', negocio: 'Caso real anónimo',
  rubro: 'gastronomia', score: 31, maxScore: 36,
  eslabones: [
    { nombre: 'Costos y Precios', score: 7, estado: 'A mejorar' }, { nombre: 'Resultado Económico', score: 7, estado: 'A mejorar' },
    { nombre: 'Cash Flow', score: 7, estado: 'A mejorar' }, { nombre: 'Indicadores de Gestión', score: 9, estado: 'Sólido' }],
  respuestas: [
    ['Costos y Precios', '¿Sabés cuánto te cuesta realmente producir o dar cada servicio?', 'A veces, pero no siempre lo tengo actualizado', 2],
    ['Costos y Precios', '¿Tu precio de venta está calculado sobre tus costos reales o lo fijás mirando a la competencia?', 'Sí, lo calculo sobre mis costos reales', 3],
    ['Costos y Precios', '¿Actualizás tus precios cuando suben tus costos?', 'A veces, pero no siempre', 2],
    ['Resultado Económico', '¿Sabés exactamente cuánto ganó tu negocio el mes pasado?', 'A veces, pero no de manera consistente', 2],
    ['Resultado Económico', '¿Separás las finanzas del negocio de tus gastos personales?', 'Sí, siempre', 3],
    ['Resultado Económico', '¿Tenés un cierre mensual que te muestre ventas, costos, estructura, impuestos y ganancia neta?', 'A veces, pero no de manera consistente', 2],
    ['Cash Flow', '¿Llegás a fin de mes con plata disponible para pagar sueldos y proveedores sin apurarte?', 'A veces llego justo', 2],
    ['Cash Flow', '¿Sabés con anticipación cuándo van a ser tus próximos gastos fuertes?', 'Sí, los tengo mapeados', 3],
    ['Cash Flow', '¿Tus cobros y pagos están equilibrados o siempre pagás antes de cobrar?', 'Depende del mes y del cliente', 2],
    ['Indicadores de Gestión', '¿Revisás los números de tu negocio al menos una vez por mes?', 'Sí, lo hago todos los meses', 3],
    ['Indicadores de Gestión', '¿Tenés algún indicador que seguís regularmente (crecimiento de ventas, contribución marginal, punto de equilibrio)?', 'Sí, tengo uno o más que sigo de cerca', 3],
    ['Indicadores de Gestión', '¿Tomás decisiones de inversión o contratación con datos concretos?', 'Sí, siempre me baso en números', 3]
  ].map(([e, p, r, s]) => ({ 'eslabónNombre': e, pregunta: p, letra: '', respuesta: r, score: s }))
};
crearDeck(sando);
console.log = log;

// ── Dibujo ──
const esc = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const rgba = (hex, a) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`;
};

function textoHtml(el) {
  // Estilo base = el run que cubre todo el texto; los demás son tramos
  const largo = el.texto.length;
  const base = { peso: 400, size: 14, color: '#000', italic: false };
  el.runs.filter(r => r.desde === 0 && r.hasta === largo).forEach(r => Object.assign(base, strip(r)));
  const tramos = el.runs.filter(r => !(r.desde === 0 && r.hasta === largo));
  let html = '';
  for (let i = 0; i < largo; i++) {
    const st = Object.assign({}, base);
    tramos.forEach(r => { if (i >= r.desde && i < r.hasta) Object.assign(st, strip(r)); });
    const ch = el.texto[i] === '\n' ? '<br>' : esc(el.texto[i]);
    html += `<span style="font-weight:${st.peso};font-size:${(st.size * K).toFixed(2)}px;color:${st.color};font-style:${st.italic ? 'italic' : 'normal'}">${ch}</span>`;
  }
  const lh = (el.lh / 100) * 1.21;
  const alin = el.alin === 'centro' ? 'center' : el.alin === 'der' ? 'right' : 'left';
  return `<div class="t" style="left:${el.x * K}px;top:${el.y * K}px;width:${el.w * K}px;height:${el.h * K}px;line-height:${lh};text-align:${alin};font-size:${(base.size * K).toFixed(2)}px;${el.medio ? 'display:flex;flex-direction:column;justify-content:center;' : ''}"><div>${html}</div></div>`;
}
function strip(r) { const o = Object.assign({}, r); delete o.desde; delete o.hasta; return o; }

function slideHtml(s, i) {
  let h = `<div class="slide" style="background:${s.fondo}">`;
  let svg = '';
  s.els.forEach(el => {
    if (el.tipo === 'texto') h += textoHtml(el);
    else if (el.tipo === 'imagen') {
      if (el.src) h += `<img src="${el.src}" style="position:absolute;left:${el.x * K}px;top:${el.y * K}px;width:${el.w * K}px;height:${el.h * K}px">`;
      else if (el.marca) h += '<div class="fondo-marca"></div>';
      else h += `<div style="position:absolute;left:${el.x * K}px;top:${el.y * K}px;width:${el.w * K}px;height:${el.h * K}px;background:#EEF1F6;display:flex;align-items:center;justify-content:center;font:16px Inter;color:#6B6E76">captura del portal</div>`;
    } else if (el.tipo === 'forma') {
      const w = el.w * K, hh = el.h * K;
      const r = el.forma === 'ELLIPSE' ? '50%' : el.forma === 'ROUND_RECTANGLE' ? `${Math.min(w, hh) * 0.17}px` : '0';
      const bg = el.fill ? rgba(el.fill, el.fillA) : 'transparent';
      const bd = el.borde ? `box-shadow:inset 0 0 0 ${el.grosor * K}px ${rgba(el.borde, el.bordeA)};` : '';
      h += `<div style="position:absolute;left:${el.x * K}px;top:${el.y * K}px;width:${w}px;height:${hh}px;border-radius:${r};background:${bg};${bd}"></div>`;
    } else if (el.tipo === 'linea') {
      h += `<svg class="ln"><line x1="${el.x1 * K}" y1="${el.y1 * K}" x2="${el.x2 * K}" y2="${el.y2 * K}" stroke="${rgba(el.color, el.alpha)}" stroke-width="${el.grosor * K}"/></svg>`;
    }
  });
  h += `<div class="num">${i + 1}</div></div>`;
  h = `<div class="marco">${h}</div>`;
  if (s.notas) h += `<div class="notas"><span>Notas del orador</span><pre>${esc(s.notas)}</pre></div>`;
  return h;
}

const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Presentación del diagnóstico</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
body{margin:0;background:#1f2229;font-family:Inter,sans-serif;padding:24px 16px}
main{max-width:1280px;margin:0 auto}
header{color:#fff;margin:8px 0 28px}
header b{display:block;font-weight:500;font-size:22px}
header small{color:#A3ADC2;font-size:14px;line-height:1.5}
h1{color:#fff;font-weight:500;font-size:17px;margin:40px 0 14px}
.marco{position:relative;width:100%;aspect-ratio:16/9;overflow:hidden;margin:0 0 18px;border-radius:6px;box-shadow:0 1px 0 rgba(255,255,255,.06)}
.slide{position:absolute;left:0;top:0;width:1280px;height:720px;overflow:hidden;transform-origin:0 0;font-family:Inter,sans-serif}
.fondo-marca{position:absolute;inset:0;background:radial-gradient(ellipse at 85% 15%,rgba(147,197,253,.35),transparent 55%),radial-gradient(ellipse at 10% 100%,rgba(12,102,228,.45),transparent 60%),#0D2B6B}
.t{position:absolute;box-sizing:border-box;padding:${7.2 * K}px;white-space:pre-wrap;word-wrap:break-word}
.ln{position:absolute;inset:0;width:1280px;height:720px;overflow:visible;pointer-events:none}
.num{display:none;position:absolute;right:6px;top:4px;font:11px Inter;color:#f0f;opacity:.6}
.debug .num{display:block}
.notas{background:#2a2e37;border-radius:6px;padding:12px 16px;margin:-6px 0 26px}
.notas span{display:block;color:#A3E635;font-size:11px;font-weight:500;text-transform:uppercase;margin-bottom:6px}
.notas pre{margin:0;color:#d6dbe4;font:13px/1.55 Inter,sans-serif;white-space:pre-wrap}
</style></head><body>
<main>
<header><b>Presentación del diagnóstico · vista previa</b>
<small>Lo que arma el script con dos casos: el de prueba y uno con respuestas reales de un lead, sin su nombre. El fondo de portada y cierre es una aproximación del de Google.</small></header>
${decks.map(d => `<h1>${esc(d.titulo)} · ${d.slides.length} slides</h1>` + d.slides.map(slideHtml).join('')).join('')}
</main>
<script>
if (/debug/.test(location.search)) document.body.classList.add('debug');
// #n muestra solo la slide n (contando todas las presentaciones desde 1): sirve para capturas
if (location.hash) {
  const n = Number(location.hash.slice(1)) - 1;
  document.body.style.padding = '0';
  document.querySelectorAll('h1,header,.notas').forEach(e => e.remove());
  document.querySelectorAll('.marco').forEach((m, i) => { if (i !== n) m.remove(); else { m.style.margin = '0'; m.style.borderRadius = '0'; } });
}
// Cada slide (1280×720) se escala al ancho disponible
function escalar() {
  document.querySelectorAll('.marco').forEach(m => { m.firstElementChild.style.transform = 'scale(' + (m.clientWidth / 1280) + ')'; });
}
escalar();
addEventListener('resize', escalar);
</script>
</body></html>`;
fs.writeFileSync(salida, html);
log('Vista previa: ' + salida + ' (' + decks.map(d => d.slides.length).join(' + ') + ' slides)');
