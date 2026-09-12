// Diagnostico financiero de ordenfinanciero.com — PORTADO SIN CAMBIOS desde
// master:index.html (86db428), lineas 4517, 4527-4545 y 4588-5689 (Fase 3 de la
// migracion a Astro, 09/2026). Misma logica, mismos textos, mismos umbrales,
// mismo desempate, mismo envio del lead y mismos eventos de GA4. track() vive
// en el layout (Base.astro). Lo unico nuevo esta al final, marcado como GLUE.
// Validado con la simulacion exhaustiva de las 531.441 combinaciones: 0 diferencias.

const MOTION = (() => { const cs = getComputedStyle(document.documentElement); const ms = n => parseFloat(cs.getPropertyValue(n)) || 120; return { instante: ms('--t-instante'), rapido: ms('--t-rapido'), entrada: ms('--t-entrada'), autoavance: ms('--t-autoavance') || 4000 }; })();

// ── ATRIBUCION: primer contacto de la sesion (Fase 1, C) ─────────
// UTMs, ?origen= y el sitio de donde llego (solo el dominio). Se guardan una
// vez por pestaña y no se pisan: viajan al Sheet con el lead.
const atribucion = (function () {
  const KEY = 'of_atrib_v1';
  try { const a = JSON.parse(sessionStorage.getItem(KEY) || 'null'); if (a) return a; } catch (e) {}
  const q = new URLSearchParams(location.search);
  const limpio = v => (v || '').trim().slice(0, 100);
  let referrer = '';
  try { if (document.referrer) { const u = new URL(document.referrer); if (u.hostname !== location.hostname) referrer = u.origin; } } catch (e) {}
  const a = {
    utm_source: limpio(q.get('utm_source')), utm_medium: limpio(q.get('utm_medium')),
    utm_campaign: limpio(q.get('utm_campaign')), utm_content: limpio(q.get('utm_content')),
    origen: limpio(q.get('origen')), referrer: referrer
  };
  try { sessionStorage.setItem(KEY, JSON.stringify(a)); } catch (e) {}
  return a;
})();


// ── FOCUS TRAP: el Tab circula dentro del overlay abierto ──────
let _lastFocus = null;

function _diagFocusables() {
  const ov = document.getElementById('diag-overlay');
  return [...ov.querySelectorAll('button, a[href], input, select, [tabindex]:not([tabindex="-1"])')]
    .filter(el => el.offsetParent !== null && !el.disabled && el.style.pointerEvents !== 'none');
}

function _trapTab(e) {
  if (e.key !== 'Tab') return;
  const ov = document.getElementById('diag-overlay');
  if (!ov.classList.contains('active')) return;
  const f = _diagFocusables();
  if (!f.length) return;
  const first = f[0], last = f[f.length - 1];
  const dentro = ov.contains(document.activeElement);
  if (e.shiftKey && (document.activeElement === first || !dentro)) {
    e.preventDefault(); last.focus();
  } else if (!e.shiftKey && (document.activeElement === last || !dentro)) {
    e.preventDefault(); first.focus();
  }
}

function _abrirTrap() {
  _lastFocus = document.activeElement;
  document.addEventListener('keydown', _trapTab, true);
  const ov = document.getElementById('diag-overlay');
  setTimeout(() => ov.focus(), MOTION.instante / 4);
}

function _cerrarTrap() {
  document.removeEventListener('keydown', _trapTab, true);
  if (_lastFocus && typeof _lastFocus.focus === 'function') _lastFocus.focus();
  _lastFocus = null;
}

// ── OVERLAY: abrir, retomar, cerrar ─────────────────────────────
// El estado vive en sessionStorage (saveState/loadState, mas abajo):
// recargar, volver atras o cerrar no pierde las respuestas.
function openDiagnostico(origen) {
  const ov = document.getElementById('diag-overlay');
  ov.classList.add('active');
  if (window.__stickyRefresh) window.__stickyRefresh();
  document.body.style.overflow = 'hidden';
  if (location.hash === '#diagnostico') history.replaceState({ diag: true }, '', '#diagnostico');
  else history.pushState({ diag: true }, '', '#diagnostico');

  const retomado = loadState();
  if (!retomado) {
    startDiag();
    // ?origen= (link de una guia, la bio, ManyChat) manda sobre el boton que abrio
    state.origen = atribucion.origen || origen || 'desconocido';
  }
  state._abandonTracked = false;
  document.getElementById('close-confirm').hidden = true;
  _abrirTrap();
  track('diag_open', { origen: origen || 'desconocido', retomado: retomado ? 'si' : 'no' });
  if (retomado) resumeScreen();
}

function resumeScreen() {
  if (state.completado) { showResultPartial(); return; }
  renderQuestion(); showScreen('screen-question'); updateChain();
}

// ultimo paso visible del prospecto, para diag_abandon
function _ultimoPaso() {
  if (state.leadOk) return 'analisis';
  if (state.completado) return 'resultado';
  return 'q' + Math.min(state.currentQ + 1, 12);
}

function _trackAbandon() {
  const ov = document.getElementById('diag-overlay');
  if (!ov.classList.contains('active') || state.leadOk || state._abandonTracked) return;
  state._abandonTracked = true;
  track('diag_abandon', { ultimo_paso: _ultimoPaso() });
}

window.addEventListener('pagehide', _trackAbandon);

// La X pide confirmacion de una linea solo si ya hay algo cargado.
function pedirCierre() {
  const hayAlgo = state.answers.some(a => a !== null);
  if (!hayAlgo) { closeDiagnostico(); return; }
  const c = document.getElementById('close-confirm');
  c.hidden = false;
  const b = c.querySelector('button.primary');
  if (b) b.focus();
}

function cancelarCierre() {
  document.getElementById('close-confirm').hidden = true;
  document.querySelector('.diag-close').focus();
}

function closeDiagnostico() {
  cancelAutoAdvance();
  _trackAbandon();
  document.getElementById('diag-overlay').classList.remove('active');
  document.getElementById('close-confirm').hidden = true;
  document.body.style.overflow = '';
  if (location.hash === '#diagnostico') history.replaceState(null, '', location.pathname + location.search);
  _cerrarTrap();
  if (window.__stickyRefresh) window.__stickyRefresh();
}

window.addEventListener('popstate', function (e) {
  const ov = document.getElementById('diag-overlay');
  if (e.state && e.state.diag) { if (!ov.classList.contains('active')) openDiagnostico('historial'); return; }
  if (location.hash === '#diagnostico') { if (!ov.classList.contains('active')) openDiagnostico('link'); return; }
  if (ov.classList.contains('active')) closeDiagnostico();
});

// Un link a #diagnostico estando ya en la pagina (sin recarga) tambien abre.
window.addEventListener('hashchange', function () {
  const ov = document.getElementById('diag-overlay');
  if (location.hash === '#diagnostico' && !ov.classList.contains('active')) openDiagnostico('link');
});

window.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && document.getElementById('diag-overlay').classList.contains('active')) {
    pedirCierre();
  }
});

// ── ICONOS por eslabón (stroke 2, mismo lenguaje) ───────────────
const ICONS = [
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>'
];

const REACTION_ICONS = {
  ok:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
  warn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
  crit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
};

