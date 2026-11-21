# Jekyll statik site

Bu dizin, Laravel uygulamasının Jekyll'e taşınmış üretim kaynağıdır. Arayüz
Laravel çıktısından üretildiği için mevcut HTML/CSS/JavaScript korunur..

## İçeriği dışa aktarmak

Laravel'in SQLite veritabanı güncellendiğinde proje kökünde aşağıdaki komutu
çalıştırın:

```bash
php scripts/export_to_jekyll.php
```

Bu komut, yayınlanmış blog yazılarını, journal notlarını, kitapları, arama
indekslerini, RSS'i, sitemap'i ve bütün mevcut sayfaları `jekyll/` içine
yeniler. İçerik ayrıca `_data/` altında JSON ve `_content/` altında Markdown
olarak saklanır; böylece veritabanı olmadan sürüm kontrolünde kalır.

## Yerel önizleme ve üretim

```bash
cd jekyll
jekyll serve
jekyll build
```

`jekyll/_site` doğrudan statik barındırmaya (GitHub Pages, Cloudflare Pages,
Netlify vb.) yayımlanabilir.

## Tailwind CSS

`layout: default` kullanan sayfalar Tailwind'i tarayıcıda derlemez; önceden
üretilmiş `assets/css/tailwind.css` dosyasını kullanır. `_layouts`, `_includes`,
`_content`, `blog`, `en/blog`, `izlence` ve `journal.html` içinde yeni bir
Tailwind sınıfı kullandığınızda bu dosyayı yeniden üretin:

```bash
sh scripts/build-css.sh
```

Komut `scripts/tailwind.config.js` ve `scripts/tailwind.src.css` ile çalışır,
çıktıyı küçültülmüş olarak `assets/css/tailwind.css` üzerine yazar; çıktı sürüm
kontrolünde tutulur. `scripts/` Jekyll tarafından yayımlanmaz. Layout
kullanmayan tek başına sayfalar kendi önceden derlenmiş `assets/css/main.css`
dosyalarını kullanmaya devam eder.

## Görseller

Yeni görsel eklerken kaynak dosyayı değiştirmeden responsive türevleri üretin
(Pillow gerekir: `python3 -m pip install Pillow`):

```bash
python3 scripts/prepare-image.py assets/images/places/ornek.webp
python3 scripts/prepare-image.py kapak.jpg --hero --alt "Ayaş panaroması"
```

Script kaynağa dokunmaz; aynı dizine 400/600/800/1200/1600 kademelerinde
`ad-<genişlik>.webp`/`.avif` ve tam genişlikte `ad.webp`/`.avif` yazar, ardından
yapıştırılabilir `<picture>` HTML'ini gösterir. `--max-width` en büyük genişliği
sınırlar (varsayılan 1600), `--hero` LCP görseli için `loading="lazy"` yerine
`fetchpriority="high"` kullanır, `--out-dir` / `--name` / `--sizes` çıktıyı
yönlendirir.

Uyulması gereken kurallar:

- `srcset`, `sizes`, `width` ve `height` her zaman ekleyin; ekran dışı görsellerde
  `loading="lazy"`, LCP/kapak görselinde (sayfada en fazla 1) `fetchpriority="high"`
  kullanın. `fetchpriority="high"` ve `loading="lazy"` birlikte kullanılmaz.
- AVIF için `<source type="image/avif">`, WebP için fallback `<img>` kullanın.
- Wikimedia / byynalcin / CC BY 3.0 gibi lisans ve atıf satırlarını koruyun;
  script yalnızca türev üretir, kaynağı veya üst veriyi değiştirmez.
- Türevleri ekledikten sonra `bundle exec jekyll build` ile doğrulayın.
  Cloudflare Pages `--safe` ile derlediği için otomatik `?v=` sürüklemesi
  kullanılmıyor; `/assets/*` için 1 günlük TTL + `stale-while-revalidate`
  uygulanır.

`/admin` sadece eski Laravel/Filament yönetimini
değil, Git tabanlı bir CMS kurulmasını gerektirir; statik dağıtımda PHP ve
Filament çalışmaz.
