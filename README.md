# Better Figures

Enhanced figure support for Obsidian.

## Features

- **Image captions**: In preview mode, native image syntax uses the alt text as a centered caption below the image.
- **Preview mode support**: The feature is applied through Obsidian's Markdown post processor.

## Usage

Write a standard Markdown image:

```markdown
![Figure 1. Architecture overview](architecture.png)
```

In preview mode, Better Figures renders the image with `Figure 1. Architecture overview` centered below it.

Images with empty alt text are left unchanged:

```markdown
![](architecture.png)
```

## Installation

1. Download the latest release.
2. Copy `main.js`, `manifest.json`, and `styles.css` to `VaultFolder/.obsidian/plugins/better-figures/`.
3. Enable the plugin in **Settings -> Community plugins**.

## Development

```bash
npm install
npm run dev
```

Build for release:

```bash
npm run build
```

## License

BSD-0-Clause License
