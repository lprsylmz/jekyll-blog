# Alper Söylemez

> Kişisel site: blog yazıları, journal notları, kitaplık ve izlence. Dil ağırlıklı olarak Türkçe; bazı yazıların İngilizce karşılığı `/en/blog/` altındadır. Site adresi: https://alpersoylemez.com

Ajanlar keşfe `/llms.txt`, `/.well-known/llms.txt`, `/ai-catalog.json` ve `/.well-known/ai-catalog.json` ile başlamalıdır. Sayfa içi arama WebMCP bildirimli HTML formları ve `/webmcp-tools.json` şemalarıyla sunulur. Analitik çerezler yalnızca ziyaretçi onayıyla yüklenir.

## Keşif

- [llms.txt](https://alpersoylemez.com/llms.txt): Bu dosyanın kök kopyası
- [Well-known llms.txt](https://alpersoylemez.com/.well-known/llms.txt): RFC 8615 konumundaki kopya
- [ARD ai-catalog.json](https://alpersoylemez.com/ai-catalog.json): Agentic Resource Discovery manifestosu
- [Well-known ai-catalog.json](https://alpersoylemez.com/.well-known/ai-catalog.json): ARD'nin önerdiği keşif yolu
- [WebMCP araç şemaları](https://alpersoylemez.com/webmcp-tools.json): JSON Schema (Draft 2020-12) ile tanımlı araçlar
- [RSS](https://alpersoylemez.com/feed.xml): Yeni içerik beslemesi
- [Sitemap](https://alpersoylemez.com/sitemap.xml): Tüm indeksli sayfalar

## Bölümler

- [Ana sayfa](https://alpersoylemez.com/): Sosyal ve site bağlantıları
- [Blog](https://alpersoylemez.com/blog/): Türkçe yazılar
- [Blog (English)](https://alpersoylemez.com/en/blog/): İngilizce yazılar
- [Journal](https://alpersoylemez.com/journal/): Kısa notlar ve etiketli kayıtlar
- [Kitaplık](https://alpersoylemez.com/kitaplik/): Okunan kitaplar
- [İzlence](https://alpersoylemez.com/izlence/): Film ve dizi kayıtları
- [Habits 2026](https://alpersoylemez.com/habits2026/): Alışkanlık takvimi
- [Çerez politikası](https://alpersoylemez.com/cerez-politikasi/): Analitik çerez açıklaması

## Blog

{% assign sorted_articles = site.articles | sort: 'date' | reverse %}
{% for article in sorted_articles %}- [{{ article.title }}]({{ article.url | absolute_url }}): {{ article.date | date: "%Y-%m-%d" }}
{% endfor %}

## Kitaplık

{% for book in site.books %}- [{{ book.title }}]({{ book.url | absolute_url }}){% if book.author %}: {{ book.author }}{% endif %}
{% endfor %}

## İzlence

{% for video in site.videos %}- [{{ video.title }}]({{ video.url | absolute_url }}){% if video.kind %}: {{ video.kind }}{% endif %}
{% endfor %}

## Optional

- [Blog arama indeksi](https://alpersoylemez.com/search_articles.json): Yazı başlık ve düz metin JSON
- [Journal arama indeksi](https://alpersoylemez.com/search_notes.json): Not başlık ve düz metin JSON
- [Kitap arama indeksi](https://alpersoylemez.com/search_books.json): Kitap başlık ve yazar JSON
- [İzlence arama indeksi](https://alpersoylemez.com/search_videos.json): Film/dizi JSON
{% assign sorted_en = site.en_articles | sort: 'date' | reverse %}
{% for article in sorted_en %}- [{{ article.title }} (EN)]({{ article.url | absolute_url }}): {{ article.date | date: "%Y-%m-%d" }}
{% endfor %}
{% assign sorted_notes = site.notes | sort: 'date' | reverse %}
{% for note in sorted_notes %}- [{{ note.title }}]({{ note.url | absolute_url }}): journal notu, {{ note.date | date: "%Y-%m-%d" }}
{% endfor %}
