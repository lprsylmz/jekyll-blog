# /assets/ altındaki dosyaların içerik özetinden sürüm anahtarı üretir ve
# derlenen çıktıdaki tüm varlık URL'lerine `?v=<özet>` ekler. Dosya adları
# sürümlenmediği için uzun ömürlü Cache-Control ancak bu şekilde güvenlidir:
# bir varlık değiştiğinde URL değişir, değişmediyse aynı kalır.
require 'digest'

Jekyll::Hooks.register :site, :pre_render do |site|
  assets_dir = File.join(site.source, 'assets')
  digest = Digest::SHA1.new

  if Dir.exist?(assets_dir)
    Dir.glob(File.join(assets_dir, '**', '*'), File::FNM_DOTMATCH).sort.each do |path|
      next unless File.file?(path)

      digest.update(path.delete_prefix(assets_dir))
      digest.update(File.binread(path))
    end
  end

  site.data['asset_version'] = digest.hexdigest[0, 12]
end

Jekyll::Hooks.register :site, :post_write do |site|
  version = site.data['asset_version']
  next unless version

  Dir.glob(File.join(site.dest, '**', '*'), File::FNM_DOTMATCH).each do |path|
    next unless File.file?(path)
    next unless path.match?(/\.(?:html|css|js|json|xml|webmanifest|txt|md)\z/i)

    content = File.binread(path)
    updated = content.gsub(%r{/assets/[^"'<>\s\),\?]+}i) { |url| "#{url}?v=#{version}" }
    File.binwrite(path, updated) if updated != content
  end
end
