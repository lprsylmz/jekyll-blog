---

title: "MacOS Dock’a Ayırıcı (Separator) Ekleme"
slug: "macos-dock-seperator"
date: 2025-08-12 00:00:00
description: "MacOS Dock’a Ayırıcı (Separator) Ekleme"
tags: ["teknoloji", "macos"]
author: "Alper Söylemez"
is_published: true
---


MacOS kullanıcıları için Dock, uygulamalara hızlı erişim sağladığı gibi masaüstü düzeni açısından da oldukça önemlidir. Ancak zamanla Dock’taki simgeler kalabalıklaşabilir. Bu durumda uygulama gruplarını görsel olarak ayırmak, kullanım kolaylığı sağlar.


Eğer Dock’taki uygulama simgeleri arasına ayırıcı (separator) eklemek istiyorsanız, aşağıdaki adımı takip edebilirsiniz.



Terminal uygulamasını açın ve aşağıdaki komutu yapıştırıp çalıştırın:



```
defaults write com.apple.dock persistent-apps -array-add '{"tile-type"="small-spacer-tile";}' && killall Dock
```



Bu komut Dock’a görünmez bir ayırıcı öğesi ekler ve Dock’u yeniden başlatarak değişikliğin hemen görünmesini sağlar.


* Ayırıcıyı tıpkı bir uygulama simgesi gibi taşıyabilirsiniz.
* Sağ tıklayarak kolayca kaldırabilirsiniz.
