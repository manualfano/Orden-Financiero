// ═══════════════════════════════════════════════════════════════
// Código.gs · Recepción de leads del diagnóstico de ordenfinanciero.com
// Versión 2026-09-11 (Fase 1, bloque A). Reemplaza COMPLETO al Código.gs
// anterior. Va junto con Deck.gs (misma carpeta), que también se reemplaza.
// ═══════════════════════════════════════════════════════════════
//
// POR QUÉ ESTA VERSIÓN
// Desde el 07/09 15:39 la web manda los eslabones con nombres nuevos
// ("Flujo de caja", "Costos y precios"…) y la versión anterior los buscaba
// con los nombres viejos: se caía antes de escribir la fila y de mandar el
// mail, y la web no se enteraba (envío "no-cors"). Esta versión:
//   · acepta los nombres viejos y los nuevos, y en el Sheet sigue usando
//     los viejos (los de los encabezados, el Radar y la presentación);
//   · responde JSON ({ ok: true, leadId } o { ok: false, error }), así la
//     web sabe si el lead quedó guardado y, si no, ofrece reintentar;
//   · no duplica: si el mismo leadId llega dos veces (reintento), responde
//     ok sin escribir otra fila ni mandar otro mail;
//   · valida el WhatsApp (549 + 10 dígitos) y descarta envíos de robots
//     (campo trampa "campo_extra", invisible para las personas);
//   · arma la presentación aparte, cada 5 minutos, para que la respuesta a
//     la web tarde 2-4 segundos y no 20-30. El mail del lead sale en el
//     momento; el link de la presentación llega en un segundo mail y queda
//     en la columna "Presentación" del Sheet.
//
// PASO A PASO PARA PUBLICAR (sin cortar el servicio actual)
//  1. Extensiones → Apps Script. En "Código.gs": Ctrl+A y pegar este archivo.
//     En "Deck.gs": Ctrl+A y pegar el Deck.gs nuevo. Guardar (ícono disquete).
//  2. Implementar → Nueva implementación → engranaje "Seleccionar tipo" →
//     Aplicación web. Descripción: "Fase 1 - 2026-09-11".
//     Ejecutar como: Yo. Quién tiene acceso: Cualquier persona. Implementar.
//  3. Si pide permisos: Autorizar acceso → elegir la cuenta → "Configuración
//     avanzada" → "Ir a … (no seguro)" → Permitir. Es tu propio script.
//  4. Copiar la "URL de la aplicación web" (termina en /exec) y pasársela a
//     Claude. La implementación vieja sigue funcionando mientras tanto.
//  5. Cuando Claude confirme que la URL nueva anda: Implementar → Gestionar
//     implementaciones → la implementación VIEJA → lápiz (editar) → Versión:
//     la más nueva → Implementar. Así la página publicada hoy vuelve a
//     guardar leads sin tocar la página.
//  6. Para volver atrás: Gestionar implementaciones → editar → elegir la
//     versión anterior. Nada se borra.
// ═══════════════════════════════════════════════════════════════

const VERSION_SCRIPT = '2026-09-11-fase1';

// ── COLORES DE MARCA ──────────────────────────────────────────
const NAVY = '#1B3A6B';
const SOLIDO_BG = '#EAF3DE', SOLIDO_TEXT = '#27500A';
const MEJORAR_BG = '#FAEEDA', MEJORAR_TEXT = '#633806';
const ATENCION_BG = '#FAECE7', ATENCION_TEXT = '#4A1B0C';