// ── DATOS DEL DIAGNÓSTICO ──────────────────────────────────────
const PREGUNTAS = [
  // ESLABÓN 0: Costos y precios
  {
    eslabón: 0, eslabónNombre: "Costos y precios",
    texto: "¿Sabés cuánto te cuesta realmente producir o dar cada servicio?",
    opciones: [
      { letra:"A", texto:"Sí, lo tengo calculado y lo actualizo seguido", score: 3 },
      { letra:"B", texto:"A veces, pero no siempre lo tengo actualizado", score: 2 },
      { letra:"C", texto:"No, lo calculo a ojo", score: 1 }
    ],
    reacciones: [
      { tipo:"ok",   texto:"Bien. Con ese número claro, cada precio que ponés tiene respaldo real." },
      { tipo:"warn", texto:"Sin un número exacto, el precio es una estimación. Y en Argentina eso se paga caro." },
      { tipo:"crit", texto:"Es lo más común. Muchos venden mucho y después no ven la plata. El costo es el primer agujero." }
    ]
  },
  {
    eslabón: 0, eslabónNombre: "Costos y precios",
    texto: "¿Tu precio de venta está calculado sobre tus costos reales o lo fijás mirando a la competencia?",
    opciones: [
      { letra:"A", texto:"Sí, lo calculo sobre mis costos reales", score: 3 },
      { letra:"B", texto:"A veces uno, a veces el otro", score: 2 },
      { letra:"C", texto:"Lo fijo según lo que cobra la competencia", score: 1 }
    ],
    reacciones: [
      { tipo:"ok",   texto:"El que fija precio sobre sus costos manda. El que mira a la competencia, sigue." },
      { tipo:"warn", texto:"Mirar al mercado no está mal, pero sin el costo claro el negocio puede estar vendiendo y perdiendo sin que se note." },
      { tipo:"crit", texto:"Si tu precio lo pone la competencia, tu margen también lo pone ella. Así no se construye un negocio." }
    ]
  },
  {
    eslabón: 0, eslabónNombre: "Costos y precios",
    texto: "¿Actualizás tus precios cuando suben tus costos?",
    opciones: [
      { letra:"A", texto:"Sí, lo hago sistemáticamente", score: 3 },
      { letra:"B", texto:"A veces, pero no siempre", score: 2 },
      { letra:"C", texto:"No, los mantengo o los subo cuando puedo", score: 1 }
    ],
    reacciones: [
      { tipo:"ok",   texto:"Clave en Argentina. El que no actualiza trabaja cada mes con un margen más chico, aunque venda igual." },
      { tipo:"warn", texto:"Cada mes sin actualizar, el costo sube y el precio queda quieto. El margen se achica solo." },
      { tipo:"crit", texto:"En contexto inflacionario, no actualizar precios es subsidiar a tus clientes con tu propia rentabilidad." }
    ]
  },
  // ESLABÓN 1: Resultado económico
  {
    eslabón: 1, eslabónNombre: "Resultado económico",
    texto: "¿Sabés exactamente cuánto ganó tu negocio el mes pasado?",
    opciones: [
      { letra:"A", texto:"Sí, lo tengo claro", score: 3 },
      { letra:"B", texto:"A veces, pero no de manera consistente", score: 2 },
      { letra:"C", texto:"No, no lo tengo resuelto", score: 1 }
    ],
    reacciones: [
      { tipo:"ok",   texto:"Bien. Saber el resultado real es la diferencia entre gestionar y adivinar." },
      { tipo:"warn", texto:"Si ese número no aparece todos los meses, el negocio se maneja a ciegas." },
      { tipo:"crit", texto:"El negocio vende, pero la plata no se ve. Sin ese número no hay forma de saber si gana o gira en falso." }
    ]
  },
  {
    eslabón: 1, eslabónNombre: "Resultado económico",
    texto: "¿Separás las finanzas del negocio de tus gastos personales?",
    opciones: [
      { letra:"A", texto:"Sí, siempre", score: 3 },
      { letra:"B", texto:"A veces, depende del mes", score: 2 },
      { letra:"C", texto:"No, están mezcladas", score: 1 }
    ],
    reacciones: [
      { tipo:"ok",   texto:"Perfecto. Sin esa separación es imposible saber si el negocio es rentable o te estás comiendo el capital." },
      { tipo:"warn", texto:"Cuando se mezclan, el resultado que ves no es el del negocio. Es un número distorsionado." },
      { tipo:"crit", texto:"Es el error más común. Y el que más distorsiona la foto real. Muchos creen que ganan cuando en realidad se están descapitalizando." }
    ]
  },
  {
    eslabón: 1, eslabónNombre: "Resultado económico",
    texto: "¿Tenés un cierre mensual que te muestre ventas, costos, estructura, impuestos y ganancia neta?",
    opciones: [
      { letra:"A", texto:"Sí, por supuesto que lo tengo", score: 3 },
      { letra:"B", texto:"A veces, pero no de manera consistente", score: 2 },
      { letra:"C", texto:"No, no lo tengo resuelto", score: 1 }
    ],
    reacciones: [
      { tipo:"ok",   texto:"Bien. El cierre mensual es el tablero de control del negocio. Con eso podés tomar decisiones." },
      { tipo:"warn", texto:"Un cierre que aparece cada tanto no sirve para comparar ni para decidir. Necesitás la serie completa." },
      { tipo:"crit", texto:"Sin cierre mensual, el resultado del negocio es una sensación. No un número real." }
    ]
  },
  // ESLABÓN 2: Flujo de caja
  {
    eslabón: 2, eslabónNombre: "Flujo de caja",
    texto: "¿Llegás a fin de mes con plata disponible para pagar sueldos y proveedores sin apurarte?",
    opciones: [
      { letra:"A", texto:"Sí, siempre", score: 3 },
      { letra:"B", texto:"A veces llego justo", score: 2 },
      { letra:"C", texto:"No, siempre estoy cortito o me falta", score: 1 }
    ],
    reacciones: [
      { tipo:"ok",   texto:"Bien. Tener liquidez cuando la necesitás es señal de que el flujo está ordenado." },
      { tipo:"warn", texto:"Llegar justo todos los meses no es normal. Es una señal de que algo en el flujo está desbalanceado." },
      { tipo:"crit", texto:"Cuanto más vende el negocio, más se atora la caja. Eso es un cuello de botella financiero, no un problema de ventas." }
    ]
  },
  {
    eslabón: 2, eslabónNombre: "Flujo de caja",
    texto: "¿Sabés con anticipación cuándo van a ser tus próximos gastos fuertes?",
    opciones: [
      { letra:"A", texto:"Sí, los tengo mapeados", score: 3 },
      { letra:"B", texto:"Algunos sí, otros me agarran de sorpresa", score: 2 },
      { letra:"C", texto:"No, me entero cuando llegan", score: 1 }
    ],
    reacciones: [
      { tipo:"ok",   texto:"Bien. Anticipar gastos es lo que te permite no sorprenderte a fin de mes." },
      { tipo:"warn", texto:"Sin anticipar esos gastos, cada gasto grande agarra al negocio desprevenido. Eso genera tensión de caja." },
      { tipo:"crit", texto:"Sin ese mapa de gastos, el negocio reacciona en vez de planificar. Y reaccionar siempre cuesta más caro." }
    ]
  },
  {
    eslabón: 2, eslabónNombre: "Flujo de caja",
    texto: "¿Tus cobros y pagos están equilibrados o siempre pagás antes de cobrar?",
    opciones: [
      { letra:"A", texto:"Cobro antes o al mismo tiempo que pago", score: 3 },
      { letra:"B", texto:"Depende del mes y del cliente", score: 2 },
      { letra:"C", texto:"Siempre pago antes de cobrar", score: 1 }
    ],
    reacciones: [
      { tipo:"ok",   texto:"Bien. Cobrar antes de pagar es la base de un flujo sano. Muchos negocios rentables quiebran por esto." },
      { tipo:"warn", texto:"Cuando el negocio paga antes de cobrar, financia a sus clientes con plata propia. Eso tiene un costo real." },
      { tipo:"crit", texto:"La caja del negocio depende de que la plata entre a tiempo, contando los días. Eso es un cuello de botella financiero puro." }
    ]
  },
  // ESLABÓN 3: Indicadores de gestión
  {
    eslabón: 3, eslabónNombre: "Indicadores de gestión",
    texto: "¿Revisás los números de tu negocio al menos una vez por mes?",
    opciones: [
      { letra:"A", texto:"Sí, lo hago todos los meses", score: 3 },
      { letra:"B", texto:"A veces, cuando me acuerdo o hay un problema", score: 2 },
      { letra:"C", texto:"No, casi nunca los reviso", score: 1 }
    ],
    reacciones: [
      { tipo:"ok",   texto:"Bien. El que revisa sus números mensualmente toma mejores decisiones que el que los mira una vez por año." },
      { tipo:"warn", texto:"Sin revisión mensual, los problemas se acumulan en silencio. Cuando los ves, ya costaron caro." },
      { tipo:"crit", texto:"Sin los números arriba de la mesa, el negocio se maneja al tum tún y cualquier decisión es una apuesta." }
    ]
  },
  {
    eslabón: 3, eslabónNombre: "Indicadores de gestión",
    texto: "¿Tenés algún indicador que seguís regularmente (crecimiento de ventas, contribución marginal, punto de equilibrio)?",
    opciones: [
      { letra:"A", texto:"Sí, tengo uno o más que sigo de cerca", score: 3 },
      { letra:"B", texto:"Tengo algunos pero no los sigo con regularidad", score: 2 },
      { letra:"C", texto:"No, no tengo ninguno definido", score: 1 }
    ],
    reacciones: [
      { tipo:"ok",   texto:"Bien. Tener un indicador propio es señal de que gestionás con criterio, no a ojo." },
      { tipo:"warn", texto:"Un indicador que se mira a veces no da tendencia. Y sin tendencia no se sabe si el negocio mejoró." },
      { tipo:"crit", texto:"Sin un número que seguir (cuánto crecen las ventas, cuánto deja cada venta, cuánto hay que vender para cubrir los gastos), lo que da vueltas por todos lados nunca se convierte en información útil." }
    ]
  },
  {
    eslabón: 3, eslabónNombre: "Indicadores de gestión",
    texto: "¿Tomás decisiones de inversión o contratación con datos concretos?",
    opciones: [
      { letra:"A", texto:"Sí, siempre me baso en números", score: 3 },
      { letra:"B", texto:"A veces sí, a veces me guío por intuición", score: 2 },
      { letra:"C", texto:"No, decido a ojo", score: 1 }
    ],
    reacciones: [
      { tipo:"ok",   texto:"Bien. Decidir con datos no elimina el riesgo, pero sí lo reduce a lo que vale la pena asumir." },
      { tipo:"warn", texto:"A veces alcanza, a veces no. El problema es que cuando no alcanza, el costo de equivocarse es alto." },
      { tipo:"crit", texto:"Las decisiones grandes se toman a ojo. Este diagnóstico es el primer paso para que se tomen con números." }
    ]
  }
];

