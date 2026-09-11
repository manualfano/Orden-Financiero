// ═══════════════════════════════════════════════════════════════
// DECK · Generación automática de la presentación del diagnóstico
// Versión 2026-09-11 (Fase 1). Cambios sobre la anterior, todos marcados
// con "11/09": la web ya no pide nombre ni negocio, así que el título, la
// portada y el cierre tienen un reemplazo cuando vienen vacíos; el radar
// (que busca por negocio) pasa a las barras cuando no hay negocio; y el
// eslabón más débil desempata igual que la web.
// ═══════════════════════════════════════════════════════════════

const DECK_FOLDER_ID = '1PWLrxlDJDpqPPiWutYvKvvCdbFr24PZT';

// Sistema visual de Orden Financiero
const OF_NAVY   = '#1B3A6B';
const OF_WHITE  = '#FFFFFF';
const OF_INK2   = '#4A5568';
const OF_ACCENT = '#3B7DD8';
const OF_BORDER = '#E1E6EE';
const OF_ON_D2  = '#9FB0CA';
const OF_ON_D3  = '#7288AB';

// El lienzo del sistema es 1280×720 px. Slides trabaja en puntos
// sobre 720×405. Todo se expresa en px de diseño y se escala acá.
const PXPT = 0.5625;
const MG   = 72;

const ORDEN_CADENA = ['Costos y Precios', 'Resultado Económico', 'Cash Flow', 'Indicadores de Gestión'];

const PLAN_ESLABON = {
  'Costos y Precios':      'Estructura de costos real por producto y una política de actualización de precios que no dependa de la memoria.',
  'Resultado Económico':   'Separar las finanzas del negocio de las personales y armar el primer cierre mensual completo.',
  'Cash Flow':             'Proyección de ingresos y egresos, con los gastos fuertes anticipados en vez de descubiertos.',
  'Indicadores de Gestión':'Cuatro métricas calculadas sobre el cierre y revisadas una vez por mes.'
};

// Cruces de respuestas que no pueden ser ciertas a la vez.
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
  // 11/09: sin negocio ni nombre, el título usa el WhatsApp
  const ident = data.negocio || data.nombre || formatearWhatsApp(data.whatsapp);
  const titulo = `OF · ${ident} · Diagnóstico ${Utilities.formatDate(new Date(data.timestamp), 'GMT-3', 'yyyy-MM')}`;
  const pres = SlidesApp.create(titulo);

  // SlidesApp.create() lo deja en la raíz: lo movemos a la carpeta.
  const archivo = DriveApp.getFileById(pres.getId());
  DriveApp.getFolderById(DECK_FOLDER_ID).addFile(archivo);
  DriveApp.getRootFolder().removeFile(archivo);

  pres.getSlides()[0].remove();

  const ctx = prepararDatos(data);

  slidePortada(pres, ctx);
  slideRadar(pres, ctx);
  slideAlcance(pres, ctx);
  slideHallazgo(pres, ctx, ctx.ordenados[0], 1);
  slideHallazgo(pres, ctx, ctx.ordenados[1], 2);
  slideHallazgoDoble(pres, ctx, ctx.ordenados[2], ctx.ordenados[3]);
  slidePrioridades(pres, ctx);
  slideCierre(pres, ctx);

  pres.saveAndClose();
  return 'https://docs.google.com/presentation/d/' + pres.getId() + '/edit';
}

