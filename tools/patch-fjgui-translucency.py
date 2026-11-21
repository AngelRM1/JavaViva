#!/usr/bin/env python3
"""
Parche web de FreeJ2ME-Plus v1.53 para CheerpJ.

Causa: FJGUI.<init> (constructor) hace
    swingDialogs[3].setBackground(new Color(238, 238, 238, 160));
El dialogo "Restart Required" queda semitransparente (alfa 160).
java.awt.Window.setBackground() exige translucidez PERPIXEL_TRANSLUCENT
para colores con alfa < 255 y CheerpJ no la soporta:
    java.lang.UnsupportedOperationException:
    PERPIXEL_TRANSLUCENT translucency is not supported
El emulador no arranca en el navegador por eso (en escritorio funciona).

Arreglo: el mismo que hizo el proyecto original despues de v1.53
(en devel ya es new Color(238, 238, 238)): construir el color con el
constructor de 3 argumentos, opaco. A nivel de bytecode eso es:
  - los 3 bytes de `sipush 160` pasan a ser 3 x nop (no cambia la
    longitud del metodo ni el equilibrio de la pila: el 4o argumento
    simplemente deja de empujarse), y
  - el invokespecial de Color.<init>(IIII)V pasa a apuntar al
    Methodref ya existente de Color.<init>(III)V.
Longitud total identica, pila equilibrada, constant pool intacto.

Uso: python3 patch-fjgui-translucency.py <FJGUI.class> <salida.class>
Devuelve 1 si no encuentra exactamente el patron esperado.
"""
import struct
import sys

NOP = 0x00
OP_NEW = 0xBB
OP_DUP = 0x59
OP_SIPUSH = 0x11
OP_INVOKESPECIAL = 0xB7
OP_INVOKEVIRTUAL = 0xB6


def parse_class(data: bytes):
    """Parseo minimo del .class: devuelve (cp, methods) donde cp es una
    lista indexada desde 1 con tuplas (tag, valor) y methods una lista
    de dicts {name, descriptor, code: bytes|None}."""
    if data[:4] != b"\xca\xfe\xba\xbe":
        raise ValueError("no es un .class (magic incorrecto)")
    pos = 8  # magic + minor + major

    def u1():
        nonlocal pos
        v = data[pos]
        pos += 1
        return v

    def u2():
        nonlocal pos
        v = struct.unpack_from(">H", data, pos)[0]
        pos += 2
        return v

    def u4():
        nonlocal pos
        v = struct.unpack_from(">I", data, pos)[0]
        pos += 4
        return v

    cp_count = u2()
    cp = [None] * cp_count
    i = 1
    while i < cp_count:
        tag = u1()
        if tag == 1:  # Utf8
            ln = u2()
            val = data[pos:pos + ln].decode("utf-8", "replace")
            pos += ln
            cp[i] = (tag, val)
        elif tag == 7:  # Class
            cp[i] = (tag, u2())
        elif tag in (9, 10, 11, 12):  # Field/Method/InterfaceMethod ref, NameAndType
            cp[i] = (tag, u2(), u2())
        elif tag in (3, 4):  # Integer, Float
            cp[i] = (tag, u4())
        elif tag in (5, 6):  # Long, Double: ocupan dos entradas
            pos += 8
            cp[i] = (tag, None)
            i += 1
            cp[i] = (tag, None)
        elif tag == 8:  # String
            cp[i] = (tag, u2())
        elif tag == 15:  # MethodHandle
            pos += 3
            cp[i] = (tag, None)
        elif tag == 16:  # MethodType
            cp[i] = (tag, u2())
        elif tag == 18:  # InvokeDynamic
            pos += 4
            cp[i] = (tag, None)
        else:
            raise ValueError(f"tag de constant pool desconocido: {tag} en {i}")
        i += 1

    def cp_utf8(idx):
        return cp[idx][1]

    def cp_class_name(idx):
        return cp_utf8(cp[idx][1])

    def methodref(idx):
        _, class_idx, nat_idx = cp[idx]
        _, name_idx, desc_idx = cp[nat_idx]
        return (cp_class_name(class_idx), cp_utf8(name_idx), cp_utf8(desc_idx))

    # access_flags, this_class, super_class
    u2(); u2(); u2()
    # interfaces
    for _ in range(u2()):
        u2()
    # fields (se saltan)
    for _ in range(u2()):
        u2(); u2(); u2()
        for _ in range(u2()):
            u2()
            ln = u4()
            pos += ln
    # methods
    methods = []
    for _ in range(u2()):
        u2()
        name = cp_utf8(u2())
        desc = cp_utf8(u2())
        code = None
        code_pos = None
        for _ in range(u2()):
            attr_name = cp_utf8(u2())
            ln = u4()
            if attr_name == "Code":
                # max_stack, max_locals, code_length, code
                pos += 4
                code_len = u4()
                code_pos = pos
                code = data[pos:pos + code_len]
                pos += code_len
                # resto del atributo Code (excepciones, sub-atributos)
                pos += ln - (4 + 4 + code_len)
            else:
                pos += ln
        methods.append({"name": name, "descriptor": desc, "code": code,
                        "code_pos": code_pos})
    return cp, methods, methodref


