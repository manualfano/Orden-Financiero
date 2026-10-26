// ═══════════════════════════════════════════════════════════════
// DECK · Generación automática de la presentación del diagnóstico
// Versión 2026-10-26 b: venta con la ecuación de valor (hoy contra 90 días, quién
// hace qué, garantía en el cierre, preguntas de costo en las notas), más lima y
// la parte del programa en navy (pedido del
// dueño), sobre el rediseño del 14/09, aprobado por el dueño sobre la
// maqueta del 14/09: colores y tipografía de la web y el portal, logo,
// fondo de marca en portada y cierre, un hallazgo por eslabón, textos del
// acompañamiento iguales a la web. 12 slides.
// Límites de Google Slides que condicionan el diseño: no hay radio de
// esquina configurable (las píldoras se arman con dos círculos y un
// rectángulo), no hay degradés (el fondo de marca es una imagen) y no hay
// espaciado entre letras.
// ═══════════════════════════════════════════════════════════════

// Carpeta de Drive donde se guardan las presentaciones (decision del dueño,
// 11/09/2026): "Presentaciones prospectos", dentro de "1.Diagnostico de preventa nuevo".
const DECK_FOLDER_ID = '1Gid75p7L-8ejCfEwuZgWV1kYQQCBk_sb';
// Imágenes (14/09/2026). El isotipo es el ícono público de la web. El fondo de
// marca (degradé del hero, que Slides no puede dibujar) es una imagen que el
// dueño subió a la carpeta de presentaciones: se busca por nombre, sin IDs.
// 26/10: icon-512 (esquinas transparentes); apple-touch-icon no tiene
// transparencia y sobre el navy de la portada se veían las puntas blancas.
const ISOTIPO_URL = 'https://ordenfinanciero.com/icon-512.png';
const FONDO_NOMBRE = 'OF-fondo-presentacion.jpg';

// Tokens de la web y el portal (src/styles/global.css)
const C = {
  navy: '#0D2B6B', navy2: '#143C8C', marca: '#0C66E4', soft: '#93C5FD', celeste: '#7DB1F4',
  secdark: '#A3ADC2', tinta: '#292A2E', t2: '#505258', t3: '#6B6E76', lienzo: '#F8F8F8',
  lienzo2: '#F0F1F2', azulclaro: '#C2DBFB', blanco: '#FFFFFF', seleccion: '#E9F2FF',
  pos: '#3D7A1F', posbg: '#E8F5E2', ale: '#956308', alebg: '#FDF2DE', rie: '#C5311A', riebg: '#FBE7E4',
  lima: '#A3E635'
};
const ESTADO_COLOR = { 'Sólido': ['pos', 'posbg'], 'A mejorar': ['ale', 'alebg'], 'Crítico': ['rie', 'riebg'] };

// Lienzo de diseño 1280×720 px; Slides trabaja en puntos sobre 720×405.
const PXPT = 0.5625;
const MG = 72;
// Las cajas de texto traen 7,2 pt de margen interno: texto() lo descuenta,
// así las coordenadas son las del texto visible (como en la maqueta).
const INSET = 7.2 / PXPT;
function P(v) { return v * PXPT; }

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio',
  'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
function mesEs(d) { return MESES[Number(Utilities.formatDate(d, 'GMT-3', 'M')) - 1]; }
function num(v) { return String(v).replace('.', ','); }

// Nombres de eslabón: el Sheet usa los viejos; la presentación, los de la web.
const ORDEN_CADENA = ['Costos y Precios', 'Resultado Económico', 'Cash Flow', 'Indicadores de Gestión'];
const NOMBRE_WEB = {
  'Costos y Precios': 'Costos y precios', 'Resultado Económico': 'Resultado económico',
  'Cash Flow': 'Flujo de caja', 'Indicadores de Gestión': 'Indicadores de gestión'
};
// Mes del programa que trabaja cada eslabón (sección "El programa" de la web)
const MES_ESLABON = { 'Costos y Precios': 1, 'Resultado Económico': 1, 'Cash Flow': 2, 'Indicadores de Gestión': 3 };

const PLAN_ESLABON = {
  'Costos y Precios':      'Estructura de costos real por producto y una política de actualización de precios que no dependa de la memoria.',
  'Resultado Económico':   'Separar las finanzas del negocio de las personales y armar el primer cierre mensual completo.',
  'Cash Flow':             'Proyección de ingresos y egresos, con los gastos fuertes anticipados en vez de descubiertos.',
  'Indicadores de Gestión':'Cuatro métricas calculadas sobre el cierre y revisadas una vez por mes.'
};

// Nota de Prioridades según el eslabón más flojo (aprobadas 14/09): el más
// flojo es el objetivo; la cadena marca el orden. [frase principal, resto]
const NOTA_PRIORIDAD = {
  'Indicadores de Gestión': ['Indicadores de gestión es el más flojo y es a donde apunta el programa.',
    'Un indicador sale del cierre mensual: primero se arman los costos y el cierre, y en el mes 3 ya se mide con números ciertos.'],
  'Cash Flow': ['Flujo de caja es el más flojo y es el objetivo del mes 2.',
    'Para proyectar la caja con números ciertos, primero hacen falta los costos y el cierre del mes 1.'],
  'Resultado Económico': ['Resultado económico es el más flojo y se trabaja desde el primer mes:',
    'el cierre mensual es la base de todo lo que sigue.'],
  'Costos y Precios': ['Costos y precios es el más flojo y se trabaja desde el primer mes:',
    'es la base de toda la cadena.']
};

// Cruces de respuestas que no pueden ser ciertas a la vez (van a las notas del orador).
const CONTRADICCIONES = [
  { a: ['cuánto te cuesta', 'producir'], aMax: 1,
    b: ['precio de venta'],              bMin: 3,
    pregunta: 'Dice que fija precios sobre costos reales pero calcula los costos a ojo. Preguntale cómo hace para actualizar un precio cuando sube un insumo.' },
  { a: ['cuánto ganó'],                  aMax: 1,
    b: ['cierre mensual'],               bMin: 3,
    pregunta: 'Dice que tiene cierre mensual pero no sabe cuánto ganó el mes pasado. Preguntale qué mira exactamente en ese cierre.' },
  { a: ['fin de mes'],                   aMax: 1,
    b: ['cobros y pagos'],               bMin: 3,
    pregunta: 'Dice que cobra antes de pagar y aun así llega justo a fin de mes. Preguntale en qué se va la plata entre medio.' }
];

// ── PUNTO DE ENTRADA ──────────────────────────────────────────
function crearDeck(data) {
  // Título: nombre del lead y negocio (pedido del dueño, 26/10); sin ninguno
  // de los dos, el WhatsApp
  const persona = [data.nombre, data.apellido].map(x => String(x || '').trim()).filter(Boolean).join(' ');
  const negocio = String(data.negocio || '').trim();
  const partes = [persona, negocio].filter((x, i, a) => x && a.indexOf(x) === i);
  const ident = partes.length ? partes.join(' · ') : formatearWhatsApp(data.whatsapp);
  const titulo = `OF · ${ident} · Diagnóstico ${Utilities.formatDate(new Date(data.timestamp), 'GMT-3', 'yyyy-MM')}`;
  const pres = SlidesApp.create(titulo);

  // SlidesApp.create() lo deja en la raíz: lo movemos a la carpeta.
  const archivo = DriveApp.getFileById(pres.getId());
  DriveApp.getFolderById(DECK_FOLDER_ID).addFile(archivo);
  DriveApp.getRootFolder().removeFile(archivo);

  pres.getSlides()[0].remove();
  PAGINA = 0;
  const ctx = prepararDatos(data);

  // 26/10: primero el diagnóstico y después a dónde se llega (antes el objetivo
  // iba antes del resultado: se vendía antes de diagnosticar)
  slidePortada(pres, ctx);                                  // 01
  slideRueda(pres, ctx);                                    // 02 (con el alcance)
  ctx.ordenados.forEach((es, i) => slideHallazgo(pres, ctx, es, i)); // 03-06
  slideBrecha(pres, ctx);                                   // 07
  slidePrioridades(pres, ctx);                              // 08
  slidePrograma(pres, ctx);                                 // 09
  slidePrueba(pres, ctx);                                   // 10, solo si está confirmada
  slideTresMeses(pres, ctx);                                // 10 u 11
  slideInversion(pres, ctx);                                // 11 o 12
  slideCierre(pres, ctx);                                   // 12 o 13

  pres.saveAndClose();
  return 'https://docs.google.com/presentation/d/' + pres.getId() + '/edit';
}

