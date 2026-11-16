(function () {
    var PALETTES = ['kagit', 'orman', 'okyanus', 'murdum'];
    var LABELS = { kagit: 'Kâğıt', orman: 'Orman', okyanus: 'Okyanus', murdum: 'Mürdüm' };
    var META = {
        kagit: { light: '#F5F0E8', dark: '#1C1F26' },
        orman: { light: '#F1F3EC', dark: '#1A231D' },
        okyanus: { light: '#EDF2F5', dark: '#14232D' },
        murdum: { light: '#F5EEF1', dark: '#271A20' }
    };

    function normalize(name) {
        return PALETTES.indexOf(name) !== -1 ? name : PALETTES[0];
    }

    function readStored() {
        try { return localStorage.getItem('palette'); } catch (e) { return null; }
    }

    window.paletteLabel = function (name) {
        return LABELS[normalize(name)];
    };

    window.nextPalette = function (name) {
        return PALETTES[(PALETTES.indexOf(normalize(name)) + 1) % PALETTES.length];
    };

    window.syncThemeColor = function () {
        var meta = document.querySelector('meta[name="theme-color"]');
        if (!meta) return;
        var p = normalize(document.documentElement.getAttribute('data-palette'));
        var dark = document.documentElement.classList.contains('dark');
        meta.setAttribute('content', dark ? META[p].dark : META[p].light);
    };

    window.setPalette = function (name, persist) {
        var p = normalize(name);
        document.documentElement.setAttribute('data-palette', p);
        if (persist) {
            try { localStorage.setItem('palette', p); } catch (e) { }
        }
        window.initialPalette = p;
        window.syncThemeColor();
        window.dispatchEvent(new CustomEvent('palettechange', { detail: { palette: p } }));
    };

    window.setPalette(readStored(), false);

    // Tema değiştiğinde tarayıcı çubuğu rengini de güncelle.
    window.addEventListener('themechange', window.syncThemeColor);
})();