// ── PREPARACIÓN ───────────────────────────────────────────────
function prepararDatos(data) {
  const porNombre = {};
  data.eslabones.forEach(es => {
    porNombre[es.nombre] = {
      nombre: es.nombre,
      estado: es.estado,
      score10: Math.round((es.score / 9) * 100) / 10,
      respuestas: (data.respuestas || []).filter(r => r['eslabónNombre'] === es.nombre)
    };
  });

  // 11/09: mismo desempate que la web: menor puntaje; si empatan, más
  // respuestas C (puntaje 1); si siguen empatados, el orden de la cadena.
  const cantidadC = es => es.respuestas.filter(r => r.score === 1).length;
  const ordenados = ORDEN_CADENA.map(n => porNombre[n]).sort((a, b) =>
    (a.score10 - b.score10) ||
    (cantidadC(b) - cantidadC(a)) ||
    (ORDEN_CADENA.indexOf(a.nombre) - ORDEN_CADENA.indexOf(b.nombre)));

  return {
    data: data,
    porNombre: porNombre,
    ordenados: ordenados,
    negocio: data.negocio || data.nombre || '', // 11/09: puede quedar vacío
    fechaCorta: Utilities.formatDate(new Date(data.timestamp), 'GMT-3', 'dd/MM/yyyy'),
    mesAnio: Utilities.formatDate(new Date(), 'GMT-3', 'MMMM yyyy'),
    score10: Math.round((data.score / data.maxScore) * 100) / 10,
    fuente: `Autodiagnóstico Orden Financiero · ${Utilities.formatDate(new Date(data.timestamp), 'GMT-3', 'dd/MM/yyyy')} · Respuestas del dueño, sin verificación documental`
  };
}

// ── HELPERS DE DIBUJO ─────────────────────────────────────────
function P(v) { return v * PXPT; }

function nuevaSlide(pres, oscura) {
  const s = pres.appendSlide(SlidesApp.PredefinedLayout.BLANK);
  s.getBackground().setSolidFill(oscura ? OF_NAVY : OF_WHITE);
  return s;
}

function texto(slide, str, x, y, w, h, o) {
  o = o || {};
  const box = slide.insertTextBox(String(str), P(x), P(y), P(w), P(h));
  const t = box.getText();
  t.getTextStyle()
    .setFontFamily('Inter')
    .setFontSize(P(o.size || 15))
    .setForegroundColor(o.color || OF_INK2)
    .setBold(false);
  t.getParagraphStyle().setLineSpacing(o.lh || 170).setSpaceBelow(0).setSpaceAbove(0);
  return box;
}

function label(slide, str, x, y, o) {
  o = o || {};
  return texto(slide, String(str).toUpperCase(), x, y, 900, 20,
    { size: 11, color: o.color || OF_ACCENT, lh: 100 });
}

function linea(slide, x, y, oscura) {
  const l = slide.insertShape(SlidesApp.ShapeType.RECTANGLE, P(x), P(y), P(40), P(2));
  l.getFill().setSolidFill(oscura ? OF_ON_D3 : OF_NAVY);
  l.getBorder().setTransparent();
  return l;
}

function circulos(slide, oscura) {
  [380, 280, 180].forEach(d => {
    const c = slide.insertShape(SlidesApp.ShapeType.ELLIPSE,
      P(1280 - 90 - d / 2), P(720 - 90 - d / 2), P(d), P(d));
    c.getFill().setTransparent();
    c.getBorder().getLineFill().setSolidFill(oscura ? OF_ON_D3 : OF_BORDER);
    c.getBorder().setWeight(1);
  });
}

function pie(slide, numero) {
  texto(slide, 'ORDEN FINANCIERO · CONSULTORÍA DE GESTIÓN', MG, 660, 600, 20,
    { size: 11, color: OF_INK2, lh: 100 });
  if (numero) texto(slide, numero, 1120, 660, 88, 20, { size: 11, color: OF_INK2, lh: 100 })
    .getText().getParagraphStyle().setParagraphAlignment(SlidesApp.ParagraphAlignment.END);
}