// ── TEXTOS DE RESULTADO (eslabón débil × nivel de gravedad × rubro) ──
const TEXTOS_RESULTADO = {
  costos: {
    critico: {
      espejo: "El negocio vende todos los días, pero a fin de mes no queda claro dónde se fue la plata.",
      consecuencia: "Es muy probable que algunos platos de la carta den pérdida sin que se note: cada vez que el costo de un ingrediente sube y el precio de la carta queda igual, el margen se regala.",
      gancho: "El problema no es vender más — es saber cuáles de tus ventas realmente te conviene hacer. Eso es lo que vemos en la llamada."
    },
    desarrollo: {
      espejo: "Hay una idea de los costos, pero no la precisión suficiente como para confiar del todo en los precios.",
      consecuencia: "Hay platos que seguramente dejan mejor margen que otros, pero sin el cálculo exacto es difícil saber cuáles empujar y cuáles revisar.",
      gancho: "Hay un ajuste relativamente simple que puede mejorar tu margen sin vender un peso más. Te lo muestro en la llamada."
    },
    solido: {
      espejo: "Tenés un manejo bastante claro de tus costos y precios — es una de las bases más sólidas de un negocio ordenado.",
      consecuencia: "El siguiente nivel no es calcular mejor, es usar ese cálculo para decidir qué platos potenciar y cuáles sacar de la carta.",
      gancho: "Tenés la base. La pregunta es si la estás usando para crecer con foco o solo para no perder plata. Eso lo vemos en la llamada."
    }
  },
  resultado: {
    critico: {
      espejo: "El negocio trabaja todo el mes y vende, pero llega a fin de mes sin un número claro de cuánto ganó de verdad.",
      consecuencia: "Es probable que la plata que entra en caja se confunda con la ganancia real del local: son cosas muy distintas, y la diferencia aparece cuando hay que invertir o afrontar un imprevisto.",
      gancho: "Sin ese número, cualquier decisión grande es una apuesta. El primer paso es tener un cierre simple y confiable. Eso es lo que armamos en la llamada."
    },
    desarrollo: {
      espejo: "Hay una noción de cómo le va al negocio, pero no un cierre formal que dé el número exacto cada mes.",
      consecuencia: "El mes puede sentirse bueno o malo, pero sin el número exacto es difícil saber si esa sensación coincide con la realidad.",
      gancho: "Formalizar ese cierre no lleva mucho tiempo y cambia completamente la calidad de tus decisiones. Te muestro cómo en la llamada."
    },
    solido: {
      espejo: "Tenés bastante claridad sobre cuánto gana tu negocio — eso ya te pone en mejor posición que la mayoría de las PyMEs.",
      consecuencia: "El siguiente paso es usar ese número para planificar inversión y crecimiento, no solo para controlar que no falte plata.",
      gancho: "Tener el número es la base. Usarlo para crecer con estrategia es el siguiente nivel. Eso lo vemos en la llamada."
    }
  },
  cashflow: {
    critico: {
      espejo: "Hay meses en los que, aunque las cosas parecen ir bien, al negocio le cuesta llegar a fin de mes con la plata justa.",
      consecuencia: "Es un patrón común en gastronomía: los proveedores se pagan antes de cobrar, y eso genera tensión financiera aunque el negocio sea rentable en el papel.",
      gancho: "Esto no se resuelve facturando más — se resuelve ordenando los tiempos de cobro y pago. Eso es lo que vemos en la llamada."
    },
    desarrollo: {
      espejo: "En general el negocio llega a fin de mes, pero sin mucho margen ni anticipación frente a gastos grandes.",
      consecuencia: "Un arreglo, un aumento de insumos, un mes con menos mesas — sin colchón, cualquiera de esas te deja sin caja para operar.",
      gancho: "Con una proyección simple de 60-90 días, estos baches se anticipan en vez de sufrirse. Te muestro cómo armarla en la llamada."
    },
    solido: {
      espejo: "Manejás bien los tiempos de cobro y pago — eso le da bastante estabilidad a tu operación.",
      consecuencia: "El siguiente nivel es usar ese colchón para negociar mejores condiciones con proveedores o invertir en momentos clave.",
      gancho: "Tener la caja ordenada te da margen de maniobra que otros no tienen. La pregunta es cómo aprovecharlo mejor. Eso lo vemos en la llamada."
    }
  },
  gestion: {
    critico: {
      espejo: "Las decisiones importantes del negocio se toman más por intuición o urgencia que por información concreta.",
      consecuencia: "Decisiones como sumar un plato, abrir un turno o contratar personal probablemente se están tomando sin el respaldo de números que confirmen si conviene.",
      gancho: "Esto cambia completamente cuando empezás a mirar 3 o 4 números clave cada mes. Te muestro cuáles en la llamada."
    },
    desarrollo: {
      espejo: "Algunas cosas se controlan, pero no de manera sistemática — el seguimiento depende más de la memoria que de un proceso.",
      consecuencia: "Sin un seguimiento sistemático, los problemas (mermas, baja rotación de algún plato) se detectan tarde, cuando ya impactaron en el resultado.",
      gancho: "Con 3 o 4 indicadores simples revisados cada mes, esto pasa de reactivo a preventivo. Te muestro cuáles en la llamada."
    },
    solido: {
      espejo: "Tenés un buen hábito de revisar números y tomar decisiones con información — eso ya te diferencia de la mayoría.",
      consecuencia: "El siguiente nivel es usar esos indicadores no solo para controlar, sino para proyectar crecimiento (nuevo local, nuevo turno, nueva carta).",
      gancho: "Ya tenés el hábito. La pregunta es si lo estás usando para crecer o solo para no retroceder. Eso lo vemos en la llamada."
    }
  }
};

