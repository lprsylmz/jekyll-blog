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

`/admin` sadece eski Laravel/Filament yönetimini
değil, Git tabanlı bir CMS kurulmasını gerektirir; statik dağıtımda PHP ve
Filament çalışmaz.
