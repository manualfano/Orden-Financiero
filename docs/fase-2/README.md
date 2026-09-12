# Proyecto: Fase 2 del sitio público

Rama de trabajo: `staging-fase-dos` (sale de `master`, que ya tiene toda la Fase 1 integrada).

## Cómo se trabaja

1. Todos los cambios de la Fase 2 se commitean en `staging-fase-dos`.
2. Cada push genera una vista previa en Vercel:
   `orden-financiero-git-staging-fase-dos-manualfanos-projects.vercel.app`
3. El dueño revisa la vista previa y da el OK.
4. Recién ahí se integra a `master`, que es lo que sirve ordenfinanciero.com.

Nada de esta rama llega a ordenfinanciero.com sin el OK explícito del dueño.

## De dónde arranca

La Fase 1 (commits `A` a `E`, 11/09) cerró los tres P0 de `AUDIT-2026-09-11.md`: el lead
dejó de perderse, el diagnóstico dejó de contradecirse y la medición pasó a GA4 con
atribución. También fijó gastronomía como único rubro y la llamada como único CTA.

## Pendiente de definir (dueño)

El alcance de la Fase 2 todavía no está elegido. Los candidatos son los hallazgos que
la Fase 1 no tocó, agrupados por frente:

- **Contenidos y guías** (H31–H36): hoy no hay plantilla, layout compartido ni sitemap
  automático; cada guía sería una copia a mano de `index.html`. Es el frente más grande.
- **Header y responsive** (H11): entre 961 y ~1.075 px el header ya estaba justo, y a
  ≤960 px no hay menú. Sin resolverlo no entra ningún ítem nuevo de navegación.
- **Accesibilidad** (H12, H17–H19): foco que cae a `<body>` en cada pregunta, nombre
  accesible de la marca en mobile, cinta de logos duplicada, contraste del anillo de foco.
- **Identidad** (H21–H22): la paleta Core decidida está implementada en 1 de 10 valores.
- **Seguridad y prolijidad** (H06, H23): el webhook sigue siendo escritura pública (la
  Fase 1 le sumó campo trampa) y el apex no manda headers de seguridad.

Antes de tomar cualquiera hay que reconfirmarlo contra el código: la Fase 1 tocó
`index.html` a fondo y varios hallazgos pueden haber quedado resueltos de paso.

## Notas técnicas

- GA4 no mide en las vistas previas salvo que se abran con `?ga_debug=1`. Los números de
  producción no se ensucian con las pruebas de esta rama.
- El sitio es 100 % estático: no hay `api/`, ni `package.json`, ni funciones. Todo lo que
  necesite servidor (descargas protegidas, rate limit real) pasa por Apps Script o cambia
  esa condición.
