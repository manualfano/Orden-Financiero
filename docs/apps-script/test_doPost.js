// Simulación del Apps Script (doPost.gs) en node: hojas, mail y caché falsos.
// Uso: node test_doPost.js <ruta a doPost.gs>
const fs = require('fs');
const vm = require('vm');

const mails = [];
function chain() {
  return new Proxy(function () {}, { get: (t, k) => (k === Symbol.toPrimitive ? () => '' : chain()), apply: () => chain() });
}
class Hoja {
  constructor(nombre) { this.nombre = nombre; this.filas = []; this.maxCols = 26; }
  getLastRow() { return this.filas.length; }
  setFrozenRows() {} setRowHeight() {} setColumnWidth() {} setConditionalFormatRules() {} getConditionalFormatRules() { return []; } getRange2() {}
  getLastColumn() { return Math.max(0, ...this.filas.map(f => f.length)); }
  getMaxColumns() { return this.maxCols; }
  getMaxRows() { return 1000; }
  insertColumnsAfter(_, n) { this.maxCols += n; }
  appendRow(v) { if (v.length > this.maxCols) throw new Error('columna fuera de rango ' + v.length); this.filas.push(v.slice()); }
  getRange(r, c, nr, nc) {
    const h = this; nr = nr || 1; nc = nc || 1;
    const rango = {
      getValues: () => Array.from({ length: nr }, (_, i) => Array.from({ length: nc }, (_, j) => ((h.filas[r - 1 + i] || [])[c - 1 + j] ?? ''))),
      getValue: () => ((h.filas[r - 1] || [])[c - 1] ?? ''),
      setValues: (vals) => { vals.forEach((fila, i) => { const f = h.filas[r - 1 + i] || (h.filas[r - 1 + i] = []); fila.forEach((v, j) => f[c - 1 + j] = v); }); return rango; },
      setValue: (v) => { const f = h.filas[r - 1] || (h.filas[r - 1] = []); f[c - 1] = v; return rango; },
      createTextFinder: (t) => ({ matchEntireCell: () => ({ findNext: () => h.filas.slice(r - 1, r - 1 + nr).some(f => String(f[c - 1]) === t) ? {} : null }) })
    };
    const px = new Proxy(rango, { get: (t, k) => (k in t ? t[k] : () => px) });
    ['setValues', 'setValue'].forEach(k => { const f = rango[k]; rango[k] = (v) => { f(v); return px; }; });
    return px;
  }
}
class Libro {
  constructor() { this.hojas = {}; }
  getSheetByName(n) { return this.hojas[n] || null; }
  insertSheet(n) {
    const h = new Hoja(n);
    return (this.hojas[n] = new Proxy(h, { get: (t, k) => (k in t ? (typeof t[k] === 'function' ? t[k].bind(t) : t[k]) : () => chain()) }));
  }
}
const libro = new Libro();
const cache = {};
const props = {};
const ctx = {
  console,
  SpreadsheetApp: { getActiveSpreadsheet: () => libro, newConditionalFormatRule: chain, BooleanCriteria: chain() },
  LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },
  CacheService: { getScriptCache: () => ({ get: k => cache[k] || null, put: (k, v) => { cache[k] = v; } }) },
  PropertiesService: { getScriptProperties: () => ({ setProperty: (k, v) => { props[k] = v; }, getProperty: k => props[k] || null, getProperties: () => props, deleteProperty: k => { delete props[k]; } }) },
  ScriptApp: { getProjectTriggers: () => [{ getHandlerFunction: () => 'procesarColaDecks' }], newTrigger: chain },
  MailApp: { sendEmail: (to, asunto, cuerpo) => mails.push({ to, asunto, cuerpo }) },
  ContentService: { createTextOutput: (t) => ({ setMimeType: () => JSON.parse(t) }), MimeType: { JSON: 'json' } },
  Utilities: chain()
};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(process.argv[2], 'utf8'), ctx);

