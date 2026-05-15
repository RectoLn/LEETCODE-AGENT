import express from "express";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const app = express();
const PORT = Number(process.env.PORT || 8787);
const CLI_TIMEOUT_MS = Number(process.env.CLI_TIMEOUT_MS || 180000);
const LEETCODE_FILE = path.join(process.cwd(), "leetcode.local.json");
const LEETCODE_GRAPHQL = "https://leetcode.cn/graphql/";

app.use(express.json({ limit: "2mb" }));

const COACH_SYSTEM_PROMPT = `你是一位耐心、专业的算法面试教练，正在帮助一位编程基础较弱、数据结构与算法实践较少的同学准备大厂手撕题。

教学原则：
1. 先讲直觉，再讲模板，最后讲代码。
2. 用中文回答，语言短句化，适合边刷题边看。
3. 默认使用 Python；如果用户指定 Java/C++/JS，则改用用户指定语言。
4. 不要直接堆最终答案。先给思路、易错点、复杂度，再给必要代码。
5. 如果用户贴了代码，优先指出关键 bug、边界条件和面试表达。`;

function normalizeMessages(messages = []) {
  return messages
    .slice(-12)
    .map((m) => `${m.role === "user" ? "学生" : "教练"}：${String(m.content || "").trim()}`)
    .join("\n\n");
}

function assertSafeCliValue(value, label) {
  if (!value) return "";
  if (!/^[\w./:+-]+$/.test(value)) {
    throw new Error(`${label} 只能包含字母、数字、点、斜杠、冒号、加号、短横线和下划线。`);
  }
  return value;
}

function quoteCmdArg(value) {
  const text = String(value);
  return /\s/.test(text) ? `"${text.replace(/"/g, '\\"')}"` : text;
}

function quoteCmdCommand(value) {
  const text = String(value);
  return /\s/.test(text) ? quoteCmdArg(text) : text;
}

function runCommand(command, args, input, options = {}) {
  return new Promise((resolve, reject) => {
    const commandName = process.platform === "win32" ? "cmd.exe" : command;
    const commandArgs =
      process.platform === "win32"
        ? ["/d", "/c", [quoteCmdCommand(command), ...args.map(quoteCmdArg)].join(" ")]
        : args;

    const child = spawn(commandName, commandArgs, {
      cwd: process.cwd(),
      windowsHide: true,
      env: { ...process.env, FORCE_COLOR: "0", NO_COLOR: "1" },
      ...options,
    });

    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => {
      child.kill("SIGTERM");
      reject(new Error(`CLI 调用超时（${Math.round(CLI_TIMEOUT_MS / 1000)} 秒）。`));
    }, CLI_TIMEOUT_MS);

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("error", (err) => {
      clearTimeout(timer);
      reject(err);
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      if (code === 0) resolve({ stdout, stderr });
      else reject(new Error(stderr || stdout || `${command} exited with code ${code}`));
    });

    if (input) child.stdin.write(input);
    child.stdin.end();
  });
}

async function askClaude(prompt, model) {
  const args = ["-p"];
  const safeModel = assertSafeCliValue(model, "模型名");
  if (safeModel) args.push("--model", safeModel);
  const fullPrompt = `${COACH_SYSTEM_PROMPT}\n\n以下是当前对话，请继续回答学生最后一个问题：\n\n${prompt}`;
  const { stdout } = await runCommand(process.env.CLAUDE_BIN || "claude", args, fullPrompt);
  return stdout.trim();
}