// ── PREPARACIÓN ───────────────────────────────────────────────
function prepararDatos(data) {
  const porNombre = {};
  data.eslabones.forEach(es => {
    porNombre[es.nombre] = {
      nombre: es.nombre,
      web: NOMBRE_WEB[es.nombre] || es.nombre,
      estado: es.estado,
      score10: Math.round((es.score / 9) * 100) / 10,
      respuestas: (data.respuestas || []).filter(r => r['eslabónNombre'] === es.nombre)
    };
  });

  // Mismo desempate que la web: menor puntaje; si empatan, más respuestas
  // en el mínimo (puntaje 1); si siguen empatados, el orden de la cadena.
  const cantidadC = es => es.respuestas.filter(r => r.score === 1).length;
  const ordenados = ORDEN_CADENA.map(n => porNombre[n]).sort((a, b) =>
    (a.score10 - b.score10) ||
    (cantidadC(b) - cantidadC(a)) ||
    (ORDEN_CADENA.indexOf(a.nombre) - ORDEN_CADENA.indexOf(b.nombre)));

  const fecha = Utilities.formatDate(new Date(data.timestamp), 'GMT-3', 'dd/MM/yyyy');
  return {
    data: data,
    porNombre: porNombre,
    ordenados: ordenados,
    cantidadC: cantidadC,
    negocio: data.negocio || '',
    rubro: rubroTexto(data.rubro),
    fecha: fecha,
    mesAnio: `${mesEs(new Date())} ${Utilities.formatDate(new Date(), 'GMT-3', 'yyyy')}`,
    score10: Math.round((data.score / data.maxScore) * 100) / 10,
    nRespuestas: (data.respuestas || []).length,
    fuente: `Autodiagnóstico Orden Financiero · ${fecha} · Respuestas del dueño, sin verificación documental`
  };
}

function rubroTexto(r) {
  const mapa = { gastronomia: 'Gastronomía' };
  const s = String(r || '').trim();
  if (!s) return '';
  return mapa[s.toLowerCase()] || (s.charAt(0).toUpperCase() + s.slice(1));
}

// ── PIEZAS DE DIBUJO ──────────────────────────────────────────
// fondo: 'marca' (imagen del hero, portada y cierre), 'navy' (liso, como la banda
// del programa en la web: lo que viene a los 90 días) o blanco (el diagnóstico de hoy)
function nuevaSlide(pres, fondo) {
  const s = pres.appendSlide(SlidesApp.PredefinedLayout.BLANK);
  PAGINA++;
  if (fondo === 'marca') {
    s.getBackground().setSolidFill(C.navy);
    const blob = fondoMarca();
    if (blob) s.insertImage(blob, 0, 0, P(1280), P(720)).sendToBack();
  } else if (fondo === 'navy') {
    s.getBackground().setSolidFill(C.navy);
  } else {
    s.getBackground().setSolidFill(C.blanco);
  }
  return s;
}

// Busca el fondo una sola vez por ejecución. Si no está, las slides quedan en navy liso.
let FONDO_CACHE;
function fondoMarca() {
  if (FONDO_CACHE !== undefined) return FONDO_CACHE;
  FONDO_CACHE = null;
  try {
    const it = DriveApp.getFolderById(DECK_FOLDER_ID).getFilesByName(FONDO_NOMBRE);
    if (it.hasNext()) FONDO_CACHE = it.next().getBlob();
    else console.warn('No está "' + FONDO_NOMBRE + '" en la carpeta: portada y cierre quedan en navy liso.');
  } catch (err) {
    console.warn('Fondo de marca no disponible: ' + err);
  }
  return FONDO_CACHE;
}

// o: size, color, peso (300/400/500/600), lh (%), italic, alin ('izq'|'centro'|'der'), medio
function texto(slide, str, x, y, w, h, o) {
  o = o || {};
  const box = slide.insertTextBox(String(str), P(x - INSET), P(y - INSET), P(w + 2 * INSET), P(h + 2 * INSET));
  const t = box.getText();
  t.getTextStyle()
    .setFontFamilyAndWeight('Inter', o.peso || 400)
    .setFontSize(P(o.size || 15))
    .setForegroundColor(o.color || C.t2)
    .setItalic(!!o.italic);
  const ps = t.getParagraphStyle();
  ps.setLineSpacing(Math.max(100, o.lh || 140)).setSpaceAbove(0).setSpaceBelow(0); // Slides no acepta menos de 100 %
  if (o.alin === 'der') ps.setParagraphAlignment(SlidesApp.ParagraphAlignment.END);
  if (o.alin === 'centro') ps.setParagraphAlignment(SlidesApp.ParagraphAlignment.CENTER);
  if (o.medio) box.setContentAlignment(SlidesApp.ContentAlignment.MIDDLE);
  return box;
}

// Cambia peso y color de un tramo del texto (desde, hasta: índices de caracteres)
function tramo(box, desde, hasta, peso, color) {
  const st = box.getText().getRange(desde, hasta).getTextStyle();
  if (peso) st.setFontFamilyAndWeight('Inter', peso);
  if (color) st.setForegroundColor(color);
}

function rect(slide, x, y, w, h, color, alpha) {
  const r = slide.insertShape(SlidesApp.ShapeType.RECTANGLE, P(x), P(y), P(w), P(h));
  r.getFill().setSolidFill(color, alpha === undefined ? 1 : alpha);
  r.getBorder().setTransparent();
  return r;
}

// Rectángulo con esquinas redondeadas (Slides fija el radio en ~17 % del lado corto)
function banda(slide, x, y, w, h, color) {
  const r = slide.insertShape(SlidesApp.ShapeType.ROUND_RECTANGLE, P(x), P(y), P(w), P(h));
  r.getFill().setSolidFill(color);
  r.getBorder().setTransparent();
  return r;
}

function circulo(slide, cx, cy, d, relleno, borde, grosor, alphaBorde) {
  const c = slide.insertShape(SlidesApp.ShapeType.ELLIPSE, P(cx - d / 2), P(cy - d / 2), P(d), P(d));
  if (relleno) c.getFill().setSolidFill(relleno); else c.getFill().setTransparent();
  if (borde) {
    c.getBorder().getLineFill().setSolidFill(borde, alphaBorde === undefined ? 1 : alphaBorde);
    c.getBorder().setWeight(grosor || 1);
  } else {
    c.getBorder().setTransparent();
  }
  return c;
}

function lineaRecta(slide, x1, y1, x2, y2, color, grosor, alpha) {
  const l = slide.insertLine(SlidesApp.LineCategory.STRAIGHT, P(x1), P(y1), P(x2), P(y2));
  l.getLineFill().setSolidFill(color, alpha === undefined ? 1 : alpha);
  l.setWeight(grosor);
  return l;
}

// Línea divisoria fina del sistema (40×2)
function regla(slide, x, y, color) { return rect(slide, x, y, 40, 2, color || C.navy); }

// Etiqueta con punto, en mayúsculas, como el "eyebrow" de la web
// Sobre fondo oscuro el punto va en lima, como el hero de la web (la lima nunca va sobre claro)
function etiqueta(slide, str, x, y, color, ancho, punto) {
  circulo(slide, x + 3, y + 6, 6, punto || color || C.marca);
  return texto(slide, String(str).toUpperCase(), x + 16, y, ancho || 900, 14,
    { size: 12, peso: 500, color: color || C.marca, lh: 100 });
}

// Estimación del ancho de un texto (Inter ≈ 0,56 em por carácter)
function anchoTexto(str, size) { return String(str).length * size * 0.56; }

// Píldora de estado ("Sólido", "A mejorar", "Crítico"): dos círculos + rectángulo
function pildora(slide, estado, x, y) {
  const par = ESTADO_COLOR[estado] || ['t2', 'lienzo2'];
  const h = 24, w = anchoTexto(estado, 12) + 20;
  circulo(slide, x + h / 2, y + h / 2, h, C[par[1]]);
  circulo(slide, x + w - h / 2, y + h / 2, h, C[par[1]]);
  rect(slide, x + h / 2, y, w - h, h, C[par[1]]);
  texto(slide, estado, x, y, w, h, { size: 12, peso: 500, color: C[par[0]], lh: 100, alin: 'centro', medio: true });
  return w;
}

// Número de página: lo lleva nuevaSlide, así una slide opcional (la prueba) no
// descuadra la numeración. pie() solo decide si se muestra (numero = true).
let PAGINA = 0;
function pie(slide, numero, oscura) {
  if (numero) numero = (PAGINA < 10 ? '0' : '') + PAGINA;
  texto(slide, 'ORDEN FINANCIERO · CONSULTORÍA DE GESTIÓN', MG, 676, 600, 14,
    { size: 11, color: oscura ? C.secdark : C.t3, lh: 100 });
  if (numero) texto(slide, numero, 1108, 676, 100, 14, { size: 11, color: oscura ? C.secdark : C.t3, lh: 100, alin: 'der' });
}

function fuente(slide, str) {
  texto(slide, str, MG, 640, 1136, 16, { size: 12, color: C.t3, lh: 100 });
}

// Título de la slide. Devuelve dónde va la regla: un título de dos renglones la
// corre hacia abajo (26/10: con la regla fija en 160, el segundo renglón la pisaba).
// o: x, y, ancho, size, oscura, lima (tramo del título que va en lima, solo sobre oscuro)
function titulo(slide, str, o) {
  o = o || {};
  const y = o.y || 100, ancho = o.ancho || 1136, size = o.size || 34;
  const lineas = renglones(str, ancho, size, 0.5);
  const box = texto(slide, str, o.x || MG, y, ancho, lineas * size * 1.15 + 6,
    { size: size, peso: 500, color: o.oscura ? C.blanco : C.navy, lh: 115 });
  if (o.lima && o.oscura) {
    const i = str.indexOf(o.lima);
    if (i !== -1) tramo(box, i, i + o.lima.length, null, C.lima);
  }
  return y + lineas * size * 1.15 + 21;
}