// Las 19 primeras columnas son las de siempre, en el mismo orden.
// Las nuevas van SIEMPRE al final.
const LEADS_HEADERS = [
  'Lead ID', 'Fecha', 'Nombre', 'Apellido', 'WhatsApp', 'Email', 'Empresa', 'Rubro',
  'Score Total /10', 'Eslabón más débil',
  'Costos y Precios /10', 'Estado Costos y Precios',
  'Resultado Económico /10', 'Estado Resultado Económico',
  'Cash Flow /10', 'Estado Cash Flow',
  'Indicadores de Gestión /10', 'Estado Indicadores de Gestión',
  'Sistema de gestión/POS',
  // nuevas (11/09/2026)
  'Letras', 'Gravedad (total)', 'Gravedad eslabón más débil',
  'Origen', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'Referrer',
  'Presentación'
];
const COL_PRESENTACION = LEADS_HEADERS.indexOf('Presentación') + 1;
const DETALLE_HEADERS = ['Lead ID', 'Fecha', 'Nombre', 'Eslabón', 'Pregunta', 'Letra elegida', 'Respuesta elegida', 'Puntaje (1-3)'];

// Nombres de eslabón que usa el Sheet (encabezados, Radar, Deck.gs).
const ESLABONES_SHEET = ['Costos y Precios', 'Resultado Económico', 'Cash Flow', 'Indicadores de Gestión'];
// Todos los nombres que puede mandar la web (viejos y nuevos), sin tildes ni mayúsculas.
const ALIAS_ESLABON = {
  'costos y precios': 0,
  'resultado economico': 1,
  'cash flow': 2, 'flujo de caja': 2,
  'indicadores de gestion': 3
};

// Campo trampa: la web lo manda vacío; si viene lleno, es un robot.
const CAMPO_TRAMPA = 'campo_extra';

const MAIL_DESTINO = 'manuel@ordenfinanciero.com';
const CACHE_SEGUNDOS = 21600; // 6 h, el máximo de CacheService
const PREFIJO_COLA_DECK = 'deck:';

// ── ENTRADA DEL FORMULARIO ────────────────────────────────────
function doPost(e) {
  let data;
  try {
    data = JSON.parse((e && e.postData && e.postData.contents) || '');
  } catch (err) {
    return responder({ ok: false, error: 'json_invalido' });
  }
  if (!data || typeof data !== 'object') return responder({ ok: false, error: 'json_invalido' });

  const leadId = String(data.leadId || '').slice(0, 64);

  // Robot: se le responde ok para que no insista, y no se escribe nada.
  if (String(data[CAMPO_TRAMPA] || '').trim() !== '') {
    console.warn('Campo trampa lleno, envío descartado. leadId=' + leadId);
    return responder({ ok: true, leadId: leadId });
  }

  if (!/^[A-Za-z0-9_-]{6,64}$/.test(leadId)) return responder({ ok: false, error: 'lead_id_invalido' });
  if (!/^549\d{10}$/.test(String(data.whatsapp || ''))) {
    return responder({ ok: false, leadId: leadId, error: 'whatsapp_invalido' });
  }

  let lead;
  try {
    lead = normalizarLead(data);
  } catch (err) {
    console.error('Datos incompletos, leadId=' + leadId + ': ' + err);
    return responder({ ok: false, leadId: leadId, error: 'datos_incompletos' });
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(25000);
  } catch (err) {
    return responder({ ok: false, leadId: leadId, error: 'ocupado' });
  }

  try {
    // Reintento de un lead que ya quedó guardado: ok, sin duplicar.
    if (yaProcesado(ss, leadId)) return responder({ ok: true, leadId: leadId, repetido: true });
    writeLead(ss, lead);
    marcarProcesado(leadId);
    try {
      writeDetalle(ss, lead);
    } catch (err) {
      console.error('Detalle ' + leadId + ': ' + err);
    }
  } catch (err) {
    console.error('No se pudo guardar el lead ' + leadId + ': ' + (err && err.stack ? err.stack : err));
    return responder({ ok: false, leadId: leadId, error: 'no_se_pudo_guardar' });
  } finally {
    lock.releaseLock();
  }

  // El lead ya está en el Sheet: nada de lo que sigue cambia la respuesta.
  try {
    encolarDeck(lead);
  } catch (err) {
    console.error('Cola del deck ' + leadId + ': ' + err);
  }
  try {
    sendLeadEmail(lead);
  } catch (err) {
    console.error('Mail ' + leadId + ': ' + err);
  }
  try {
    asegurarDisparadorDecks();
  } catch (err) {
    console.error('Disparador: ' + err);
  }

  return responder({ ok: true, leadId: leadId });
}

