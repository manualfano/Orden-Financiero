// Test de aritmetica de los mockups (Fase 5). Corre en cada build (prebuild):
// si un numero de ejemplo no cierra al peso, el build falla. Un numero lindo
// pero incorrecto es peor que un numero feo.
import assert from 'node:assert/strict';
import { negocio, eerr, ficha, caja, calcularEERR, calcularFicha, calcularCaja, calcularTablero } from '../src/data/ejemplo.js';
import { $, pct } from '../src/data/formato.js';

let n = 0;
const ok = (cond, msg) => { assert.ok(cond, msg); n++; };
const igual = (a, b, msg) => { assert.equal(a, b, `${msg}: ${a} ≠ ${b}`); n++; };
const cerca = (a, b, msg) => { assert.ok(Math.abs(a - b) < 1e-6, `${msg}: ${a} ≠ ${b}`); n++; };

// EERR: ventas − CMV − gastos = resultado, y los porcentajes suman.
const r = calcularEERR();
igual(r.cmv + r.gastos + r.resultado, eerr.ventas, 'EERR cierra al peso');
igual(r.margenBruto, eerr.ventas - r.cmv, 'margen bruto');
igual(r.resultado, r.margenBruto - r.gastos, 'resultado = margen bruto − gastos');
cerca(r.cmvPct + r.lineas.filter((l) => l.tipo === 'gasto').reduce((s, l) => s + l.pct, 0) + r.resultadoPct, 100, 'porcentajes suman 100');
ok(r.resultado > 0 && r.resultadoPct > 5 && r.resultadoPct < 20, `margen neto plausible para gastronomia (${r.resultadoPct.toFixed(1)} %)`);
ok(r.cmvPct > 25 && r.cmvPct < 45, `food cost del mes plausible (${r.cmvPct.toFixed(1)} %)`);
ok(eerr.lineas.every((l) => l.monto > 0 && Number.isInteger(l.monto)), 'lineas en pesos enteros y positivas');
ok(!eerr.lineas.some((l) => l.monto % 1_000_000 === 0), 'sin cifras redondas sospechosas en las lineas');

// Ficha de costo: insumos × (1 + merma) = costo; precio − costo = margen.
const f = calcularFicha();
igual(f.insumos, ficha.ingredientes.reduce((s, i) => s + i.costo, 0), 'suma de ingredientes');
cerca(f.costo, f.insumos * (1 + ficha.mermaPct / 100), 'costo con merma');
cerca(f.margen + f.costo, ficha.precioCarta, 'precio = costo + margen');
cerca(f.foodCostPct + f.margenPct, 100, 'food cost + margen = 100');
ok(f.foodCostPct > 20 && f.foodCostPct < 40, `food cost del plato plausible (${f.foodCostPct.toFixed(1)} %)`);

// Caja: saldo inicial + cobros − pagos = saldo final, y la serie es acumulativa.
const c = calcularCaja();
igual(c.saldoInicial + c.cobros - c.pagos, c.saldoFinal, 'caja cierra al peso');
igual(c.serie[c.serie.length - 1].saldo, c.saldoFinal, 'ultimo saldo de la serie = saldo final');
ok(c.serie.every((s, i) => s.saldo === (i === 0 ? c.saldoInicial : c.serie[i - 1].saldo) + s.monto), 'serie acumulativa');
ok(c.saldoFinal > 0, 'la semana no termina en rojo (el ejemplo muestra caja justa, no quebrada)');
ok(c.saldoMinimo <= c.saldoFinal, 'saldo minimo ≤ saldo final');

// Tablero: coincide con las otras fuentes.
const t = calcularTablero();
cerca(t.foodCostPct, r.cmvPct, 'tablero: food cost = EERR');
cerca(t.margenNetoPct, r.resultadoPct, 'tablero: margen neto = EERR');
cerca(t.ticketPromedio * negocio.cubiertos, r.ventas, 'ticket × cubiertos = ventas');

// Formato es-AR.
igual($(1250000), '$ 1.250.000', 'formato pesos');
igual(pct(32.5), '32,5 %', 'formato porcentaje');

console.log(`test-ejemplo: ${n} verificaciones OK · EERR ${$(r.ventas)} → resultado ${$(r.resultado)} (${pct(r.resultadoPct)}) · ficha food cost ${pct(f.foodCostPct)} · caja ${$(c.saldoInicial)} → ${$(c.saldoFinal)}`);