function circulosDeco(slide, oscura) {
  [[440, 1000, 420], [320, 1060, 480], [200, 1120, 540]].forEach(([d, x, y]) => {
    circulo(slide, x + d / 2, y + d / 2, d, null, oscura ? C.blanco : C.navy, 1, oscura ? 0.16 : 0.10);
  });
}

// Renglones que ocupa un texto en una caja de ancho w (px de diseño).
// em: ancho medio de un carácter. 0,55 deja aire en el cuerpo de texto; los
// títulos (Inter 500 grande) miden ~0,47 y usan 0,5.
function renglones(str, w, size, em) {
  const porRenglon = Math.max(1, Math.floor(w / (size * (em || 0.55))));
  let n = 0, actual = 0;
  String(str).split(/\s+/).forEach(p => {
    if (actual === 0) { actual = p.length; n++; }
    else if (actual + 1 + p.length <= porRenglon) actual += 1 + p.length;
    else { actual = p.length; n++; }
  });
  return Math.max(1, n);
}

// ── SLIDES ────────────────────────────────────────────────────
function slidePortada(pres, ctx) {
  const s = nuevaSlide(pres, 'marca');
  circulosDeco(s, true);

  const partes = [ctx.negocio, 'Diagnóstico de gestión', ctx.rubro].filter(Boolean);
  etiqueta(s, partes.join(' · '), MG, 72, C.soft, 820, C.lima);

  // Logo arriba a la derecha: isotipo + "ordenfinanciero." (Inter 600, punto celeste)
  try {
    s.insertImage(ISOTIPO_URL, P(980), P(60), P(36), P(36));
  } catch (err) {
    banda(s, 980, 60, 36, 36, C.marca);
    console.warn('Isotipo no disponible: ' + err);
  }
  const marca = texto(s, 'ordenfinanciero.', 1028, 64, 190, 28, { size: 22, peso: 600, color: C.blanco, lh: 100 });
  tramo(marca, 15, 16, 600, C.celeste);

  regla(s, MG, 250, C.soft);
  const tit = texto(s, 'Diagnóstico de\nsalud financiera', MG, 276, 900, 130, { size: 60, peso: 500, color: C.blanco, lh: 105 });
  tramo(tit, 15, 31, null, C.lima); // destacado en lima, como el titular de la web
  texto(s, 'Los cuatro eslabones que ordenan los números de un negocio', MG, 452, 900, 30,
    { size: 20, color: C.secdark, lh: 140 });

  lineaRecta(s, MG, 520, 832, 520, C.blanco, 1, 0.14);
  ORDEN_CADENA.forEach((n, i) => {
    const x = MG + i * 200;
    texto(s, '0' + (i + 1), x, 540, 60, 16, { size: 13, peso: 500, color: C.lima, lh: 100 });
    texto(s, NOMBRE_WEB[n], x, 562, 190, 20, { size: 15, color: C.blanco, lh: 130 });
  });

  texto(s, `MANUEL ALFANO · ORDEN FINANCIERO   ·   CONFIDENCIAL   ·   ${ctx.mesAnio.toUpperCase()}`,
    MG, 660, 900, 14, { size: 12, color: C.secdark, lh: 100 });
}

// Radar dibujado con líneas (Slides no tiene gráfico de radar).
// o: color, escala (5 textos), destacado (índice), anchoEtiqueta, oscura (sobre navy)
function dibujarRadar(s, cx, cy, r, ejes, valores, max, o) {
  const red = o.oscura ? C.blanco : C.navy, alphaRed = o.oscura ? 0.16 : 0.12;
  const n = ejes.length, niveles = 5;
  const punto = (i, radio) => {
    const a = (-90 + i * 360 / n) * Math.PI / 180;
    return [cx + radio * Math.cos(a), cy + radio * Math.sin(a)];
  };
  const segmento = (a, b, color, grosor, alpha) => {
    if (Math.hypot(b[0] - a[0], b[1] - a[1]) < 0.5) return;
    lineaRecta(s, a[0], a[1], b[0], b[1], color, grosor, alpha);
  };

  for (let k = 1; k <= niveles; k++) {
    for (let i = 0; i < n; i++) segmento(punto(i, r * k / niveles), punto(i + 1, r * k / niveles), red, 0.75, alphaRed);
  }
  for (let i = 0; i < n; i++) segmento([cx, cy], punto(i, r), red, 0.75, alphaRed);

  o.escala.forEach((v, k) => {
    texto(s, String(v), cx - 44, cy - r * (k + 1) / niveles - 7, 36, 14,
      { size: 11, color: o.oscura ? C.secdark : C.t3, lh: 100, alin: 'der' });
  });

  // o.objetivo: una segunda figura (la meta) que se dibuja debajo, en o.colorObjetivo
  const figura = (vals, color, grosor, d) => {
    const pts = vals.map((v, i) => punto(i, r * Math.max(0, Math.min(v, max)) / max));
    for (let i = 0; i < n; i++) segmento(pts[i], pts[(i + 1) % n], color, grosor);
    pts.forEach(([x, y]) => circulo(s, x, y, d, color));
  };
  if (o.objetivo) figura(o.objetivo, o.colorObjetivo, 2, 8);
  figura(valores, o.color, 2.5, 10);

  ejes.forEach((nombre, i) => {
    const [x, y] = punto(i, r);
    const w = o.anchoEtiqueta, h = 20, dest = i === o.destacado;
    const est = { size: 15, peso: dest ? 500 : 400, color: dest ? C.marca : (o.oscura ? C.blanco : C.navy), lh: 100 };
    if (Math.abs(x - cx) < 1) {
      est.alin = 'centro';
      texto(s, nombre, x - w / 2, y < cy ? y - 34 : y + 16, w, h, est);
    } else {
      const top = y > cy + 1 ? y + 8 : y - 9;
      if (x > cx) texto(s, nombre, x + 16, top, w, h, est);
      else { est.alin = 'der'; texto(s, nombre, x - 16 - w, top, w, h, est); }
    }
  });
}

// Lo que el dueño va a poder responder a los 90 días, pregunta por pregunta, en
// sus palabras (26/10, ecuación de valor: el resultado soñado dicho como lo diría
// el dueño, no como nombre de proceso). Se busca la pregunta por palabras clave.
const RESPUESTA_OBJETIVO = [
  { claves: ['cuánto te cuesta'],        objetivo: 'Sé cuánto me cuesta cada producto, con los precios de hoy' },
  { claves: ['precio de venta'],         objetivo: 'Mis precios salen de mis costos; la competencia es una referencia' },
  { claves: ['actualizás tus precios'],  objetivo: 'Cuando sube un insumo, sé qué precio tocar y cuánto' },
  { claves: ['cuánto ganó'],             objetivo: 'Sé cuánto ganó el negocio el mes pasado' },
  { claves: ['separás las finanzas'],    objetivo: 'La plata del negocio y la de casa van por separado' },
  { claves: ['cierre mensual'],          objetivo: 'Todos los meses cierro ventas, costos, gastos, impuestos y ganancia' },
  { claves: ['fin de mes'],              objetivo: 'Llego a fin de mes sabiendo con qué pago sueldos y proveedores' },
  { claves: ['gastos fuertes'],          objetivo: 'Los gastos fuertes los veo venir con semanas de anticipación' },
  { claves: ['cobros y pagos'],          objetivo: 'Sé cuándo entra y cuándo sale la plata, y lo acomodo antes' },
  { claves: ['revisás los números'],     objetivo: 'Reviso los números del negocio todos los meses' },
  { claves: ['indicador'],               objetivo: 'Sigo pocos números clave: ventas, margen y punto de equilibrio' },
  { claves: ['decisiones de inversión'], objetivo: 'Antes de invertir o contratar, miro los números' }
];
function respuestaObjetivo(pregunta) {
  const p = String(pregunta).toLowerCase();
  const r = RESPUESTA_OBJETIVO.find(o => o.claves.every(c => p.indexOf(c) !== -1));
  return r ? r.objetivo : null;
}

// Fechas del primer cierre (pedido de Manu 14/09): el título nombra el mes que
// todavía no empezó; el cierre se hace alrededor del 10 del mes siguiente
// (sábado o domingo → lunes).
function primerCierre() {
  const hoy = new Date();
  const mes = mesEs(new Date(hoy.getFullYear(), hoy.getMonth() + 1, 15));
  const cierre = new Date(hoy.getFullYear(), hoy.getMonth() + 2, 10);
  if (cierre.getDay() === 6) cierre.setDate(12);
  if (cierre.getDay() === 0) cierre.setDate(11);
  return { mes: mes, fecha: `${cierre.getDate()} de ${mesEs(cierre)}` };
}

