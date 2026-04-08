<div align="center">

# 🔍 WordLens

**Instant word definitions, pronunciations, synonyms, and Hindi translations — right on any webpage.**

[![Version](https://img.shields.io/badge/version-1.0.0-blue?style=flat-square)](https://github.com/DnyanDeepH/WordLens/releases)
[![License: MIT](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)
[![Manifest](https://img.shields.io/badge/Manifest-V3-orange?style=flat-square)](https://developer.chrome.com/docs/extensions/mv3/)
[![Chrome](https://img.shields.io/badge/Chrome-Extension-yellow?style=flat-square&logo=google-chrome)](https://www.google.com/chrome/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)](CONTRIBUTING.md)

<br/>

> **WordLens** is a lightweight, privacy-friendly Chrome Extension that lets you select any English word on a webpage and instantly see its definition, phonetic pronunciation, part of speech, synonyms, an example sentence, and its Hindi translation — all inside a sleek floating tooltip. No new tabs. No distractions.

<br/>

<!-- HERO IMAGE -->
<!-- Replace the placeholder below with an actual screenshot or demo GIF -->
![WordLens Demo](https://via.placeholder.com/800x450.png?text=WordLens+Demo+Screenshot)

</div>

---

## ✨ Features

- 💬 **Instant Floating Tooltip** — Select any word and the definition pops up right next to your cursor. No context switching, no new tabs.
- 📖 **Comprehensive Word Data** — Displays meaning, phonetic pronunciation, part of speech, and a real-world example sentence in one glance.
- 🏷️ **Synonym Tags** — Top 5 synonyms are displayed as modern UI tags for quick exploration.
- 🌐 **Bilingual Support (EN → HI)** — Automatically fetches and shows the Hindi translation alongside the English definition.
- 📍 **Smart Positioning** — The tooltip intelligently calculates viewport boundaries. It appears below the selected text by default, and flips above it if there isn't enough space at the bottom of the screen.
- ✂️ **Smart Text Parsing** — Automatically trims leading and trailing punctuation (`.`, `,`, `!`, etc.) from your selection so you always get a clean lookup.
- ⚡ **Performance Optimized:**
  - **Caching** — Previously searched words are stored in `chrome.storage.local`, making repeat lookups instant and reducing unnecessary API calls.
  - **Debouncing** — Selection events are debounced to prevent a flood of API requests while you're still dragging to select text.
- 🔘 **Toggle ON / OFF** — Click the extension icon in the Chrome toolbar to enable or disable WordLens anytime. A green **ON** or grey **OFF** badge gives you instant status feedback.
- 🌙 **Dark Mode Ready** — The tooltip automatically adapts to your system's light or dark theme preference via `prefers-color-scheme`.

---

## 🚀 Installation

Since WordLens is a locally loaded extension (not yet on the Chrome Web Store), follow these steps to install it:

1. **Clone or Download** the repository:
   ```bash
   git clone https://github.com/DnyanDeepH/WordLens.git
   ```
   Or download the ZIP from the [Releases](https://github.com/DnyanDeepH/WordLens/releases) page and extract it to a folder of your choice.

2. **Open the Extensions Page** in Google Chrome by navigating to:
   ```
   chrome://extensions/
   ```

3. **Enable Developer Mode** by toggling the switch in the **top-right corner** of the Extensions page.

4. **Click "Load unpacked"** — a button that appears on the top-left after enabling Developer Mode.

5. **Select the folder** — navigate to and select the `chrome-extension` folder from the cloned/extracted repository.

6. **Pin the extension** to your Chrome toolbar for quick access:
   - Click the puzzle piece icon (🧩) in the toolbar.
   - Find **WordLens** in the list and click the 📌 **pin** icon.

> ✅ You're all set! WordLens is now active on all webpages you visit.

---

## 💻 Usage

### Using the Tooltip
1. Navigate to **any webpage** with English text.
2. **Click and drag** to select any English word.
3. A floating tooltip will appear near your selection, showing:
   - The word's **definition** and **phonetic pronunciation**
   - Its **part of speech** (noun, verb, adjective, etc.)
   - An **example sentence**
   - Up to **5 synonyms** displayed as clickable tags
   - The **Hindi translation** of the word
4. Click anywhere else on the page or press `Escape` to dismiss the tooltip.

### Toggling WordLens On / Off
- Click the **WordLens icon** in your Chrome toolbar to toggle the extension.
- The icon badge will update to reflect the current state:
  - 🟢 **`ON`** — WordLens is active and will respond to text selections.
  - ⚫ **`OFF`** — WordLens is paused and will not show any tooltips.

### Repeat Lookups
Words you've already looked up are **cached locally** in your browser. If you select the same word again, the tooltip appears instantly — no network request needed.

---

## 🛠️ Tech Stack & APIs

### Extension Core

| Technology | Purpose |
|---|---|
| **Vanilla JavaScript** | Content script logic, tooltip behavior, API communication |
| **HTML & CSS** | Tooltip structure and styling (including dark mode support) |
| **Manifest V3** | Extension configuration, permissions, and service worker |
| **Chrome APIs** | `chrome.storage.local` for caching, `chrome.action` for badge/toggle |

### External APIs

| API | Endpoint | Usage |
|---|---|---|
| **Free Dictionary API** | `https://api.dictionaryapi.dev/api/v2/entries/en/{word}` | Definitions, phonetics, part of speech, examples, synonyms |
| **Google Translate API** | `https://translate.googleapis.com/translate_a/single` | English → Hindi translation |

> 📝 **Note:** Both APIs are free and require no API key for basic usage.

### Landing Page (Demo)

The project also ships with an interactive landing page to demonstrate the extension's functionality in a browser:

| Technology | Purpose |
|---|---|
| **React** | Component-based UI for the demo |
| **Tailwind CSS** | Utility-first styling for the landing page |

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, grow, and build. Any contribution you make is **greatly appreciated**! 🙌

### How to Contribute

1. **Fork** the repository.
2. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-amazing-feature
   ```
3. **Commit your changes** with a clear, descriptive message:
   ```bash
   git commit -m "feat: add support for XYZ"
   ```
4. **Push** to your branch:
   ```bash
   git push origin feature/your-amazing-feature
   ```
5. **Open a Pull Request** against the `main` branch and describe your changes.

### Ideas for Contributions
- 🔊 Add text-to-speech pronunciation playback
- 🌍 Support additional translation target languages
- 📚 Add support for multi-word phrases or idioms
- 🎨 New tooltip themes or color schemes
- 🌐 Firefox / Edge extension ports

### Reporting Bugs
Found a bug? Please [open an issue](https://github.com/DnyanDeepH/WordLens/issues/new) with:
- A clear description of the problem
- Steps to reproduce it
- The Chrome version and OS you're using

---

## 📄 License

This project is licensed under the **MIT License** — you are free to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the software.

See the [LICENSE](LICENSE) file for the full legal text.

```
MIT License

Copyright (c) 2025 DnyanDeepH

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

<div align="center">

Made with ❤️ by [DnyanDeepH](https://github.com/DnyanDeepH)

⭐ **If you find WordLens useful, please consider starring the repository!** ⭐

</div>
