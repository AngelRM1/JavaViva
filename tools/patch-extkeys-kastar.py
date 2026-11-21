#!/usr/bin/env python3
"""Parche de bytecode (v1.12): las teclas * y # por el archivo de
entrada externa de FreeJ2ME-Plus v1.53.

PROBLEMA (verificado en el código fuente v1.53, FreeJ2ME.java):
- El mapa de entrada externa (static initializer) registra "ka" y "kb"
  como claves, pero processExternalKey() compara con "k*" y "k#".
- Si el frontend escribe "k*:1" en FreeJ2MEExternalKeyEvents.txt,
  readFile() hace extEventsMap.get("k*") -> null y la comparación
  `value != extEventsMap.get(key)` desempaqueta ese null ->
  NullPointerException, que NO está capturada (solo IOException) y
  MATA el hilo ExternalInputs: a partir de ahí NINGUNA tecla externa
  llega al juego.
- Si se escribiera "ka:1", el mapa sí lo tiene, pero
  processExternalKey("ka") no casa con ninguna rama y cae en el caso
  por defecto (key = 0): pulsaría el 0 en vez del *.

PARCHE: en FreeJ2ME.class, las constantes Utf8 "ka" (#576) y "kb"
(#577) pasan a "k*" y "k#". Mismo largo (2 bytes), mismo tamaño de
archivo, sin tocar ninguna instrucción. Verificado antes de parchear:
- Cada Utf8 aparece exactamente una vez en todo el archivo.
- Cada una solo la referencia una entrada CONSTANT_String (#254/#255).
- Cada String solo lo carga un ldc en <clinit> (las dos llamadas
  extEventsMap.put del inicializador estático).
Tras el parche, el mapa contiene "k*" y "k#", que son justo las
claves que processExternalKey() espera (VK_E y VK_R). La rama devel
de FreeJ2ME-Plus tiene la misma inconsistencia, así que no es un
arreglo que venga de upstream: es un parche propio, solo para web
(JavaViva Windows usa el jar original sin parchear).

Uso: python3 tools/patch-extkeys-kastar.py <jar>
El jar se reescribe con la clase parcheada; el original queda en
engine-orig/freej2me_plus-v1.7-patched.jar (ese ya lleva el parche
v1.7 de translucencia de FJGUI).
"""

import struct
import sys
import zipfile

JAR = sys.argv[1] if len(sys.argv) > 1 else "public/engine/freej2me_plus.jar"
CLASS_PATH = "org/recompile/freej2me/FreeJ2ME.class"


def parse_cp(data):
    """Devuelve (utf8: idx -> (offset_bytes, value), strings: idx -> utf8_idx)."""
    assert data[:4] == b"\xca\xfe\xba\xbe", "no es un .class válido"
    pos = 8
    cp_count = struct.unpack(">H", data[pos : pos + 2])[0]
    pos += 2
    utf8 = {}
    strings = {}
    i = 1
    while i < cp_count:
        tag = data[pos]
        pos += 1
        if tag == 1:  # Utf8
            ln = struct.unpack(">H", data[pos : pos + 2])[0]
            pos += 2
            utf8[i] = (pos, data[pos : pos + ln].decode("utf-8"))
            pos += ln
        elif tag in (7, 8, 16, 19, 20):
            if tag == 8:
                strings[i] = struct.unpack(">H", data[pos : pos + 2])[0]
            pos += 2
        elif tag == 15:
            pos += 3
        elif tag in (3, 4, 9, 10, 11, 12, 17, 18):
            pos += 4
        elif tag in (5, 6):
            pos += 8
            i += 1  # long/double ocupan dos huecos
        else:
            raise ValueError(f"tag de constant pool desconocido: {tag} en #{i}")
        i += 1
    return utf8, strings


def main():
    with zipfile.ZipFile(JAR) as zf:
        orig = zf.read(CLASS_PATH)
        names = zf.namelist()

    utf8, strings = parse_cp(orig)

    # 1. Localizar las Utf8 "ka" y "kb" (deben ser únicas en el archivo).
    targets = {}
    for idx, (off, val) in utf8.items():
        if val in ("ka", "kb"):
            assert val not in targets, f"{val!r} aparece dos veces en el constant pool"
            targets[val] = (idx, off)
    assert set(targets) == {"ka", "kb"}, f"no se encontraron 'ka' y 'kb': {targets}"
    # 2. Cada una solo la referencia una CONSTANT_String.
    for val, (uidx, _) in targets.items():
        refs = [s for s, u in strings.items() if u == uidx]
        assert len(refs) == 1, f"{val!r} referenciada por {len(refs)} String: {refs}"
    # 3. Cada String solo lo carga un ldc (0x12 + índice de 1 byte).
    for val, (uidx, _) in targets.items():
        sidx = [s for s, u in strings.items() if u == uidx][0]
        assert sidx < 256, "el índice String no cabe en ldc de 1 byte"
        count = orig.count(bytes([0x12, sidx]))
        assert count == 1, f"String #{sidx} ({val!r}) cargado {count} veces, se esperaba 1"

    # 4. Parche: mismo largo, 2 bytes por cadena.
    patched = bytearray(orig)
    patched[targets["ka"][1] : targets["ka"][1] + 2] = b"k*"
    patched[targets["kb"][1] : targets["kb"][1] + 2] = b"k#"
    assert len(patched) == len(orig), "el tamaño cambió (no debería)"

    # 5. Verificación: re-parsear el resultado.
    utf8b, _ = parse_cp(bytes(patched))
    vals = [v for _, v in utf8b.values()]
    assert "ka" not in vals and "kb" not in vals, "quedan 'ka'/'kb' tras el parche"
    assert vals.count("k*") == 2 and vals.count("k#") == 2, (
        "se esperaban dos 'k*' y dos 'k#' (una en processExternalKey, otra en el mapa)"
    )
    diffs = [i for i in range(len(orig)) if orig[i] != patched[i]]
    # Solo 2 bytes cambian de verdad: la 'k' inicial es la misma en
    # "ka"->"k*" y en "kb"->"k#"; cambian 'a'->'*' y 'b'->'#'.
    assert len(diffs) == 2, f"se esperaban 2 bytes distintos, hay {len(diffs)}"
    print(f"Parche aplicado: 2 bytes en {CLASS_PATH}")
    print(f"  'ka' (Utf8 #{targets['ka'][0]}) -> 'k*'")
    print(f"  'kb' (Utf8 #{targets['kb'][0]}) -> 'k#'")
    print(f"  tamaño de la clase sin cambios: {len(orig)} bytes")

    # 6. Reescribir el jar con la clase parcheada (el resto intacto).
    with zipfile.ZipFile(JAR) as zf:
        entries = [(info, zf.read(info.filename)) for info in zf.infolist()]
    with zipfile.ZipFile(JAR, "w", zipfile.ZIP_DEFLATED) as zf:
        for info, content in entries:
            if info.filename == CLASS_PATH:
                content = bytes(patched)
            zf.writestr(info, content)
    print(f"Jar reescrito: {JAR} ({len(names)} entradas)")


if __name__ == "__main__":
    main()