// Hoy contra los 90 días (26/10, reemplaza al radar de los cinco procesos): la
// misma rueda del dueño con la meta del programa encima, y sus respuestas más
// flojas al lado de lo que va a poder responder. Va después de los hallazgos.
function slideBrecha(pres, ctx) {
  const s = nuevaSlide(pres, 'navy');
  circulosDeco(s, true);
  etiqueta(s, 'Hoy y a los 90 días', MG, 72, C.soft, null, C.lima);
  regla(s, MG, titulo(s, 'Las mismas preguntas, con otras respuestas en 90 días',
    { oscura: true, lima: 'en 90 días' }), C.lima);

  // Rueda: hoy (celeste) y la meta del programa (lima)
  dibujarRadar(s, 330, 405, 118, ORDEN_CADENA.map(n => NOMBRE_WEB[n]),
    ORDEN_CADENA.map(n => ctx.porNombre[n].score10), 10,
    { color: C.soft, objetivo: ORDEN_CADENA.map(() => 10), colorObjetivo: C.lima,
      escala: [2, 4, 6, 8, 10], anchoEtiqueta: 180, destacado: -1, oscura: true });
  [[C.soft, 'Hoy, según el test'], [C.lima, 'Objetivo del programa']].forEach(([color, t], i) => {
    const x = MG + 34 + i * 230;
    lineaRecta(s, x, 604, x + 22, 604, color, 2.5);
    texto(s, t, x + 32, 596, 190, 16, { size: 13, color: C.secdark, lh: 100 });
  });

  // Las respuestas más flojas (hasta 3): menor puntaje primero; a igual puntaje,
  // el eslabón más flojo primero
  const orden = ctx.ordenados.map(e => e.nombre);
  const filas = [];
  ctx.ordenados.forEach(es => es.respuestas.forEach(r => {
    const obj = respuestaObjetivo(r.pregunta);
    if (obj && r.score < 3) filas.push({ r: r, obj: obj, rango: orden.indexOf(es.nombre) });
  }));
  filas.sort((a, b) => (a.r.score - b.r.score) || (a.rango - b.rango));

  const X = 680, HX = X, HW = 236, OX = 944, OW = 264;
  etiqueta(s, 'Hoy', HX, 200, C.soft, HW, C.soft);
  etiqueta(s, 'A los 90 días', OX, 200, C.lima, OW, C.lima);
  let y = 226;
  if (!filas.length) {
    lineaRecta(s, X, y, 1208, y, C.blanco, 1, 0.14);
    texto(s, 'Las respuestas de hoy ya son buenas. El programa pone los números que las respaldan, mes a mes.',
      X, y + 20, 528, 60, { size: 17, color: C.blanco, lh: 140 });
  }
  // Entran las filas que caben antes de 572 (debajo va el primer resultado)
  let puestas = 0;
  filas.slice(0, 3).forEach(f => {
    const hP = renglones(f.r.pregunta, 528, 13) * altoRenglon(13, 135);
    const hR = Math.max(renglones('"' + f.r.respuesta + '"', HW, 16), renglones(f.obj, OW, 16)) * altoRenglon(16, 135);
    if (puestas && y + 22 + hP + hR + 16 > 572) return;
    puestas++;
    lineaRecta(s, X, y, 1208, y, C.blanco, 1, 0.14);
    texto(s, f.r.pregunta, X, y + 14, 528, hP, { size: 13, color: C.secdark, lh: 135 });
    texto(s, '"' + f.r.respuesta + '"', HX, y + 22 + hP, HW, hR, { size: 16, color: C.soft, lh: 135, italic: true });
    texto(s, f.obj, OX, y + 22 + hP, OW, hR, { size: 16, color: C.blanco, lh: 135 });
    y += 22 + hP + hR + 16;
  });
  lineaRecta(s, X, y, 1208, y, C.blanco, 1, 0.14);

  // La primera victoria, con fecha
  const pc = primerCierre();
  const frase = `Primer resultado: el cierre de ${pc.mes}, con la ganancia del negocio, el ${pc.fecha}.`;
  const t = texto(s, frase, X, 590, 528, 46, { size: 15, color: C.blanco, lh: 140 });
  tramo(t, 0, 17, 500, C.lima);

  pie(s, true, true);
  notasDeLlamada(s, null, PREGUNTA_CIERRE);
}

function slideRueda(pres, ctx) {
  const s = nuevaSlide(pres);
  const debil = ctx.ordenados[0];
  etiqueta(s, 'Resultado del test', MG, 72);
  const yR = titulo(s, `${debil.web} es el eslabón más flojo, con ${num(debil.score10)} de 10`);
  regla(s, MG, yR);
  // 26/10: el alcance (antes una slide propia, con dos tercios vacíos) va acá
  texto(s, 'El test mide cómo se gestiona el negocio, no cuánto gana: el número dice dónde mirar.',
    MG, yR + 20, 600, 48, { size: 16, color: C.t2, lh: 140 });

  dibujarRadar(s, 390, 415, 125, ORDEN_CADENA.map(n => NOMBRE_WEB[n]),
    ORDEN_CADENA.map(n => ctx.porNombre[n].score10), 10,
    { color: C.navy, escala: [2, 4, 6, 8, 10], anchoEtiqueta: 220, destacado: ORDEN_CADENA.indexOf(debil.nombre) });

  // Panel derecho: puntaje total y una fila por eslabón, de mayor a menor
  const X = 730;
  texto(s, num(ctx.score10), X, 196, 130, 64, { size: 64, peso: 300, color: C.navy, lh: 100 });
  texto(s, `de 10 · puntaje total\n${ctx.data.score} de ${ctx.data.maxScore} puntos`,
    X + anchoTexto(num(ctx.score10), 64) * 0.95 + 14, 214, 260, 44, { size: 16, color: C.t2, lh: 130 });
  lineaRecta(s, X, 290, 1208, 290, C.navy, 1, 0.12);

  let y = 290;
  ctx.ordenados.slice().reverse().forEach(es => {
    const esDebil = es === debil;
    texto(s, es.web, X, y + 19, 196, 20, { size: 16, peso: esDebil ? 500 : 400, color: esDebil ? C.marca : C.navy, lh: 100 });
    rect(s, 938, y + 25, 124, 8, C.lienzo2);
    rect(s, 938, y + 25, Math.max(2, 124 * es.score10 / 10), 8, esDebil ? C.marca : C.azulclaro);
    texto(s, num(es.score10), 1062, y + 19, 48, 20, { size: 16, color: C.navy, lh: 100, alin: 'der' });
    pildora(s, es.estado, 1208 - (anchoTexto(es.estado, 12) + 20), y + 17);
    y += 57;
    lineaRecta(s, X, y, 1208, y, C.navy, 1, 0.12);
  });

  // Empate en el más flojo: se explica por qué queda primero
  const segundo = ctx.ordenados[1];
  if (segundo.score10 === debil.score10) {
    const cA = ctx.cantidadC(debil), cB = ctx.cantidadC(segundo);
    const motivo = cA !== cB
      ? `tiene más respuestas en el mínimo: ${cA} contra ${cB}.`
      : 'va antes en la cadena.';
    texto(s, `Empata en ${num(debil.score10)} con ${segundo.web}. Queda como el más flojo porque ${motivo}`,
      X, y + 14, 478, 44, { size: 14, color: C.t3, lh: 150 });
  }

  fuente(s, `${ctx.fuente} · Escala 0 a 10`);
  pie(s, true);
}

function tituloHallazgo(es, esElMasSolido) {
  if (esElMasSolido) return `${es.web} es lo más sólido del negocio, con ${num(es.score10)} de 10`;
  const minimos = es.respuestas.filter(r => r.score === 1).length;
  if (minimos === es.respuestas.length && minimos > 0)
    return `Las ${minimos === 3 ? 'tres' : minimos} preguntas de ${es.web} dieron el mínimo de la escala`;
  if (minimos >= 2)
    return `${minimos} de las ${es.respuestas.length} preguntas de ${es.web} dieron el mínimo`;
  return `${es.web} quedó en ${num(es.score10)} de 10`;
}

// Tabla de respuestas de un eslabón: pregunta · respuesta del dueño · puntaje,
// entre TX y el margen derecho. Devuelve dónde termina.
function tablaRespuestas(s, es, TX, top) {
  const R = 1208, PW = Math.round((R - TX - 120) * 0.5), RX = TX + PW + 28, RW = R - 112 - RX;
  etiqueta(s, 'Pregunta', TX, top, C.t3, PW);
  etiqueta(s, 'Respuesta del dueño', RX, top, C.t3, RW);
  etiqueta(s, 'Puntaje', R - 84, top, C.t3, 70);

  const filas = es.respuestas;
  const medir = (size, pad) => filas.reduce((t, r) =>
    t + Math.max(renglones(r.pregunta, PW, size), renglones('"' + r.respuesta + '"', RW, size - 1)) * size * 1.45 + 2 * pad, 0);
  let size = 17, pad = 18;
  if (top + 22 + medir(size, pad) > 620) { size = 15; pad = 12; }

  let y = top + 22;
  if (!filas.length) {
    texto(s, 'Sin respuestas registradas para este eslabón.', TX, y + 18, R - TX, 24, { size: 16, color: C.t3 });
    y += 60;
  }
  filas.forEach(r => {
    const lineas = Math.max(renglones(r.pregunta, PW, size), renglones('"' + r.respuesta + '"', RW, size - 1));
    const alto = lineas * size * 1.45 + 2 * pad;
    lineaRecta(s, TX, y, R, y, C.navy, 1, 0.12);
    texto(s, r.pregunta, TX, y + pad, PW, alto - 2 * pad, { size: size, color: C.navy, lh: 145 });
    texto(s, '"' + r.respuesta + '"', RX, y + pad, RW, alto - 2 * pad, { size: size - 1, color: C.t2, lh: 145, italic: true });
    for (let k = 0; k < 3; k++) {
      circulo(s, R - 87 + k * 14, y + pad + 10, 10, k < r.score ? C.marca : C.blanco, C.marca, 1.5);
    }
    texto(s, `${r.score} de 3`, R - 56, y + pad + 3, 56, 16, { size: 14, color: C.t2, lh: 100, alin: 'der' });
    y += alto;
  });
  lineaRecta(s, TX, y, R, y, C.navy, 1, 0.12);
  return y;
}

