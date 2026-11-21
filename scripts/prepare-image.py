#!/usr/bin/env python3
"""Yeni görselleri sitenin responsive görsel kuralarına hazırlar.

Kaynak dosyayı değiştirmez; yanına 400/600/800/... genişliklerinde WebP ve
AVIF türevleri yazar ve yapıştırılabilir `<picture>` HTML'ini gösterir.

Kullanım:
    python3 scripts/prepare-image.py assets/images/places/yeni.webp
    python3 scripts/prepare-image.py kapak.jpg --hero --alt "Ayaş panaroması"
    python3 scripts/prepare-image.py grafik.png --out-dir assets/images/blog --max-width 1200

Pillow gerekir: python3 -m pip install Pillow
"""

import argparse
import sys
from pathlib import Path

from PIL import Image

# Sitenin kullandığı srcset kademeleri. Kaynak bundan küçükse başka genişlik
# üretilmez (upscaling yapılmaz), büyükse --max-width ile sınırlandırılır.
WIDTH_LADDER = (400, 600, 800, 1200, 1600, 2400)
WEBP_QUALITY = 68   # mevcut Ayaş türevleriyle aynı sıkıştırma
AVIF_QUALITY = 50   # aynı görsel kalitesinde WebP'den belirgin küçük

GALLERY_SIZES = "(min-width: 640px) 33vw, calc(100vw - 5.125rem)"
HERO_SIZES = "(min-width: 1024px) 25vw, (min-width: 768px) 33vw, calc(100vw - 5.125rem)"
GALLERY_CLASS = "w-full h-auto rounded-lg shadow-md object-cover"
HERO_CLASS = "w-full h-auto rounded-lg shadow-xl object-cover border border-brand-dark/10 dark:border-brand-light/10"

REPO_ROOT = Path(__file__).resolve().parent.parent


def parse_args():
    parser = argparse.ArgumentParser(
        description="Görselden responsive WebP/AVIF türevleri ve <picture> HTML'i üretir."
    )
    parser.add_argument("image", type=Path, help="kaynak görsel (değiştirilmez)")
    parser.add_argument("--out-dir", type=Path, help="türevlerin yazılacağı dizin (varsayılan: kaynağın dizini)")
    parser.add_argument("--name", help="çıktı dosya adı, uzantısız (varsayılan: kaynak dosya adı)")
    parser.add_argument("--max-width", type=int, default=1600, help="üretilecek en büyük genişlik (varsayılan: 1600)")
    parser.add_argument("--sizes", help="srcset için sizes özniteliği (varsayılan: --hero moduna göre)")
    parser.add_argument("--alt", default="", help="erişilebilir metin; boşsa dekoratif sayılır")
    parser.add_argument("--class", dest="css_class", help="img için CSS sınıfları")
    parser.add_argument("--hero", action="store_true", help="LCP/kapak görseli: lazy yok, fetchpriority=high")
    parser.add_argument("--no-avif", action="store_true", help="yalnızca WebP türevleri üret")
    return parser.parse_args()


def output_url(path: Path) -> str:
    """Jekyll köküne göre /assets/... biçiminde URL döndürür."""
    try:
        return "/" + path.resolve().relative_to(REPO_ROOT).as_posix()
    except ValueError:
        return path.as_posix()


def main() -> int:
    args = parse_args()
    source = args.image
    if not source.is_file():
        print(f"Hata: {source} bulunamadı.", file=sys.stderr)
        return 1
    if args.max_width < 1:
        print("Hata: --max-width 1'den küçük olamaz.", file=sys.stderr)
        return 1

    try:
        with Image.open(source) as opened:
            opened.load()
            image = opened.convert("RGBA" if "A" in opened.getbands() else "RGB")
    except Exception as exc:
        print(f"Hata: {source} okunamadı: {exc}", file=sys.stderr)
        return 1

    src_width, src_height = image.size
    max_width = min(args.max_width, src_width)
    scale = max_width / src_width
    out_width = max_width
    out_height = max(1, round(src_height * scale))

    widths = [w for w in WIDTH_LADDER if w <= out_width]
    if not widths or widths[-1] != out_width:
        widths.append(out_width)

    out_dir = (args.out_dir or source.parent).resolve()
    out_dir.mkdir(parents=True, exist_ok=True)
    name = args.name or source.stem

    webp_urls = []
    avif_urls = []
    for width in widths:
        height = out_height if width == out_width else max(1, round(out_height * width / out_width))
        variant = image if width == out_width else image.resize(
            (width, height), Image.Resampling.LANCZOS
        )
        suffix = "" if width == out_width else f"-{width}"

        webp_path = out_dir / f"{name}{suffix}.webp"
        variant.save(webp_path, "WEBP", quality=WEBP_QUALITY, method=6)
        webp_urls.append(f"{output_url(webp_path)} {width}w")
        print(f"  {webp_path.name:42s} {width}x{height}  {webp_path.stat().st_size / 1024:7.1f} KiB")

        if not args.no_avif:
            avif_path = out_dir / f"{name}{suffix}.avif"
            variant.save(avif_path, "AVIF", quality=AVIF_QUALITY, speed=6)
            avif_urls.append(f"{output_url(avif_path)} {width}w")
            print(f"  {avif_path.name:42s} {width}x{height}  {avif_path.stat().st_size / 1024:7.1f} KiB")

    sizes = args.sizes or (HERO_SIZES if args.hero else GALLERY_SIZES)
    css_class = args.css_class or (HERO_CLASS if args.hero else GALLERY_CLASS)
    priority = 'fetchpriority="high"' if args.hero else 'loading="lazy"'
    srcset_webp = ", ".join(webp_urls)
    srcset_avif = ", ".join(avif_urls)
    fallback = output_url(out_dir / f"{name}.webp")

    print("\n<!-- Aşağıdaki HTML'i kullanın; kaynaktaki lisans/atıf satırını koruyun. -->")
    indent = "" if args.no_avif else "  "
    if not args.no_avif:
        print("<picture>")
        print(f'  <source type="image/avif" srcset="{srcset_avif}" sizes="{sizes}">')
    print(f'{indent}<img src="{fallback}"')
    print(f'{indent}     srcset="{srcset_webp}"')
    print(f'{indent}     sizes="{sizes}"')
    print(f'{indent}     alt="{args.alt}"')
    print(f'{indent}     width="{out_width}" height="{out_height}"')
    print(f"{indent}     {priority}")
    print(f'{indent}     class="{css_class}">')
    if not args.no_avif:
        print("</picture>")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
