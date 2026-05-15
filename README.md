# LEETCODE-AGENT

English | [简体中文](README.zh-CN.md)

LEETCODE-AGENT is a local, desktop-oriented LeetCode study workspace. It combines a study plan, live LeetCode.cn problem statements, code drafts, notes, and a local AI coach powered by Claude CLI or Codex CLI.

Planned repository:

```text
https://github.com/RectoLn/LEETCODE-AGENT
```

## Features

- Desktop three-column study workspace
- Connects to LeetCode.cn to load account status and problem statements
- Live problem search from LeetCode.cn
- Add or remove problems from the current study day
- Generate a custom study plan with Claude CLI or Codex CLI
- Real-time frontend rendering after AI plan generation
- Markdown-rendered AI coach responses
- Resizable sidebar, columns, problem statement, code editor, and notes area
- Progress, chat history, code drafts, notes, and custom plans stored in browser `localStorage`

## Run Locally

```powershell
npm install
npm run dev
```

Open:

```text
http://127.0.0.1:5173
```

## CLI Requirements

The frontend does not store API keys. AI requests are sent to the local Node server, which calls your local CLI:

- Claude: `claude -p`
- Codex: `codex exec`

Check your local CLI installation:

```powershell
claude --version
codex --version
```

If the commands are not available in `PATH`, set explicit paths:

```powershell
$env:CLAUDE_BIN="D:\path\to\claude.cmd"
$env:CODEX_BIN="D:\path\to\codex.cmd"
npm run dev
```

## Connect LeetCode.cn

This project does not collect your username or password, and it does not send your login cookie to the AI model.

1. Log in to `https://leetcode.cn` in your browser.
2. Open DevTools and find the site cookies.
3. Copy the full cookie string, or copy `LEETCODE_SESSION` and `csrftoken`.
4. Paste it into the LeetCode account panel in the left sidebar.

The cookie is saved only to the local `leetcode.local.json` file. This file is excluded by `.gitignore` and must not be uploaded to GitHub.

## Safety Notes

- Do not commit `leetcode.local.json`.
- Do not commit `.env` files.
- Do not commit logs, screenshots, build outputs, or `node_modules`.
- If a login cookie has been exposed, log out of LeetCode.cn and log in again.

## Current Limitation

Automatic code submission to LeetCode is not implemented. LeetCode submission endpoints are not stable public APIs and may be affected by login state, CSRF, CAPTCHA, or API changes. The recommended workflow is to study, draft, and review locally, then open the original problem page to submit.

## Development Commands

```powershell
npm run dev       # Start backend and frontend
npm run server    # Start local backend only
npm run client    # Start Vite frontend only
npm run build     # Build frontend
```
