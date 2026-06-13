#!/usr/bin/env python3
"""Genera i QR code per la locandina del Boiardo Individual Lab.

- Error correction: H (massima ridondanza, ~30%)
- Quiet zone (border): 4 moduli
- PNG ad alta risoluzione (>= 2000 px di lato)
- SVG vettoriale (scalabile per la stampa)
- Nero su bianco + variante brand (verde scuro #0b2014 su bianco)
"""
import segno

PUBLIC_URL = "https://davide2205.github.io/boiardo-individual-lab/"
BORDER = 4            # quiet zone in moduli (>= 4 richiesto)
PNG_MIN_PX = 2000     # lato minimo richiesto
PNG_TARGET_PX = 2400  # target per stare comodi sopra il minimo
BRAND_DARK = "#0b2014"

# error='h' + boost_error=False => esattamente livello H (non viene declassato)
qr = segno.make(PUBLIC_URL, error="h", boost_error=False)

modules = qr.symbol_size(scale=1, border=0)[0]        # moduli per lato (senza bordo)
side_with_border = modules + 2 * BORDER
# scala intera che porta il lato sopra al target (e quindi sopra il minimo)
scale = -(-PNG_TARGET_PX // side_with_border)         # ceil division
final_px = side_with_border * scale

print(f"URL codificato : {PUBLIC_URL}")
print(f"Versione QR    : {qr.version}")
print(f"Error level    : {qr.error}")
print(f"Moduli/lato    : {modules}  (+ bordo {BORDER} => {side_with_border})")
print(f"Scala PNG      : {scale}px/modulo  ->  PNG {final_px}x{final_px}px (>= {PNG_MIN_PX})")
assert final_px >= PNG_MIN_PX, "PNG sotto il minimo richiesto!"

# --- Nero su bianco ---
qr.save("qr-boiardo-lab.png", scale=scale, border=BORDER, dark="black", light="white")
qr.save("qr-boiardo-lab.svg", scale=20, border=BORDER, dark="black", light="white")

# --- Variante brand: verde scuro su bianco (alto contrasto) ---
qr.save("qr-boiardo-lab-brand.png", scale=scale, border=BORDER, dark=BRAND_DARK, light="white")
qr.save("qr-boiardo-lab-brand.svg", scale=20, border=BORDER, dark=BRAND_DARK, light="white")

print("Generati: qr-boiardo-lab.png/.svg + qr-boiardo-lab-brand.png/.svg")
