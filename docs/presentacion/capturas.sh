#!/bin/sh
# Capturas PNG de la vista previa, una por slide, con Chrome sin ventana.
# Uso: sh docs/presentacion/capturas.sh <vista-previa.html> <carpeta-de-salida> [slides...]
# Sin lista de slides, captura las 24 (dos presentaciones de 12).
HTML="$1"; OUT="$2"; shift 2
CHROME="/c/Program Files/Google/Chrome/Application/chrome.exe"
mkdir -p "$OUT"
LISTA="${*:-$(seq 1 24)}"
for n in $LISTA; do
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --virtual-time-budget=4000 \
    --window-size=1280,720 --screenshot="$OUT/slide-$(printf %02d "$n").png" "file:///$HTML#$n" >/dev/null 2>&1
done
echo "capturas en $OUT"
