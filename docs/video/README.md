# Proyecto: video fotorrealista para ordenfinanciero.com

Rama de trabajo: `staging-video` (sale de `staging-pagina-nueva`, porque el video va en la página nueva).

## Cómo se trabaja

1. Todos los cambios del video se commitean en `staging-video`.
2. Cada push genera una vista previa en Vercel:
   `orden-financiero-git-staging-video-manualfanos-projects.vercel.app`
3. El dueño revisa la vista previa y da el OK.
4. Recién ahí se integra: primero a `staging-pagina-nueva` (o a `master` si la página nueva ya salió).

Nada de esta rama llega a ordenfinanciero.com sin el OK explícito del dueño.

## Pendiente de definir (dueño)

- Dónde va el video (portada, sección, diagnóstico) y qué tiene que transmitir.
- Duración y si lleva voz, música o texto en pantalla.
- Herramienta de generación y quién produce las tomas.

## Notas técnicas

- Los videos pesados no van al repo: se exportan comprimidos (MP4 H.264 + WebM, sin audio si es de fondo) y con una imagen fija de respaldo (póster) para celulares y conexiones lentas.
- El video no puede empeorar la velocidad de carga de la página (hoy LCP ~2,1 s): carga diferida y `preload="none"`.
