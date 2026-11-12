const path = require('path');

const root = path.resolve(__dirname, '..');
const glob = (pattern) => path.join(root, pattern).replace(/\\/g, '/');

// Bu yapılandırma yalnızca `_layouts/default.html` ve onu kullanan sayfalar içindir.
// Tek başına (layout'suz) sayfalar kendi önceden derlenmiş `/assets/css/main.css`
// dosyalarını kullanmaya devam eder.
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
                'brand-light': '#F5F0E8',
                'brand-dark': '#1C1F26',
                'brand-accent': 'rgb(51 65 85)',
                'brand-muted': 'rgb(148 163 184)',
                'brand-primary': 'rgb(51 65 85)',
            },
            fontFamily: {
                sans: ['"Lora"', 'Georgia', 'serif'],
                mono: ['"JetBrains Mono"', 'monospace'],
            },
        },
    },
};
