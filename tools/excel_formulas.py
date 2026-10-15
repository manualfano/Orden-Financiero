"""Genera descargas/10-formulas-financieras-restaurante.xlsx (14/10/2026).

Es la descarga de la guía /guias/formulas-financieras (se baja a cambio del WhatsApp).
Una sola hoja para cargar los números del negocio y otra con las 10 fórmulas ya armadas.
Viene con el ejemplo de la guía cargado; las celdas celestes son las que se cambian.

    python tools/excel_formulas.py
"""
import pathlib

from openpyxl import Workbook
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.worksheet.datavalidation import DataValidation

ROOT = pathlib.Path(__file__).resolve().parent.parent
SALIDA = ROOT / 'descargas' / '10-formulas-financieras-restaurante.xlsx'

NAVY, MARCA, CELESTE, LIENZO, GRIS = '0D2B6B', '0C66E4', 'E9F2FF', 'F7F8F9', '6B6E76'
F = 'Arial'
PESOS, PCT, DEC, DIAS = '"$" #,##0', '0.0%', '0.00', '0 "días"'
fino = Side(style='thin', color='DCDFE4')
borde = Border(bottom=fino)


def titulo(ws, texto, sub):
    ws['B2'] = texto
    ws['B2'].font = Font(name=F, size=18, bold=True, color=NAVY)
    ws['B3'] = sub
    ws['B3'].font = Font(name=F, size=10, color=GRIS)
    ws.sheet_view.showGridLines = False


def cabecera(ws, fila, textos):
    for i, t in enumerate(textos):
        c = ws.cell(fila, 2 + i, t)
        c.font = Font(name=F, size=10, bold=True, color='FFFFFF')
        c.fill = PatternFill('solid', fgColor=NAVY)
        c.alignment = Alignment(vertical='center', wrap_text=True)
    ws.row_dimensions[fila].height = 22


def seccion(ws, fila, texto):
    c = ws.cell(fila, 2, texto)
    c.font = Font(name=F, size=11, bold=True, color=MARCA)
    ws.row_dimensions[fila].height = 24


# ── Hoja 1: tus números ───────────────────────────────────────────────
wb = Workbook()
ws = wb.active
ws.title = 'Tus números'
titulo(ws, 'Tus números', 'Cambiá solo las celdas celestes. Viene cargado un restaurante de ejemplo. Todo sin IVA.')
ws.column_dimensions['A'].width = 3
ws.column_dimensions['B'].width = 46
ws.column_dimensions['C'].width = 18
ws.column_dimensions['D'].width = 70