def main():
    src, dst = sys.argv[1], sys.argv[2]
    data = bytearray(open(src, "rb").read())
    cp, methods, methodref = parse_class(bytes(data))

    # Resolver los indices necesarios en el constant pool.
    idx_iiii = idx_iii = None
    idx_color_class = None
    idx_setbg = []
    for idx in range(1, len(cp)):
        e = cp[idx]
        if e is None:
            continue
        if e[0] == 7 and cp[e[1]][1] == "java/awt/Color":
            idx_color_class = idx
        if e[0] == 10:
            cls, name, desc = methodref(idx)
            if cls == "java/awt/Color" and name == "<init>" and desc == "(IIII)V":
                idx_iiii = idx
            elif cls == "java/awt/Color" and name == "<init>" and desc == "(III)V":
                idx_iii = idx
            elif name == "setBackground" and desc == "(Ljava/awt/Color;)V":
                idx_setbg.append(idx)
    assert idx_color_class, "no se encontro la clase java/awt/Color"
    assert idx_iiii, "no se encontro Color.<init>(IIII)V"
    assert idx_iii, "no se encontro Color.<init>(III)V (se esperaba, FJGUI usa colores de 3 args)"
    assert idx_setbg, "no se encontro ningun setBackground(Color)"
    print(f"Color class=#{idx_color_class} <init>(IIII)V=#{idx_iiii} <init>(III)V=#{idx_iii} setBackground refs={idx_setbg}")

    # Patron del constructor translucido (22 bytes):
    #   new Color; dup; sipush 238 x3; sipush 160;
    #   invokespecial Color.<init>(IIII)V; invokevirtual setBackground
    # El invokevirtual puede ser cualquiera de los setBackground refs.
    patched = 0
    for m in methods:
        code = m["code"]
        if not code:
            continue
        for sb in idx_setbg:
            pat = (
                bytes([OP_NEW]) + struct.pack(">H", idx_color_class)
                + bytes([OP_DUP])
                + bytes([OP_SIPUSH, 0x00, 238]) * 3
                + bytes([OP_SIPUSH, 0x00, 160])
                + bytes([OP_INVOKESPECIAL]) + struct.pack(">H", idx_iiii)
                + bytes([OP_INVOKEVIRTUAL]) + struct.pack(">H", sb)
            )
            start = 0
            while True:
                off = bytes(code).find(pat, start)
                if off < 0:
                    break
                # Posiciones dentro del patron: sipush 160 empieza en +3+1+9 = 13;
                # el invokespecial empieza en +16 y su indice en +17.
                # Se parchea `data` (el archivo) en la posicion absoluta
                # code_pos + off; `code` es solo la copia para buscar.
                base = m["code_pos"] + off
                sipush_off = base + 13
                inv_off = base + 16
                assert data[sipush_off] == OP_SIPUSH and data[sipush_off + 1] == 0x00 \
                    and data[sipush_off + 2] == 160, "sipush 160 no coincide"
                # Parche: 3 x nop en lugar de sipush 160, y el indice del
                # invokespecial pasa de (IIII)V a (III)V.
                for k in range(3):
                    data[sipush_off + k] = NOP
                data[inv_off + 1:inv_off + 3] = struct.pack(">H", idx_iii)
                patched += 1
                print(f"parcheado en metodo {m['name']}{m['descriptor']} offset {off} "
                      f"(sipush 160 -> nop x3; <init>(IIII)V -> <init>(III)V)")
                start = off + len(pat)

    # Informe de otros Color.<init>(IIII)V que queden en la clase (por si
    # otro metodo tambien usa colores translucidos).
    others = 0
    for m in methods:
        code = m["code"]
        if not code:
            continue
        needle = bytes([OP_INVOKESPECIAL]) + struct.pack(">H", idx_iiii)
        start = 0
        while True:
            off = bytes(code).find(needle, start)
            if off < 0:
                break
            others += 1
            print(f"AVISO: queda un Color.<init>(IIII)V en {m['name']}{m['descriptor']} offset {off}")
            start = off + len(needle)
    print(f"parches aplicados: {patched}; otros (IIII)V restantes: {others}")
    if patched == 0:
        print("ERROR: no se encontro el patron esperado; no se parchea nada.")
        return 1
    open(dst, "wb").write(bytes(data))
    print(f"escrito {dst} ({len(data)} bytes, misma longitud que el original)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