// Abrir la URL /exec en el navegador muestra qué versión está publicada.
// No escribe nada.
function doGet() {
  return responder({ ok: true, servicio: 'leads-diagnostico', version: VERSION_SCRIPT });
}

function responder(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// ── NORMALIZACIÓN ─────────────────────────────────────────────
function claveEslabon(nombre) {
  return String(nombre || '').toLowerCase()
    .replace(/[áàä]/g, 'a').replace(/[éèë]/g, 'e').replace(/[íìï]/g, 'i')
    .replace(/[óòö]/g, 'o').replace(/[úùü]/g, 'u')
    .replace(/\s+/g, ' ').trim();
}

// Nombre del eslabón como lo usa el Sheet. Si no se reconoce, usa la posición
// (si la hay) y, si tampoco, deja el nombre tal cual llegó.
function nombreEslabonSheet(nombre, posicion) {
  const idx = ALIAS_ESLABON[claveEslabon(nombre)];
  if (idx !== undefined) return ESLABONES_SHEET[idx];
  if (posicion !== undefined && ESLABONES_SHEET[posicion]) return ESLABONES_SHEET[posicion];
  return String(nombre || '');
}

// Un texto que empieza con = + - @ el Sheet lo toma como fórmula: se le
// antepone un apóstrofo para que quede como texto.
function textoSeguro(v, max) {
  let s = (v === undefined || v === null) ? '' : String(v);
  if (max) s = s.slice(0, max);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function numero(v) {
  const n = Number(v);
  if (!isFinite(n)) throw new Error('número inválido: ' + v);
  return n;
}

function normalizarLead(data) {
  if (!Array.isArray(data.eslabones) || data.eslabones.length !== 4) throw new Error('eslabones');

  const eslabones = data.eslabones.map((es, i) => ({
    nombre: nombreEslabonSheet(es && es.nombre, i),
    score: numero(es && es.score),
    estado: textoSeguro(es && es.estado, 40)
  }));

  const respuestas = (Array.isArray(data.respuestas) ? data.respuestas : []).slice(0, 12).map(r => ({
    'eslabónNombre': nombreEslabonSheet(r && r['eslabónNombre']),
    pregunta: textoSeguro(r && r.pregunta, 300),
    letra: textoSeguro(r && r.letra, 2),
    respuesta: textoSeguro(r && r.respuesta, 300),
    score: numero(r && r.score)
  }));

  const fecha = new Date(data.timestamp);
  return {
    leadId: String(data.leadId),
    timestamp: isNaN(fecha.getTime()) ? new Date().toISOString() : fecha.toISOString(),
    whatsapp: String(data.whatsapp),
    nombre: textoSeguro(data.nombre, 120),
    apellido: textoSeguro(data.apellido, 120),
    email: textoSeguro(data.email, 200),
    negocio: textoSeguro(data.negocio, 200),
    instagram: textoSeguro(data.instagram, 120),
    sistema: textoSeguro(data.sistema, 120),
    rubro: textoSeguro(data.rubro, 40),
    score: numero(data.score),
    maxScore: numero(data.maxScore || 36),
    gravedad: textoSeguro(data.gravedad, 40),
    gravedadEslabon: textoSeguro(data.gravedadEslabon, 40),
    eslabonDebil: nombreEslabonSheet(data.eslabonDebil),
    letras: textoSeguro(data.letras, 20),
    origen: textoSeguro(data.origen, 100),
    utm_source: textoSeguro(data.utm_source, 100),
    utm_medium: textoSeguro(data.utm_medium, 100),
    utm_campaign: textoSeguro(data.utm_campaign, 100),
    utm_content: textoSeguro(data.utm_content, 100),
    referrer: textoSeguro(data.referrer, 300),
    eslabones: eslabones,
    respuestas: respuestas,
    diagnostico: textoSeguro(data.diagnostico, 5000)
  };
}

// ── NO DUPLICAR ───────────────────────────────────────────────
function yaProcesado(ss, leadId) {
  if (CacheService.getScriptCache().get('lead:' + leadId)) return true;
  const sheet = ss.getSheetByName('Leads');
  if (!sheet || sheet.getLastRow() < 2) return false;
  return !!sheet.getRange(2, 1, sheet.getLastRow() - 1, 1)
    .createTextFinder(leadId).matchEntireCell(true).findNext();
}

function marcarProcesado(leadId) {
  CacheService.getScriptCache().put('lead:' + leadId, '1', CACHE_SEGUNDOS);
}

// ── TELÉFONO: normalización para links de WhatsApp (wa.me) ────
// wa.me exige: código de país (54) + 9 (celular AR) + código de área + número,
// todo en dígitos, sin 0 de larga distancia ni 15 de celular.
function normalizeArgWhatsApp(raw) {
  let digits = (raw || '').replace(/\D/g, '');
  if (!digits) return '';

  if (digits.startsWith('00')) digits = digits.slice(2); // prefijo internacional

  const hasCountry = digits.startsWith('54');
  let rest = hasCountry ? digits.slice(2) : digits;

  if (rest.startsWith('0')) rest = rest.slice(1); // 0 de larga distancia

  // saca el "15" de celular que a veces queda pegado después del código de área
  for (const areaLen of [2, 3, 4]) {
    const area = rest.slice(0, areaLen);
    const resto = rest.slice(areaLen);
    if (resto.startsWith('15') && (area + resto.slice(2)).length === 10) {
      rest = area + resto.slice(2);
      break;
    }
  }

  if (!rest.startsWith('9')) rest = '9' + rest; // WhatsApp exige el 9 para AR
  return '54' + rest;
}

// 5492216809170 → +54 9 221 680-9170 (mismo formato que muestra la web)
function formatearWhatsApp(wa) {
  const d = String(wa || '').replace(/\D/g, '');
  if (!/^549\d{10}$/.test(d)) return d;
  const local = d.slice(3);
  const area = local.startsWith('11') ? local.slice(0, 2) : local.slice(0, 3);
  const resto = local.slice(area.length);
  return `+54 9 ${area} ${resto.slice(0, resto.length - 4)}-${resto.slice(-4)}`;
}

// ── MANTENIMIENTO: correr manualmente desde el editor ──────────
// 1) limpiarTodoTest     → borra todas las filas de datos (deja el encabezado)
// 2) setup               → fuerza el encabezado/diseño correcto de Leads y Detalle
// 3) setupRadar          → crea la pestaña "Radar" con el selector y la tabla auxiliar
// 4) borrarFilasDePrueba → borra solo las filas cuyo Lead ID empieza con "PRUEBA-"
// 5) instalarDisparador  → (re)crea el disparador que arma las presentaciones
function limpiarTodoTest() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ['Leads', 'Detalle'].forEach(name => {
    const sheet = ss.getSheetByName(name);
    if (!sheet) return;
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).clearContent();
    }
  });
}

