#!/usr/bin/env python3
"""
tratar-imagens.py — prepara as fotos da proposta a partir das saídas do Magnific.

Origem: SÓ as fotos reais de `artefatos/.../proposta-comercial-champion/v4/img/`, ampliadas 2x no
Magnific (modo Precision photo, preset retrato: fiel ao original, sem inventar detalhe) e com o fundo
removido no próprio Magnific. Nenhuma imagem gerada por IA entra.

O que este script faz:
  · recortes (pessoa sem fundo): corta na área útil, aquece de leve as sombras azuladas e grava
    WebP com alfa em dois tamanhos (desktop e mobile). O fundo passa a ser o "palco" da página,
    igual em todas as seções — é isso que harmoniza fotos de ensaios diferentes;
  · hero (cinturões): usa a foto inteira (o recorte perdeu um dos cinturões) e levanta o preto
    até a cor do palco, para a foto dissolver na página sem borda;
  · capas da plataforma: só redimensiona e converte.

  python3 scripts/tratar-imagens.py <pasta-com-as-saidas-do-magnific>
"""
import sys
from pathlib import Path
from PIL import Image, ImageOps

ORIGEM = Path(sys.argv[1])
DESTINO = Path(__file__).resolve().parent.parent / "public" / "img"
# Cor do palco = --palco em src/styles/base.css. Precisa bater com ela.
PALCO = (20, 19, 19)


def webp(im, caminho, q=82):
    caminho.parent.mkdir(parents=True, exist_ok=True)
    im.save(caminho, "WEBP", quality=q, method=6)
    print(f"{caminho.relative_to(DESTINO)}  {im.size[0]}x{im.size[1]}  {caminho.stat().st_size // 1024} KB")


def aquecer(rgb):
    """Puxa as sombras azuladas do ensaio para o neutro quente do ink."""
    r, g, b = rgb.split()
    b = b.point(lambda v: int(v * 0.94))
    r = r.point(lambda v: min(255, int(v * 1.015)))
    return Image.merge("RGB", (r, g, b))


def recorte(nome, saida, alturas=(1800, 960), cor=True):
    im = Image.open(ORIGEM / f"cut-{nome}.png").convert("RGBA")
    alfa = im.getchannel("A")
    caixa = alfa.point(lambda v: 255 if v > 8 else 0).getbbox()
    im = im.crop(caixa)
    if cor:
        rgb = aquecer(im.convert("RGB"))
        rgb.putalpha(im.getchannel("A"))
        im = rgb
    for h, sufixo in zip(alturas, ("", "-m")):
        w = round(im.width * h / im.height)
        webp(im.resize((w, h), Image.LANCZOS), DESTINO / "fotos" / f"{saida}{sufixo}.webp")


def levantar_preto(rgb):
    """Mapeia o preto da foto para o palco: v' = palco + v * (1 - palco/255)."""
    canais = []
    for c, p in zip(rgb.split(), PALCO):
        canais.append(c.point(lambda v, p=p: int(p + v * (1 - p / 255))))
    return Image.merge("RGB", canais)


def hero():
    im = levantar_preto(Image.open(ORIGEM / "up-cinturoes.jpg").convert("RGB"))
    webp(im.resize((2560, round(2560 * im.height / im.width)), Image.LANCZOS), DESTINO / "fotos" / "hero-cinturoes.webp", 80)
    # Mobile: recorte vertical centrado no rosto, para tela em pé.
    h = im.height
    w = round(h * 10 / 16)
    x = (im.width - w) // 2
    vert = im.crop((x, 0, x + w, h)).resize((1100, round(1100 * h / w)), Image.LANCZOS)
    webp(vert, DESTINO / "fotos" / "hero-cinturoes-m.webp", 80)


def capas():
    for nome in ["m0", "m1", "m3", "m6", "central", "certificado"]:
        im = Image.open(ORIGEM / f"capa-{nome}.jpg").convert("RGB")
        webp(im.resize((672, round(672 * im.height / im.width)), Image.LANCZOS), DESTINO / "capas" / f"{nome}.webp", 84)


if __name__ == "__main__":
    hero()
    recorte("palco", "rodrigo-palco")
    recorte("pb", "rodrigo-pb", cor=False)
    recorte("quiteria", "quiteria")
    recorte("fundadores", "fundadores")
    recorte("kit", "kit-caderno", alturas=(1100, 640), cor=False)
    capas()
