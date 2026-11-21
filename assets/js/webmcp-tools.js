(function () {
    var SCHEMA_URL = "/webmcp-tools.json";
    var siteSearch = window.SiteSearch;

    var executors = {
        search_content: function (args) {
            var query = args && args.query ? String(args.query).trim() : "";
            var collection = args && args.collection ? args.collection : "all";
            var limit = args && args.limit ? Number(args.limit) : 8;
            if (!siteSearch) {
                return Promise.resolve({ results: [], error: "arama servisi yüklenemedi" });
            }
            if (siteSearch.normalize(query).length < 2) {
                return Promise.resolve({ results: [], error: "query en az 2 karakter olmalıdır" });
            }
            if (!limit || limit < 1) limit = 8;
            if (limit > 25) limit = 25;

            return siteSearch.query(query, collection, limit).then(function (results) {
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
                    { name: "Gezinti", url: "https://alpersoylemez.com/gezinti/" },
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
        if (!ctx || typeof ctx.registerTool !== "function" || typeof AbortController !== "function") {
            return Promise.resolve(false);
        }

        // Araçların tamamı ya da hiçbiri görünür olmalı: bir kayıt başarısız olursa
        // aynı signal ile kaydedilen tüm araçları geri al.
        var controller = new AbortController();
        return Promise.all(tools.map(function (tool) {
            return ctx.registerTool(tool, { signal: controller.signal });
        })).then(function () {
            return true;
        }).catch(function (error) {
            controller.abort();
            console.warn('[WebMCP] Araç kaydı başarısız, tüm partiler geri alındı:', error);
            return false;
        });
    }

    function buildTools() {
        return [
            {
                name: "search_content",
                description: "Blog yazıları, journal notları, kitaplık, gezinti (yerler) ve izlence kayıtlarında tam metin araması yapar; eşleşen başlık, adres ve özetleri döndürür.",
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
                            enum: ["all", "articles", "notes", "books", "places", "videos"],
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
                annotations: {
                    readOnlyHint: true,
                    untrustedContentHint: true,
                    consequentialHint: false
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
                annotations: {
                    readOnlyHint: true,
                    untrustedContentHint: false,
                    consequentialHint: false
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
                annotations: {
                    readOnlyHint: true,
                    untrustedContentHint: false,
                    consequentialHint: false
                },
                execute: executors.get_site_overview
            }
        ];
    }

    function bindAgentEvents() {
        var ctx = getModelContext();
        if (!ctx || typeof ctx.addEventListener !== "function") return;

        ctx.addEventListener("toolactivated", function (event) {
            if (!event || event.toolName !== "search_site") return;
            window.dispatchEvent(new CustomEvent("webmcp-open-search"));
        });

        ctx.addEventListener("toolcancel", function (event) {
            if (!event || event.toolName !== "search_site") return;
            window.dispatchEvent(new CustomEvent("webmcp-close-search"));
        });
    }

    /**
     * Araçları mümkün olan en erken anda kaydeder.
     * Lighthouse snapshot'ı için DOMContentLoaded beklenmez.
     */
    async function init() {
        bindAgentEvents();

        // Araçları doğrudan kaydet — JSON fetch'i bekleme
        var tools = buildTools();
        await registerTools(tools);
    }

    // Sayfa yüklenme durumundan bağımsız olarak hemen çalıştır
    if (document.readyState === "loading") {
        // DOMContentLoaded'ı bekle ama mümkün olan en kısa sürede
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
