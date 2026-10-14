/* WhatsApp con país (14/10/2026). Lo usan el diagnóstico (index.html) y la
   descarga de Excel de las guías (tools/build_guias.py).

   Hasta acá el formulario daba por hecho que todo número era argentino y solo
   contaba 10 dígitos: un número de otro país no entraba, y uno inventado con un
   código de área que no existe (ej. 599) pasaba igual. Ahora:
   · un selector de país al lado del número (Argentina de entrada, o el país de
     la zona horaria de la persona);
   · si alguien escribe o pega el número con +código, el país se elige solo;
   · cada número se revisa con las reglas de su país (libphonenumber-js, en
     /vendor, se baja recién cuando hace falta). Si no parece válido se avisa,
     pero si la persona confirma tocando el botón de nuevo, pasa marcado como
     "dudoso": un número real que la librería no conoce nunca se pierde.

   Uso:
     OFWhatsApp.montar(select, input)            llena el selector y engancha el campo
     OFWhatsApp.revisar(input)                   -> { ok, digits, display, pais, verificado, motivo }
     OFWhatsApp.mensaje(resultado, textoVacio)   -> texto de error para la persona
     OFWhatsApp.pista(input)                     -> texto de ayuda debajo del campo
     OFWhatsApp.cargar()                         baja la librería (promesa; nunca falla)
*/
(function () {
  'use strict';

  var LIB_URL = '/vendor/libphonenumber-max-1.13.14.js';

  // Países que se ven primero (Argentina, la región y donde más vive gente de
  // la región). El resto aparece abajo, en "Otros países", cuando carga la librería.
  var PRINCIPALES = [
    ['AR', 'Argentina', '54'], ['UY', 'Uruguay', '598'], ['CL', 'Chile', '56'],
    ['PY', 'Paraguay', '595'], ['BO', 'Bolivia', '591'], ['PE', 'Perú', '51'],
    ['EC', 'Ecuador', '593'], ['CO', 'Colombia', '57'], ['VE', 'Venezuela', '58'],
    ['MX', 'México', '52'], ['PA', 'Panamá', '507'], ['CR', 'Costa Rica', '506'],
    ['GT', 'Guatemala', '502'], ['SV', 'El Salvador', '503'], ['HN', 'Honduras', '504'],
    ['NI', 'Nicaragua', '505'], ['DO', 'República Dominicana', '1'], ['PR', 'Puerto Rico', '1'],
    ['CU', 'Cuba', '53'], ['BR', 'Brasil', '55'], ['ES', 'España', '34'],
    ['US', 'Estados Unidos', '1'], ['IT', 'Italia', '39']
  ];
  var CODIGO = {}, NOMBRE = {};
  PRINCIPALES.forEach(function (p) { NOMBRE[p[0]] = p[1]; CODIGO[p[0]] = p[2]; });

  // Zona horaria -> país, para elegir el país de entrada (sin pedir permisos)
  var ZONA_PAIS = {
    'America/Montevideo': 'UY', 'America/Santiago': 'CL', 'America/Punta_Arenas': 'CL',
    'America/Asuncion': 'PY', 'America/La_Paz': 'BO', 'America/Lima': 'PE',
    'America/Guayaquil': 'EC', 'America/Bogota': 'CO', 'America/Caracas': 'VE',
    'America/Mexico_City': 'MX', 'America/Monterrey': 'MX', 'America/Cancun': 'MX',
    'America/Merida': 'MX', 'America/Tijuana': 'MX', 'America/Chihuahua': 'MX',
    'America/Hermosillo': 'MX', 'America/Mazatlan': 'MX', 'America/Matamoros': 'MX',
    'America/Bahia_Banderas': 'MX', 'America/Panama': 'PA', 'America/Costa_Rica': 'CR',
    'America/Guatemala': 'GT', 'America/El_Salvador': 'SV', 'America/Tegucigalpa': 'HN',
    'America/Managua': 'NI', 'America/Santo_Domingo': 'DO', 'America/Puerto_Rico': 'PR',
    'America/Havana': 'CU', 'America/Sao_Paulo': 'BR', 'Europe/Madrid': 'ES',
    'Atlantic/Canary': 'ES', 'America/New_York': 'US', 'America/Chicago': 'US',
    'America/Denver': 'US', 'America/Los_Angeles': 'US', 'America/Phoenix': 'US',
    'Europe/Rome': 'IT'
  };

  function paisInicial() {
    try {
      var z = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      if (z.indexOf('America/Argentina/') === 0 || z === 'America/Buenos_Aires') return 'AR';
      if (ZONA_PAIS[z]) return ZONA_PAIS[z];
    } catch (e) { /* sin Intl: Argentina */ }
    return 'AR';
  }

  // ── Librería: se baja una sola vez y solo cuando hace falta ──
  var promesa = null;
  function lib() { return window.libphonenumber && window.libphonenumber.parsePhoneNumber ? window.libphonenumber : null; }
  function cargar() {
    if (lib()) return Promise.resolve(lib());
    if (promesa) return promesa;
    promesa = new Promise(function (resolver) {
      var s = document.createElement('script');
      s.src = LIB_URL; s.async = true;
      s.onload = function () { resolver(lib()); sumarOtrosPaises(); };
      // Sin librería el formulario sigue andando, con la revisión básica
      s.onerror = function () { promesa = null; resolver(null); };
      document.head.appendChild(s);
    });
    return promesa;
  }

  var montados = [];
  function nombrePais(iso) {
    if (NOMBRE[iso]) return NOMBRE[iso];
    try { return new Intl.DisplayNames(['es'], { type: 'region' }).of(iso) || iso; } catch (e) { return iso; }
  }
  function codigoPais(iso) {
    if (CODIGO[iso]) return CODIGO[iso];
    var L = lib();
    try { return L ? String(L.getCountryCallingCode(iso)) : ''; } catch (e) { return ''; }
  }

  function opcion(iso) {
    var o = document.createElement('option');
    o.value = iso;
    o.textContent = nombrePais(iso) + ' (+' + codigoPais(iso) + ')';
    return o;
  }

  function sumarOtrosPaises() {
    var L = lib();
    if (!L) return;
    var resto = L.getCountries().filter(function (iso) { return !NOMBRE[iso]; })
      .map(function (iso) { return [iso, nombrePais(iso)]; })
      .sort(function (a, b) { return a[1].localeCompare(b[1], 'es'); });
    montados.forEach(function (m) {
      if (m.select.querySelector('optgroup[data-otros]')) return;
      var g = document.createElement('optgroup');
      g.label = 'Otros países';
      g.setAttribute('data-otros', '');
      resto.forEach(function (r) { g.appendChild(opcion(r[0])); });
      m.select.appendChild(g);
      // Si el campo ya trae un +código de un país de esta lista, se elige ahora
      detectarPais(m);
    });
  }

  function datos(input) {
    for (var i = 0; i < montados.length; i++) if (montados[i].input === input) return montados[i];
    return null;
  }

  // Lo que se ve en el selector cerrado: "AR +54"
  function pintarSelector(m) {
    var iso = m.select.value;
    m.visible.textContent = iso + ' +' + codigoPais(iso);
    m.input.placeholder = iso === 'AR' ? '221 555 0000' : 'Número con código de área';
  }

  // Con +código (escrito, pegado o autocompletado) el país se elige solo
  function detectarPais(m) {
    var v = String(m.input.value || '').trim();
    if (!/^(\+|00)/.test(v)) return;
    var d = v.replace(/\D/g, '').replace(/^00/, '');
    var iso = '';
    var L = lib();
    if (L) {
      try {
        var p = L.parsePhoneNumber('+' + d);
        if (p && p.country) iso = p.country;
      } catch (e) { /* incompleto todavía */ }
    }
    if (!iso) {
      // Sin librería (o número a medio escribir): el código más largo que coincida
      var mejor = '';
      PRINCIPALES.forEach(function (p) {
        if (d.indexOf(p[2]) === 0 && p[2].length > mejor.length && p[2] !== '1') { mejor = p[2]; iso = p[0]; }
      });
      // +1 es de varios países: si ya estaba uno de ellos, se respeta
      if (!iso && d.charAt(0) === '1' && CODIGO[m.select.value] !== '1') iso = 'US';
    }
    if (iso && iso !== m.select.value && m.select.querySelector('option[value="' + iso + '"]')) {
      m.select.value = iso;
      pintarSelector(m);
    }
  }

  function montar(select, input) {
    if (!select || !input || datos(input)) return;
    var visible = select.parentNode.querySelector('.wa-pais-v');
    var m = { select: select, input: input, visible: visible, confirmado: '' };
    montados.push(m);
    PRINCIPALES.forEach(function (p) { select.appendChild(opcion(p[0])); });
    select.value = paisInicial();
    pintarSelector(m);
    select.addEventListener('change', function () {
      pintarSelector(m);
      m.confirmado = '';
      // Eligió el país a mano: si el número traía +código, queda solo la parte
      // nacional (si no, el +código volvería a cambiar el país)
      var v = String(input.value || '').trim();
      if (/^(\+|00)/.test(v)) {
        var nacional = '';
        try { nacional = lib() ? String(lib().parsePhoneNumber('+' + v.replace(/\D/g, '').replace(/^00/, '')).nationalNumber) : ''; } catch (e) { nacional = ''; }
        input.value = nacional;
      }
      m.cambioManual = true;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      m.cambioManual = false;
      // Sin mover el foco al número: con teclado, cada flecha cambia el país
      // y la persona tiene que poder seguir recorriendo la lista
    });
    input.addEventListener('input', function () {
      // Cualquier cambio en el número pide confirmar de nuevo si vuelve a ser dudoso
      m.confirmado = '';
      if (!m.cambioManual) detectarPais(m);
    });
    input.addEventListener('focus', cargar);
    select.addEventListener('focus', cargar);
    if (lib()) sumarOtrosPaises();
  }

  // ── Revisión del número ──
  // Argentina: igual que antes (10 dígitos, sin 0 ni 15, con o sin +54 9), y
  // además el código de área tiene que existir. wa.me pide 54 9 + 10 dígitos.
  function revisarArgentina(raw) {
    var d = String(raw || '').replace(/\D/g, '');
    if (!d) return { ok: false, motivo: 'vacio' };
    if (d.indexOf('00') === 0) d = d.slice(2);
    if (d.indexOf('54') === 0 && d.length > 10) d = d.slice(2);
    if (d.length === 11 && d.charAt(0) === '9') d = d.slice(1);
    if (d.charAt(0) === '0') return { ok: false, motivo: 'cero' };
    if (d.length === 12 && d.slice(2, 4) === '15') return { ok: false, motivo: 'quince' };
    if (d.length === 12 && d.slice(3, 5) === '15') return { ok: false, motivo: 'quince' };
    if (d.length === 12 && d.slice(4, 6) === '15') return { ok: false, motivo: 'quince' };
    if (d.length !== 10) return { ok: false, motivo: 'largo' };
    var L = lib();
    var area = d.indexOf('11') === 0 ? d.slice(0, 2) : d.slice(0, 3);
    // Sin la librería, el formato de siempre (+54 9 221 555-0000); con ella, el
    // código de área va bien separado también cuando es de 4 cifras (2964)
    var display = '+54 9 ' + area + ' ' + d.slice(area.length, d.length - 4) + '-' + d.slice(-4);
    var r = { ok: true, digits: '549' + d, display: display, pais: 'AR', verificado: 'sin_chequear' };
    if (L) {
      try {
        var p = L.parsePhoneNumber('+549' + d);
        r.verificado = p.isValid() ? 'si' : 'no';
        if (r.verificado === 'si') r.display = p.formatInternational();
      } catch (e) { r.verificado = 'no'; }
    }
    return r;
  }

  function revisarOtroPais(raw, iso) {
    var v = String(raw || '').trim();
    var d = v.replace(/\D/g, '');
    if (!d) return { ok: false, motivo: 'vacio' };
    var codigo = codigoPais(iso);
    var L = lib();
    if (L) {
      var p = null;
      try { p = /^(\+|00)/.test(v) ? L.parsePhoneNumber('+' + d.replace(/^00/, '')) : L.parsePhoneNumber(v, iso); } catch (e) { p = null; }
      // Escribió el código de país sin el +: se prueba también así
      if ((!p || !p.isValid()) && codigo && d.indexOf(codigo) === 0) {
        try { var q = L.parsePhoneNumber('+' + d); if (q && q.isValid()) p = q; } catch (e) { /* sigue */ }
      }
      if (!p || !p.isPossible()) {
        return { ok: false, motivo: (p && p.nationalNumber && String(p.nationalNumber).length > 12) ? 'largo_otro' : 'corto_otro' };
      }
      return {
        ok: true, digits: String(p.number).replace(/\D/g, ''), display: p.formatInternational(),
        pais: p.country || iso, verificado: p.isValid() ? 'si' : 'no'
      };
    }
    // Sin librería: código de país + número sin el 0 de larga distancia, 8 a 15 dígitos
    var nacional = /^(\+|00)/.test(v) ? d.replace(/^00/, '').slice(codigo.length) : d.replace(/^0+/, '');
    var todo = codigo + nacional;
    if (todo.length < 8) return { ok: false, motivo: 'corto_otro' };
    if (todo.length > 15) return { ok: false, motivo: 'largo_otro' };
    return { ok: true, digits: todo, display: '+' + codigo + ' ' + nacional, pais: iso, verificado: 'sin_chequear' };
  }

  // Devuelve { ok, digits, display, pais, verificado: si|no|sin_chequear, motivo }.
  // verificado "no" = parece mal: la primera vez se avisa (motivo "dudoso") y,
  // si la persona vuelve a mandar el mismo número, pasa marcado.
  function revisar(input, confirmar) {
    var m = datos(input);
    var iso = m ? m.select.value : 'AR';
    var r = iso === 'AR' ? revisarArgentina(input.value) : revisarOtroPais(input.value, iso);
    if (!r.ok || r.verificado !== 'no') return r;
    var clave = iso + '|' + r.digits;
    if (m && m.confirmado === clave) return r;
    if (m && confirmar) m.confirmado = clave;
    return { ok: false, motivo: 'dudoso', pais: iso };
  }

  function mensaje(r, textoVacio) {
    var pais = nombrePais(r.pais || 'AR');
    var M = {
      vacio: textoVacio || 'Escribí tu WhatsApp.',
      cero: 'Sacá el 0 del código de área: por ejemplo 221 555 0000.',
      quince: 'Sacá el 15 del número: por ejemplo 221 555 0000.',
      largo: 'Revisá el número: código de área y número, 10 dígitos en total (ej. 221 555 0000).',
      corto_otro: 'Revisá el número: parece que le faltan dígitos. Va con el código de área.',
      largo_otro: 'Revisá el número: parece que le sobran dígitos.',
      // El botón pasa a decir "Mi número está bien": la confirmación se ve, no es un doble toque escondido
      dudoso: 'Este número no parece de ' + pais + '. Revisá el número y el país; si está bien, tocá «Mi número está bien».'
    };
    return M[r.motivo] || M.largo;
  }

  // Ayuda debajo del campo: cómo escribirlo o cómo va a quedar guardado
  function pista(input) {
    var m = datos(input);
    var iso = m ? m.select.value : 'AR';
    var r = iso === 'AR' ? revisarArgentina(input.value) : revisarOtroPais(input.value, iso);
    if (r.ok && r.verificado !== 'no') return 'Se guarda como ' + r.display;
    return iso === 'AR' ? 'Código de área y número, sin el 0 ni el 15.' : 'Tu número con el código de área, sin el +' + codigoPais(iso) + '.';
  }

  window.OFWhatsApp = { montar: montar, revisar: revisar, mensaje: mensaje, pista: pista, cargar: cargar, nombrePais: nombrePais };
})();