const base = (extra) => Object.assign({
  leadId: 'PRUEBA-' + Math.random().toString(36).slice(2, 10), timestamp: new Date().toISOString(),
  rubro: 'gastronomia', origen: 'mirror', score: 22, maxScore: 36, gravedad: 'desarrollo',
  eslabonDebil: 'Resultado económico', letras: 'CABCCCCABAAC', nombre: 'Prueba', negocio: 'Panadería X',
  instagram: 'https://www.instagram.com/panaderiax', sistema: '',
  eslabones: [{ nombre: 'Costos y precios', score: 6, estado: 'A mejorar' }, { nombre: 'Resultado económico', score: 3, estado: 'Crítico' },
              { nombre: 'Flujo de caja', score: 6, estado: 'A mejorar' }, { nombre: 'Indicadores de gestión', score: 7, estado: 'A mejorar' }],
  respuestas: [], diagnostico: 'texto', campo_extra: '', gravedadEslabon: 'critico',
  utm_source: '', utm_medium: '', utm_campaign: '', utm_content: '', referrer: ''
}, extra);
const post = (d) => ctx.doPost({ postData: { contents: JSON.stringify(d) } });

let fallas = 0;
function ok(cond, nombre) { console.log((cond ? 'OK   ' : 'FALLA') + ' ' + nombre); if (!cond) fallas++; }

// 1. Argentina válido (web nueva)
mails.length = 0;
let r = post(base({ whatsapp: '5492216809170', whatsappPais: 'AR', whatsappDisplay: '+54 9 221 680 9170', whatsappVerificado: 'si' }));
ok(r.ok === true, 'AR válido se guarda');
const leads = libro.getSheetByName('Leads');
let fila = leads.filas[leads.filas.length - 1];
ok(String(fila[4]).includes('wa.me/5492216809170'), 'link wa.me AR');
ok(fila[fila.length - 1] === 'Argentina · revisado', 'columna Control: ' + fila[fila.length - 1]);
ok(leads.filas[0][leads.filas[0].length - 1] === 'Control del WhatsApp', 'encabezado nuevo en Leads');
ok(mails[0].cuerpo.includes('WhatsApp: +54 9 221 680 9170  →  https://wa.me/5492216809170'), 'mail: número y link');
ok(mails[0].cuerpo.includes('País: Argentina (número revisado: es válido)'), 'mail: país');
ok(mails[0].cuerpo.includes('Origen: el botón debajo de las frases "Facturo un montón y no veo un peso" (mirror)'), 'mail: origen en palabras');
ok(!mails[0].asunto.includes('dudoso'), 'asunto sin dudoso');

// 2. Argentina dudoso (el 599 del mystery shopper)
mails.length = 0;
r = post(base({ whatsapp: '5495992668338', whatsappPais: 'AR', whatsappDisplay: '+54 9 599 266-8338', whatsappVerificado: 'no' }));
ok(r.ok === true, 'AR dudoso se guarda igual');
ok(mails[0].asunto.endsWith('· número dudoso'), 'asunto: ' + mails[0].asunto);
ok(mails[0].cuerpo.includes('⚠ Número dudoso: no parece un número válido de Argentina'), 'mail: aviso dudoso');
fila = leads.filas[leads.filas.length - 1];
ok(fila[fila.length - 1].startsWith('Argentina · DUDOSO'), 'columna Control dudoso');

// 3. Chile
mails.length = 0;
r = post(base({ whatsapp: '56987654321', whatsappPais: 'CL', whatsappDisplay: '+56 9 8765 4321', whatsappVerificado: 'si', origen: 'guia-flujo-de-caja-calculadora-caja-falta' }));
ok(r.ok === true, 'Chile se guarda');
fila = leads.filas[leads.filas.length - 1];
ok(String(fila[4]).includes('wa.me/56987654321'), 'link wa.me Chile: ' + fila[4]);
ok(mails[0].cuerpo.includes('País: Chile'), 'mail: Chile');
ok(mails[0].cuerpo.includes('la calculadora de la guía "flujo de caja" — resultado de la calculadora: caja falta'), 'mail: origen guía con caso');