async function askCodex(prompt, model) {
  const dir = await mkdtemp(path.join(tmpdir(), "lc-coach-"));
  const outFile = path.join(dir, "answer.txt");
  try {
    const fullPrompt = `${COACH_SYSTEM_PROMPT}\n\n以下是当前对话，请继续回答学生最后一个问题：\n\n${prompt}`;
    const args = [
      "exec",
      "--skip-git-repo-check",
      "--sandbox",
      "read-only",
      "--ask-for-approval",
      "never",
      "--output-last-message",
      outFile,
    ];
    const safeModel = assertSafeCliValue(model, "模型名");
    if (safeModel) args.push("-m", safeModel);
    args.push("-");
    await runCommand(process.env.CODEX_BIN || "codex", args, fullPrompt);
    const answer = await readFile(outFile, "utf8");
    return answer.trim();
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

function extractJsonObject(text = "") {
  const raw = String(text).trim();
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const source = fenced ? fenced[1].trim() : raw;
  const start = source.indexOf("{");
  const end = source.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("AI did not return a JSON object.");
  return JSON.parse(source.slice(start, end + 1));
}

function normalizeGeneratedPlan(payload) {
  const weeks = Array.isArray(payload?.weeks) ? payload.weeks : Array.isArray(payload?.plan) ? payload.plan : [];
  if (!weeks.length) throw new Error("Generated plan is empty.");
  return weeks.slice(0, 12).map((week, weekIndex) => ({
    week: Number(week.week || weekIndex + 1),
    title: String(week.title || `Week ${weekIndex + 1}`).slice(0, 40),
    color: "#2d2d2d",
    days: (Array.isArray(week.days) ? week.days : []).slice(0, 14).map((day, dayIndex) => ({
      day: Number(day.day || weekIndex * 7 + dayIndex + 1),
      topic: String(day.topic || "Custom practice").slice(0, 60),
      difficulty: String(day.difficulty || "Custom").slice(0, 20),
      concept: String(day.concept || "").slice(0, 300),
      problems: (Array.isArray(day.problems) ? day.problems : []).slice(0, 6).map((p) => {
        const slug = String(p.slug || p.titleSlug || "").trim();
        const id = Number(p.id || p.questionFrontendId || 0);
        if (!slug || !id) return null;
        return {
          id,
          name: String(p.name || p.title || p.translatedTitle || slug).slice(0, 80),
          tag: String(p.tag || p.difficulty || "AI").slice(0, 20),
          slug,
          url: `https://leetcode.cn/problems/${slug}/`,
        };
      }).filter(Boolean),
    })).filter((day) => day.problems.length),
  })).filter((week) => week.days.length);
}

async function readLeetCodeSession() {
  if (!existsSync(LEETCODE_FILE)) return {};
  try {
    return JSON.parse(await readFile(LEETCODE_FILE, "utf8"));
  } catch {
    return {};
  }
}

async function writeLeetCodeSession(session) {
  await writeFile(LEETCODE_FILE, JSON.stringify(session, null, 2), "utf8");
}

function buildCookie(session = {}) {
  const pairs = [];
  if (session.leetcodeSession) pairs.push(`LEETCODE_SESSION=${session.leetcodeSession}`);
  if (session.csrfToken) pairs.push(`csrftoken=${session.csrfToken}`);
  return pairs.join("; ");
}

function parseCookieHeader(cookie = "") {
  return String(cookie)
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((acc, part) => {
      const index = part.indexOf("=");
      if (index > 0) acc[part.slice(0, index)] = part.slice(index + 1);
      return acc;
    }, {});
}

async function leetcodeGraphQL(query, variables = {}) {
  const session = await readLeetCodeSession();
  const cookie = buildCookie(session);
  const res = await fetch(LEETCODE_GRAPHQL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Referer: "https://leetcode.cn/",
      Origin: "https://leetcode.cn",
      ...(cookie ? { Cookie: cookie, "x-csrftoken": session.csrfToken || "" } : {}),
    },
    body: JSON.stringify({ query, variables }),
  });

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`力扣返回了非 JSON 内容：${text.slice(0, 120)}`);
  }
  if (!res.ok || data.errors) {
    throw new Error(data.errors?.[0]?.message || `力扣请求失败：HTTP ${res.status}`);
  }
  return data.data;
}

app.get("/api/health", async (_req, res) => {
  const checks = await Promise.allSettled([
    runCommand(process.env.CLAUDE_BIN || "claude", ["--version"], ""),
    runCommand(process.env.CODEX_BIN || "codex", ["--version"], ""),
  ]);
  res.json({
    ok: true,
    claude: checks[0].status === "fulfilled",
    codex: checks[1].status === "fulfilled",
  });
});

app.post("/api/chat", async (req, res) => {
  const provider = req.body?.provider === "codex" ? "codex" : "claude";
  const messages = Array.isArray(req.body?.messages) ? req.body.messages : [];
  const model = typeof req.body?.model === "string" ? req.body.model.trim() : "";
  const prompt = normalizeMessages(messages);

  if (!prompt) {
    res.status(400).json({ error: "消息不能为空。" });
    return;
  }

  try {
    const answer = provider === "codex" ? await askCodex(prompt, model) : await askClaude(prompt, model);
    res.json({ answer: answer || "我没有拿到 CLI 输出，可以检查一下本地 CLI 登录状态。" });
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : "本地 CLI 调用失败。",
    });
  }
});

app.post("/api/plan/generate", async (req, res) => {
  const provider = req.body?.provider === "codex" ? "codex" : "claude";
  const model = typeof req.body?.model === "string" ? req.body.model.trim() : "";
  const goal = String(req.body?.goal || "Prepare for big tech coding interviews").trim();
  const level = String(req.body?.level || "weak programming foundation, beginner DSA").trim();
  const weeks = Math.min(Math.max(Number(req.body?.weeks || 6), 1), 12);
  const daysPerWeek = Math.min(Math.max(Number(req.body?.daysPerWeek || 5), 1), 7);
  const problemsPerDay = Math.min(Math.max(Number(req.body?.problemsPerDay || 2), 1), 5);

  const prompt = `
Create a LeetCode study plan as strict JSON only. No markdown, no prose.

User goal: ${goal}
User level: ${level}
Duration: ${weeks} weeks
Days per week: ${daysPerWeek}
Problems per day: ${problemsPerDay}

Return this exact shape:
{
  "weeks": [
    {
      "week": 1,
      "title": "Array and two pointers",
      "days": [
        {
          "day": 1,
          "topic": "Binary search",
          "difficulty": "Beginner",
          "concept": "One short Chinese explanation.",
          "problems": [
            { "id": 704, "name": "二分查找", "slug": "binary-search", "tag": "必刷" }
          ]
        }
      ]
    }
  ]
}

Rules:
- Use real LeetCode problem ids and title slugs.
- Prefer leetcode.cn common interview problems.
- Use Chinese for title/topic/concept/name/tag.
- Include exactly ${weeks} weeks if possible.
- Include exactly ${daysPerWeek} days per week if possible.
- Include exactly ${problemsPerDay} problems per day.
- Return JSON only.
`;

  try {
    const raw = provider === "codex" ? await askCodex(prompt, model) : await askClaude(prompt, model);
    const parsed = extractJsonObject(raw);
    const plan = normalizeGeneratedPlan(parsed);
    res.json({ plan, raw });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Failed to generate plan." });
  }
});

