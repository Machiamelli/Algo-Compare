# Contributing to AlgoCompare

Thank you for your interest in contributing to AlgoCompare! 🎉

## Getting Started

1. **Fork** the repository on GitHub
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/<your-username>/Algo-Compare.git
   cd AlgoCompare
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Run in development mode**:
   ```bash
   npm run electron:dev
   ```

## Development Workflow

| Command                  | Description                                      |
| ------------------------ | ------------------------------------------------ |
| `npm run dev`            | Start Vite dev server only (no Electron)         |
| `npm run electron:dev`   | Full Electron app with hot-reload                |
| `npm run electron:build` | Build production binaries (output in `release/`) |

## Making Changes

1. **Create a feature branch** from `main`:
   ```bash
   git checkout -b feature/my-feature
   ```
2. **Make your changes** and test them with `npm run electron:dev`
3. **Commit** with a clear, descriptive message:
   ```bash
   git commit -m "Add: description of your change"
   ```
4. **Push** to your fork:
   ```bash
   git push origin feature/my-feature
   ```
5. **Open a Pull Request** against the `main` branch

## Commit Message Convention

Use a prefix to categorize your commit:

- `Add:` — New feature or file
- `Fix:` — Bug fix
- `Update:` — Improvement to existing functionality
- `Refactor:` — Code restructuring without behavior change
- `Docs:` — Documentation only
- `Style:` — Formatting, whitespace (no code change)

## Project Structure

```
electron/          → Main process (Node.js/Electron)
  ├── main.cjs          Entry point
  ├── preload.cjs       Context bridge
  ├── ipc/              IPC handlers
  ├── detection/        Compiler/runtime detection
  ├── execution/        Compilation & execution engine
  └── utils/            File management, parsing, paths

src/               → Renderer process (React)
  ├── components/       UI components
  ├── hooks/            React hooks (state, persistence, theme)
  └── services/         API layer (IPC calls to main process)

docs/              → Landing page website (static HTML)
build/             → Electron-builder icons (icon.png, icon.ico, icon.icns)
```

## Guidelines

- Follow the existing code style and patterns
- Test your changes on at least one platform (Windows or Linux)
- Keep pull requests focused — one feature or fix per PR
- Update documentation if your change affects user-facing behavior

## Reporting Issues

Found a bug? Please [open an issue](https://github.com/Machiamelli/Algo-Compare/issues/new) with:

- Steps to reproduce
- Expected vs. actual behavior
- Your OS and version
- Relevant screenshots or error messages

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