# (nombre, valor, formato, ayuda). Las filas con None en nombre son títulos de sección.
DATOS = [
    ('§', 'Del último mes'),
    ('ventas', 'Ventas del mes, sin IVA', 40_000_000, PESOS, 'Lo que vendiste en el mes, sin IVA. Si sos monotributista, lo que cobraste.'),
    ('cmv', 'Costo de la mercadería vendida (CMV)', 12_000_000, PESOS, 'Lo que te costó la comida y la bebida que vendiste en el mes.'),
    ('otrosvar', 'Otros costos variables', 0, PESOS, 'Lo que sube cuanto más vendés: envases, comisiones de apps de delivery y de tarjetas.'),
    ('fijos', 'Costos fijos del mes (sin amortizaciones)', 15_800_000, PESOS, 'Alquiler, sueldos con aguinaldo y cargas, servicios, contador, sistemas y tu sueldo.'),
    ('amort', 'Amortizaciones del mes', 1_000_000, PESOS, 'Lo que se gasta por mes de lo que compraste para usar años (horno, heladera, obra). Ej: horno de $12.000.000 que dura 10 años = $100.000 por mes.'),
    ('§', 'Un producto'),
    ('precio', 'Precio de venta sin IVA', 14_000, PESOS, 'Del producto que quieras mirar. Ej: la hamburguesa.'),
    ('cvu', 'Costo variable de ese producto', 4_200, PESOS, 'Ingredientes, envase y comisión de esa venta.'),
    ('§', 'Hoy (sacalo del balance o de tu contador)'),
    ('activo', 'Activo corriente', 12_000_000, PESOS, 'Caja, banco, lo que te deben cobrar en menos de un año y la mercadería.'),
    ('stock', 'Inventario (mercadería en stock)', 3_000_000, PESOS, 'Lo que vale la mercadería que tenés hoy en depósito y cámaras.'),
    ('pasivo', 'Pasivo corriente', 7_500_000, PESOS, 'Lo que tenés que pagar en menos de un año: proveedores, sueldos, impuestos, cuotas.'),
    ('dinv', 'Días de inventario', 5, DIAS, 'Cuántos días dura la mercadería desde que la comprás hasta que la vendés.'),
    ('dcob', 'Días de cobro', 2, DIAS, 'Cuántos días tardás en cobrar. Efectivo = 0; tarjeta de crédito y apps, más.'),
    ('dpag', 'Días de pago', 30, DIAS, 'Cuántos días tardás en pagarles a tus proveedores.'),
    ('§', 'Del último año'),
    ('neta', 'Ganancia neta del año', 24_000_000, PESOS, 'Lo que quedó después de todo: costos, intereses e impuestos.'),
    ('inversion', 'Inversión total en el negocio', 80_000_000, PESOS, 'Todo lo que se puso para armarlo y hacerlo andar: obra, equipos, mercadería y caja. Lo tuyo y lo prestado.'),
    ('patrimonio', 'Patrimonio neto (lo que es tuyo)', 60_000_000, PESOS, 'La inversión total menos lo que debés (préstamos).'),
]
REF = {}
fila = 5
for d in DATOS:
    if d[0] == '§':
        fila += 1
        seccion(ws, fila, d[1])
        fila += 1
        continue
    clave, nombre, valor, fmt, ayuda = d
    ws.cell(fila, 2, nombre).font = Font(name=F, size=10, color=NAVY, bold=True)
    c = ws.cell(fila, 3, valor)
    c.number_format = fmt
    c.font = Font(name=F, size=11, color='000000')
    c.fill = PatternFill('solid', fgColor=CELESTE)
    c.alignment = Alignment(horizontal='right')
    a = ws.cell(fila, 4, ayuda)
    a.font = Font(name=F, size=9, color=GRIS)
    a.alignment = Alignment(wrap_text=True, vertical='center')
    for col in (2, 3, 4):
        ws.cell(fila, col).border = borde
    ws.row_dimensions[fila].height = 30
    REF[clave] = f"'Tus números'!$C${fila}"
    fila += 1

# Inversión nueva para VPN y TIR: fila de flujos por año (año 0 = la inversión, en negativo)
fila += 1
seccion(ws, fila, 'Una inversión que estás pensando (para VPN y TIR)')
fila += 1
for clave, nombre, valor, fmt, ayuda in [
    ('tasa', 'Lo que te cuesta la plata, por año', 0.30, PCT, 'La tasa del préstamo, o lo que ganarías poniendo la plata en otro lado. En la misma moneda que los flujos.'),
]:
    ws.cell(fila, 2, nombre).font = Font(name=F, size=10, color=NAVY, bold=True)
    c = ws.cell(fila, 3, valor)
    c.number_format, c.fill = fmt, PatternFill('solid', fgColor=CELESTE)
    c.font = Font(name=F, size=11)
    a = ws.cell(fila, 4, ayuda)
    a.font, a.alignment = Font(name=F, size=9, color=GRIS), Alignment(wrap_text=True, vertical='center')
    for col in (2, 3, 4):
        ws.cell(fila, col).border = borde
    ws.row_dimensions[fila].height = 30
    REF[clave] = f"'Tus números'!$C${fila}"
    fila += 1
fila += 1
cabecera(ws, fila, ['Año', 'Plata', 'Qué es'])
fila += 1
flujos = [('Año 0', -20_000_000, 'Lo que ponés hoy, en negativo. Ej: la obra de una terraza.'),
          ('Año 1', 10_000_000, 'Lo que te deja de más ese año (ventas extra menos sus costos).'),
          ('Año 2', 10_000_000, ''), ('Año 3', 10_000_000, ''), ('Año 4', 10_000_000, ''),
          ('Año 5', 0, 'Si dura menos años, dejá 0.')]
fila_f0 = fila
for nombre, valor, ayuda in flujos:
    ws.cell(fila, 2, nombre).font = Font(name=F, size=10, color=NAVY, bold=True)
    c = ws.cell(fila, 3, valor)
    c.number_format, c.fill, c.font = PESOS, PatternFill('solid', fgColor=CELESTE), Font(name=F, size=11)
    ws.cell(fila, 4, ayuda).font = Font(name=F, size=9, color=GRIS)
    for col in (2, 3, 4):
        ws.cell(fila, col).border = borde
    fila += 1