app.get("/api/leetcode/session", async (_req, res) => {
  const session = await readLeetCodeSession();
  res.json({
    connected: Boolean(session.leetcodeSession && session.csrfToken),
    hasLeetcodeSession: Boolean(session.leetcodeSession),
    hasCsrfToken: Boolean(session.csrfToken),
    updatedAt: session.updatedAt || null,
  });
});

app.post("/api/leetcode/session", async (req, res) => {
  const fullCookie = String(req.body?.fullCookie || "").trim();
  const parsedCookie = parseCookieHeader(fullCookie);
  const leetcodeSession = String(req.body?.leetcodeSession || parsedCookie.LEETCODE_SESSION || "").trim();
  const csrfToken = String(req.body?.csrfToken || parsedCookie.csrftoken || "").trim();
  if (!leetcodeSession || !csrfToken) {
    res.status(400).json({ error: "请填写完整 Cookie，或同时填写 LEETCODE_SESSION 和 csrftoken。" });
    return;
  }
  await writeLeetCodeSession({ leetcodeSession, csrfToken, updatedAt: new Date().toISOString() });
  res.json({ ok: true });
});

app.delete("/api/leetcode/session", async (_req, res) => {
  await rm(LEETCODE_FILE, { force: true });
  res.json({ ok: true });
});

app.get("/api/leetcode/profile", async (_req, res) => {
  try {
    const data = await leetcodeGraphQL(`
      query globalData {
        userStatus {
          isSignedIn
          username
          realName
          avatar
          userSlug
        }
      }
    `);
    res.json({ profile: data.userStatus });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "读取力扣账号失败。" });
  }
});

app.get("/api/leetcode/problems", async (req, res) => {
  const search = String(req.query.search || "").trim();
  const difficulty = String(req.query.difficulty || "").trim();
  const limit = Math.min(Number(req.query.limit || 30), 100);
  const skip = Math.max(Number(req.query.skip || 0), 0);

  try {
    const data = await leetcodeGraphQL(
      `
      query problemsetQuestionList($categorySlug: String, $skip: Int, $limit: Int, $filters: QuestionListFilterInput) {
        problemsetQuestionList(
          categorySlug: $categorySlug
          skip: $skip
          limit: $limit
          filters: $filters
        ) {
          total
          questions {
            questionFrontendId: frontendQuestionId
            title
            translatedTitle: titleCn
            titleSlug
            difficulty
            acRate
            topicTags { name translatedName: nameTranslated slug }
          }
        }
      }
    `,
      {
        categorySlug: "algorithms",
        skip,
        limit,
        filters: {
          searchKeywords: search || undefined,
          difficulty: difficulty || undefined,
        },
      },
    );
    res.json(data.problemsetQuestionList);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "读取题库失败。" });
  }
});

app.get("/api/leetcode/problem/:slug", async (req, res) => {
  const titleSlug = String(req.params.slug || "").trim();
  if (!/^[a-z0-9-]+$/.test(titleSlug)) {
    res.status(400).json({ error: "题目 slug 不合法。" });
    return;
  }

  try {
    const data = await leetcodeGraphQL(
      `
      query questionData($titleSlug: String!) {
        question(titleSlug: $titleSlug) {
          questionId
          questionFrontendId
          title
          translatedTitle
          titleSlug
          content
          translatedContent
          difficulty
          topicTags { name translatedName slug }
          codeSnippets { lang langSlug code }
          exampleTestcases
        }
      }
    `,
      { titleSlug },
    );
    if (!data.question) {
      res.status(404).json({ error: "没有找到这道题。" });
      return;
    }
    res.json({ problem: data.question });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "读取题目失败。" });
  }
});

app.post("/api/reminder", async (req, res) => {
  const enabled = Boolean(req.body?.enabled);
  const hour = Number(req.body?.hour || 20);
  const minute = Number(req.body?.minute || 30);
  const payload = { enabled, hour, minute, updatedAt: new Date().toISOString() };
  await writeFile(path.join(process.cwd(), "reminder.local.json"), JSON.stringify(payload, null, 2));
  res.json({ ok: true, reminder: payload });
});

app.listen(PORT, "127.0.0.1", () => {
  console.log(`LeetCode CLI Coach server: http://127.0.0.1:${PORT}`);
});