// ── SLIDES ────────────────────────────────────────────────────
function slidePortada(pres, ctx) {
  const s = nuevaSlide(pres, true);
  // 11/09: sin negocio, la etiqueta queda solo con "Diagnóstico de gestión"
  label(s, ctx.negocio ? `${ctx.negocio} · Diagnóstico de gestión` : 'Diagnóstico de gestión', MG, MG, { color: OF_ON_D3 });
  linea(s, MG, 300, true);
  texto(s, 'Diagnóstico de\nsalud financiera', MG, 322, 900, 130,
    { size: 44, color: OF_WHITE, lh: 112 });
  texto(s, 'Cuatro eslabones: costos, resultado, caja e indicadores', MG, 452, 800, 30,
    { size: 18, color: OF_ON_D2, lh: 140 });
  texto(s, `MANUEL ALFANO · ORDEN FINANCIERO   ·   CONFIDENCIAL   ·   ${ctx.mesAnio.toUpperCase()}`,
    MG, 620, 900, 20, { size: 12, color: OF_ON_D3, lh: 100 });
  circulos(s, true);
}

function slideRadar(pres, ctx) {
  const s = nuevaSlide(pres, false);
  label(s, 'Resultado del test', MG, MG);
  texto(s, 'La rueda del orden financiero', MG, MG + 26, 900, 44,
    { size: 28, color: OF_NAVY, lh: 125 });
  texto(s, `El eslabón más flojo es ${ctx.ordenados[0].nombre}, con ${ctx.ordenados[0].score10} de 10.`,
    MG, MG + 76, 800, 30, { size: 18, lh: 140 });
  linea(s, MG, MG + 118);

  const img = imagenRadar(ctx);
  if (img) {
    const pic = s.insertImage(img, P(MG), P(230), P(520), P(360));
    pic.setTitle('Rueda del orden financiero');
  } else {
    barrasFallback(s, ctx, MG, 240);
  }

  let y = 250;
  ctx.ordenados.slice().reverse().forEach(es => {
    texto(s, es.nombre, 660, y, 380, 24, { size: 15, color: OF_NAVY, lh: 130 });
    texto(s, `${es.score10} / 10 · ${es.estado}`, 660, y + 26, 380, 24,
      { size: 15, color: OF_INK2, lh: 130 });
    y += 76;
  });

  texto(s, `${ctx.fuente} · Escala 0 a 10`, MG, 612, 1000, 20,
    { size: 11, color: OF_INK2, lh: 100 });
  pie(s, '02');
}

function slideAlcance(pres, ctx) {
  const s = nuevaSlide(pres, false);
  label(s, 'Alcance', MG, MG);
  texto(s, 'Esto mide cómo se gestiona el negocio, no cuánto gana', MG, MG + 26, 900, 44,
    { size: 28, color: OF_NAVY, lh: 125 });
  linea(s, MG, MG + 84);

  const items = [
    'Si los costos están calculados',
    'Si hay cierre mensual',
    'Si la caja se proyecta',
    'Si hay indicadores que se sigan'
  ];
  let y = 210;
  items.forEach(t => { texto(s, '–  ' + t, MG, y, 800, 30, { size: 15 }); y += 42; });

  texto(s, 'El número dice dónde mirar, no por qué. De acá en adelante vamos respuesta por respuesta.',
    MG, y + 30, 900, 30, { size: 15 });
  texto(s, ctx.fuente, MG, 612, 1000, 20, { size: 11, color: OF_INK2, lh: 100 });
  pie(s, '03');
  circulos(s, false);
}

function slideHallazgo(pres, ctx, es, n) {
  const s = nuevaSlide(pres, false);
  label(s, `Hallazgo ${n} · ${es.nombre}`, MG, MG);
  texto(s, tituloHallazgo(es), MG, MG + 26, 950, 60, { size: 28, color: OF_NAVY, lh: 125 });
  linea(s, MG, MG + 100);

  filasRespuestas(s, es.respuestas, 200);

  texto(s, ctx.fuente, MG, 612, 1000, 20, { size: 11, color: OF_INK2, lh: 100 });
  pie(s, n === 1 ? '04' : '05');
  notasDeLlamada(s, es);
}