// Un eslabón por slide. i = 0 el más flojo … 3 el más sólido.
// 26/10: el más flojo tiene diseño propio (panel navy con el puntaje en lima);
// en los otros, el número grande lleva el color de su estado.
function slideHallazgo(pres, ctx, es, i) {
  if (i === 0) return slideHallazgoPrincipal(pres, ctx, es);
  const s = nuevaSlide(pres);
  etiqueta(s, `Hallazgo ${i + 1} · ${es.web}`, MG, 72);
  const yRegla = titulo(s, tituloHallazgo(es, i === 3));
  regla(s, MG, yRegla);

  const top = Math.max(212, yRegla + 52);
  const y = tablaRespuestas(s, es, 372, top);

  // Bloque del puntaje, centrado en el alto de la tabla
  const extra = i === 3 ? 'Es el eslabón más sólido del negocio.' : '';
  const color = C[(ESTADO_COLOR[es.estado] || ['navy'])[0]];
  // 14/09: en Slides el número de 88 px ocupa ~105 px de alto (interlineado mínimo 100 %)
  const altoBloque = 105 + 8 + 20 + 16 + 24 + (extra ? 22 + 46 : 0);
  const b = Math.max(top, top + (y - top - altoBloque) / 2);
  texto(s, num(es.score10), MG, b, 250, 105, { size: 88, peso: 300, color: color, lh: 100 });
  texto(s, `de 10 en ${es.web}`, MG, b + 113, 260, 20, { size: 16, color: C.t2, lh: 120 });
  pildora(s, es.estado, MG, b + 149);
  if (extra) texto(s, extra, MG, b + 195, 250, 46, { size: 15, color: C.t2, lh: 150 });

  fuente(s, ctx.fuente);
  pie(s, true);
  notasDeLlamada(s, es);
}

// El hallazgo principal: panel navy a la izquierda (como el hero de la web) con
// el puntaje en lima; título y respuestas a la derecha.
function slideHallazgoPrincipal(pres, ctx, es) {
  const s = nuevaSlide(pres);
  const PANEL = 404, X = PANEL + 56;
  rect(s, 0, 0, PANEL, 720, C.navy);
  [[300, 250, 600], [200, 300, 650]].forEach(([d, cx, cy]) =>
    circulo(s, cx, cy, d, null, C.blanco, 1, 0.12));

  etiqueta(s, `Hallazgo 1 · ${es.web}`, MG, 72, C.soft, PANEL - MG - 24, C.lima);
  // Slides no baja el interlineado de 100 %: el número de 120 px ocupa ~145 de alto
  texto(s, num(es.score10), MG, 200, 300, 145, { size: 120, peso: 300, color: C.lima, lh: 100 });
  texto(s, `de 10 en ${es.web}`, MG, 352, PANEL - MG - 24, 24, { size: 18, color: C.blanco, lh: 120 });
  pildora(s, es.estado, MG, 390);
  texto(s, 'Es el eslabón más flojo del negocio.', MG, 436, PANEL - MG - 32, 50,
    { size: 17, peso: 500, color: C.blanco, lh: 140 });

  const yRegla = titulo(s, tituloHallazgo(es, false), { x: X, ancho: 1208 - X, size: 30 });
  regla(s, X, yRegla);
  tablaRespuestas(s, es, X, Math.max(212, yRegla + 48));

  texto(s, ctx.fuente, X, 640, 1208 - X, 16, { size: 12, color: C.t3, lh: 100 });
  texto(s, 'ORDEN FINANCIERO · CONSULTORÍA DE GESTIÓN', MG, 676, PANEL - MG, 14, { size: 11, color: C.secdark, lh: 100 });
  texto(s, (PAGINA < 10 ? '0' : '') + PAGINA, 1108, 676, 100, 14, { size: 11, color: C.t3, lh: 100, alin: 'der' });
  notasDeLlamada(s, es);
}

function slidePrioridades(pres, ctx) {
  const s = nuevaSlide(pres);
  const debil = ctx.ordenados[0];
  etiqueta(s, 'Prioridades', MG, 72);
  regla(s, MG, titulo(s, 'El orden lo define la cadena, no la urgencia'));

  lineaRecta(s, MG, 269, 1208, 269, C.navy, 1, 0.12);
  ORDEN_CADENA.forEach((nombre, i) => {
    const es = ctx.porNombre[nombre], x = MG + i * 290, esDebil = es === debil;
    texto(s, '0' + (i + 1), x, 200, 90, 42, { size: 40, peso: 300, color: C.marca, lh: 100 });
    circulo(s, x + 5.5, 269, 11, esDebil ? C.marca : C.blanco, C.marca, 2);
    etiqueta(s, `Mes ${MES_ESLABON[nombre]}`, x, 296, C.t3, 200);
    texto(s, es.web, x, 318, 266, 26, { size: 21, peso: 500, color: esDebil ? C.marca : C.navy, lh: 115 });
    texto(s, `${num(es.score10)} de 10`, x, 355, 80, 20, { size: 15, color: C.t2, lh: 100 });
    pildora(s, es.estado, x + 74, 352);
    texto(s, PLAN_ESLABON[nombre], x, 392, 266, 100, { size: 15, color: C.t2, lh: 155 });
  });

  const nota = NOTA_PRIORIDAD[debil.nombre];
  banda(s, MG, 516, 1136, 92, C.lienzo);
  const caja = texto(s, nota[0] + ' ' + nota[1], 100, 536, 1080, 52, { size: 17, color: C.t2, lh: 150 });
  tramo(caja, 0, nota[0].length, 400, C.navy);

  fuente(s, `Puntajes: autodiagnóstico Orden Financiero · ${ctx.fecha} · Respuestas del dueño, sin verificación documental`);
  pie(s, true);
}

// Acompañamiento: mismo texto que la web (rama staging-acompanamiento, 14/09)
const PROGRAMA_INCLUYE = [
  'Disponible 24/7 para consultas y dudas: lo que necesites se ve en el día',
  'Una reunión por semana durante los tres meses',
  'Una de las reuniones de cada mes es de cierre: se revisa el resultado y se toman decisiones',
  'Diseño y puesta en marcha del sistema de registro con tablero de control'
];

// Quién hace qué (26/10, ecuación de valor: baja el esfuerzo percibido sin
// prometer de más). Corrección del dueño (26/10): los costos los arma el
// dueño; Orden Financiero arma los sistemas y lo acompaña en el armado.
const ESFUERZO = [
  ['Lo que hacés vos', ['Una reunión por semana', 'Pasar ventas, compras y pagos', 'Armar tus costos y tomar las decisiones']],
  ['Lo que hacemos nosotros', ['Armar los sistemas de registro y el tablero', 'Acompañarte a armar costos, cierre y caja', 'Explicarte cada número hasta que lo manejes solo']]
];

function slidePrograma(pres, ctx) {
  const s = nuevaSlide(pres, 'navy');
  // sin círculos: en esta slide cruzaban el texto de la columna derecha

  etiqueta(s, 'El programa', MG, 72, C.soft, null, C.lima);
  regla(s, MG, titulo(s, 'Tres meses trabajando sobre los números del negocio',
    { oscura: true, lima: 'Tres meses' }), C.lima);

  // Columna izquierda: duración y quién acompaña (credenciales iguales a la web)
  // Slides no baja el interlineado de 100 %: el número de 120 px ocupa ~145 de alto
  texto(s, '3', MG, 200, 200, 145, { size: 120, peso: 300, color: C.lima, lh: 100 });
  texto(s, 'meses de duración', MG, 354, 300, 28, { size: 22, color: C.blanco, lh: 120 });
  lineaRecta(s, MG, 418, 392, 418, C.blanco, 1, 0.14);
  etiqueta(s, 'Te acompaña', MG, 440, C.soft, 300, C.lima);
  texto(s, 'Manuel Alfano', MG, 464, 320, 24, { size: 20, peso: 500, color: C.blanco, lh: 120 });
  texto(s, 'Más de 12 años en la gastronomía con negocio propio. Licenciado en Administración (UNLP).',
    MG, 496, 320, 72, { size: 15, color: C.secdark, lh: 145 });

  // Columna derecha: lo que incluye
  const X = 480, W = 728;
  let y = 206;
  PROGRAMA_INCLUYE.forEach((t, i) => {
    const alto = renglones(t, W - 40, 17) * altoRenglon(17, 130) + 24;
    lineaRecta(s, X, y, X + W, y, C.blanco, 1, 0.14);
    texto(s, '0' + (i + 1), X, y + 14, 40, 16, { size: 14, peso: 500, color: C.lima, lh: 100 });
    texto(s, t, X + 40, y + 12, W - 40, alto - 24, { size: 17, color: C.blanco, lh: 130 });
    y += alto;
  });
  lineaRecta(s, X, y, X + W, y, C.blanco, 1, 0.14);

  // Quién hace qué, en dos columnas
  const yE = y + 26, CW = (W - 32) / 2;
  ESFUERZO.forEach(([tit, items], k) => {
    const x = X + k * (CW + 32);
    texto(s, tit, x, yE, CW, 20, { size: 15, peso: 500, color: k ? C.lima : C.blanco, lh: 100 });
    let yi = yE + 30;
    items.forEach(it => {
      const h = renglones(it, CW - 16, 15, 0.5) * altoRenglon(15, 135);
      texto(s, '–', x, yi, 12, 18, { size: 15, color: k ? C.lima : C.secdark, lh: 135 });
      texto(s, it, x + 16, yi, CW - 16, h, { size: 15, color: C.secdark, lh: 135 });
      yi += h + 4;
    });
    if (yi > 656) console.warn('Programa: "' + tit + '" pisa el pie (' + Math.round(yi) + ')');
  });

  pie(s, true, true);
}

