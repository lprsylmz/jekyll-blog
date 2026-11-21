(function () {
    var siteSearch = window.SiteSearch;

    function config() {
        return window.WebMCPConfig || {};
    }

    function baseUrl() {
        return config().baseUrl || "";
    }

    function absoluteUrl(path) {
        return (config().siteUrl || "") + baseUrl() + path;
    }

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
                    { name: "Ana sayfa", url: absoluteUrl("/") },
                    { name: "Blog", url: absoluteUrl("/blog/") },
                    { name: "Blog (English)", url: absoluteUrl("/en/blog/") },
                    { name: "Journal", url: absoluteUrl("/journal/") },
                    { name: "Gezinti", url: absoluteUrl("/gezinti/") },
                    { name: "Kitaplık", url: absoluteUrl("/kitaplik/") },
                    { name: "İzlence", url: absoluteUrl("/izlence/") },
                    { name: "Habits 2026", url: absoluteUrl("/habits2026/") }
                ],
                discovery: [
                    { name: "llms.txt", url: absoluteUrl("/llms.txt") },
                    { name: "ai-catalog.json", url: absoluteUrl("/.well-known/ai-catalog.json") },
                    { name: "WebMCP tools", url: absoluteUrl("/webmcp-tools.json") },
                    { name: "RSS", url: absoluteUrl("/feed.xml") }
                ]
            });
        },
        get_site_overview: function () {
            return fetch(baseUrl() + "/llms.txt").then(function (res) {
                if (!res.ok) throw new Error("llms.txt okunamadı");
                return res.text();
            }).then(function (markdown) {
                return { format: "text/markdown", content: markdown };
            });
        }
    };

    // WebMCP'nin tek resmi giriş noktası: document.modelContext.
    function getModelContext() {
        return document && document.modelContext ? document.modelContext : null;
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
        // Şemaların tek kaynağı _data/webmcp_tools.json; yayımlanan JSON dosyası
        // ve bu JS aynıtan üretilir.
        var definitions = window.WebMCPToolDefinitions || [];
        return definitions.filter(function (definition) {
            return definition && typeof executors[definition.name] === "function";
        }).map(function (definition) {
            return {
                name: definition.name,
                description: definition.description,
                inputSchema: definition.inputSchema,
                annotations: definition.annotations,
                execute: executors[definition.name]
            };
        });
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

        // Şemalar yüklenmiş tanımlardan gelir; ek JSON isteği yapılmaz.
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