function borrarFilasDePrueba() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ['Leads', 'Detalle'].forEach(nombreHoja => {
    const sheet = ss.getSheetByName(nombreHoja);
    if (!sheet || sheet.getLastRow() < 2) return;
    const ids = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues().map(r => String(r[0]));
    for (let i = ids.length - 1; i >= 0; i--) {
      if (ids[i].indexOf('PRUEBA-') === 0) sheet.deleteRow(i + 2);
    }
  });
}

function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  styleLeadsSheet(ensureSheet(ss, 'Leads'));
  styleDetalleSheet(ensureSheet(ss, 'Detalle'));
}

function ensureSheet(ss, name) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  return sheet;
}

// Una hoja nueva de Google trae 26 columnas (A-Z) y Leads usa 29: sin esto,
// escribir en la columna 27 da error y el lead se pierde.
function asegurarColumnas(sheet, cantidad) {
  const faltan = cantidad - sheet.getMaxColumns();
  if (faltan > 0) sheet.insertColumnsAfter(sheet.getMaxColumns(), faltan);
}

// Completa los encabezados que falten (celdas vacías de la fila 1) sin
// pisar ninguno que ya tenga texto.
function ensureLeadsHeaders(sheet) {
  asegurarColumnas(sheet, LEADS_HEADERS.length);
  const rango = sheet.getRange(1, 1, 1, LEADS_HEADERS.length);
  const actuales = rango.getValues()[0];
  let cambio = false;
  const nuevos = actuales.map((v, i) => {
    if (String(v).trim() === '') { cambio = true; return LEADS_HEADERS[i]; }
    return v;
  });
  if (!cambio) return;
  rango.setValues([nuevos]);
  rango.setFontWeight('bold').setFontColor('#FFFFFF').setBackground(NAVY)
    .setHorizontalAlignment('center').setVerticalAlignment('middle').setFontSize(10).setWrap(true);
}

