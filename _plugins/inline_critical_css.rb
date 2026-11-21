# Tailwind çıktısını tek kaynaktan (assets/css/tailwind.css) okuyup
# `_layouts/default.html` içinde satır içi stil olarak kullanılabilir yapar.
# Böylece ilk boyama harici bir CSS isteğini beklemez; CSS'in tek kaynağı
# assets/css/tailwind.css olarak kalır.
Jekyll::Hooks.register :site, :pre_render do |site|
  path = File.join(site.source, 'assets', 'css', 'tailwind.css')
  site.data['tailwind_css'] = File.read(path) if File.exist?(path)
end
