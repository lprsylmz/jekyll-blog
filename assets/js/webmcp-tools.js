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

    function registerTools(card) {
        var ctx = (navigator && navigator.modelContext) || (document && document.modelContext);
        if (!ctx) return;

        var tools = (card.tools || []).map(function (tool) {
            return {
                name: tool.name,
                description: tool.description,
                inputSchema: tool.inputSchema,
                execute: executors[tool.name]
            };
        }).filter(function (tool) {
            return typeof tool.execute === "function";
        });

        if (typeof ctx.registerTool === "function") {
            tools.forEach(function (tool) {
                ctx.registerTool(tool);
            });
            return;
        }

        if (typeof ctx.provideContext === "function") {
            ctx.provideContext({ tools: tools });
        }
    }

    /**
     * Sayfadaki data-mcp-tool attribute'una sahip formları tarayıp
     * WebMCP'ye bildirir (Declarative API desteği olmayan tarayıcılar için fallback).
     */
    function registerDeclarativeForms() {
        var ctx = (navigator && navigator.modelContext) || (document && document.modelContext);
        if (!ctx || typeof ctx.registerTool !== "function") return;

        var forms = document.querySelectorAll("form[data-mcp-tool]");
        forms.forEach(function (form) {
            var toolName = form.getAttribute("data-mcp-tool");
            var toolDesc = form.getAttribute("data-mcp-description") || "";

            if (!toolName || !executors[toolName]) return;

            // Argüman şemasını data-mcp-arg attribute'larından oluştur
            var properties = {};
            var required = [];
            form.querySelectorAll("[data-mcp-arg]").forEach(function (el) {
                var argName = el.getAttribute("data-mcp-arg");
                var argDesc = el.getAttribute("data-mcp-arg-description") || "";
                var argType = el.type === "number" ? "number" : "string";
                if (!argName) return;
                properties[argName] = { type: argType, description: argDesc };
                if (el.required) required.push(argName);
            });

            ctx.registerTool({
                name: toolName,
                description: toolDesc,
                inputSchema: {
                    type: "object",
                    properties: properties,
                    required: required.length ? required : undefined
                },
                execute: executors[toolName]
            });
        });
    }

    function bindAgentEvents() {
        var ctx = document.modelContext;
        if (!ctx || typeof ctx.addEventListener !== "function") return;

        ctx.addEventListener("toolactivated", function () {
            window.dispatchEvent(new CustomEvent("webmcp-open-search"));
        });
    }

    function init() {
        bindAgentEvents();
        fetch(SCHEMA_URL)
            .then(function (res) {
                if (!res.ok) throw new Error("webmcp-tools.json okunamadı");
                return res.json();
            })
            .then(function (card) {
                registerTools(card);
                registerDeclarativeForms();
            })
            .catch(function (err) {
                console.warn("[WebMCP]", err);
            });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
