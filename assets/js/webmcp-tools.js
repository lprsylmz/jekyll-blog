(function () {
    var SCHEMA_URL = "/webmcp-tools.json";
    var INDEX_URLS = [
        "/search_notes.json",
        "/search_articles.json",
        "/search_books.json",
        "/search_videos.json"
    ];

    function collectionOf(item) {
        var url = item && item.url ? String(item.url) : "";
        if (url.indexOf("/en/blog/") !== -1 || url.indexOf("/blog/") !== -1) return "articles";
        if (url.indexOf("/notes/") !== -1 || url.indexOf("/journal") !== -1) return "notes";
        if (url.indexOf("/kitap/") !== -1 || url.indexOf("/kitaplik") !== -1) return "books";
        if (url.indexOf("/izlence/") !== -1) return "videos";
        return "other";
    }

    function loadIndex() {
        if (window.__webmcpIndexPromise) return window.__webmcpIndexPromise;
        window.__webmcpIndexPromise = Promise.all(INDEX_URLS.map(function (url) {
            return fetch(url).then(function (res) {
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
        return window.__webmcpIndexPromise;
    }

    var executors = {
        search_content: function (args) {
            var query = args && args.query ? String(args.query).trim().toLowerCase() : "";
            var collection = args && args.collection ? args.collection : "all";
            var limit = args && args.limit ? Number(args.limit) : 8;
            if (query.length < 2) {
                return Promise.resolve({ results: [], error: "query en az 2 karakter olmalıdır" });
            }
            if (!limit || limit < 1) limit = 8;
            if (limit > 25) limit = 25;

            return loadIndex().then(function (items) {
                var results = items.filter(function (item) {
                    if (collection && collection !== "all" && collectionOf(item) !== collection) {
                        return false;
                    }
                    var title = item.title ? String(item.title).toLowerCase() : "";
                    var author = item.author ? String(item.author).toLowerCase() : "";
                    var content = item.content ? String(item.content).toLowerCase() : "";
                    return title.indexOf(query) !== -1 || author.indexOf(query) !== -1 || content.indexOf(query) !== -1;
                }).slice(0, limit).map(function (item) {
                    return {
                        title: item.title || "",
                        url: item.url || "",
                        date: item.date || "",
                        author: item.author || "",
                        collection: collectionOf(item)
                    };
                });
                return { query: query, collection: collection, count: results.length, results: results };
            });
        },
        list_site_sections: function () {
            return Promise.resolve({
                sections: [
                    { name: "Ana sayfa", url: "https://alpersoylemez.com/" },
                    { name: "Blog", url: "https://alpersoylemez.com/blog/" },
                    { name: "Blog (English)", url: "https://alpersoylemez.com/en/blog/" },
                    { name: "Journal", url: "https://alpersoylemez.com/journal/" },
                    { name: "Kitaplık", url: "https://alpersoylemez.com/kitaplik/" },
                    { name: "İzlence", url: "https://alpersoylemez.com/izlence/" },
                    { name: "Habits 2026", url: "https://alpersoylemez.com/habits2026/" }
                ],
                discovery: [
                    { name: "llms.txt", url: "https://alpersoylemez.com/llms.txt" },
                    { name: "ai-catalog.json", url: "https://alpersoylemez.com/.well-known/ai-catalog.json" },
                    { name: "WebMCP tools", url: "https://alpersoylemez.com/webmcp-tools.json" },
                    { name: "RSS", url: "https://alpersoylemez.com/feed.xml" }
                ]
            });
        },
        get_site_overview: function () {
            return fetch("/llms.txt").then(function (res) {
                if (!res.ok) throw new Error("llms.txt okunamadı");
                return res.text();
            }).then(function (markdown) {
                return { format: "text/markdown", content: markdown };
            });
        }
    };

    /**
     * Chrome 150+ sonrası doğru API: document.modelContext
     * Eski sürümler için navigator.modelContext fallback.
     */
    function getModelContext() {
        return (document && document.modelContext) || (navigator && navigator.modelContext) || null;
    }

    function registerTools(tools) {
        var ctx = getModelContext();
        if (!ctx) return;

        tools.forEach(function (tool) {
            if (typeof ctx.registerTool === "function") {
                ctx.registerTool(tool);
            }
        });
    }

    function buildTools() {
        return [
            {
                name: "search_content",
                description: "Blog yazıları, journal notları, kitaplık ve izlence kayıtlarında tam metin araması yapar; eşleşen başlık, adres ve özetleri döndürür.",
                inputSchema: {
                    type: "object",
                    additionalProperties: false,
                    required: ["query"],
                    properties: {
                        query: {
                            type: "string",
                            minLength: 2,
                            maxLength: 200,
                            description: "Aranacak kelime veya ifade. En az iki karakter olmalıdır."
                        },
                        collection: {
                            type: "string",
                            enum: ["all", "articles", "notes", "books", "videos"],
                            default: "all",
                            description: "Aramanın sınırlandırılacağı koleksiyon. all tüm koleksiyonları tarar."
                        },
                        limit: {
                            type: "integer",
                            minimum: 1,
                            maximum: 25,
                            default: 8,
                            description: "Döndürülecek maksimum sonuç sayısı (1-25)."
                        }
                    }
                },
                execute: executors.search_content
            },
            {
                name: "list_site_sections",
                description: "Sitenin ajanların gezebileceği ana bölümlerini, keşif dosyalarını ve içerik indekslerini listeler.",
                inputSchema: {
                    type: "object",
                    additionalProperties: false,
                    properties: {}
                },
                execute: executors.list_site_sections
            },
            {
                name: "get_site_overview",
                description: "LLM'ler için hazırlanmış llms.txt içeriğini okur; site yapısı ve öncelikli bağlantıları döndürür.",
                inputSchema: {
                    type: "object",
                    additionalProperties: false,
                    properties: {}
                },
                execute: executors.get_site_overview
            }
        ];
    }

    function bindAgentEvents() {
        var ctx = getModelContext();
        if (!ctx || typeof ctx.addEventListener !== "function") return;

        ctx.addEventListener("toolactivated", function () {
            window.dispatchEvent(new CustomEvent("webmcp-open-search"));
        });
    }

    /**
     * Araçları mümkün olan en erken anda kaydeder.
     * Lighthouse snapshot'ı için DOMContentLoaded beklenmez.
     */
    function init() {
        bindAgentEvents();

        // Araçları doğrudan kaydet — JSON fetch'i bekleme
        var tools = buildTools();
        registerTools(tools);
    }

    // Sayfa yüklenme durumundan bağımsız olarak hemen çalıştır
    if (document.readyState === "loading") {
        // DOMContentLoaded'ı bekle ama mümkün olan en kısa sürede
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