// ── ESTADO ────────────────────────────────────────────────────
// Fase 1 (D): un solo rubro; viaja fijo en el estado y en el payload.
const RUBRO = 'gastronomia';
// answers[q] = indice de la opcion elegida (0..2) o null. Los puntajes por
// eslabon se derivan de answers (syncScores) para que "Anterior" y cambiar
// una respuesta no rompan la cuenta. Scoring y umbrales: sin cambios.
const DIAG_STORAGE_KEY = 'of_diag_v2';

const state = {
  currentQ: 0,
  answers: Array(12).fill(null),
  eslabónScores: [0,0,0,0],
  eslabónCounts: [0,0,0,0],
  rubro: RUBRO,
  origen: 'desconocido',
  leadData: {},
  completado: false,   // llego al resultado parcial (conversion de la web, A1-a)
  leadOk: false,       // dejo el WhatsApp y vio el analisis completo
  leadGuardado: false, // el Apps Script confirmo la fila (solo en memoria)
  leadId: null,        // fijo por numero: el reintento reusa el mismo y no duplica
  _abandonTracked: false
};

function syncScores() {
  const scores = [0,0,0,0], counts = [0,0,0,0];
  state.answers.forEach((idx, q) => {
    if (idx === null || idx === undefined) return;
    const p = PREGUNTAS[q];
    scores[p.eslabón] += p.opciones[idx].score;
    counts[p.eslabón]++;
  });
  state.eslabónScores = scores;
  state.eslabónCounts = counts;
}

function answeredCount() { return state.answers.filter(a => a !== null && a !== undefined).length; }

function saveState() {
  try {
    // leadOk solo se guarda si el numero quedo en el Sheet: si no, al recargar
    // vuelve a pedir el WhatsApp (que nunca va al storage) en vez de perder el lead.
    sessionStorage.setItem(DIAG_STORAGE_KEY, JSON.stringify({
      currentQ: state.currentQ, answers: state.answers, rubro: state.rubro,
      origen: state.origen, completado: state.completado, leadOk: state.leadOk && state.leadGuardado
    }));
  } catch (e) { /* sin storage (modo privado estricto): sigue en memoria */ }
}

function loadState() {
  try {
    const raw = sessionStorage.getItem(DIAG_STORAGE_KEY);
    if (!raw) return false;
    const s = JSON.parse(raw);
    // Hay algo que retomar si respondio al menos una pregunta (antes: si eligio rubro)
    if (!s || !Array.isArray(s.answers) || (!s.completado && !s.answers.some(a => a !== null && a !== undefined))) return false;
    state.currentQ = Math.min(Math.max(parseInt(s.currentQ, 10) || 0, 0), 11);
    state.answers = (Array.isArray(s.answers) && s.answers.length === 12) ? s.answers : Array(12).fill(null);
    state.rubro = RUBRO;
    state.origen = s.origen || 'desconocido';
    state.completado = !!s.completado;
    state.leadOk = !!s.leadOk;
    state.leadGuardado = state.leadOk;
    state.leadData = {};
    syncScores();
    return true;
  } catch (e) { return false; }
}

function clearState() {
  try { sessionStorage.removeItem(DIAG_STORAGE_KEY); } catch (e) {}
}

// ── UMBRALES: una sola fuente (Fase 1, bloque B) ─────────────────
// Por eslabon (3 a 9 puntos): 3-4 critico · 5-7 a mejorar (desarrollo) · 8-9 solido.
// Total (12 a 36): <=19 critico · 20-29 en desarrollo · >=30 solido.
// El medidor, el rotulo, los textos de cada eslabon, el badge y el payload
// salen todos de aca: no hay otra cuenta de umbrales en el archivo.
const UMBRAL_ESLABON = { criticoHasta: 4, solidoDesde: 8, min: 3, max: 9 };
const UMBRAL_TOTAL = { criticoHasta: 19, solidoDesde: 30, min: 12, max: 36 };

function nivelEslabon(score) {
  if (score <= UMBRAL_ESLABON.criticoHasta) return 'critico';
  if (score >= UMBRAL_ESLABON.solidoDesde) return 'solido';
  return 'desarrollo';
}

function nivelTotal(total) {
  if (total <= UMBRAL_TOTAL.criticoHasta) return 'critico';
  if (total >= UMBRAL_TOTAL.solidoDesde) return 'solido';
  return 'desarrollo';
}

const ESTADO_POR_NIVEL = { critico: 'crit', desarrollo: 'warn', solido: 'ok' };
const ROTULO_POR_NIVEL = { critico: 'Crítico', desarrollo: 'A mejorar', solido: 'Sólido' };

// Estado de un eslabon completo (count = 3 preguntas respondidas)
function getEslabónState(score, count) {
  if (count === 0) return 'pending';
  return ESTADO_POR_NIVEL[nivelEslabon(score)];
}

function getEslabónLabel(score, count) {
  if (count === 0) return '—';
  return ROTULO_POR_NIVEL[nivelEslabon(score)];
}

// Eslabon mas debil: menor puntaje; si empatan, el que tiene mas respuestas C;
// si siguen empatados, el orden de la cadena (Costos → Resultado → Caja → Gestion).
function indiceEslabonDebil() {
  const s = state.eslabónScores;
  const respuestasC = i => state.answers.filter((idx, q) =>
    idx !== null && idx !== undefined && PREGUNTAS[q].eslabón === i && PREGUNTAS[q].opciones[idx].score === 1).length;
  let debil = 0;
  for (let i = 1; i < 4; i++) {
    if (s[i] < s[debil] || (s[i] === s[debil] && respuestasC(i) > respuestasC(debil))) debil = i;
  }
  return debil;
}

// Textos del caso en que los 4 eslabones son solidos: "debil" arriba de un
// medidor "Solido" seria una contradiccion.
const ROTULO_DEBIL = {
  normal: { tarjeta: 'Tu eslabón más débil', encabezado: 'Tu eslabón más débil, explicado' },
  todosSolidos: { tarjeta: 'El más bajo de los cuatro', encabezado: 'Tu eslabón más bajo, explicado' }
};

function getProgressMicrocopy(total) {
  if (total === 0) return '0 / 12';
  if (total === 12) return '12 / 12';
  return `${total} / 12`;
}