// ── PRUEBA: UN CIERRE REAL (26/10) ─────────────────────────────
// Ecuación de valor: sube la probabilidad percibida con un cierre de verdad.
// Datos de la planilla de cierre de una panadería cliente (Drive, carpeta de
// cierres del cliente, hojas EERR y CMV real), agosto 2026. Sin el nombre del
// negocio (decisión del dueño, 26/10: montos y porcentajes visibles).
// Ganancia neta con costo real = 21.820.117 − (18.546.683 − 12.487.322).
// No sale hasta que el dueño confirme los textos (confirmado: true).
const PRUEBA = {
  confirmado: false,
  titulo: 'Agosto parecía ganar el 33,4 % de las ventas; con el costo real de la mercadería, ganó el 24,1 %',
  columnas: ['Con las compras del mes', 'Con el costo real'],
  filas: [
    ['Ventas', 65266383, 65266383],
    ['Costo de la mercadería', 12487322, 18546683],
    ['Ganancia neta', 21820117, 15760756]
  ],
  negocio: 'Panadería con local y reparto, en el programa',
  periodo: 'Agosto 2026',
  fuente: 'Planilla de cierre del negocio: ventas, compras, sueldos y gastos del mes, y el costo real de la mercadería',
  hallazgo: 'En julio se compró harina por $13,7 M y en agosto por $0,9 M. Mirando solo las compras, agosto parecía 9,3 puntos mejor de lo que fue.'
};

function millones(v) { return '$' + num((v / 1e6).toFixed(1)) + ' M'; }
function porcentaje(v, base) { return num((v / base * 100).toFixed(1)) + ' %'; }

function slidePrueba(pres, ctx) {
  if (!PRUEBA.confirmado) return;
  const s = nuevaSlide(pres);
  etiqueta(s, 'Un cierre real', MG, 72);
  const yR = titulo(s, PRUEBA.titulo, { size: 30 });
  regla(s, MG, yR);

  // Tabla: concepto · con compras · con costo real (columna resaltada)
  const top = Math.max(232, yR + 52);
  const LX = MG, AX = 380, AW = 180, BX = 588, BW = 196, ALTO = 84;
  const ventas = PRUEBA.filas[0][1];
  const fin = top + 44 + PRUEBA.filas.length * ALTO;
  banda(s, BX - 8, top - 16, BW + 16, fin - top + 32, C.seleccion);
  texto(s, PRUEBA.columnas[0], AX, top, AW, 16, { size: 13, peso: 500, color: C.t3, lh: 100, alin: 'der' });
  texto(s, PRUEBA.columnas[1], BX, top, BW - 16, 16, { size: 13, peso: 500, color: C.marca, lh: 100, alin: 'der' });

  PRUEBA.filas.forEach(([nombre, a, b], i) => {
    const y = top + 44 + i * ALTO, total = i === PRUEBA.filas.length - 1;
    lineaRecta(s, LX, y, BX + BW, y, C.navy, total ? 1.5 : 1, total ? 0.5 : 0.12);
    const size = total ? 26 : 22, peso = total ? 500 : 400;
    texto(s, nombre, LX, y + 20, 300, 24, { size: total ? 18 : 17, peso: peso, color: C.navy, lh: 100 });
    texto(s, millones(a), AX, y + 16, AW, 30, { size: size, peso: peso, color: total ? C.t2 : C.navy, lh: 100, alin: 'der' });
    texto(s, millones(b), BX, y + 16, BW - 16, 30, { size: size, peso: peso, color: total ? C.marca : C.navy, lh: 100, alin: 'der' });
    if (i > 0) {
      texto(s, porcentaje(a, ventas) + ' de las ventas', AX, y + 52, AW, 16, { size: 13, color: C.t3, lh: 100, alin: 'der' });
      texto(s, porcentaje(b, ventas) + ' de las ventas', BX, y + 52, BW - 16, 16, { size: 13, color: total ? C.marca : C.t3, lh: 100, alin: 'der' });
    }
  });

  // Contexto, a la derecha
  const X = 836, W = 372;
  let y = top - 4;
  [['Negocio', PRUEBA.negocio], ['Período', PRUEBA.periodo], ['De dónde salen los datos', PRUEBA.fuente]].forEach(([t, v]) => {
    etiqueta(s, t, X, y, C.t3, W);
    const hv = renglones(v, W, 15, 0.5) * altoRenglon(15, 140);
    texto(s, v, X, y + 22, W, hv, { size: 15, color: C.navy, lh: 140 });
    y += 22 + hv + 20;
  });
  lineaRecta(s, X, y, X + W, y, C.navy, 1, 0.12);
  etiqueta(s, 'Lo que mostró el cierre', X, y + 20, C.marca, W);
  const hh = renglones(PRUEBA.hallazgo, W, 16, 0.5) * altoRenglon(16, 140);
  texto(s, PRUEBA.hallazgo, X, y + 42, W, hh, { size: 16, peso: 500, color: C.navy, lh: 140 });
  if (y + 42 + hh > 640) console.warn('Prueba: el hallazgo pisa la fuente (' + Math.round(y + 42 + hh) + ')');

  texto(s, 'Planilla de cierre del negocio · agosto 2026 · % sobre las ventas del mes', MG, 640, 712, 16, { size: 12, color: C.t3, lh: 100 });
  pie(s, true);
}

// Sale de la sección "El programa" de la web, condensado (26/10, pedido del dueño:
// la slide tenía ~200 palabras). Tres ítems por mes; "Datos con los que se
// trabaja" ya no va: lo que pone el dueño está en la slide del programa.
// Si cambia la web, revisar acá.
const PROGRAMA_MESES = [
  { eyebrow: 'Mes 1 · Diagnóstico y base', titulo: 'Poner los números arriba de la mesa',
    items: ['Los costos del negocio, producto por producto', 'Por dónde se escapa la rentabilidad', 'Primer tablero con los números del mes'],
    modulos: 'Registro · Resultado · Costeo · Tablero · Bitácora' },
  { eyebrow: 'Mes 2 · Orden y sistema', titulo: 'Que la plata del negocio se vea y se anticipe',
    items: ['Flujo de caja en marcha', 'Plata del negocio y de casa, separadas', 'El precio correcto de cada producto'],
    modulos: 'Agenda · Insumos · Costeo' },
  { eyebrow: 'Mes 3 · Control y autonomía', titulo: 'El dueño maneja sus propios números',
    items: ['Decisiones con datos reales', 'La rentabilidad de los próximos meses, planificada', 'Independencia total del sistema'],
    modulos: 'Hoja de ruta' }
];

// Alto de un renglón en Slides: el interlineado se aplica sobre ~1,2 em.
function altoRenglon(size, lh) { return size * 1.2 * lh / 100; }

// 26/10: en navy con los títulos de mes en lima, como la sección "El programa"
// de la web. Condensada: tres columnas con título, tres ítems y los módulos, y
// el cupo en una línea. Las alturas salen de altoRenglon.
function slideTresMeses(pres, ctx) {
  const s = nuevaSlide(pres, 'navy');
  circulosDeco(s, true);
  etiqueta(s, 'El programa', MG, 72, C.soft, null, C.lima);
  regla(s, MG, titulo(s, 'Del diagnóstico al negocio ordenado, en tres meses',
    { oscura: true, lima: 'negocio ordenado' }), C.lima);

  const W = (1136 - 64) / 3;
  const altoTit = Math.max.apply(null, PROGRAMA_MESES.map(m => renglones(m.titulo, W, 22, 0.5))) * altoRenglon(22, 120);
  let yFin = 0;
  PROGRAMA_MESES.forEach((m, i) => {
    const x = MG + i * (W + 32);
    lineaRecta(s, x, 200, x + W, 200, C.blanco, 1, 0.16);
    etiqueta(s, m.eyebrow, x, 222, C.soft, W - 16, C.lima);
    texto(s, m.titulo, x, 250, W, altoTit, { size: 22, peso: 500, color: C.lima, lh: 120 });
    let y = 250 + altoTit + 20;
    m.items.forEach(it => {
      const h = renglones(it, W - 20, 16) * altoRenglon(16, 135);
      texto(s, '–', x, y, 14, 20, { size: 16, color: C.lima, lh: 135 });
      texto(s, it, x + 20, y, W - 20, h, { size: 16, color: C.blanco, lh: 135 });
      y += h + 10;
    });
    yFin = Math.max(yFin, y);
  });

  // Módulos: todas las columnas a la misma altura
  const yMod = yFin + 14;
  PROGRAMA_MESES.forEach((m, i) => {
    const x = MG + i * (W + 32);
    lineaRecta(s, x, yMod, x + W, yMod, C.blanco, 1, 0.16);
    texto(s, 'Módulos que quedan', x, yMod + 16, W, 14, { size: 12, peso: 500, color: C.soft, lh: 100 });
    texto(s, m.modulos, x, yMod + 38, W, 44, { size: 15, color: C.blanco, lh: 135 });
  });

  // El cupo, en una línea (el texto largo está en la web)
  const yCupo = Math.max(yMod + 110, 590);
  const cupo = texto(s, 'Máximo 3 negocios nuevos por mes: es lo que permite sostener el acompañamiento 1 a 1 con cada cliente.',
    MG, yCupo, 1136, 24, { size: 16, color: C.secdark, lh: 120 });
  tramo(cupo, 0, 32, 500, C.lima);
  if (yCupo + 24 > 660) console.warn('Tres meses: el cupo pisa el pie');

  pie(s, true, true);
}