REF['f0'] = f"'Tus números'!$C${fila_f0}"
REF['flujos'] = f"'Tus números'!$C${fila_f0 + 1}:$C${fila_f0 + 5}"
REF['todos'] = f"'Tus números'!$C${fila_f0}:$C${fila_f0 + 5}"
ws.freeze_panes = 'A5'

# Solo números en las celdas celestes
dv = DataValidation(type='decimal', operator='between', formula1='-1000000000000', formula2='1000000000000',
                    showErrorMessage=True, errorTitle='Solo números', error='Escribí un número, sin letras.')
ws.add_data_validation(dv)
for clave, ref in REF.items():
    if clave not in ('flujos', 'todos'):
        dv.add(ref.split('!')[1].replace('$', ''))
dv.add(f'C{fila_f0}:C{fila_f0 + 5}')

# ── Hoja 2: las 10 fórmulas ───────────────────────────────────────────
f2 = wb.create_sheet('Las 10 fórmulas', 0)
titulo(f2, 'Las 10 fórmulas financieras de tu restaurante',
       'Se calculan solas con lo que cargues en la hoja "Tus números". Guía completa: ordenfinanciero.com/guias/formulas-financieras')
for col, w in zip('ABCDEFG', (3, 5, 28, 40, 40, 18, 52)):
    f2.column_dimensions[col].width = w
cabecera(f2, 5, ['#', 'Fórmula', 'Qué te dice', 'Cuenta', 'Tu resultado', 'Cómo leerlo'])

