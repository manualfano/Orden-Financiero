// Datos de ejemplo de los mockups (Fase 5). UN negocio gastronomico ficticio;
// todos los mockups leen de aca. Se cargan solo los insumos: los totales, los
// porcentajes y los saldos se CALCULAN (nunca se escriben), y
// scripts/test-ejemplo.mjs verifica en cada build que cierren al peso.
// Los conceptos son de gastronomia (CMV, sueldos, alquiler, comisiones de apps).

export const negocio = {
  nombre: 'Parrilla La Esquina',
  mes: 'Agosto 2026',
  cubiertos: 3075,
};

/** Estado de resultados del mes: ventas y cada linea de costo/gasto, en pesos. */
export const eerr = {
  ventas: 18_450_000,
  lineas: [
    { concepto: 'Costo de mercadería (CMV)', monto: 6_273_000, tipo: 'cmv' },
    { concepto: 'Sueldos y cargas', monto: 5_120_000, tipo: 'gasto' },
    { concepto: 'Alquiler', monto: 1_650_000, tipo: 'gasto' },
    { concepto: 'Servicios', monto: 780_000, tipo: 'gasto' },
    { concepto: 'Comisiones de apps y tarjetas', monto: 1_106_000, tipo: 'gasto' },
    { concepto: 'Impuestos y tasas', monto: 1_290_000, tipo: 'gasto' },
    { concepto: 'Otros gastos', monto: 415_000, tipo: 'gasto' },
  ],
};

/** Ficha de costo de un plato: ingredientes, merma y precio de carta. */
export const ficha = {
  plato: 'Milanesa napolitana con papas',
  ingredientes: [
    { nombre: 'Nalga (220 g)', costo: 1_980 },
    { nombre: 'Pan rallado y huevo', costo: 240 },
    { nombre: 'Jamón y muzzarella', costo: 620 },
    { nombre: 'Salsa', costo: 110 },
    { nombre: 'Papas (250 g)', costo: 390 },
    { nombre: 'Aceite y varios', costo: 160 },
  ],
  mermaPct: 6,
  precioCarta: 12_900,
};

/** Flujo de caja de una semana: saldo inicial, cobros y pagos. */
export const caja = {
  semana: 'Semana del 17 al 23',
  saldoInicial: 2_140_000,
  movimientos: [
    { dia: 'Lun', concepto: 'Cobro tarjetas', monto: 1_480_000 },
    { dia: 'Mar', concepto: 'Proveedor de carnes', monto: -1_620_000 },
    { dia: 'Mié', concepto: 'Servicios', monto: -310_000 },
    { dia: 'Jue', concepto: 'Cobro tarjetas', monto: 1_390_000 },
    { dia: 'Vie', concepto: 'Quincena', monto: -2_560_000 },
    { dia: 'Sáb', concepto: 'Cobro contado y apps', monto: 1_450_000 },
    { dia: 'Dom', concepto: 'Verdulería y bebidas', monto: -1_250_000 },
  ],
};

// ── Calculos (unica fuente; los mockups y el test usan estas funciones) ──────

export function calcularEERR(e = eerr) {
  const cmv = e.lineas.filter((l) => l.tipo === 'cmv').reduce((s, l) => s + l.monto, 0);
  const gastos = e.lineas.filter((l) => l.tipo === 'gasto').reduce((s, l) => s + l.monto, 0);
  const margenBruto = e.ventas - cmv;
  const resultado = margenBruto - gastos;
  const pct = (m) => (m / e.ventas) * 100;
  return {
    ventas: e.ventas,
    lineas: e.lineas.map((l) => ({ ...l, pct: pct(l.monto) })),
    cmv, gastos, margenBruto, resultado,
    cmvPct: pct(cmv), margenBrutoPct: pct(margenBruto), resultadoPct: pct(resultado),
  };
}

export function calcularFicha(f = ficha) {
  const insumos = f.ingredientes.reduce((s, i) => s + i.costo, 0);
  const merma = insumos * (f.mermaPct / 100);
  const costo = insumos + merma;
  const margen = f.precioCarta - costo;
  return {
    ...f, insumos, merma, costo, margen,
    foodCostPct: (costo / f.precioCarta) * 100,
    margenPct: (margen / f.precioCarta) * 100,
  };
}

export function calcularCaja(c = caja) {
  let saldo = c.saldoInicial;
  const serie = c.movimientos.map((m) => { saldo += m.monto; return { ...m, saldo }; });
  const cobros = c.movimientos.filter((m) => m.monto > 0).reduce((s, m) => s + m.monto, 0);
  const pagos = c.movimientos.filter((m) => m.monto < 0).reduce((s, m) => s - m.monto, 0);
  return { ...c, serie, cobros, pagos, saldoFinal: saldo, saldoMinimo: Math.min(c.saldoInicial, ...serie.map((s) => s.saldo)) };
}

export function calcularTablero() {
  const r = calcularEERR();
  const f = calcularFicha();
  const c = calcularCaja();
  return {
    foodCostPct: r.cmvPct,
    margenNetoPct: r.resultadoPct,
    ticketPromedio: r.ventas / negocio.cubiertos,
    resultado: r.resultado,
    fichaFoodCostPct: f.foodCostPct,
    saldoFinal: c.saldoFinal,
  };
}
