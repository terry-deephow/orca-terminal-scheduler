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
  "publisher": "terry-deephow",
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

## Development & Local Installation

### 1. Install Dependencies & Build
```bash
npm install
npm run build
```

### 2. Local Installation into Orca
To install this plugin directly in your Orca application:
```bash
# macOS
mkdir -p "$HOME/Library/Application Support/Orca/plugins/terry-deephow.orca-terminal-scheduler"
cp -r . "$HOME/Library/Application Support/Orca/plugins/terry-deephow.orca-terminal-scheduler/"
```

---

## Installing & Publishing

### Self Installation (from GitHub)
Users or developers can clone and link this repository:
```bash
git clone https://github.com/terry-deephow/orca-terminal-scheduler.git
cd orca-terminal-scheduler
npm install && npm run build
mkdir -p "$HOME/Library/Application Support/Orca/plugins/terry-deephow.orca-terminal-scheduler"
cp -r . "$HOME/Library/Application Support/Orca/plugins/terry-deephow.orca-terminal-scheduler/"
```

### Submitting to Orca Marketplace
To make it discoverable in Orca's public Plugin Catalog:
1. Fork [stablyai/orca-plugins](https://github.com/stablyai/orca-plugins).
2. Add your plugin to `orca-marketplace.json`:
   ```json
   {
     "id": "terry-deephow.orca-terminal-scheduler",
     "source": {
       "kind": "git",
       "url": "https://github.com/terry-deephow/orca-terminal-scheduler.git",
       "ref": "v1.0.0"
     },
     "description": "Schedule automated commands and prompts to send to Orca terminals and AI agents",
     "categories": ["developer-tools", "automation"]
   }
   ```
3. Submit a Pull Request.

---

## License

MIT License.