// ── LEADS: resumen global ──────────────────────────────────────
function writeLead(ss, data) {
  const sheet = ensureSheet(ss, 'Leads');
  if (sheet.getLastRow() === 0) styleLeadsSheet(sheet);
  else ensureLeadsHeaders(sheet);

  const porNombre = {};
  data.eslabones.forEach(es => porNombre[es.nombre] = es);
  ESLABONES_SHEET.forEach(n => { if (!porNombre[n]) throw new Error('falta el eslabón ' + n); });
  const score10 = (s, max) => Math.round((s / max) * 100) / 10;

  const fecha = new Date(data.timestamp);
  const telLimpio = normalizeArgWhatsApp(data.whatsapp);
  const waLink = telLimpio ? `=HYPERLINK("https://wa.me/${telLimpio}","Abrir WhatsApp")` : '';

  sheet.appendRow([
    data.leadId, fecha, data.nombre, data.apellido || '', waLink, data.email || '', data.negocio || '', data.rubro,
    score10(data.score, data.maxScore), data.eslabonDebil,
    score10(porNombre['Costos y Precios'].score, 9), porNombre['Costos y Precios'].estado,
    score10(porNombre['Resultado Económico'].score, 9), porNombre['Resultado Económico'].estado,
    score10(porNombre['Cash Flow'].score, 9), porNombre['Cash Flow'].estado,
    score10(porNombre['Indicadores de Gestión'].score, 9), porNombre['Indicadores de Gestión'].estado,
    data.sistema || '',
    data.letras, data.gravedad, data.gravedadEslabon,
    data.origen, data.utm_source, data.utm_medium, data.utm_campaign, data.utm_content, data.referrer,
    ''
  ]);

  const fila = sheet.getLastRow();
  sheet.getRange(fila, 2).setNumberFormat('dd/mm/yyyy hh:mm');
  [9, 11, 13, 15, 17].forEach(col => sheet.getRange(fila, col).setNumberFormat('0.0'));
}

