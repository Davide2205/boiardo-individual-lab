#!/usr/bin/env python3
"""Decodifica i QR PNG e verifica che il contenuto sia ESATTAMENTE l'URL pubblico."""
import cv2
import os

PUBLIC_URL = "https://davide2205.github.io/boiardo-individual-lab/"
det = cv2.QRCodeDetector()

def decode(path):
    img = cv2.imread(path)
    if img is None:
        return None, None
    h, w = img.shape[:2]
    data, pts, _ = det.detectAndDecode(img)
    if not data:
        # fallback: ridimensiona e riprova (decoder a volte fatica sull'alta risoluzione)
        small = cv2.resize(img, (900, 900), interpolation=cv2.INTER_AREA)
        data, pts, _ = det.detectAndDecode(small)
    return data, (w, h)

ok_all = True
for path in ["qr-boiardo-lab.png", "qr-boiardo-lab-brand.png"]:
    data, size = decode(path)
    match = (data == PUBLIC_URL)
    ok_all = ok_all and match
    print(f"\n[{path}]")
    print(f"  dimensioni : {size[0]}x{size[1]} px")
    print(f"  decodificato: {data!r}")
    print(f"  == URL pubblico ? {'SI ✅' if match else 'NO ❌'}")

print("\nRISULTATO:", "TUTTI OK ✅" if ok_all else "PROBLEMA ❌")
raise SystemExit(0 if ok_all else 1)
