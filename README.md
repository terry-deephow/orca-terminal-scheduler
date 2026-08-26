# Orca Terminal Scheduler Plugin

An official-standard plugin for [Orca (ADE)](https://www.onorca.dev/) to schedule automated commands and prompts sent to Orca terminals and AI agents (Claude Code, OpenAI Codex, Cursor CLI, Aider, etc.).

## Features

- ⏱️ **Flexible Periodic Scheduling**: Set custom intervals (in seconds) to inject commands or agent prompts into active terminals.
- 🎯 **Smart Terminal Targeting**: Automatically targets active worktree terminals or specific terminal sessions.
- 🖥️ **Integrated Sidebar Panel UI**: Manage, start, pause, and review schedules directly from Orca's right sidebar.
- 💾 **State Persistence**: Uses Orca's built-in plugin storage API (`storage.get` / `storage.set`) to persist schedules across restarts.
- 🔔 **Native Notifications**: Displays desktop toast notifications whenever scheduled tasks trigger or complete.

---

## Architecture & Manifest

This plugin follows the Orca Plugin Specification (`manifestVersion: 1`, `pluginApi: 1`):

```json
{
  "manifestVersion": 1,
  "id": "orca-terminal-scheduler",
  "publisher": "kmshiori",
  "name": "Orca Terminal Scheduler",
  "version": "1.0.0",
  "description": "Schedule automated commands and prompts to send to Orca terminals and AI agents",
  "engines": {
    "orca": ">=1.4.0"
  },
  "pluginApi": 1,
  "main": "dist/index.js",
  "capabilities": [
    { "kind": "workspace:read" },
    { "kind": "terminal:send" },
    { "kind": "notifications:show" },
    { "kind": "storage" }
  ],
  "contributes": {
    "commands": [
      {
        "id": "scheduler.start",
        "title": "Start Terminal Scheduler",
        "context": "global"
      },
      {
        "id": "scheduler.stop",
        "title": "Stop Terminal Scheduler",
        "context": "global"
      },
      {
        "id": "scheduler.status",
        "title": "Get Scheduler Status",
        "context": "global"
      }
    ],
    "panels": [
      {
        "id": "scheduler-panel",
        "title": "Scheduler",
        "icon": "clock",
        "entry": "panel/index.html"
      }
    ]
  }
}
```

---

## Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Build the Plugin
```bash
npm run build
```
This compiles `src/index.ts` into a standalone bundle at `dist/index.js`.

### 3. Local Testing in Orca
To test locally in your Orca application:
Link or copy this plugin directory into your Orca plugins directory:
```bash
# macOS
mkdir -p "$HOME/Library/Application Support/Orca/plugins/kmshiori.orca-terminal-scheduler"
cp -r . "$HOME/Library/Application Support/Orca/plugins/kmshiori.orca-terminal-scheduler/"
```

---

## Publishing to Orca Users

### Step 1: Push to GitHub
1. Create a public repository on GitHub (e.g. `https://github.com/kmshiori/orca-terminal-scheduler`).
2. Tag your release:
   ```bash
   git tag v1.0.0
   git push origin main --tags
   ```

### Step 2: Submit to Orca Marketplace
To make it installable for all Orca users via the in-app Plugin Catalog:
1. Fork the official [stablyai/orca-plugins](https://github.com/stablyai/orca-plugins) repository.
2. Add your plugin to `orca-marketplace.json`:
   ```json
   {
     "id": "kmshiori.orca-terminal-scheduler",
     "source": {
       "kind": "git",
       "url": "https://github.com/kmshiori/orca-terminal-scheduler.git",
       "ref": "v1.0.0"
     },
     "description": "Schedule automated commands and prompts to send to Orca terminals and AI agents",
     "categories": ["developer-tools", "automation"]
   }
   ```
3. Submit a Pull Request to `stablyai/orca-plugins`. Once merged, users can discover and install your plugin directly inside Orca!

---

## License

MIT License.