// 4. Web vieja (sin campos nuevos): sigue andando como siempre
mails.length = 0;
r = post(base({ whatsapp: '5491155550000' }));
ok(r.ok === true, 'web vieja AR se guarda');
ok(mails[0].cuerpo.includes('WhatsApp: +54 9 11 5555-0000'), 'web vieja: formato de siempre');
ok(mails[0].cuerpo.includes('País: Argentina'), 'web vieja: país deducido');
fila = leads.filas[leads.filas.length - 1];
ok(fila[fila.length - 1] === 'Argentina', 'web vieja: control solo país');

// 5. Rechazos
ok(post(base({ whatsapp: '541155550000' })).error === 'whatsapp_invalido', 'AR sin 9 rechazado');
ok(post(base({ whatsapp: '1234567' })).error === 'whatsapp_invalido', 'corto rechazado');
ok(post(base({ whatsapp: '0987654321' })).error === 'whatsapp_invalido', 'empieza con 0 rechazado');
ok(post(base({ whatsapp: '5698765432112345' })).error === 'whatsapp_invalido', 'más de 15 rechazado');
ok(post(base({ whatsapp: '=HYPERLINK("x")' })).error === 'whatsapp_invalido', 'fórmula rechazada');

// 6. Display malicioso se ignora
mails.length = 0;
r = post(base({ whatsapp: '56987654321', whatsappPais: 'CL', whatsappDisplay: '=IMPORTXML("http://x")', whatsappVerificado: 'si' }));
ok(r.ok && mails[0].cuerpo.includes('WhatsApp: +56987654321'), 'display raro ignorado');
r = post(base({ whatsapp: '56987654321', whatsappPais: 'zzz"', whatsappVerificado: 'quizas' }));
fila = leads.filas[leads.filas.length - 1];
ok(r.ok && fila[fila.length - 1] === '', 'país y verificado raros ignorados: "' + fila[fila.length - 1] + '"');

// 7. Reintento no duplica
const id = 'PRUEBA-reintento1';
const antes = leads.filas.length;
post(base({ leadId: id, whatsapp: '5492216809170' })); post(base({ leadId: id, whatsapp: '5492216809170' }));
ok(leads.filas.length === antes + 1, 'reintento no duplica');

// 8. Descarga: hoja vieja sin la columna nueva
const desc = libro.insertSheet('Descarga de Excel');
desc.filas.push(['Lead ID', 'Fecha', 'WhatsApp', 'Archivo', 'Origen', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'Referrer']);
mails.length = 0;
r = post({ tipo: 'descarga', leadId: 'PRUEBA-desc1', timestamp: new Date().toISOString(), whatsapp: '525512345678', whatsappPais: 'MX',
           whatsappDisplay: '+52 55 1234 5678', whatsappVerificado: 'si', origen: 'guia-costo-de-un-plato-excel', archivo: 'Calc.xlsx', campo_extra: '' });
ok(r.ok === true, 'descarga México se guarda');
ok(libro.hojas['Descarga de Excel'].filas[0][10] === 'Control del WhatsApp', 'descarga: encabezado sumado a hoja vieja');
ok(String(desc.filas[1][2]).includes('wa.me/525512345678') && String(desc.filas[1][2]).includes('+52 55 1234 5678'), 'descarga: link y número');
ok(desc.filas[1][10] === 'México · revisado', 'descarga: control');
ok(mails[0].cuerpo.includes('la descarga del Excel de la guía "costo de un plato"'), 'descarga: origen en palabras');
ok(!mails[0].cuerpo.includes('\n\n\n'), 'mail sin líneas vacías de más');

// 9. Origen desconocido / sin origen
ok(ctx.origenEnPalabras('') === '-' && ctx.origenEnPalabras('desconocido') === '-' && ctx.origenEnPalabras('bio-ig') === 'bio-ig', 'origen vacío o raro');
ok(ctx.origenEnPalabras('guia-food-cost') === 'un link de la guía "food cost" (guia-food-cost)', 'origen guía simple');
ok(ctx.origenEnPalabras('guia-food-cost-barra') === 'la barra fija de la guía "food cost" (guia-food-cost-barra)', 'origen guía barra');

// 10. GET
ok(ctx.doGet().version === '2026-10-14-whatsapp', 'versión publicada');

console.log(fallas ? `\n${fallas} FALLAS` : '\nTodo OK');
process.exit(fallas ? 1 : 0);
