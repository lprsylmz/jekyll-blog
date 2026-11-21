---
layout: null
permalink: /assets/js/webmcp-definitions.js
---
window.WebMCPConfig = {
    baseUrl: {{ site.baseurl | default: "" | jsonify }},
    siteUrl: {{ site.url | default: "" | jsonify }}
};
window.WebMCPToolDefinitions = {{ site.data.webmcp_tools.tools | jsonify }};