const ESLABÓN_MICROFRASE = {
  ok:   'Esto está ordenado',
  warn: 'Le falta una vuelta de tuerca',
  crit: 'Acá se va la plata'
};

function updateChain() {
  syncScores();
  const total = answeredCount();
  document.getElementById('progress-text').textContent = getProgressMicrocopy(total);
  document.getElementById('progress-fill').style.width = `${(total/12)*100}%`;
  const topFill = document.getElementById('top-progress-fill');
  if (topFill) topFill.style.width = `${(total/12)*100}%`;

  const currentEslabón = state.completado ? -1 : (PREGUNTAS[state.currentQ] || {}).eslabón;
  for (let i = 0; i < 4; i++) {
    const node = document.getElementById(`node-${i}`);
    const scoreEl = document.getElementById(`score-${i}`);
    const descEl = node.querySelector('.node-desc');
    const s = state.eslabónScores[i];
    const c = state.eslabónCounts[i];

    let st = (c === 3) ? getEslabónState(s, c) : 'pending';
    if (st === 'pending' && i === currentEslabón) st = 'active';

    node.className = `chain-node state-${st}`;
    scoreEl.textContent = c > 0 ? `${s}/${c*3}` : '—';

    if (descEl) {
      if (c === 3) { descEl.textContent = ESLABÓN_MICROFRASE[st] || ESLABÓN_MICROFRASE.warn; descEl.style.fontWeight = '600'; }
      else { descEl.style.fontWeight = ''; }
    }
  }
}