// ── MAIL AUTOMÁTICO A MANUEL ───────────────────────────────────
function sendLeadEmail(data) {
  const telLimpio = normalizeArgWhatsApp(data.whatsapp);
  const waUrl = telLimpio ? `https://wa.me/${telLimpio}` : '';
  const quien = data.nombre || formatearWhatsApp(data.whatsapp);
  const prueba = data.leadId.indexOf('PRUEBA-') === 0 ? '[PRUEBA] ' : '';

  const subject = `${prueba}Nuevo diagnóstico: ${quien} — ${data.score}/${data.maxScore} (${data.eslabonDebil})`;

  const filasEslabones = data.eslabones
    .map(es => `${es.nombre}: ${es.score}/9 (${es.estado})`)
    .join('\n');

  const respuestasPorEslabon = {};
  (data.respuestas || []).forEach(r => {
    const key = r.eslabónNombre;
    if (!respuestasPorEslabon[key]) respuestasPorEslabon[key] = [];
    respuestasPorEslabon[key].push(`  • ${r.pregunta}\n    → ${r.respuesta}`);
  });
  const detalleRespuestas = Object.keys(respuestasPorEslabon)
    .map(nombre => `${nombre}:\n${respuestasPorEslabon[nombre].join('\n')}`)
    .join('\n\n');

  const utm = [data.utm_source, data.utm_medium, data.utm_campaign, data.utm_content]
    .map(v => v || '-').join(' / ');

  const bodyPlain = [
    `Nombre: ${data.nombre || '-'}`,
    `WhatsApp: ${formatearWhatsApp(data.whatsapp) || '-'}${waUrl ? '  →  ' + waUrl : ''}`,
    `Instagram: ${data.instagram || '-'}`,
    `Negocio: ${data.negocio || '-'}`,
    `Rubro: ${data.rubro || '-'}`,
    `Sistema de gestión/POS: ${data.sistema || '-'}`,
    '',
    `Score total: ${data.score}/${data.maxScore}${data.gravedad ? ' (' + data.gravedad + ')' : ''}`,
    `Eslabón más débil: ${data.eslabonDebil}${data.gravedadEslabon ? ' (' + data.gravedadEslabon + ')' : ''}`,
    `Letras: ${data.letras || '-'}`,
    '',
    filasEslabones,
    '',
    `Origen: ${data.origen || '-'}`,
    `UTM (source / medium / campaign / content): ${utm}`,
    `Llegó desde: ${data.referrer || '-'}`,
    '',
    '── Respuestas detalladas ──',
    detalleRespuestas,
    '',
    '── Diagnóstico ──',
    data.diagnostico || '',
    '',
    'Presentación: se arma en los próximos minutos. El link llega en otro mail y queda en la columna "Presentación" del Sheet.'
  ].join('\n');

  MailApp.sendEmail(MAIL_DESTINO, subject, bodyPlain);
}

// ── PRESENTACIÓN: se arma fuera de la respuesta a la web ───────
// crearDeck (Deck.gs) tarda 20-30 s; la web no puede esperar tanto. El lead
// queda en una cola y el disparador de cada 5 minutos arma las pendientes.
function encolarDeck(lead) {
  const datosDeck = {
    leadId: lead.leadId, timestamp: lead.timestamp, whatsapp: lead.whatsapp,
    nombre: lead.nombre, apellido: lead.apellido, negocio: lead.negocio, rubro: lead.rubro,
    sistema: lead.sistema, score: lead.score, maxScore: lead.maxScore,
    eslabonDebil: lead.eslabonDebil, eslabones: lead.eslabones, respuestas: lead.respuestas,
    intentos: 0
  };
  PropertiesService.getScriptProperties().setProperty(PREFIJO_COLA_DECK + lead.leadId, JSON.stringify(datosDeck));
}

function procesarDecksPendientes() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) return; // otra ejecución está trabajando
  const inicio = Date.now();
  try {
    const props = PropertiesService.getScriptProperties();
    const claves = Object.keys(props.getProperties()).filter(k => k.indexOf(PREFIJO_COLA_DECK) === 0);
    for (const clave of claves) {
      if (Date.now() - inicio > 4 * 60 * 1000) break; // el límite de Apps Script es 6 min
      let datos;
      try {
        datos = JSON.parse(props.getProperty(clave));
      } catch (err) {
        props.deleteProperty(clave);
        continue;
      }
      try {
        const url = crearDeck(datos);
        guardarLinkPresentacion(datos.leadId, url);
        const prueba = datos.leadId.indexOf('PRUEBA-') === 0 ? '[PRUEBA] ' : '';
        MailApp.sendEmail(MAIL_DESTINO,
          `${prueba}Presentación lista: ${datos.nombre || formatearWhatsApp(datos.whatsapp)} — ${datos.score}/${datos.maxScore}`,
          'Presentación del diagnóstico: ' + url + '\n\nLead ID: ' + datos.leadId);
        props.deleteProperty(clave);
      } catch (err) {
        console.error('Deck ' + datos.leadId + ': ' + (err && err.stack ? err.stack : err));
        datos.intentos = (datos.intentos || 0) + 1;
        if (datos.intentos >= 3) {
          props.deleteProperty(clave);
          guardarLinkPresentacion(datos.leadId, 'No se pudo generar');
          MailApp.sendEmail(MAIL_DESTINO, 'No se pudo armar una presentación',
            'Lead ID: ' + datos.leadId + '\nError: ' + err + '\n\nEl lead está en el Sheet; solo faltó la presentación.');
        } else {
          props.setProperty(clave, JSON.stringify(datos));
        }
      }
    }
  } finally {
    lock.releaseLock();
  }
}