function slideHallazgoDoble(pres, ctx, esA, esB) {
  const s = nuevaSlide(pres, false);
  label(s, `Hallazgo 3 · ${esA.nombre} · ${esB.nombre}`, MG, MG);
  texto(s, 'Los otros dos eslabones, en las palabras del dueño', MG, MG + 26, 950, 44,
    { size: 28, color: OF_NAVY, lh: 125 });
  linea(s, MG, MG + 84);

  let y = 190;
  [esA, esB].forEach(es => {
    texto(s, `${es.nombre.toUpperCase()} · ${es.score10}`, MG, y, 600, 20,
      { size: 11, color: OF_INK2, lh: 100 });
    y = filasRespuestas(s, es.respuestas, y + 26) + 18;
  });

  texto(s, ctx.fuente, MG, 612, 1000, 20, { size: 11, color: OF_INK2, lh: 100 });
  pie(s, '06');
  notasDeLlamada(s, esA, esB);
}

function slidePrioridades(pres, ctx) {
  const s = nuevaSlide(pres, false);
  label(s, 'Prioridades', MG, MG);
  texto(s, 'El orden lo define la cadena, no la urgencia', MG, MG + 26, 900, 44,
    { size: 28, color: OF_NAVY, lh: 125 });
  linea(s, MG, MG + 84);

  const masFuerte = ctx.ordenados[3].nombre;
  const aTrabajar = ORDEN_CADENA.filter(n => n !== masFuerte);
  const anchoCol = (1280 - MG * 2 - 48) / 3;

  aTrabajar.forEach((nombre, i) => {
    const x = MG + i * (anchoCol + 24);
    texto(s, `MES ${i + 1} · ${nombre.toUpperCase()}`, x, 210, anchoCol, 34,
      { size: 12, color: OF_ACCENT, lh: 130 });
    texto(s, PLAN_ESLABON[nombre], x, 254, anchoCol, 200, { size: 15 });
  });

  texto(s, 'Cada eslabón necesita al anterior resuelto para poder existir.', MG, 500, 900, 30, { size: 15 });
  pie(s, '07');
  circulos(s, false);
}

function slideCierre(pres, ctx) {
  const s = nuevaSlide(pres, true);
  label(s, 'Próximos pasos', MG, MG, { color: OF_ON_D3 });
  linea(s, MG, MG + 30, true);
  texto(s, `Cerrar ${Utilities.formatDate(new Date(), 'GMT-3', 'MMMM')} con un número de ganancia`,
    MG, MG + 56, 900, 60, { size: 34, color: OF_WHITE, lh: 125 });

  const responsable = ctx.data.nombre || 'Dueño'; // 11/09: la web ya no pide el nombre
  const pasos = [
    `Abrir la cuenta del negocio separada de la personal · ${responsable} · esta semana`,
    `Juntar facturación y gastos del mes · ${responsable} · ${viernes(2)}`,
    `Primer cierre mensual armado y revisado juntos · Manuel · ${viernes(3)}`
  ];
  let y = 300;
  pasos.forEach(p => { texto(s, '–  ' + p, MG, y, 900, 30, { size: 16, color: OF_ON_D2 }); y += 40; });

  texto(s, 'MANUEL ALFANO · MANUEL@ORDENFINANCIERO.COM · ORDENFINANCIERO.COM',
    MG, 620, 900, 20, { size: 12, color: OF_ON_D3, lh: 100 });
  circulos(s, true);
}

