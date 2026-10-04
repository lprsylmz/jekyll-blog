---

title: "Adding a Separator to the macOS Dock"
slug: "macos-dock-seperator"
date: 2025-08-12 00:00:00
description: "How to add a spacer/separator tile between app icons on the macOS Dock using a single Terminal command."
tags: ["technology", "macos"]
author: "Alper Söylemez"
is_published: true
lang: en
lang_url: "/blog/macos-dock-seperator/"
---

For macOS users, the Dock is not only a quick-access hub for apps but also an important part of desktop organisation. Over time, the icons on your Dock can get cluttered. Visually grouping applications with separators makes the whole thing much easier to navigate.

If you want to add a spacer (separator) between app icons in your Dock, follow the step below.

Open the Terminal app and paste the following command, then press Return:

```
defaults write com.apple.dock persistent-apps -array-add '{"tile-type"="small-spacer-tile";}' && killall Dock
```

This command adds an invisible spacer tile to your Dock and restarts it instantly so the change takes effect right away.

* You can drag the separator just like any app icon to reposition it.
* Right-click on it to remove it easily.
