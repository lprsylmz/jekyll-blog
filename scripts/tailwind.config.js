const path = require('path');

const root = path.resolve(__dirname, '..');
const glob = (pattern) => path.join(root, pattern).replace(/\\/g, '/');

// Bu yapılandırma yalnızca `_layouts/default.html` ve onu kullanan sayfalar içindir.
// Tek başına (layout'suz) sayfalar kendi önceden derlenmiş `/assets/css/main.css`
// dosyalarını kullanmaya devam eder.
//
// Renkler CSS değişkenlerine bağlıdır; palet tanımları `scripts/tailwind.src.css`
// içindeki `:root[data-palette="..."]` bloklarında yaşar. Her palet 60/30/10
// kuralına göre kurulur: %60 zemin (brand-light/brand-dark), %30 metin ve
// yüzeyler (ink + brand-muted), %10 vurgu (brand-accent/brand-primary).
module.exports = {
    darkMode: 'class',
    content: [
        glob('_layouts/**/*.html'),
        glob('_includes/**/*.{html,md}'),
        glob('_content/**/*.{md,html}'),
        glob('blog/**/*.html'),
        glob('en/blog/**/*.html'),
        glob('izlence/**/*.html'),
        glob('journal.html'),
    ],
    theme: {
        extend: {
            colors: {
                'brand-light': 'rgb(var(--brand-light) / <alpha-value>)',
                'brand-dark': 'rgb(var(--brand-dark) / <alpha-value>)',
                'brand-accent': 'rgb(var(--brand-accent) / <alpha-value>)',
                'brand-muted': 'rgb(var(--brand-muted) / <alpha-value>)',
                'brand-primary': 'rgb(var(--brand-primary) / <alpha-value>)',
            },
            fontFamily: {
                sans: ['"Lora"', 'Georgia', 'serif'],
                mono: ['"JetBrains Mono"', 'monospace'],
            },
        },
    },
};