// ── PIEZAS REUTILIZABLES ──────────────────────────────────────
function filasRespuestas(slide, respuestas, y) {
  respuestas.forEach(r => {
    const sep = slide.insertShape(SlidesApp.ShapeType.RECTANGLE, P(MG), P(y), P(1136), P(1));
    sep.getFill().setSolidFill(OF_BORDER);
    sep.getBorder().setTransparent();

    texto(slide, r.pregunta, MG, y + 10, 620, 46, { size: 15, color: OF_NAVY, lh: 150 });
    texto(slide, '"' + r.respuesta + '"', MG + 644, y + 10, 400, 46, { size: 15, lh: 150 })
      .getText().getTextStyle().setItalic(true);
    texto(slide, r.score + ' de 3', MG + 1064, y + 10, 72, 24, { size: 14, lh: 150 })
      .getText().getParagraphStyle().setParagraphAlignment(SlidesApp.ParagraphAlignment.END);
    y += 62;
  });
  return y;
}

function tituloHallazgo(es) {
  const minimos = es.respuestas.filter(r => r.score === 1).length;
  if (minimos === es.respuestas.length && minimos > 0)
    return `Las ${minimos === 3 ? 'tres' : minimos} preguntas de ${es.nombre} dieron el mínimo de la escala`;
  if (minimos >= 2)
    return `${minimos} de las ${es.respuestas.length} preguntas de ${es.nombre} dieron el mínimo`;
  return `${es.nombre} quedó en ${es.score10} de 10`;
}

// Las contradicciones no van al slide: van a las notas del orador.
function notasDeLlamada(slide) {
  const eslabones = Array.prototype.slice.call(arguments, 1);
  const todas = [];
  eslabones.forEach(es => es.respuestas.forEach(r => todas.push(r)));

  const hallados = [];
  CONTRADICCIONES.forEach(c => {
    const ra = todas.find(r => c.a.every(f => r.pregunta.toLowerCase().indexOf(f) !== -1));
    const rb = todas.find(r => c.b.every(f => r.pregunta.toLowerCase().indexOf(f) !== -1));
    if (ra && rb && ra.score <= c.aMax && rb.score >= c.bMin) hallados.push('• ' + c.pregunta);
  });

  const notas = hallados.length
    ? 'PARA PREGUNTAR EN LA LLAMADA:\n' + hallados.join('\n')
    : 'Sin contradicciones detectadas entre estas respuestas. Revisar el título antes de presentar.';

  const forma = slide.getNotesPage().getSpeakerNotesShape();
  if (forma) forma.getText().setText(notas);
}

function viernes(semanas) {
  const d = new Date();
  d.setDate(d.getDate() + ((5 - d.getDay() + 7) % 7 || 7) + (semanas - 1) * 7);
  return Utilities.formatDate(d, 'GMT-3', 'd \'de\' MMMM');
}

// ── RADAR: reusa el gráfico que ya existe en la pestaña "Radar" ──
function imagenRadar(ctx) {
  // 11/09: el Radar busca por negocio (columna Empresa). Sin negocio
  // mostraría todo en cero: mejor las barras, que salen de los datos.
  if (!ctx.data.negocio) return null;
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) return null;
    const hoja = ss.getSheetByName('Radar');
    if (!hoja) return null;

    hoja.getRange('B1').setValue(ctx.data.negocio);
    SpreadsheetApp.flush();
    Utilities.sleep(2000);

    const charts = hoja.getCharts();
    if (!charts.length) return null;
    return charts[0].getAs('image/png');
  } catch (err) {
    console.error('Radar: ' + err);
    return null;
  }
}

// Si el radar falla, barras horizontales ordenadas de mayor a menor.
function barrasFallback(slide, ctx, x, y) {
  const anchoMax = 420;
  ctx.ordenados.slice().reverse().forEach(es => {
    texto(slide, es.nombre, x, y, 240, 24, { size: 15, color: OF_NAVY, lh: 130 });
    const b = slide.insertShape(SlidesApp.ShapeType.RECTANGLE,
      P(x + 250), P(y + 4), P(anchoMax * (es.score10 / 10)), P(20));
    b.getFill().setSolidFill(es === ctx.ordenados[0] ? OF_NAVY : '#B9C2D0');
    b.getBorder().setTransparent();
    y += 46;
  });
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
