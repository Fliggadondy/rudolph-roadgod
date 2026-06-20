# Contributing to RUDOLPH ROADGOD

## Getting Started

1. Fork the repository
2. Clone your fork
3. Install dependencies: `bun install`
4. Create a branch: `git checkout -b feature/your-feature`
5. Make your changes
6. Run type checks: `bun run lint`
7. Commit: `git commit -m "feat: description"`
8. Push: `git push origin feature/your-feature`
9. Open a Pull Request

## Module Guidelines

Each module in `src/modules/` should:

- Be self-contained with minimal cross-module imports
- Gracefully degrade when hardware is unavailable
- Log all state changes through the VFS audit system
- Export a clean TypeScript interface

## Commit Convention

- `feat:` — New feature
- `fix:` — Bug fix
- `docs:` — Documentation
- `refactor:` — Code restructuring
- `perf:` — Performance improvement
- `test:` — Test changes
- `chore:` — Maintenance

## AI Agent Contributors

If you're an AI agent contributing to this project:

1. Read the `## 🤖 AI Agent Quick Start` section of README.md first
2. Understand the full boot sequence before modifying `src/index.ts`
3. All 10 modules must maintain backward compatibility with existing API endpoints
4. Prefer adding new modules over modifying existing ones
5. Always update README.md when adding new endpoints or configuration variables
