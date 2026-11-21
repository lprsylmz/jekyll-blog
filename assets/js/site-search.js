(function () {
    "use strict";

    // Arama dizinlerinin tamamı; görünür arama alanı ve WebMCP aracı aynı
    // servisi kullandığı için sonuçlar iki tarafta da birebir aynı olur.
    var INDEX_PATHS = [
        "/search_notes.json",
        "/search_articles.json",
        "/search_books.json",
        "/search_places.json",
        "/search_videos.json"
    ];

    function baseUrl() {
        return (window.WebMCPConfig && window.WebMCPConfig.baseUrl) || "";
    }

    function normalize(value) {
        if (!value) return "";
        return String(value)
            .replace(/İ/g, 'i')
            .replace(/I/g, 'ı')
            .toLowerCase()
            .replace(/ı/g, 'i')
            .replace(/ğ/g, 'g')
            .replace(/ü/g, 'u')
            .replace(/ş/g, 's')
            .replace(/ö/g, 'o')
            .replace(/ç/g, 'c');
    }

    function collectionOf(item) {
        var url = item && item.url ? String(item.url) : "";
        if (url.indexOf("/en/blog/") !== -1 || url.indexOf("/blog/") !== -1) return "articles";
        if (url.indexOf("/notes/") !== -1 || url.indexOf("/journal") !== -1) return "notes";
        if (url.indexOf("/kitap/") !== -1 || url.indexOf("/kitaplik") !== -1) return "books";
        if (url.indexOf("/gezinti") !== -1) return "places";
        if (url.indexOf("/izlence/") !== -1) return "videos";
        return "other";
    }

    var loadPromise = null;

    function load() {
        if (!loadPromise) {
            loadPromise = Promise.all(INDEX_PATHS.map(function (path) {
                return fetch(baseUrl() + path).then(function (res) {
                    if (!res.ok) return [];
                    return res.json();
                }).catch(function () {
                    return [];
                });
            })).then(function (parts) {
                return parts.reduce(function (all, part) {
                    return all.concat(Array.isArray(part) ? part : []);
                }, []);
            });
        }
        return loadPromise;
    }

    function matches(item, query) {
        var fields = [
            item.title,
            item.author,
            Array.isArray(item.tags) ? item.tags.join(" ") : "",
            item.content
        ];
        return fields.some(function (field) {
            return normalize(field).indexOf(query) !== -1;
        });
    }

    function queryLoaded(items, rawQuery, collection, limit) {
        var query = normalize(rawQuery).trim();
        if (query.length < 2) return [];

        var max = Number(limit) || 8;
        if (max < 1) max = 8;
        if (max > 25) max = 25;

        return (Array.isArray(items) ? items : []).filter(function (item) {
            if (collection && collection !== "all" && collectionOf(item) !== collection) return false;
            return matches(item, query);
        }).slice(0, max).map(function (item) {
            return {
                title: item.title || "",
                url: item.url || "",
                date: item.date || "",
                author: item.author || "",
                collection: collectionOf(item)
            };
        });
    }

    function query(rawQuery, collection, limit) {
        return load().then(function (items) {
            return queryLoaded(items, rawQuery, collection, limit);
        });
    }

    window.SiteSearch = {
        normalize: normalize,
        collectionOf: collectionOf,
        load: load,
        query: query,
        queryLoaded: queryLoaded
    };
})();