function showScreen(id) {
  document.querySelectorAll('#diag-overlay .screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  document.getElementById('panel-right').scrollTop = 0;
}

// ── INICIO ────────────────────────────────────────────────────
function startDiag() {
  clearState();
  state.currentQ = 0;
  state.answers = Array(12).fill(null);
  state.eslabónScores = [0,0,0,0];
  state.eslabónCounts = [0,0,0,0];
  state.rubro = RUBRO;
  state.leadData = {};
  state.completado = false;
  state.leadOk = false;
  state.leadGuardado = false;
  state.leadId = null;
  document.getElementById('diag-overlay').classList.remove('show-result');
  resetGate();
  renderQuestion();
  showScreen('screen-question');
  updateChain();
}

// ── RENDER PREGUNTA ───────────────────────────────────────────
function renderQuestion() {
  const q = PREGUNTAS[state.currentQ];
  const elegida = state.answers[state.currentQ];

  document.getElementById('q-eslabon-name').textContent = q.eslabónNombre;
  document.getElementById('q-num').textContent = `Pregunta ${state.currentQ + 1} de 12`;
  document.getElementById('q-text').textContent = q.texto;

  const qHeader = document.querySelector('#screen-question .q-header');
  qHeader.classList.remove('q-enter');
  void qHeader.offsetWidth;
  qHeader.classList.add('q-enter');

  const container = document.getElementById('q-options');
  container.classList.remove('q-enter');
  void container.offsetWidth;
  container.classList.add('q-enter');
  container.innerHTML = '';

  q.opciones.forEach((op, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'q-option q-option-stagger';
    btn.setAttribute('aria-pressed', elegida === idx ? 'true' : 'false');
    btn.style.animationDelay = `${idx * MOTION.instante / 2}ms`;
    btn.innerHTML = `
      <div class="opt-letter" aria-hidden="true">${op.letra}</div>
      <div class="opt-text">${op.texto}</div>
    `;
    btn.onclick = () => selectOption(idx);
    container.appendChild(btn);
  });

  renderReaction();

  const prev = document.getElementById('btn-prev');
  prev.disabled = state.currentQ === 0;
  prev.innerHTML = '<span aria-hidden="true">←</span> Anterior';

  const next = document.getElementById('btn-next');
  next.disabled = (elegida === null || elegida === undefined);
  next.innerHTML = state.currentQ === 11
    ? 'Ver mi resultado <span aria-hidden="true">→</span>'
    : 'Siguiente <span aria-hidden="true">→</span>';
}

function renderReaction() {
  const q = PREGUNTAS[state.currentQ];
  const elegida = state.answers[state.currentQ];
  const reaction = document.getElementById('q-reaction');
  if (elegida === null || elegida === undefined) {
    reaction.className = 'q-reaction';
    reaction.innerHTML = '';
    return;
  }
  const r = q.reacciones[elegida];
  reaction.innerHTML = `${REACTION_ICONS[r.tipo]}<span>${r.texto}</span>`;
  reaction.className = `q-reaction visible ${r.tipo}`;
}

// ── SELECCIONAR OPCIÓN (se puede cambiar) ─────────────────────
function cancelAutoAdvance() {
  if (state._autoTimer) { clearTimeout(state._autoTimer); state._autoTimer = null; }
  const cd = document.getElementById('q-countdown');
  if (cd) { cd.classList.remove('visible'); const f = cd.querySelector('.q-countdown-fill'); if (f) { f.style.animation = 'none'; void f.offsetWidth; f.style.animation = ''; } }
}

// A20 (07/09/2026): si el prospecto no toca nada en --t-autoavance, avanza solo.
// Tocar otra opcion reinicia; "Siguiente" o "Anterior" lo cancelan.
function armAutoAdvance() {
  cancelAutoAdvance();
  const cd = document.getElementById('q-countdown');
  if (cd) cd.classList.add('visible');
  state._autoTimer = setTimeout(() => { state._autoTimer = null; nextQuestion(); }, MOTION.autoavance);
}

function selectOption(idx) {
  const q = PREGUNTAS[state.currentQ];
  state.answers[state.currentQ] = idx;
  document.querySelectorAll('#screen-question .q-option').forEach((el, i) => {
    el.setAttribute('aria-pressed', i === idx ? 'true' : 'false');
  });
  renderReaction();
  document.getElementById('btn-next').disabled = false;
  saveState();
  updateChain();
  armAutoAdvance();
  track('diag_answer', { q: state.currentQ + 1, letra: q.opciones[idx].letra, eslabon: q.eslabónNombre });
}

// ── SIGUIENTE / ANTERIOR ──────────────────────────────────────
function nextQuestion() {
  cancelAutoAdvance();
  const elegida = state.answers[state.currentQ];
  if (elegida === null || elegida === undefined) return;
  if (state.currentQ < PREGUNTAS.length - 1) {
    state.currentQ++;
    saveState();
    renderQuestion();
    updateChain();
    document.getElementById('panel-right').scrollTop = 0;
  } else {
    showResultPartial();
  }
}

function prevQuestion() {
  cancelAutoAdvance();
  if (state.currentQ === 0) return;
  state.currentQ--;
  saveState();
  renderQuestion();
  updateChain();
  document.getElementById('panel-right').scrollTop = 0;
}

// ── RESULTADO PARCIAL: el valor antes que el dato ─────────────
function showResultPartial() {
  syncScores();
  if (answeredCount() < 12) { renderQuestion(); showScreen('screen-question'); return; }
  const yaEstaba = state.completado;
  state.completado = true;
  saveState();

  const totalScore = state.eslabónScores.reduce((a,b) => a+b, 0);
  document.getElementById('total-score').textContent = totalScore;

  const badge = document.getElementById('score-badge');
  const BADGE = {
    solido:     { texto: 'Tu negocio tiene salud financiera sólida', clase: 'strong' },
    desarrollo: { texto: 'Tu negocio está en desarrollo', clase: 'moderate' },
    critico:    { texto: 'Tu negocio está en situación crítica', clase: 'critical' }
  }[nivelTotal(totalScore)];
  badge.textContent = BADGE.texto;
  badge.className = 'score-badge ' + BADGE.clase;

  const nombres = ['Costos y precios','Resultado económico','Flujo de caja','Indicadores de gestión'];
  const grid = document.getElementById('eslabones-grid');
  grid.innerHTML = '';
  const dd0 = getDiagnosticoData();
  const weakestIdx = dd0.eslabonDebilIndex;

  for (let i = 0; i < 4; i++) {
    const s = state.eslabónScores[i];
    // H26: el arco va del minimo real (3) al maximo (9); todas C = arco vacio
    const pct = ((s - UMBRAL_ESLABON.min) / (UMBRAL_ESLABON.max - UMBRAL_ESLABON.min)) * 100;
    const st = getEslabónState(s, 3);
    const label = getEslabónLabel(s, 3);
    const arcLen = 251.33; // π × 80
    const offset = (arcLen * (1 - pct / 100)).toFixed(2);
    const esDebil = i === weakestIdx;

    const card = document.createElement('div');
    card.className = `eslabon-card ${st}${esDebil ? ' weakest' : ''}`;
    card.innerHTML = `
      <div class="eslabon-card-name">${ICONS[i]} ${nombres[i]}</div>
      <svg class="gauge-svg" viewBox="-4 0 208 130" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${nombres[i]}: ${s} de 9, ${label}">
        <path d="M 20,100 A 80,80 0 0,1 180,100" class="gauge-track"/>
        <path d="M 20,100 A 80,80 0 0,1 180,100" class="gauge-fill"
              stroke-dasharray="${arcLen}"
              style="stroke-dashoffset:${arcLen}"
              data-offset="${offset}"/>
        <line x1="159.8" y1="65.5" x2="178.8" y2="54.5" class="gauge-target"/>
        <text x="100" y="92" class="gauge-score-num" font-size="44">${s}</text>
        <text x="20" y="124" class="gauge-min-max" font-size="12" text-anchor="middle">${UMBRAL_ESLABON.min}</text>
        <text x="180" y="124" class="gauge-min-max" font-size="12" text-anchor="middle">${UMBRAL_ESLABON.max}</text>
      </svg>
      <div class="eslabon-card-status">${label}</div>
      ${esDebil ? `<div class="eslabon-weak-label">${dd0.rotuloDebil.tarjeta}</div>` : ''}
    `;
    grid.appendChild(card);
  }

  setTimeout(() => {
    grid.querySelectorAll('.gauge-fill').forEach(el => { el.style.strokeDashoffset = el.dataset.offset; });
  }, MOTION.instante);

  document.getElementById('diag-overlay').classList.add('show-result');
  showScreen('screen-result');
  updateChain();

  const dd = getDiagnosticoData();
  if (!yaEstaba) track('diag_result_view', { score: dd.total, gravedad: dd.nivelGravedad, eslabon_debil: dd.eslabonDebil });

  if (state.leadOk) {
    renderFull();
  } else {
    resetGate();
    document.getElementById('result-gate').hidden = false;
    document.getElementById('result-full').hidden = true;
    if (!yaEstaba) track('diag_lead_view', {});
  }
}

// ── WHATSAPP: validacion y formato (numeros argentinos) ───────
// Acepta 10 digitos (codigo de area + numero) con o sin +54 / 9 adelante.
// Rechaza el 0 inicial y el 15. Devuelve {ok, digits, display, motivo}.
function parseWhatsApp(raw) {
  let d = String(raw || '').replace(/\D/g, '');
  if (!d) return { ok: false, motivo: 'vacio' };
  if (d.startsWith('54')) d = d.slice(2);
  if (d.length === 11 && d.startsWith('9')) d = d.slice(1);
  if (d.startsWith('0')) return { ok: false, motivo: 'cero' };
  if (d.length === 12 && d.slice(2, 4) === '15') return { ok: false, motivo: 'quince' };
  if (d.length === 12 && d.slice(3, 5) === '15') return { ok: false, motivo: 'quince' };
  if (d.length !== 10) return { ok: false, motivo: 'largo' };
  const area = d.startsWith('11') ? d.slice(0, 2) : d.slice(0, 3);
  const resto = d.slice(area.length);
  const display = `+54 9 ${area} ${resto.slice(0, resto.length - 4)}-${resto.slice(-4)}`;
  return { ok: true, digits: '549' + d, display };
}

function previewWhatsApp() {
  const input = document.getElementById('lead-wa');
  const hint = document.getElementById('wa-hint');
  const err = document.getElementById('err-wa');
  const p = parseWhatsApp(input.value);
  input.classList.remove('invalid');
  err.classList.remove('visible'); err.textContent = '';
  hint.textContent = p.ok ? `Se guarda como ${p.display}` : 'Código de área y número, sin el 0 ni el 15.';
}

function resetGate() {
  const form = document.getElementById('result-gate');
  if (!form) return;
  form.hidden = false;
  const input = document.getElementById('lead-wa');
  input.value = ''; input.classList.remove('invalid'); input.disabled = false;
  document.getElementById('wa-hint').textContent = 'Código de área y número, sin el 0 ni el 15.';
  const err = document.getElementById('err-wa'); err.textContent = ''; err.classList.remove('visible');
  const st = document.getElementById('gate-status'); st.className = 'gate-status'; st.innerHTML = '';
  const btn = document.getElementById('btn-lead'); btn.disabled = false; btn.innerHTML = 'Ver el análisis completo <span aria-hidden="true">→</span>';
}

// ── ENVÍO ─────────────────────────────────────────────────────
// Fase 1 (11/09/2026): implementacion "Fase 1" del Apps Script
// (docs/apps-script/doPost.gs). Responde JSON {ok, leadId} y no duplica si
// el mismo leadId llega dos veces, asi que reintentar es seguro.
const SHEET_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbw_4OP8ve0fKfP9M3VtCvRvmDG395PVzHUNOYqAH55FmVxaD93VNg8QfjDayOK-xVr_Ng/exec';
// A8 cerrada el 11/09: el Apps Script responde JSON. En false vuelve al envio
// ciego (no-cors) de antes: sirve solo como llave de emergencia si el script
// dejara de responder JSON.
const WEBHOOK_RESPONDS = true;
const ENVIO_TIMEOUT_MS = 10000;

// A24: WhatsApp directo para el lead caliente. Solo digitos con 549 adelante
// (ej. 5492215550000). Vacio = los links .cta-wa quedan ocultos.
const WHATSAPP_NUMERO = '5492216809170'; // +54 9 221 680-9170 (dueño, 07/09)
// celular: la app via wa.me; computadora: WhatsApp Web directo, sin pantalla intermedia
function urlWhatsApp(mensaje) {
  const n = String(WHATSAPP_NUMERO).replace(/\D/g, '');
  if (!n) return '';
  const texto = encodeURIComponent(mensaje || 'Hola Manu, vengo de la web.');
  const esCelular = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && window.innerWidth < 960);
  return esCelular ? ('https://wa.me/' + n + '?text=' + texto) : ('https://web.whatsapp.com/send?phone=' + n + '&text=' + texto);
}
(function () {
  document.querySelectorAll('.cta-wa').forEach(a => {
    const url = urlWhatsApp(a.dataset.msg);
    if (!url) { a.hidden = true; return; }
    a.href = url;
    a.target = '_blank'; a.rel = 'noopener'; a.hidden = false;
  });
})();