// La inversión (26/10, pedido de Manu): base USD 1.900 y el mismo recargo que
// tenía su presentación de Canva (USD 1.500 → 2 pagos +10 %, 3 pagos +20 %).
// Va antes del cierre, donde está la garantía. El pago único lleva el foco
// ("Mejor precio" y el ahorro contra 3 pagos): informa, no adorna.
const PRECIO_BASE = 1900;
const OPCIONES_PAGO = [
  { pagos: 1, recargo: 0,    nombre: 'Un pago' },
  { pagos: 2, recargo: 0.10, nombre: 'Dos pagos' },
  { pagos: 3, recargo: 0.20, nombre: 'Tres pagos' }
];
function usd(v) { return 'USD ' + String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }

// Píldora lima con texto navy (dos círculos + rectángulo, como pildora())
function pildoraLima(slide, str, x, y) {
  const h = 26, w = anchoTexto(str, 12) + 24;
  circulo(slide, x + h / 2, y + h / 2, h, C.lima);
  circulo(slide, x + w - h / 2, y + h / 2, h, C.lima);
  rect(slide, x + h / 2, y, w - h, h, C.lima);
  texto(slide, str, x, y, w, h, { size: 12, peso: 500, color: C.navy, lh: 100, alin: 'centro', medio: true });
  return w;
}

function slideInversion(pres, ctx) {
  const s = nuevaSlide(pres, 'navy');
  circulosDeco(s, true);
  etiqueta(s, 'La inversión', MG, 72, C.soft, null, C.lima);
  regla(s, MG, titulo(s, 'Ordená los números de tu negocio en 90 días',
    { oscura: true, lima: '90 días' }), C.lima);

  const W = (1136 - 64) / 3, top = 236, alto = 280;
  const totalMax = PRECIO_BASE * (1 + OPCIONES_PAGO[OPCIONES_PAGO.length - 1].recargo);
  OPCIONES_PAGO.forEach((op, i) => {
    const x = MG + i * (W + 32);
    const total = PRECIO_BASE * (1 + op.recargo);
    const cuota = total / op.pagos;
    const foco = i === 0;
    rect(s, x, top, W, alto, C.navy2);
    rect(s, x, top, W, foco ? 4 : 3, foco ? C.lima : C.blanco, foco ? 1 : 0.16);
    texto(s, op.nombre, x + 32, top + 36, W - 64, 24, { size: 20, peso: 500, color: C.blanco, lh: 100 });
    if (foco) pildoraLima(s, 'Mejor precio', x + W - 32 - (anchoTexto('Mejor precio', 12) + 24), top + 33);
    texto(s, usd(cuota), x + 32, top + 84, W - 64, 52,
      { size: 44, peso: 500, color: C.lima, lh: 100 });
    texto(s, foco ? `Ahorrás ${usd(totalMax - total)} contra ${OPCIONES_PAGO.length} pagos` : 'cada uno',
      x + 32, top + 146, W - 64, 20, { size: 16, color: foco ? C.blanco : C.secdark, lh: 100 });
    lineaRecta(s, x + 32, top + 196, x + W - 32, top + 196, C.blanco, 1, 0.16);
    const final = texto(s, `Precio final ${usd(total)}`, x + 32, top + 220, W - 64, 20,
      { size: 17, color: C.secdark, lh: 100 });
    tramo(final, 13, 13 + usd(total).length, 500, C.blanco);
  });

  // Lo que se lleva el dueño, pegado al precio; la garantía en la slide que sigue
  texto(s, 'Tres meses de acompañamiento 1 a 1 para saber cuánto ganás, a dónde va cada peso y qué precio poner.',
    MG, 552, 1136, 24, { size: 17, color: C.blanco, lh: 120 });
  const gar = texto(s, 'Con garantía: la ves en la página que sigue.', MG, 584, 1136, 24, { size: 17, color: C.secdark, lh: 120 });
  tramo(gar, 0, 12, 500, C.lima);

  pie(s, true, true);
}

function slideCierre(pres, ctx) {
  const s = nuevaSlide(pres, 'marca');
  circulosDeco(s, true);
  etiqueta(s, 'Próximos pasos', MG, 72, C.soft, null, C.lima);
  regla(s, MG, 100, C.soft);

  // El título nombra el mes siguiente, el que todavía no empezó (pedido de Manu 14/09).
  const pc = primerCierre();
  const nombreMes = pc.mes;
  const tit = texto(s, `Cerrar ${nombreMes} con un número de ganancia`, MG, 128, 1136, 50,
    { size: 44, peso: 500, color: C.blanco, lh: 110 });
  tramo(tit, 7, 7 + nombreMes.length, null, C.lima);
  const fechaCierre = pc.fecha;

  // Responsables: siempre los dos (pedido de Manu 14/09)
  const responsable = 'Manuel y dueño/a de negocio';
  const pasos = [
    ['Abrir la cuenta del negocio separada de la personal', responsable, 'Esta semana'],
    ['Crear sistemas de registro y acceso a la data real', responsable, viernes(2)],
    ['Primer cierre mensual y toma de decisiones', responsable, fechaCierre]
  ];
  let y = 270;
  pasos.forEach((p, i) => {
    lineaRecta(s, MG, y, 1080, y, C.blanco, 1, 0.14);
    circulo(s, MG + 18, y + 38, 36, null, C.lima, 1.5);
    texto(s, String(i + 1), MG, y + 30, 36, 16, { size: 15, peso: 500, color: C.lima, lh: 100, alin: 'centro' });
    texto(s, p[0], 136, y + 27, 488, 24, { size: 19, color: C.blanco, lh: 130 });
    texto(s, p[1], 624, y + 30, 240, 18, { size: 15, color: C.secdark, lh: 100 });
    texto(s, p[2], 864, y + 30, 216, 18, { size: 15, color: C.blanco, lh: 100, alin: 'der' });
    y += 76;
  });
  lineaRecta(s, MG, y, 1080, y, C.blanco, 1, 0.14);

  // La garantía va acá, al lado de la decisión (26/10, ecuación de valor: baja el
  // riesgo de decir que sí). Mismo texto que la web.
  etiqueta(s, 'Garantía simple', MG, y + 44, C.lima, 400, C.lima);
  texto(s, 'Si en 90 días no sabés exactamente a dónde va a parar cada peso que factura tu negocio, seguimos trabajando sin costo hasta que lo sepas.',
    MG, y + 68, 900, 56, { size: 18, color: C.blanco, lh: 140 });

  texto(s, 'MANUEL ALFANO · MANUEL@ORDENFINANCIERO.COM · ORDENFINANCIERO.COM',
    MG, 660, 900, 14, { size: 12, color: C.secdark, lh: 100 });
}

// ── NOTAS Y FECHAS ────────────────────────────────────────────
// Notas del orador (26/10): las contradicciones entre respuestas y una pregunta
// para que el dueño le ponga número a lo que le cuesta seguir igual. No van al
// slide: el costo lo dice el dueño en la llamada, con sus palabras.
const PREGUNTA_COSTO = {
  'Costos y Precios': 'La última vez que subió un insumo, ¿cuántos días tardaste en tocar el precio? Esos días se vendió con el margen viejo: ¿cuánto vendés por día?',
  'Resultado Económico': 'Si te pregunto cuánto ganó el negocio el mes pasado, ¿qué número me das? ¿Cuántos meses llevás sin saberlo con certeza?',
  'Cash Flow': 'En el último año, ¿cuántas veces tuviste que poner plata tuya, pedir un adelanto o atrasar un pago? ¿Cuánto te costó cada vez?',
  'Indicadores de Gestión': '¿Cuál fue la última decisión grande (contratar, comprar un equipo, cambiar el horario)? ¿Con qué número la tomaste y cómo supiste si salió bien?'
};
const PREGUNTA_CIERRE = 'Si dentro de seis meses el negocio sigue igual que hoy, ¿qué es lo que más te preocupa que pase?';

