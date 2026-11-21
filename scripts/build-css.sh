#!/usr/bin/env sh
# `_layouts/default.html` için Tailwind CSS üretir.
# Play CDN (assets/js/tailwindcss.js) yerine statik dosya kullanılır.
#
# Kullanım: sh scripts/build-css.sh
# Çıktı:   assets/css/tailwind.css
#          _includes/tailwind-inline.css (safe modda satır içi kullanım için)
set -eu
cd "$(dirname "$0")/.."
npx --yes tailwindcss@3.4.17 \
    --config scripts/tailwind.config.js \
    --input scripts/tailwind.src.css \
    --output assets/css/tailwind.css \
    --minify
cp assets/css/tailwind.css _includes/tailwind-inline.css