R = REF
var_total = f"({R['cmv']}+{R['otrosvar']})"
uo = f"({R['ventas']}-{var_total}-{R['fijos']}-{R['amort']})"
mc_pct = f"(1-{var_total}/{R['ventas']})"
FORMULAS = [
    ('Margen bruto', 'Lo que te queda de cada peso vendido después de pagar la mercadería.',
     '(Ventas − CMV) ÷ Ventas × 100', f"=IFERROR(({R['ventas']}-{R['cmv']})/{R['ventas']},\"\")", PCT,
     f'=IF(F6="","Cargá ventas y CMV.",IF(F6>=0.65,"Bien: la mercadería se lleva "&TEXT(1-F6,"0%")&" o menos de cada venta.","Ojo: la mercadería se lleva "&TEXT(1-F6,"0%")&" de cada venta. Revisá costos y precios."))'),
    ('Margen de contribución (un producto)', 'Lo que deja ese producto para pagar los costos fijos y ganar.',
     '(Precio − Costo variable) ÷ Precio × 100', f"=IFERROR(({R['precio']}-{R['cvu']})/{R['precio']},\"\")", PCT,
     f'=IF(F7="","Cargá precio y costo.","De cada $100 que cobrás por ese producto, te quedan $"&TEXT(F7*100,"0")&" para los fijos y la ganancia.")'),
    ('EBITDA', 'Lo que genera la operación, antes de intereses, impuestos y amortizaciones.',
     'Utilidad operativa + Amortizaciones', f"={uo}+{R['amort']}", PESOS,
     f'=IFERROR(IF(F8<=0,"Negativo: la operación no se paga sola.","Es el "&TEXT(F8/{R["ventas"]},"0%")&" de las ventas."),"")'),
    ('Punto de equilibrio', 'Cuánto tenés que vender por mes para no ganar ni perder.',
     'Costos fijos ÷ Margen de contribución %', f"=IFERROR(({R['fijos']}+{R['amort']})/{mc_pct},\"\")", PESOS,
     f'=IFERROR(IF({mc_pct}<=0,"Cada venta te hace perder: revisá precios.",IF({R["ventas"]}>=F9,"Vendés "&TEXT({R["ventas"]}/F9-1,"0%")&" arriba del piso.","Estás "&TEXT(1-{R["ventas"]}/F9,"0%")&" abajo del piso: el mes da pérdida.")),"")'),
    ('Prueba ácida', 'Si podés pagar las deudas de corto plazo sin vender mercadería.',
     '(Activo corriente − Inventario) ÷ Pasivo corriente', f"=IFERROR(({R['activo']}-{R['stock']})/{R['pasivo']},\"\")", DEC,
     '=IF(F10="","Cargá activo, inventario y pasivo.",IF(F10>=1,"Mayor a 1: estás cubierto.","Menor a 1: hoy no te alcanza para pagar todo lo de corto plazo."))'),
    ('Ciclo de conversión de efectivo', 'Cuántos días tarda la plata que ponés en volver a tu caja.',
     'Días de inventario + Días de cobro − Días de pago', f"={R['dinv']}+{R['dcob']}-{R['dpag']}", '0 "días"',
     '=IF(F11<0,"Negativo: tus proveedores te financian "&-F11&" días. Esa plata no es tuya: separá lo que les debés.","Positivo: ponés plata "&F11&" días antes de recuperarla. Necesitás capital de trabajo.")'),
    ('ROI (retorno sobre la inversión)', 'Cuánto rinde cada peso puesto en el negocio, contando lo prestado.',
     'Ganancia neta anual ÷ Inversión total × 100', f"=IFERROR({R['neta']}/{R['inversion']},\"\")", PCT,
     f'=IF(F12="","Cargá ganancia e inversión.","Recuperás la inversión en unos "&ROUND(1/F12,1)&" años. Comparalo con la tasa de la hoja ""Tus números"" ("&TEXT({R["tasa"]},"0%")&").")'),
    ('ROE (retorno sobre el patrimonio)', 'Cuánto rinde la plata que es tuya.',
     'Ganancia neta anual ÷ Patrimonio neto × 100', f"=IFERROR({R['neta']}/{R['patrimonio']},\"\")", PCT,
     f'=IF(F13="","Cargá ganancia y patrimonio.",IF(F13>{R["tasa"]},"Tu plata rinde más que la tasa de la hoja ""Tus números"" ("&TEXT({R["tasa"]},"0%")&").","Tu plata rinde igual o menos que la tasa de la hoja ""Tus números"" ("&TEXT({R["tasa"]},"0%")&"): en otro lado ganarías parecido."))'),
    ('VPN (valor presente neto)', 'Cuánto vale hoy lo que una inversión te va a dar.',
     'Flujos futuros descontados − Inversión inicial', f"=IFERROR(NPV({R['tasa']},{R['flujos']})+{R['f0']},\"\")", PESOS,
     '=IF(F14="","Cargá la tasa y los flujos.",IF(F14>0,"Más que 0: la inversión conviene.","Menos que 0: con esa tasa, no conviene."))'),
    ('TIR (tasa interna de retorno)', 'La rentabilidad de esa inversión, en % por año.',
     'La tasa que hace que el VPN dé 0', f"=IFERROR(IRR({R['todos']}),\"\")", PCT,
     f'=IF(F15="","Cargá los flujos (el año 0 en negativo).",IF(F15>{R["tasa"]},"Mayor que lo que te cuesta la plata ("&TEXT({R["tasa"]},"0%")&"): conviene.","Menor que lo que te cuesta la plata ("&TEXT({R["tasa"]},"0%")&"): no conviene."))'),
]
for i, (nombre, que, cuenta, formula, fmt, lectura) in enumerate(FORMULAS):
    r = 6 + i
    vals = [i + 1, nombre, que, cuenta, formula, lectura]
    for j, v in enumerate(vals):
        c = f2.cell(r, 2 + j, v)
        c.alignment = Alignment(wrap_text=True, vertical='center')
        c.border = borde
        c.font = Font(name=F, size=10, color='2C2E33')
    f2.cell(r, 2).font = Font(name=F, size=12, bold=True, color=MARCA)
    f2.cell(r, 3).font = Font(name=F, size=10, bold=True, color=NAVY)
    f2.cell(r, 5).font = Font(name=F, size=10, color=GRIS, italic=True)
    res = f2.cell(r, 6)
    res.number_format = fmt
    res.font = Font(name=F, size=13, bold=True, color=NAVY)
    res.fill = PatternFill('solid', fgColor=LIENZO)
    res.alignment = Alignment(horizontal='right', vertical='center')
    f2.row_dimensions[r].height = 48
f2['B17'] = '¿Algún número te dio raro o no lo sabés sacar? Hacé el diagnóstico gratis en ordenfinanciero.com: 12 preguntas, 3 minutos.'
f2['B17'].font = Font(name=F, size=10, bold=True, color=MARCA)
f2.freeze_panes = 'A6'

wb.active = 0
SALIDA.parent.mkdir(exist_ok=True)
wb.save(SALIDA)
print('OK', SALIDA)