function guardarLinkPresentacion(leadId, valor) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Leads');
  if (!sheet || sheet.getLastRow() < 2) return;
  const celda = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1)
    .createTextFinder(leadId).matchEntireCell(true).findNext();
  if (celda) sheet.getRange(celda.getRow(), COL_PRESENTACION).setValue(valor);
}

// Se llama sola desde doPost (una vez cada 6 h como mucho); no hace falta
// correrla a mano, salvo que se hayan borrado los disparadores.
function asegurarDisparadorDecks() {
  const cache = CacheService.getScriptCache();
  if (cache.get('disparador_ok')) return;
  const existe = ScriptApp.getProjectTriggers().some(t => t.getHandlerFunction() === 'procesarDecksPendientes');
  if (!existe) ScriptApp.newTrigger('procesarDecksPendientes').timeBased().everyMinutes(5).create();
  cache.put('disparador_ok', '1', CACHE_SEGUNDOS);
}

function instalarDisparador() {
  ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === 'procesarDecksPendientes')
    .forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('procesarDecksPendientes').timeBased().everyMinutes(5).create();
  CacheService.getScriptCache().put('disparador_ok', '1', CACHE_SEGUNDOS);
}

// ── ESTILO DE LAS PESTAÑAS ────────────────────────────────────
function styleLeadsSheet(sheet) {
  asegurarColumnas(sheet, LEADS_HEADERS.length);
  const header = sheet.getRange(1, 1, 1, LEADS_HEADERS.length);
  header.setValues([LEADS_HEADERS]);
  header.setFontWeight('bold').setFontColor('#FFFFFF').setBackground(NAVY)
    .setHorizontalAlignment('center').setVerticalAlignment('middle').setFontSize(10).setWrap(true);
  sheet.setFrozenRows(1);
  sheet.setRowHeight(1, 40);

  const widths = [110, 130, 110, 110, 110, 170, 150, 110, 110, 160, 100, 150, 100, 160, 100, 120, 100, 170, 150,
    120, 120, 150, 110, 110, 110, 130, 110, 200, 200];
  widths.forEach((w, i) => sheet.setColumnWidth(i + 1, w));

  applyEstadoFormatting(sheet, [12, 14, 16, 18]);
}

// ── DETALLE: las 12 respuestas por lead ───────────────────────
function writeDetalle(ss, data) {
  const sheet = ensureSheet(ss, 'Detalle');
  if (sheet.getLastRow() === 0) styleDetalleSheet(sheet);

  const fecha = new Date(data.timestamp);
  const rows = data.respuestas.map(r => [
    data.leadId, fecha, data.nombre, r.eslabónNombre, r.pregunta, r.letra, r.respuesta, r.score
  ]);
  if (!rows.length) return;

  const startRow = sheet.getLastRow() + 1;
  sheet.getRange(startRow, 1, rows.length, DETALLE_HEADERS.length).setValues(rows);
  sheet.getRange(startRow, 2, rows.length, 1).setNumberFormat('dd/mm/yyyy hh:mm');
}

function styleDetalleSheet(sheet) {
  const header = sheet.getRange(1, 1, 1, DETALLE_HEADERS.length);
  header.setValues([DETALLE_HEADERS]);
  header.setFontWeight('bold').setFontColor('#FFFFFF').setBackground(NAVY)
    .setHorizontalAlignment('center').setVerticalAlignment('middle').setFontSize(10);
  sheet.setFrozenRows(1);
  sheet.setRowHeight(1, 32);

  const widths = [110, 130, 150, 150, 380, 90, 320, 100];
  widths.forEach((w, i) => sheet.setColumnWidth(i + 1, w));

  sheet.getRange(2, 5, sheet.getMaxRows() - 1, 1).setWrap(true);
  sheet.getRange(2, 7, sheet.getMaxRows() - 1, 1).setWrap(true);

  applyPuntajeFormatting(sheet, 8);
}

