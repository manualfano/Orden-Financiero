// Formato es-AR para las cifras de los mockups: "$ 1.250.000", "32,5 %".
// Se resuelve en el build (Astro), no en el navegador.
const pesos = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });
const numero = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });
const decimal1 = new Intl.NumberFormat('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** "$ 1.250.000" (con espacio fino entre el signo y la cifra). */
export const $ = (n) => pesos.format(Math.round(n)).replace(/^\$\s?/, '$ ').replace('-$ ', '−$ ');
/** "3.075" */
export const num = (n) => numero.format(n);
/** "32,5 %" */
export const pct = (n) => `${decimal1.format(n)} %`;
