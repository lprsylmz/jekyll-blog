---

title: "Tyro Checkpoint"
slug: "tyro-checkpoint"
date: 2026-04-30 00:00:00
description: "Tyro Checkpoint is a simple Laravel package that provides Git-like checkpoint functionality for your SQLite database. This package is designed for SQLite databases only."
tags: ["tyro checkpoint", "laravel", "SQLite"]
author: "Alper Söylemez"
is_published: true
lang: en
lang_url: "/blog/tyro-checkpoint/"
---

Tyro Checkpoint is a simple Laravel package that provides Git-like checkpoint (snapshot) functionality for your SQLite database. This package is designed exclusively for SQLite databases.

Requirements

    PHP 8.1 or higher

    Laravel 10.x, 11.x, or 12.x

    SQLite database configured as the default connection

Installing Tyro Checkpoint


```
composer require hasinhayder/tyro-checkpoint --dev
```
```
php artisan tyro-checkpoint:install
```
If the `storage/tyro-checkpoints` directory was created, the installation was successful. By default, all checkpoints are stored in the `storage/tyro-checkpoints/` directory. Each checkpoint is a full copy of your SQLite database file. To prevent data loss during a restore, it is stored in a JSON file outside the database. This directory contains both snapshot files (`.sqlite`) and the metadata record (`checkpoints.json`). It supports optional file-level encryption using AES-256-CBC.

Creating a Checkpoint

Create a checkpoint with an automatically generated name:
```
php artisan tyro-checkpoint:create
```
Create a checkpoint with a custom name and an optional note:

```
php artisan tyro-checkpoint:create initial_state --note="Clean install"
```


Use the `--encrypt` flag to create an encrypted snapshot:
```
php artisan tyro-checkpoint:create secure_state --encrypt
```


View all saved checkpoints along with their sizes, creation dates, and statuses:
```
php artisan tyro-checkpoint:list
```


Restore a checkpoint by its ID or name:
```
php artisan tyro-checkpoint:restore 1
```
or
```
php artisan tyro-checkpoint:restore initial_state
```
If you don't provide an identifier, the command will display a selection list.


Add or update a note on an existing checkpoint:
```
php artisan tyro-checkpoint:add-note 1
```


Lock a checkpoint to prevent it from being accidentally deleted by `delete` or `flush` commands:
```
php artisan tyro-checkpoint:lock 1
```

Unlock it to re-enable deletion:
```

php artisan tyro-checkpoint:unlock 1
```

Delete a specific unlocked checkpoint:
```
php artisan tyro-checkpoint:delete 1
```

Delete all unlocked checkpoints to free up disk space:
```
php artisan tyro-checkpoint:flush
```
https://hasinhayder.github.io/tyro-checkpoint/
