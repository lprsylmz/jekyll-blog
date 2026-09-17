---
title: "Tyro Checkpoint"
slug: tyro-checkpoint
date: 2026-04-30T00:00:00+00:00
tags: ["tyro checkpoint","laravel","SQLite"]
---

Tyro Checkpoint, SQLite veritabanınız için Git benzeri kontrol noktası (checkpoint) işlevi sağlayan basit bir Laravel paketidir. Bu paket sadece SQLite veritabanları için tasarlanmıştır.

Gereksinimler

    PHP 8.1 veya üzeri

    Laravel 10.x, 11.x veya 12.x

    Varsayılan bağlantı olarak yapılandırılmış SQLite veritabanı

Tyro Checkpoint Kurulumu


```
composer require hasinhayder/tyro-checkpoint --dev
```
```
php artisan tyro-checkpoint:install
```
storage/tyro-checkpoints dizinini oluştuysa kurulum gerçekleşmiştir. Varsayılan olarak tüm kontrol noktaları storage/tyro-checkpoints/ dizininde saklanır. Her kontrol noktası, SQLite veritabanı dosyanızın tam bir kopyasıdır. Geri yükleme sırasında veri kaybını önlemek için veritabanı dışında bir JSON dosyasında saklanır. Bu dizin hem anlık görüntü dosyalarını (.sqlite) hem de meta veri kaydını (checkpoints.json) içerir. AES-256-CBC kullanarak isteğe bağlı dosya düzeyinde şifreleme sunar.

Kontrol Noktası Oluşturma

Otomatik oluşturulan bir isimle kontrol noktası oluşturun:
```
php artisan tyro-checkpoint:create
```
Özel bir isim ve isteğe bağlı bir notla kontrol noktası oluşturun:

```
php artisan tyro-checkpoint:create initial_state --note="Temiz kurulum"
```


Şifreli bir anlık görüntü oluşturmak için --encrypt bayrağını kullanın:
```
php artisan tyro-checkpoint:create secure_state --encrypt
```


Kaydedilen tüm kontrol noktalarını, boyutlarını, oluşturulma tarihlerini ve durumlarını görüntüleyin:
```
php artisan tyro-checkpoint:list
```


Bir kontrol noktasını ID veya isim (Name) ile geri yükleyin:
```
php artisan tyro-checkpoint:restore 1
``` 
veya
```
php artisan tyro-checkpoint:restore initial_state
```
Bir tanımlayıcı sağlamazsanız, komut bir seçim listesi görüntüleyecektir.


Mevcut bir kontrol noktasına not ekleyin veya değiştirin:
```
php artisan tyro-checkpoint:add-note 1
```


Bir kontrol noktasını delete veya flush komutlarıyla yanlışlıkla silinmesini önlemek için kilitleyin:
```
php artisan tyro-checkpoint:lock 1
```

Silmeyi tekrar etkinleştirmek için kilidi açın:
```

php artisan tyro-checkpoint:unlock 1
```

Kilidi açılmış belirli bir kontrol noktasını silin:
```
php artisan tyro-checkpoint:delete 1
```

Disk alanından tasarruf etmek için kilidi açılmış tüm kontrol noktalarını silin:
```
php artisan tyro-checkpoint:flush
```
https://hasinhayder.github.io/tyro-checkpoint/