function notasDeLlamada(slide, es, preguntaExtra) {
  const partes = [];
  if (es) {
    const hallados = [];
    CONTRADICCIONES.forEach(c => {
      const ra = es.respuestas.find(r => c.a.every(f => r.pregunta.toLowerCase().indexOf(f) !== -1));
      const rb = es.respuestas.find(r => c.b.every(f => r.pregunta.toLowerCase().indexOf(f) !== -1));
      if (ra && rb && ra.score <= c.aMax && rb.score >= c.bMin) hallados.push('• ' + c.pregunta);
    });
    partes.push(hallados.length
      ? 'PARA PREGUNTAR EN LA LLAMADA:\n' + hallados.join('\n')
      : 'Sin contradicciones detectadas entre estas respuestas. Revisar el título antes de presentar.');
  }
  const costo = preguntaExtra || (es && PREGUNTA_COSTO[es.nombre]);
  if (costo) partes.push('PARA PONERLE NÚMERO (que lo diga el dueño):\n• ' + costo);

  const forma = slide.getNotesPage().getSpeakerNotesShape();
  if (forma) forma.getText().setText(partes.join('\n\n'));
}

function fechaViernes(semanas) {
  const d = new Date();
  d.setDate(d.getDate() + ((5 - d.getDay() + 7) % 7 || 7) + (semanas - 1) * 7);
  return d;
}

function viernes(semanas) {
  const d = fechaViernes(semanas);
  return `${Utilities.formatDate(d, 'GMT-3', 'd')} de ${mesEs(d)}`;
}

// ── DATOS DE UNA FILA DE LEADS ────────────────────────────────
// Arma los datos de la presentación desde una fila de la pestaña Leads (con
// sus respuestas de Detalle), igual que los manda la web.
function datosDeFila(fila) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const leads = ss.getSheetByName('Leads');
  const v = leads.getRange(fila, 1, 1, 19).getValues()[0];
  const leadId = String(v[0]);
  const wa = (leads.getRange(fila, 5).getFormula().match(/wa\.me\/(\d+)/) || [])[1] || '';
  const sobre9 = x => Math.round(Number(x) * 9 / 10); // el Sheet guarda /10

  const detalle = ss.getSheetByName('Detalle');
  const respuestas = detalle.getRange(2, 1, detalle.getLastRow() - 1, 8).getValues()
    .filter(r => String(r[0]) === leadId)
    .map(r => ({ 'eslabónNombre': String(r[3]), pregunta: String(r[4]), letra: String(r[5]),
      respuesta: String(r[6]), score: Number(r[7]) }));

  return {
    leadId: leadId,
    timestamp: new Date(v[1]).toISOString(),
    nombre: String(v[2]), apellido: String(v[3]), whatsapp: wa,
    negocio: String(v[6]), rubro: String(v[7]), sistema: String(v[18]),
    score: Math.round(Number(v[8]) * 36 / 10), maxScore: 36,
    eslabonDebil: String(v[9]),
    // columnas K-L, M-N, O-P, Q-R: puntaje /10 y estado, en el orden de la cadena
    eslabones: ORDEN_CADENA.map((nombre, i) => ({
      nombre: nombre, score: sobre9(v[10 + 2 * i]), estado: String(v[11 + 2 * i]) })),
    respuestas: respuestas
  };
}

// ── PRUEBA CON EL ÚLTIMO LEAD ─────────────────────────────────
// Arma la presentación del último lead de la pestaña Leads. No manda mails ni
// toca el Sheet: solo deja la presentación en la carpeta y muestra el link en
// el registro de ejecución.
function probarUltimoLead() {
  const fila = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Leads').getLastRow();
  const data = datosDeFila(fila);
  const url = crearDeck(data);
  console.log('DECK OK (' + data.leadId + ', ' + data.respuestas.length + ' respuestas): ' + url);
}

// ── REHACER LA PRESENTACIÓN DESDE LA PLANILLA (26/10) ─────────
// Menú "Orden Financiero" en la planilla: se elige la fila (o varias seguidas)
// de un lead en la pestaña Leads y se rehace su presentación con el diseño
// vigente. El link nuevo reemplaza al de la columna "Presentación"; la
// presentación vieja queda en la carpeta. No manda mails.
function onOpen() {
  SpreadsheetApp.getUi().createMenu('Orden Financiero')
    .addItem('Rehacer la presentación de la fila elegida', 'rehacerPresentacionSeleccionada')
    .addToUi();
}

function rehacerPresentacionSeleccionada() {
  const ui = SpreadsheetApp.getUi();
  const hoja = SpreadsheetApp.getActiveSheet();
  if (hoja.getName() !== 'Leads') {
    ui.alert('Andá a la pestaña Leads, hacé clic en la fila del lead y volvé a elegir esta opción.');
    return;
  }
  const rango = hoja.getActiveRange();
  const desde = Math.max(2, rango.getRow()), hasta = rango.getLastRow();
  if (hasta < desde) {
    ui.alert('Hacé clic en la fila de un lead (no en los títulos) y volvé a elegir esta opción.');
    return;
  }
  // Cada presentación tarda ~20 s y Apps Script corta a los 6 min
  if (hasta - desde + 1 > 5) {
    ui.alert('Elegí hasta 5 filas por vez.');
    return;
  }
  const hechas = [];
  for (let fila = desde; fila <= hasta; fila++) {
    const data = datosDeFila(fila);
    const nombre = data.negocio || data.nombre || data.leadId;
    try {
      const url = crearDeck(data);
      guardarLinkPresentacion(data.leadId, url);
      hechas.push('✓ ' + nombre);
    } catch (err) {
      console.error('Rehacer ' + data.leadId + ': ' + (err && err.stack ? err.stack : err));
      hechas.push('✗ ' + nombre + ': no se pudo (' + err + ')');
    }
  }
  ui.alert('Presentaciones', hechas.join('\n') + '\n\nEl link nuevo quedó en la columna "Presentación".', ui.ButtonSet.OK);
}

// ── PRUEBA MANUAL ─────────────────────────────────────────────
// Seleccionar probarDeck en el desplegable y Ejecutar.
function probarDeck() {
  const data = {
    leadId: 'PRUEBA-MANUAL',
    timestamp: '2026-08-28T19:52:00Z',
    nombre: 'Sergio Juarez',
    apellido: '',
    whatsapp: '',
    email: '',
    negocio: 'Don chechin',
    rubro: 'gastronomia',
    sistema: 'Ninguno',
    score: 20,
    maxScore: 36,
    eslabonDebil: 'Resultado Económico',
    eslabones: [
      { nombre: 'Costos y Precios',       score: 7, estado: 'A mejorar' },
      { nombre: 'Resultado Económico',    score: 3, estado: 'Crítico' },
      { nombre: 'Cash Flow',              score: 6, estado: 'A mejorar' },
      { nombre: 'Indicadores de Gestión', score: 4, estado: 'Crítico' }
    ],
    respuestas: [
      { 'eslabónNombre': 'Costos y Precios', pregunta: '¿Sabés cuánto te cuesta realmente producir o dar cada servicio?', letra: 'C', respuesta: 'No, lo calculo a ojo', score: 1 },
      { 'eslabónNombre': 'Costos y Precios', pregunta: '¿Tu precio de venta está calculado sobre tus costos reales o lo fijás mirando a la competencia?', letra: 'A', respuesta: 'Sí, lo calculo sobre mis costos reales', score: 3 },
      { 'eslabónNombre': 'Costos y Precios', pregunta: '¿Actualizás tus precios cuando suben tus costos?', letra: 'A', respuesta: 'Sí, lo hago sistemáticamente', score: 3 },
      { 'eslabónNombre': 'Resultado Económico', pregunta: '¿Sabés exactamente cuánto ganó tu negocio el mes pasado?', letra: 'C', respuesta: 'No, no lo tengo resuelto', score: 1 },
      { 'eslabónNombre': 'Resultado Económico', pregunta: '¿Separás las finanzas del negocio de tus gastos personales?', letra: 'C', respuesta: 'No, están mezcladas', score: 1 },
      { 'eslabónNombre': 'Resultado Económico', pregunta: '¿Tenés un cierre mensual que te muestre ventas, costos, estructura, impuestos y ganancia neta?', letra: 'C', respuesta: 'No, no lo tengo resuelto', score: 1 },
      { 'eslabónNombre': 'Cash Flow', pregunta: '¿Llegás a fin de mes con plata disponible para pagar sueldos y proveedores sin apurarte?', letra: 'B', respuesta: 'A veces llego justo', score: 2 },
      { 'eslabónNombre': 'Cash Flow', pregunta: '¿Sabés con anticipación cuándo van a ser tus próximos gastos fuertes?', letra: 'B', respuesta: 'Algunos sí, otros me agarran de sorpresa', score: 2 },
      { 'eslabónNombre': 'Cash Flow', pregunta: '¿Tus cobros y pagos están equilibrados o siempre pagás antes de cobrar?', letra: 'B', respuesta: 'Depende del mes y del cliente', score: 2 },
      { 'eslabónNombre': 'Indicadores de Gestión', pregunta: '¿Revisás los números de tu negocio al menos una vez por mes?', letra: 'C', respuesta: 'No, casi nunca los reviso', score: 1 },
      { 'eslabónNombre': 'Indicadores de Gestión', pregunta: '¿Tenés algún indicador que seguís regularmente?', letra: 'C', respuesta: 'No, no tengo ninguno definido', score: 1 },
      { 'eslabónNombre': 'Indicadores de Gestión', pregunta: '¿Tomás decisiones de inversión o contratación con datos concretos?', letra: 'B', respuesta: 'A veces sí, a veces me guío por intuición', score: 2 }
    ],
    diagnostico: 'Prueba manual'
  };

  const url = crearDeck(data);
  console.log('DECK OK: ' + url);
}
