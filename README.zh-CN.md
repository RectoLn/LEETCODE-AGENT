# LEETCODE-AGENT

[English](README.md) | 简体中文

LEETCODE-AGENT 是一个本地运行、面向电脑端的 LeetCode 刷题工作台。它把刷题计划、LeetCode.cn 题面、代码草稿、刷题笔记，以及由 Claude CLI 或 Codex CLI 驱动的本地 AI 教练整合在同一个网页里。

计划发布仓库：

```text
https://github.com/RectoLn/LEETCODE-AGENT
```

## 功能

- 桌面端三栏刷题工作台
- 连接 LeetCode.cn，读取账号状态和题面
- 从 LeetCode.cn 实时搜索题库
- 将题目加入当前 Day，或从当前 Day 移除
- 使用 Claude CLI 或 Codex CLI 生成自定义刷题计划
- AI 生成计划后前端实时渲染
- AI 教练回复支持 Markdown 渲染
- 支持侧栏折叠、三栏横向拖拽、题面/代码/笔记纵向拖拽
- 进度、聊天记录、代码草稿、笔记、自定义计划保存到浏览器 `localStorage`

## 本地运行

```powershell
npm install
npm run dev
```

打开：

```text
http://127.0.0.1:5173
```

## CLI 要求

前端不会保存 API Key。AI 请求会发送到本机 Node 后端，再调用本地 CLI：

- Claude：`claude -p`
- Codex：`codex exec`

检查本机 CLI：

```powershell
claude --version
codex --version
```

如果命令不在 `PATH` 中，可以显式指定：

```powershell
$env:CLAUDE_BIN="D:\path\to\claude.cmd"
$env:CODEX_BIN="D:\path\to\codex.cmd"
npm run dev
```

## 连接 LeetCode.cn

本项目不会收集你的用户名和密码，也不会把登录 Cookie 发送给 AI 模型。

1. 在浏览器登录 `https://leetcode.cn`
2. 打开开发者工具，找到当前站点 Cookie
3. 复制完整 Cookie，或复制 `LEETCODE_SESSION` 和 `csrftoken`
4. 粘贴到左侧“力扣账号”面板

Cookie 只会保存到本地 `leetcode.local.json` 文件。该文件已被 `.gitignore` 排除，不能上传到 GitHub。

## 安全说明

- 不要提交 `leetcode.local.json`
- 不要提交 `.env` 文件
- 不要提交日志、截图、构建产物或 `node_modules`
- 如果登录 Cookie 曾经暴露，建议在 LeetCode.cn 退出登录并重新登录

## 当前限制

暂未实现自动提交代码到 LeetCode。LeetCode 的判题提交接口不是稳定公开 API，容易受到登录态、CSRF、验证码或接口变更影响。推荐流程是在本地工作台学习、写草稿、让 AI 审代码，然后打开原题页面提交。

## 开发命令

```powershell
npm run dev       # 同时启动后端和前端
npm run server    # 只启动本地后端
npm run client    # 只启动 Vite 前端
npm run build     # 构建前端
```