// ── FORMATO CONDICIONAL ────────────────────────────────────────
function applyEstadoFormatting(sheet, cols) {
  const rules = sheet.getConditionalFormatRules().filter(r =>
    !cols.some(c => r.getRanges().some(rg => rg.getColumn() === c))
  );
  cols.forEach(col => {
    const range = sheet.getRange(2, col, sheet.getMaxRows() - 1, 1);
    rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('Sólido').setBackground(SOLIDO_BG).setFontColor(SOLIDO_TEXT).setRanges([range]).build());
    rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('A mejorar').setBackground(MEJORAR_BG).setFontColor(MEJORAR_TEXT).setRanges([range]).build());
    rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('Crítico').setBackground(ATENCION_BG).setFontColor(ATENCION_TEXT).setRanges([range]).build());
  });
  sheet.setConditionalFormatRules(rules);
}

function applyPuntajeFormatting(sheet, col) {
  const range = sheet.getRange(2, col, sheet.getMaxRows() - 1, 1);
  const rules = [
    SpreadsheetApp.newConditionalFormatRule().whenNumberEqualTo(3).setBackground(SOLIDO_BG).setFontColor(SOLIDO_TEXT).setRanges([range]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenNumberEqualTo(2).setBackground(MEJORAR_BG).setFontColor(MEJORAR_TEXT).setRanges([range]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenNumberEqualTo(1).setBackground(ATENCION_BG).setFontColor(ATENCION_TEXT).setRanges([range]).build()
  ];
  sheet.setConditionalFormatRules(sheet.getConditionalFormatRules().concat(rules));
}

// ── RADAR: pestaña con selector + tabla auxiliar ──────────────
function setupRadar() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Radar');
  if (!sheet) sheet = ss.insertSheet('Radar');
  sheet.clear();

  sheet.getRange('A1').setValue('Elegí un negocio:').setFontWeight('bold');
  const leadsSheet = ss.getSheetByName('Leads');
  const rule = SpreadsheetApp.newDataValidation()
    .requireValueInRange(leadsSheet.getRange('G2:G'), true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange('B1').setDataValidation(rule).setBackground('#EAF0FA').setFontColor(NAVY).setFontWeight('bold');

  sheet.getRange('A2').setValue('Nombre y apellido:').setFontWeight('bold');
  sheet.getRange('B2').setFormula('=IFERROR(INDEX(Leads!C:C, MATCH($B$1, Leads!G:G, 0)) & " " & INDEX(Leads!D:D, MATCH($B$1, Leads!G:G, 0)), "")');

  sheet.getRange('A3').setValue('Lead ID:').setFontWeight('bold');
  sheet.getRange('B3').setFormula('=IFERROR(INDEX(Leads!A:A, MATCH($B$1, Leads!G:G, 0)), "")');

  const headers = ['Eslabón', 'Score /10'];
  sheet.getRange('A5:B5').setValues([headers]).setFontWeight('bold').setBackground(NAVY).setFontColor('#FFFFFF');

  const filas = [
    ['Costos y Precios', 'K'],
    ['Resultado Económico', 'M'],
    ['Cash Flow', 'O'],
    ['Indicadores de Gestión', 'Q']
  ];
  filas.forEach((f, i) => {
    const row = 6 + i;
    sheet.getRange(row, 1).setValue(f[0]);
    sheet.getRange(row, 2).setFormula(`=IFERROR(INDEX(Leads!${f[1]}:${f[1]}, MATCH($B$1, Leads!G:G, 0)), 0)`);
  });

  sheet.setColumnWidth(1, 200);
  sheet.setColumnWidth(2, 100);
}