function submitLead(e) {
  if (e && e.preventDefault) e.preventDefault();
  const input = document.getElementById('lead-wa');
  const err = document.getElementById('err-wa');
  const p = parseWhatsApp(input.value);

  if (!p.ok) {
    const msgs = {
      vacio: 'Necesitamos tu WhatsApp para mostrarte el análisis completo.',
      cero: 'Sacá el 0 del código de área: por ejemplo 221 555 0000.',
      quince: 'Sacá el 15 del número: por ejemplo 221 555 0000.',
      largo: 'Revisá el número: código de área y número, 10 dígitos en total (ej. 221 555 0000).'
    };
    input.classList.add('invalid');
    err.textContent = msgs[p.motivo] || msgs.largo;
    err.classList.add('visible');
    input.focus();
    return false;
  }

  // Mismo numero = mismo leadId: un reintento nunca crea una segunda fila
  if (!state.leadId || !state.leadData || state.leadData.wa !== p.digits) {
    state.leadId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }
  state.leadData = { wa: p.digits, waDisplay: p.display };
  const btn = document.getElementById('btn-lead');
  const status = document.getElementById('gate-status');
  btn.disabled = true; input.disabled = true;
  btn.textContent = 'Guardando…';
  status.className = 'gate-status'; status.innerHTML = '';

  sendLeadToSheet().then(res => {
    track('diag_lead_submit', { ok: res.ok ? 'true' : 'false' });
    state.leadGuardado = res.ok;
    // El analisis se muestra igual: si no se guardo, con aviso, Reintentar y WhatsApp
    state.leadOk = true;
    saveState();
    renderFull();
    mostrarAvisoLead(res.ok ? null : 'error');
  });
  return false;
}

function reintentarLead(btn) {
  if (btn) { btn.disabled = true; btn.textContent = 'Guardando…'; }
  sendLeadToSheet().then(res => {
    track('diag_lead_submit', { ok: res.ok ? 'true' : 'false' });
    state.leadGuardado = res.ok;
    saveState();
    mostrarAvisoLead(res.ok ? 'ok' : 'error');
  });
}

// Mensaje de respaldo para WhatsApp: con esto Manuel reconstruye el diagnostico
function mensajeRespaldo() {
  const nombresEslabon = ['Costos y precios','Resultado económico','Flujo de caja','Indicadores de gestión'];
  const { eslabonDebilIndex, total, todosSolidos } = getDiagnosticoData();
  const letras = state.answers.map((idx, q) => PREGUNTAS[q].opciones[idx].letra).join('');
  return `Hola Manu, hice el diagnóstico en la web y no se guardó mi número. Puntaje: ${total}/36. Eslabón más ${todosSolidos ? 'bajo' : 'débil'}: ${nombresEslabon[eslabonDebilIndex]}. Respuestas: ${letras}.`;
}

// Icono del boton de respaldo (el resultado ya no tiene WhatsApp: el CTA es la llamada)
const ICONO_WHATSAPP = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.5 3.5A11.9 11.9 0 0 0 12 0C5.4 0 .1 5.3.1 11.9c0 2.1.5 4.1 1.6 5.9L0 24l6.4-1.7a11.9 11.9 0 0 0 5.6 1.4c6.6 0 11.9-5.3 11.9-11.9 0-3.2-1.2-6.2-3.4-8.3zM12 21.7c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.8 1 1-3.7-.2-.4A9.8 9.8 0 0 1 2.1 12C2.1 6.5 6.5 2.1 12 2.1c2.6 0 5.1 1 7 2.9a9.8 9.8 0 0 1 2.9 7c0 5.4-4.5 9.7-9.9 9.7zm5.4-7.3c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.5-.6c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.2-.6-.3z"/></svg>';

function mostrarAvisoLead(modo) {
  const el = document.getElementById('lead-aviso');
  if (!el) return;
  if (!modo) { el.className = 'gate-status'; el.innerHTML = ''; return; }
  if (modo === 'ok') {
    el.className = 'gate-status visible';
    el.innerHTML = '<span>Listo: tu número quedó guardado.</span>';
    return;
  }
  const url = urlWhatsApp(mensajeRespaldo());
  const icono = ICONO_WHATSAPP;
  el.className = 'gate-status visible error';
  el.innerHTML = '<span>No pudimos guardar tu número. El análisis está acá abajo igual: probá de nuevo o mandale el resultado a Manuel por WhatsApp.</span>'
    + '<span class="lead-aviso-acciones">'
    + '<button type="button" class="btn-secondary" onclick="reintentarLead(this)">Reintentar</button>'
    + (url ? `<a class="cta-wa cta-wa-light" href="${url}" target="_blank" rel="noopener" onclick="track('cta_whatsapp_click', { desde: 'aviso-guardado' })">${icono}Mandar por WhatsApp</a>` : '')
    + '</span>';
}

// Un intento con tiempo maximo. Devuelve {ok:true} o {ok:false, tipo}
// con tipo = timeout | red | respuesta_invalida | rechazado.
function enviarUnaVez(payload) {
  const ctrl = new AbortController();
  const reloj = setTimeout(() => ctrl.abort(), ENVIO_TIMEOUT_MS);
  return fetch(SHEET_WEBHOOK_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify(payload), signal: ctrl.signal })
    .then(r => r.ok ? r.json().catch(() => Promise.reject({ tipo: 'respuesta_invalida' })) : Promise.reject({ tipo: 'respuesta_invalida' }))
    .then(j => (j && j.ok === true) ? { ok: true } : Promise.reject({ tipo: (j && j.error) ? 'rechazado' : 'respuesta_invalida' }))
    .catch(e => ({ ok: false, tipo: (e && e.tipo) || (e && e.name === 'AbortError' ? 'timeout' : 'red') }))
    .finally(() => clearTimeout(reloj));
}

function armarPayload() {
  const nombresEslabon = ['Costos y precios','Resultado económico','Flujo de caja','Indicadores de gestión'];
  const { eslabonDebilIndex, total, nivelGravedad, nivelEslabonDebil, titulo, data, consecuencia, primerPaso } = getDiagnosticoData();

  const eslabones = state.eslabónScores.map((s, i) => ({ nombre: nombresEslabon[i], score: s, estado: getEslabónLabel(s, 3) }));
  const respuestas = state.answers.map((idx, q) => {
    const p = PREGUNTAS[q]; const op = p.opciones[idx];
    return { eslabónNombre: p.eslabónNombre, pregunta: p.texto, letra: op.letra, respuesta: op.texto, score: op.score };
  });
  const letras = state.answers.map((idx, q) => PREGUNTAS[q].opciones[idx].letra).join('');
  const diagnosticoTexto = [titulo, data.espejo, consecuencia, data.gancho].concat(primerPaso ? ['Acá se le escapa: ' + primerPaso] : []).join('\n\n');

  return {
    leadId: state.leadId,
    timestamp: new Date().toISOString(),
    whatsapp: state.leadData.wa,
    rubro: state.rubro,
    origen: state.origen,
    score: total,
    maxScore: 36,
    gravedad: nivelGravedad,
    eslabonDebil: nombresEslabon[eslabonDebilIndex],
    letras: letras,
    // Compatibilidad con las columnas que el Apps Script ya espera:
    // no se piden mas datos personales; estos campos viajan vacios.
    nombre: '', negocio: '', sistema: '', instagram: '',
    eslabones: eslabones,
    respuestas: respuestas,
    diagnostico: diagnosticoTexto,
    campo_extra: (document.getElementById('campo-extra') || {}).value || '',
    // Fase 1 (B), columna nueva al final: estado del eslabon mas debil
    gravedadEslabon: nivelEslabonDebil,
    // Fase 1 (C), columnas nuevas al final: de donde llego
    utm_source: atribucion.utm_source, utm_medium: atribucion.utm_medium,
    utm_campaign: atribucion.utm_campaign, utm_content: atribucion.utm_content,
    referrer: atribucion.referrer
  };
}

// Hasta dos intentos (el segundo, automatico). Cada falla se mide con su tipo.
async function sendLeadToSheet() {
  if (!SHEET_WEBHOOK_URL) return { ok: true };
  const payload = armarPayload();

  if (!WEBHOOK_RESPONDS) {
    await fetch(SHEET_WEBHOOK_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify(payload) }).catch(() => {});
    return { ok: true };
  }
  let res = { ok: false, tipo: 'red' };
  for (let intento = 1; intento <= 2; intento++) {
    res = await enviarUnaVez(payload);
    if (res.ok) return res;
    track('diag_lead_error', { tipo: res.tipo, intento: intento });
    if (intento === 1) await new Promise(r => setTimeout(r, 800));
  }
  return res;
}

// ── NARRATIVA DE RESULTADO ──────────────────────────────────────
const TITULO_DIAGNOSTICO = {
  costos: {
    critico:     'Tu precio no cubre lo que cuesta producir',
    desarrollo:  'Los costos están, pero no están del todo controlados',
    solido:      'Buena base de costos — el siguiente paso es usarla para crecer'
  },
  resultado: {
    critico:     'El negocio trabaja mucho, pero no queda ganancia real',
    desarrollo:  'Hay resultado, pero sin precisión ni control',
    solido:      'El resultado económico está ordenado'
  },
  cashflow: {
    critico:     'La caja es el problema central de tu negocio hoy',
    desarrollo:  'El negocio llega a fin de mes, pero sin margen de maniobra',
    solido:      'El flujo de caja está bajo control'
  },
  gestion: {
    critico:     'Las decisiones se toman sin datos, y eso tiene costo',
    desarrollo:  'Hay intuición, pero faltan números concretos',
    solido:      'Buena gestión — podés optimizar los detalles'
  }
};

const PRIMER_PASO = {
  costos:    "El negocio puede estar vendiendo bien y tener productos que trabajan en contra sin que se note. El costo real de lo que vendés no es lo que pagás por el insumo —es eso más un montón de gastos que se diluyen en el día a día—, y mientras siga siendo una estimación disfrazada de certeza, la distancia entre 'va bien' y lo que de verdad te queda es más grande de lo que parece.",
  resultado: "Plata en caja no es ganancia: adentro de ese saldo hay costos, impuestos y estructura que todavía no se descontaron, así que el negocio puede estar en rojo justo mientras se siente en verde. Cada mes que ese número real no aparece, los precios, los gastos y los sueldos se deciden sobre una cifra que no existe.",
  cashflow:  "Rentable y con caja no son lo mismo: un negocio puede ganar plata todos los meses y aun así vivir tapando huecos con la tarjeta o con plata que era para otra cosa. Cada parche tiene un precio que casi nunca se ve de frente —intereses, descuentos por necesitar la plata ya, oportunidades que se pierden— y el tamaño real del hueco no se siente desde adentro hasta que el negocio ya está corriendo de atrás.",
  gestion:   "Cada decisión que se toma sin el número atrás es una apuesta que a veces sale bien de casualidad, no por criterio. Lo grave es que, sin datos, no hay forma de saber cuántas veces ya salió mal ni cuánta plata quedó en el camino."
};

// Fase 1 (B): cada texto sale del estado del eslabon mas debil, el mismo que
// muestra su medidor. El total solo define el badge (y `gravedad` en el payload).
function getDiagnosticoData() {
  const eslabonDebilIndex = indiceEslabonDebil();
  const eslabonKeys = ['costos', 'resultado', 'cashflow', 'gestion'];
  const eslabonDebil = eslabonKeys[eslabonDebilIndex];
  const total = state.eslabónScores.reduce((a,b) => a+b, 0);
  const nivelGravedad = nivelTotal(total);
  const nivelEslabonDebil = nivelEslabon(state.eslabónScores[eslabonDebilIndex]);
  // Si el mas bajo es "Solido", los cuatro lo son
  const todosSolidos = nivelEslabonDebil === 'solido';

  const data = TEXTOS_RESULTADO[eslabonDebil][nivelEslabonDebil];
  const consecuencia = data.consecuencia;
  const titulo = TITULO_DIAGNOSTICO[eslabonDebil][nivelEslabonDebil];
  // "Aca se te escapa" describe una falla: no va arriba de un eslabon solido
  const primerPaso = todosSolidos ? '' : PRIMER_PASO[eslabonDebil];
  const rotuloDebil = todosSolidos ? ROTULO_DEBIL.todosSolidos : ROTULO_DEBIL.normal;

  return { eslabonDebilIndex, eslabonDebil, total, nivelGravedad, nivelEslabonDebil, todosSolidos, rotuloDebil, data, consecuencia, titulo, primerPaso };
}

function getTextoResultado() {
  const { data, consecuencia, titulo, primerPaso } = getDiagnosticoData();

  return `
    <div class="report-diag-title">${titulo}</div>
    <p>${data.espejo}</p>
    <p>${consecuencia}</p>
    <p>${data.gancho}</p>
    ${primerPaso ? `<div class="report-primer-paso">
      <div class="report-primer-paso-label">Acá se te escapa</div>
      <p>${primerPaso}</p>
    </div>` : ''}
  `;
}

// ── ANÁLISIS COMPLETO (después del WhatsApp) ──────────────────
function renderFull() {
  document.getElementById('narrative-content').innerHTML = getTextoResultado();
  document.getElementById('narrative-title').textContent = getDiagnosticoData().rotuloDebil.encabezado;
  document.getElementById('result-gate').hidden = true;
  const full = document.getElementById('result-full');
  const primeraVez = full.hidden;
  full.hidden = false;
  if (primeraVez) {
    track('diag_result_full', {});
    setTimeout(() => { full.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, MOTION.instante / 2);
  }
}

// ── VERSIÓN PARA QUIENES YA AGENDARON (diagnostico.ordenfinanciero.com) ──
(function() {
  if (!location.hostname.startsWith('diagnostico.')) return;

  document.getElementById('hero-eyebrow-text').textContent = 'Ya agendaste tu llamada';
  document.getElementById('hero-title').innerHTML = 'Antes de tu llamada, <em>completá este diagnóstico</em>';
  document.getElementById('hero-subtitle').textContent = 'Son 3 minutos y hace que la reunión arranque desde información real de tu negocio, no desde suposiciones.';
  document.getElementById('hero-cta-text').textContent = 'Completar mi diagnóstico';
  document.getElementById('hero-trust-3').textContent = 'Es el punto de partida de tu llamada';

  document.getElementById('gate-title').textContent = 'Tu resultado, para llevar a la llamada';
  document.getElementById('cta-card-title').textContent = 'Ya tenés tu llamada agendada';
  document.getElementById('cta-card-desc').textContent = 'Llevá este resultado a la reunión: es el punto de partida para ir directo a tus números reales.';
  document.getElementById('cta-card-link').style.display = 'none';
  document.getElementById('cta-strip').style.display = 'none';
})();

// ── APERTURA POR LINK DIRECTO: /#diagnostico ──────────────────
if (location.hash === '#diagnostico') openDiagnostico('link');

// ── GLUE (Fase 3): los CTAs de la pagina nueva son <a href="#diagnostico" data-origen="…">.
// Sin esto, el hashchange abriria el diagnostico con origen "link" y se perderia que boton fue.
document.addEventListener('click', function (e) {
  const a = e.target.closest('a[href="#diagnostico"][data-origen]');
  if (!a) return;
  e.preventDefault();
  openDiagnostico(a.getAttribute('data-origen'));
});
