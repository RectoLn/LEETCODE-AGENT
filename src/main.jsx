import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { marked } from "marked";
import {
  BarChart3,
  Bot,
  CalendarDays,
  Check,
  Circle,
  Code2,
  ExternalLink,
  FileText,
  Flame,
  GraduationCap,
  GripHorizontal,
  GripVertical,
  Link2,
  ListChecks,
  LogOut,
  Plus,
  PanelLeftClose,
  PanelLeftOpen,
  Play,
  RefreshCw,
  Save,
  Search,
  Send,
  Settings2,
  Sparkles,
  Target,
  User,
  X,
} from "lucide-react";
import "./styles.css";

marked.setOptions({
  breaks: true,
  gfm: true,
});

const PLAN = [
  week(1, "数组 & 双指针", "#1f9d63", [
    day(1, "数组基础 + 二分查找", "入门", "二分查找每次把搜索空间砍半。先背熟闭区间模板：left=0, right=n-1, while left<=right。", [
      problem(704, "二分查找", "必刷", "binary-search"),
      problem(35, "搜索插入位置", "巩固", "search-insert-position"),
    ]),
    day(2, "双指针 - 对撞指针", "入门", "两个指针从两端向中间收拢，常用于有序数组、反转、回文判断。", [
      problem(167, "两数之和 II", "必刷", "two-sum-ii-input-array-is-sorted"),
      problem(344, "反转字符串", "巩固", "reverse-string"),
    ]),
    day(3, "双指针 - 快慢指针", "简单", "slow 指向已处理区域末尾，fast 扫描未知区域。原地修改数组时特别好用。", [
      problem(26, "删除有序数组中的重复项", "必刷", "remove-duplicates-from-sorted-array"),
      problem(283, "移动零", "巩固", "move-zeroes"),
    ]),
    day(4, "滑动窗口入门", "简单", "窗口右边扩张纳入元素，条件不满足时左边收缩。关键是明确窗口内维护什么。", [
      problem(209, "长度最小的子数组", "必刷", "minimum-size-subarray-sum"),
      problem(3, "无重复字符的最长子串", "重点", "longest-substring-without-repeating-characters"),
    ]),
    day(5, "前缀和", "简单", "prefix[i] 表示前 i 个数之和，区间和可以 O(1) 查询。560 题要配合哈希表。", [
      problem(303, "区域和检索", "必刷", "range-sum-query-immutable"),
      problem(560, "和为K的子数组", "重点", "subarray-sum-equals-k"),
    ]),
  ]),
  week(2, "链表", "#2563eb", [
    day(6, "链表基础操作", "简单", "链表题一定画图。反转链表用 prev/curr/next 三指针，是后面复杂链表题的地基。", [
      problem(206, "反转链表", "必刷", "reverse-linked-list"),
      problem(21, "合并两个有序链表", "必刷", "merge-two-sorted-lists"),
    ]),
    day(7, "链表双指针", "简单", "Floyd 判圈：快指针走两步，慢指针走一步。有环必相遇，找入口再让一个指针回头。", [
      problem(141, "环形链表", "必刷", "linked-list-cycle"),
      problem(142, "环形链表 II", "重点", "linked-list-cycle-ii"),
    ]),
    day(8, "链表进阶", "中等", "删除类链表题优先考虑 dummy 虚拟头节点，边界会少很多。", [
      problem(19, "删除链表的倒数第N个节点", "必刷", "remove-nth-node-from-end-of-list"),
      problem(876, "链表的中间节点", "巩固", "middle-of-the-linked-list"),
    ]),
    day(9, "链表综合", "中等", "相交链表的 A+B / B+A 走法很优雅；交换节点时要先保留 next。", [
      problem(160, "相交链表", "必刷", "intersection-of-two-linked-lists"),
      problem(24, "两两交换链表中的节点", "重点", "swap-nodes-in-pairs"),
    ]),
    day(10, "链表复习日", "复习", "25 题是高频硬题。先把反转一段链表封装清楚，再处理分组。", [
      problem(92, "反转链表 II", "挑战", "reverse-linked-list-ii"),
      problem(25, "K个一组翻转链表", "大厂高频", "reverse-nodes-in-k-group"),
    ]),
  ]),
  week(3, "栈 & 队列 & 哈希表", "#db2777", [
    day(11, "栈的应用", "简单", "栈是后进先出。括号匹配遇左括号入栈，遇右括号弹栈比较。", [
      problem(20, "有效的括号", "必刷", "valid-parentheses"),
      problem(155, "最小栈", "必刷", "min-stack"),
    ]),
    day(12, "单调栈", "中等", "单调栈解决下一个更大/更小元素，元素通常只进栈出栈各一次。", [
      problem(739, "每日温度", "必刷", "daily-temperatures"),
      problem(496, "下一个更大元素 I", "巩固", "next-greater-element-i"),
    ]),
    day(13, "哈希表", "简单", "哈希表用空间换时间。两数之和边遍历边查 complement。", [
      problem(1, "两数之和", "必刷", "two-sum"),
      problem(49, "字母异位词分组", "必刷", "group-anagrams"),
    ]),
    day(14, "哈希表进阶", "中等", "LRU 用哈希表 + 双向链表，查找和调整顺序都要 O(1)。", [
      problem(128, "最长连续序列", "大厂高频", "longest-consecutive-sequence"),
      problem(146, "LRU缓存", "大厂必考", "lru-cache"),
    ]),
    day(15, "队列 & BFS预热", "简单", "双栈模拟队列：一个管入，一个管出。出栈为空时把入栈倒过去。", [
      problem(225, "用队列实现栈", "基础", "implement-stack-using-queues"),
      problem(232, "用栈实现队列", "基础", "implement-queue-using-stacks"),
    ]),
  ]),
  week(4, "树 & 递归", "#d97706", [
    day(16, "二叉树遍历", "简单", "树的遍历就是递归最自然的练习。先熟递归版，再补迭代版。", [
      problem(144, "二叉树的前序遍历", "必刷", "binary-tree-preorder-traversal"),
      problem(94, "二叉树的中序遍历", "必刷", "binary-tree-inorder-traversal"),
    ]),
    day(17, "树的BFS", "简单", "层序遍历用队列，每轮固定处理当前层 size 个节点。", [
      problem(102, "二叉树的层序遍历", "大厂高频", "binary-tree-level-order-traversal"),
      problem(104, "二叉树的最大深度", "必刷", "maximum-depth-of-binary-tree"),
    ]),
    day(18, "树的路径问题", "中等", "直径题用后序遍历：递归返回单侧最长路径，同时更新全局最大值。", [
      problem(112, "路径总和", "必刷", "path-sum"),
      problem(543, "二叉树的直径", "重点", "diameter-of-binary-tree"),
    ]),
    day(19, "BST二叉搜索树", "中等", "BST 的中序遍历是有序序列。验证 BST 可以传合法上下界。", [
      problem(98, "验证二叉搜索树", "必刷", "validate-binary-search-tree"),
      problem(230, "BST中第K小的元素", "大厂高频", "kth-smallest-element-in-a-bst"),
    ]),
    day(20, "树的构造", "中等", "LCA：如果左右子树各找到一个目标，当前节点就是最近公共祖先。", [
      problem(105, "从前序与中序遍历序列构造二叉树", "大厂高频", "construct-binary-tree-from-preorder-and-inorder-traversal"),
      problem(236, "二叉树的最近公共祖先", "必刷", "lowest-common-ancestor-of-a-binary-tree"),
    ]),
  ]),
  week(5, "动态规划", "#7c3aed", [
    day(21, "DP入门 - 爬楼梯类", "简单", "DP 先写状态定义，再写转移。爬楼梯就是 dp[i]=dp[i-1]+dp[i-2]。", [
      problem(70, "爬楼梯", "必刷", "climbing-stairs"),
      problem(198, "打家劫舍", "必刷", "house-robber"),
    ]),
    day(22, "背包问题", "中等", "0-1 背包一维数组要倒序遍历，避免同一物品被重复使用。", [
      problem(416, "分割等和子集", "大厂高频", "partition-equal-subset-sum"),
      problem(494, "目标和", "重点", "target-sum"),
    ]),
    day(23, "最长子序列", "中等", "LCS 是二维 DP 经典题，字符相等看左上，不等看左和上。", [
      problem(300, "最长递增子序列", "必刷", "longest-increasing-subsequence"),
      problem(1143, "最长公共子序列", "大厂高频", "longest-common-subsequence"),
    ]),
    day(24, "字符串DP", "中等", "编辑距离关注插入、删除、替换三种操作；回文子串也可用中心扩展。", [
      problem(72, "编辑距离", "大厂必考", "edit-distance"),
      problem(5, "最长回文子串", "大厂高频", "longest-palindromic-substring"),
    ]),
    day(25, "DP复习+综合", "中等", "零钱兑换是完全背包，硬币可以无限次使用。", [
      problem(322, "零钱兑换", "大厂高频", "coin-change"),
      problem(139, "单词拆分", "大厂高频", "word-break"),
    ]),
  ]),
  week(6, "图 & 回溯 & 大厂冲刺", "#dc2626", [
    day(26, "图的BFS/DFS", "中等", "岛屿题是网格 DFS/BFS 模板；腐烂橘子是多源 BFS。", [
      problem(200, "岛屿数量", "大厂高频", "number-of-islands"),
      problem(994, "腐烂的橘子", "必刷", "rotting-oranges"),
    ]),
    day(27, "回溯算法", "中等", "回溯 = 做选择、递归、撤销选择。画决策树最管用。", [
      problem(46, "全排列", "必刷", "permutations"),
      problem(78, "子集", "必刷", "subsets"),
    ]),
    day(28, "回溯进阶", "中等", "组合问题用 start 控制重复，单词搜索是矩阵 DFS + visited。", [
      problem(39, "组合总和", "大厂高频", "combination-sum"),
      problem(79, "单词搜索", "大厂高频", "word-search"),
    ]),
    day(29, "堆 & TopK", "中等", "TopK 用小根堆维护 K 个元素，或者用快速选择。", [
      problem(215, "数组中的第K个最大元素", "大厂必考", "kth-largest-element-in-an-array"),
      problem(347, "前K个高频元素", "大厂高频", "top-k-frequent-elements"),
    ]),
    day(30, "大厂综合模拟", "综合", "接雨水可用双指针维护 leftMax/rightMax，哪边低就处理哪边。", [
      problem(31, "下一个排列", "大厂高频", "next-permutation"),
      problem(42, "接雨水", "大厂压轴", "trapping-rain-water"),
    ]),
  ]),
];

function week(id, title, color, days) {
  return { week: id, title, color, days };
}

function day(id, topic, difficulty, concept, problems) {
  return { day: id, topic, difficulty, concept, problems };
}

function problem(id, name, tag, slug) {
  return { id, name, tag, slug, url: `https://leetcode.cn/problems/${slug}/` };
}

function clonePlan(plan) {
  return JSON.parse(JSON.stringify(plan));
}

function problemFromQuestion(q) {
  return problem(
    Number(q.questionFrontendId || q.frontendQuestionId),
    q.translatedTitle || q.titleCn || q.title,
    q.difficulty || "自选",
    q.titleSlug,
  );
}

function useLocalState(key, initial) {
  const [state, setState] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(key) || JSON.stringify(initial));
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);
  return [state, setState];
}

function sanitizeHtml(html = "") {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "")
    .replace(/javascript:/gi, "");
}

function renderMarkdown(text = "") {
  return sanitizeHtml(marked.parse(text));
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function App() {
  const [completed, setCompleted] = useLocalState("lc_done_v3", {});
  const [provider, setProvider] = useLocalState("lc_provider", "claude");
  const [model, setModel] = useLocalState("lc_model", "");
  const [selectedDayId, setSelectedDayId] = useLocalState("lc_selected_day", 1);
  const [selectedSlug, setSelectedSlug] = useLocalState("lc_selected_slug", "binary-search");
  const [customPlan, setCustomPlan] = useLocalState("lc_custom_plan_v1", null);
  const [messages, setMessages] = useLocalState("lc_chat_v3", [
    { role: "assistant", content: "你好，我是你的本地 CLI 算法教练。现在可以边看力扣题面、边写代码、边问我。" },
  ]);
  const [codeBySlug, setCodeBySlug] = useLocalState("lc_code_by_slug", {});
  const [notesBySlug, setNotesBySlug] = useLocalState("lc_notes_by_slug", {});
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [health, setHealth] = useState(null);
  const [lcSession, setLcSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [cookieForm, setCookieForm] = useState({ fullCookie: "", leetcodeSession: "", csrfToken: "" });
  const [problemDetail, setProblemDetail] = useState(null);
  const [problemLoading, setProblemLoading] = useState(false);
  const [problemError, setProblemError] = useState("");
  const [bankSearch, setBankSearch] = useState("");
  const [bankDifficulty, setBankDifficulty] = useState("");
  const [bankResults, setBankResults] = useState([]);
  const [bankLoading, setBankLoading] = useState(false);
  const [bankError, setBankError] = useState("");
  const [planGoal, setPlanGoal] = useLocalState("lc_plan_goal", "大厂算法面试，编程基础较弱，6周每天2题");
  const [planWeeks, setPlanWeeks] = useLocalState("lc_plan_weeks", 6);
  const [planDaysPerWeek, setPlanDaysPerWeek] = useLocalState("lc_plan_days_per_week", 5);
  const [planProblemsPerDay, setPlanProblemsPerDay] = useLocalState("lc_plan_problems_per_day", 2);
  const [planGenerating, setPlanGenerating] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useLocalState("lc_sidebar_collapsed", false);
  const [layout, setLayout] = useLocalState("lc_layout_v1", {
    problemWidth: 300,
    coachWidth: 360,
    statementHeight: 285,
    codeHeight: 260,
  });
  const chatEndRef = useRef(null);

  const activePlan = customPlan || PLAN;
  const allDays = useMemo(() => activePlan.flatMap((w) => w.days), [activePlan]);
  const allProblems = useMemo(() => allDays.flatMap((d) => d.problems), [allDays]);
  const selectedDay = allDays.find((d) => d.day === selectedDayId) || allDays[0];
  const selectedWeek = activePlan.find((w) => w.days.some((d) => d.day === selectedDay.day)) || activePlan[0];
  const selectedProblem = allProblems.find((p) => p.slug === selectedSlug) || selectedDay.problems[0];
  const code = codeBySlug[selectedProblem.slug] || "";
  const notes = notesBySlug[selectedProblem.slug] || "";
  const doneCount = Object.keys(completed).length;
  const pct = Math.round((doneCount / allProblems.length) * 100);
  const currentDay = allDays.find((d) => !d.problems.every((p) => completed[p.id])) || allDays.at(-1);
  const selectedDayIndex = Math.max(0, allDays.findIndex((d) => d.day === selectedDay.day));
  const planSummary = useMemo(() => ({
    source: customPlan ? "AI / 自定义计划" : "默认 6 周计划",
    weeks: activePlan.length,
    days: allDays.length,
    problems: allProblems.length,
  }), [activePlan, allDays.length, allProblems.length, customPlan]);

  const weekly = useMemo(() => {
    return activePlan.map((w) => {
      const problems = w.days.flatMap((d) => d.problems);
      const done = problems.filter((p) => completed[p.id]).length;
      return { ...w, total: problems.length, done };
    });
  }, [activePlan, completed]);

  useEffect(() => {
    fetch("/api/health").then((r) => r.json()).then(setHealth).catch(() => setHealth({ claude: false, codex: false }));
    refreshLeetCode();
  }, []);

  useEffect(() => {
    loadProblem(selectedProblem.slug);
  }, [selectedProblem.slug]);

  useEffect(() => {
    searchBank();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  function startColumnResize(which, event) {
    event.preventDefault();
    const startX = event.clientX;
    const start = { ...layout };
    document.body.classList.add("resizing");

    function onMove(moveEvent) {
      const dx = moveEvent.clientX - startX;
      setLayout((prev) => {
        if (which === "problem") {
          return { ...prev, problemWidth: clamp(start.problemWidth + dx, 220, 520) };
        }
        return { ...prev, coachWidth: clamp(start.coachWidth - dx, 300, 620) };
      });
    }

    function onUp() {
      document.body.classList.remove("resizing");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp, { once: true });
  }

  function startRowResize(which, event) {
    event.preventDefault();
    const startY = event.clientY;
    const start = { ...layout };
    document.body.classList.add("resizing");

    function onMove(moveEvent) {
      const dy = moveEvent.clientY - startY;
      setLayout((prev) => {
        if (which === "statement") {
          return {
            ...prev,
            statementHeight: clamp(start.statementHeight + dy, 160, 560),
            codeHeight: clamp(start.codeHeight - dy, 150, 520),
          };
        }
        return { ...prev, codeHeight: clamp(start.codeHeight + dy, 150, 560) };
      });
    }

    function onUp() {
      document.body.classList.remove("resizing");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp, { once: true });
  }

  async function refreshLeetCode() {
    const session = await fetch("/api/leetcode/session").then((r) => r.json()).catch(() => null);
    setLcSession(session);
    if (session?.connected) {
      const data = await fetch("/api/leetcode/profile").then((r) => r.json()).catch((err) => ({ error: err.message }));
      setProfile(data.profile || null);
    } else {
      setProfile(null);
    }
  }

  async function saveLeetCodeSession() {
    const res = await fetch("/api/leetcode/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cookieForm),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      alert(data.error || "保存失败");
      return;
    }
    setCookieForm({ fullCookie: "", leetcodeSession: "", csrfToken: "" });
    await refreshLeetCode();
  }

  async function disconnectLeetCode() {
    await fetch("/api/leetcode/session", { method: "DELETE" });
    await refreshLeetCode();
  }

  async function loadProblem(slug) {
    setProblemLoading(true);
    setProblemError("");
    try {
      const res = await fetch(`/api/leetcode/problem/${slug}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "读取题目失败");
      setProblemDetail(data.problem);
      const py = data.problem.codeSnippets?.find((s) => s.langSlug === "python3")?.code;
      setCodeBySlug((prev) => (prev[slug] ? prev : { ...prev, [slug]: py || "" }));
    } catch (err) {
      setProblemDetail(null);
      setProblemError(err instanceof Error ? err.message : "读取题目失败");
    } finally {
      setProblemLoading(false);
    }
  }

  function selectProblem(p) {
    const d = allDays.find((dayItem) => dayItem.problems.some((item) => item.slug === p.slug));
    if (d) setSelectedDayId(d.day);
    setSelectedSlug(p.slug);
  }

  function updateEditablePlan(updater) {
    setCustomPlan((prev) => {
      const next = clonePlan(prev || activePlan);
      updater(next);
      return next;
    });
  }

  async function searchBank() {
    setBankLoading(true);
    setBankError("");
    try {
      const params = new URLSearchParams({ limit: "30" });
      if (bankSearch.trim()) params.set("search", bankSearch.trim());
      if (bankDifficulty) params.set("difficulty", bankDifficulty);
      const res = await fetch(`/api/leetcode/problems?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "读取题库失败");
      setBankResults(Array.isArray(data.questions) ? data.questions : []);
    } catch (err) {
      setBankError(err instanceof Error ? err.message : "读取题库失败");
      setBankResults([]);
    } finally {
      setBankLoading(false);
    }
  }

  function addProblemToSelectedDay(question) {
    const item = problemFromQuestion(question);
    updateEditablePlan((draft) => {
      const targetDay = draft.flatMap((w) => w.days).find((d) => d.day === selectedDay.day);
      if (!targetDay) return;
      if (!targetDay.problems.some((p) => p.slug === item.slug)) targetDay.problems.push(item);
    });
    setSelectedSlug(item.slug);
  }

  function removeProblemFromSelectedDay(item) {
    updateEditablePlan((draft) => {
      const targetDay = draft.flatMap((w) => w.days).find((d) => d.day === selectedDay.day);
      if (!targetDay) return;
      targetDay.problems = targetDay.problems.filter((p) => p.slug !== item.slug);
      if (targetDay.problems.length === 0) {
        targetDay.problems.push(problem(704, "二分查找", "必刷", "binary-search"));
      }
    });
    if (selectedSlug === item.slug) {
      const fallback = selectedDay.problems.find((p) => p.slug !== item.slug) || selectedDay.problems[0];
      setSelectedSlug(fallback.slug);
    }
  }

  function resetPlan() {
    if (confirm("确定恢复默认 6 周计划吗？自定义增删的题目会被清空。")) {
      setCustomPlan(null);
      setSelectedDayId(1);
      setSelectedSlug("binary-search");
    }
  }

  function goToDay(day) {
    if (!day) return;
    setSelectedDayId(day.day);
    if (day.problems?.[0]) setSelectedSlug(day.problems[0].slug);
  }

  function goToRelativeDay(delta) {
    const next = allDays[clamp(selectedDayIndex + delta, 0, allDays.length - 1)];
    goToDay(next);
  }

  async function generatePlanWithAI() {
    if (planGenerating) return;
    setPlanGenerating(true);
    try {
      const res = await fetch("/api/plan/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          model,
          goal: planGoal,
          level: "编程基础较弱，算法和数据结构实践较少",
          weeks: Number(planWeeks) || 6,
          daysPerWeek: Number(planDaysPerWeek) || 5,
          problemsPerDay: Number(planProblemsPerDay) || 2,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "AI 生成计划失败");
      setCustomPlan(data.plan);
      const firstDay = data.plan?.[0]?.days?.[0];
      const firstProblem = firstDay?.problems?.[0];
      if (firstDay && firstProblem) {
        setSelectedDayId(firstDay.day);
        setSelectedSlug(firstProblem.slug);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "AI 生成计划失败");
    } finally {
      setPlanGenerating(false);
    }
  }

  function toggleProblem(id) {
    setCompleted((prev) => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = true;
      return next;
    });
  }

  function askAbout(text) {
    setInput(text);
    setTimeout(() => document.querySelector(".composer textarea")?.focus(), 0);
  }

  function askWithCurrentContext(intent) {
    askAbout(`${intent}

当前题目：LeetCode ${selectedProblem.id}「${selectedProblem.name}」
题目链接：${selectedProblem.url}
我的代码：
\`\`\`python
${code || "还没写"}
\`\`\`
我的笔记：${notes || "暂无"}`);
  }

  async function sendMessage() {
    const content = input.trim();
    if (!content || loading) return;
    const nextMessages = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, model, messages: nextMessages }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "本地 CLI 调用失败");
      setMessages((prev) => [...prev, { role: "assistant", content: data.answer }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `本地 ${provider} CLI 没有成功返回。\n\n${err instanceof Error ? err.message : "未知错误"}` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className={sidebarCollapsed ? "app-shell integrated sidebar-collapsed" : "app-shell integrated"}
      style={{ gridTemplateColumns: `${sidebarCollapsed ? 44 : 260}px minmax(900px, 1fr)` }}
    >
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon"><GraduationCap size={24} /></div>
          <div className="brand-copy">
            <strong>LeetCode CLI Coach</strong>
            <span>本地一体化刷题台</span>
          </div>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarCollapsed((value) => !value)}
            aria-label={sidebarCollapsed ? "展开侧栏" : "折叠侧栏"}
            title={sidebarCollapsed ? "展开侧栏" : "折叠侧栏"}
          >
            {sidebarCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>
        </div>

        <section className="today-card collapsible-sidebar-content">
          <div className="eyebrow"><CalendarDays size={14} /> 当前进度</div>
          <div className="big-progress">{pct}%</div>
          <div className="progress-track"><div style={{ width: `${pct}%` }} /></div>
          <p>{doneCount}/{allProblems.length} 题完成，下一站 Day {currentDay.day}</p>
          <button className="primary-btn" onClick={() => setSelectedDayId(currentDay.day)}>
            <Play size={16} /> 继续今日任务
          </button>
        </section>

        <section className="leetcode-card collapsible-sidebar-content">
          <div className="eyebrow"><Bot size={14} /> AI 计划</div>
          <div className={customPlan ? "plan-source active" : "plan-source"}>
            <strong>{planSummary.source}</strong>
            <span>{planSummary.weeks} 周 · {planSummary.days} 天 · {planSummary.problems} 题</span>
          </div>
          <textarea
            className="cookie-textarea"
            value={planGoal}
            onChange={(e) => setPlanGoal(e.target.value)}
            placeholder="告诉 Claude/Codex 你的目标、周期、每天题量"
          />
          <div className="plan-controls">
            <label>
              <span>周</span>
              <input type="number" min="1" max="12" value={planWeeks} onChange={(e) => setPlanWeeks(Number(e.target.value))} />
            </label>
            <label>
              <span>天/周</span>
              <input type="number" min="1" max="7" value={planDaysPerWeek} onChange={(e) => setPlanDaysPerWeek(Number(e.target.value))} />
            </label>
            <label>
              <span>题/天</span>
              <input type="number" min="1" max="5" value={planProblemsPerDay} onChange={(e) => setPlanProblemsPerDay(Number(e.target.value))} />
            </label>
          </div>
          <button className="mini-btn" onClick={generatePlanWithAI} disabled={planGenerating}>
            <Sparkles size={14} /> {planGenerating ? "生成中..." : "AI 生成计划"}
          </button>
          <button className="mini-btn secondary" onClick={resetPlan}>
            <RefreshCw size={14} /> 默认计划
          </button>
        </section>

        <section className="leetcode-card collapsible-sidebar-content">
          <div className="eyebrow"><User size={14} /> 力扣账号</div>
          {profile?.isSignedIn ? (
            <>
              <strong>{profile.realName || profile.username}</strong>
              <span>@{profile.username}</span>
              <button className="mini-btn" onClick={disconnectLeetCode}><LogOut size={14} /> 断开</button>
            </>
          ) : (
            <>
              <p>粘贴浏览器里的 Cookie，本机保存，不发送给 AI。</p>
              <textarea
                className="cookie-textarea"
                value={cookieForm.fullCookie}
                onChange={(e) => setCookieForm((f) => ({ ...f, fullCookie: e.target.value }))}
                placeholder="粘贴完整 Cookie，应用会自动提取 LEETCODE_SESSION 和 csrftoken"
              />
              <button className="mini-btn" onClick={saveLeetCodeSession}><Link2 size={14} /> 连接账号</button>
            </>
          )}
        </section>

        <nav className="week-list collapsible-sidebar-content">
          {weekly.map((w) => (
            <button key={w.week} className={w.week === selectedWeek.week ? "week-item active" : "week-item"} onClick={() => setSelectedDayId(w.days[0].day)} style={{ "--accent": w.color }}>
              <span>Week {w.week}</span>
              <strong>{w.title}</strong>
              <small>{w.days.length} 天 · {w.done}/{w.total} 题</small>
            </button>
          ))}
        </nav>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <div className="eyebrow"><Target size={14} /> Day {selectedDay.day} · {selectedWeek.title}</div>
            <h1>{selectedProblem.id}. {selectedProblem.name}</h1>
          </div>
          <div className="provider-panel">
            <Settings2 size={18} />
            <select value={provider} onChange={(e) => setProvider(e.target.value)}>
              <option value="claude">Claude CLI</option>
              <option value="codex">Codex CLI</option>
            </select>
            <input value={model} onChange={(e) => setModel(e.target.value)} placeholder={provider === "claude" ? "模型可留空，如 sonnet" : "模型可留空"} />
            <span className={health?.[provider] ? "status ok" : "status"}>{health?.[provider] ? "已检测" : "待检测"}</span>
          </div>
        </header>

        <div
          className="integrated-grid"
          style={{
            gridTemplateColumns: `${layout.problemWidth}px 8px minmax(360px, 1fr) 8px ${layout.coachWidth}px`,
          }}
        >
          <section className="problem-browser">
            <section className="plan-overview-card">
              <div>
                <div className="eyebrow"><Sparkles size={14} /> 当前计划</div>
                <strong>{selectedWeek.title}</strong>
                <span>{planSummary.source} · 第 {selectedDayIndex + 1}/{allDays.length} 天 · Day {selectedDay.day} · {selectedDay.problems.length} 题</span>
              </div>
              <div className="day-nav-actions">
                <button className="mini-action" onClick={() => goToRelativeDay(-1)} disabled={selectedDayIndex === 0}>上一天</button>
                <button className="mini-action" onClick={() => goToRelativeDay(1)} disabled={selectedDayIndex >= allDays.length - 1}>下一天</button>
                <button className="mini-action" onClick={generatePlanWithAI} disabled={planGenerating}>
                  {planGenerating ? "生成中" : "重生成"}
                </button>
              </div>
            </section>

            <div className="concept-card" style={{ "--accent": selectedWeek.color }}>
              <div className="eyebrow"><Sparkles size={14} /> 今日核心</div>
              <p>{selectedDay.concept}</p>
            </div>

            <div className="problem-list compact">
              <div className="section-title"><ListChecks size={17} /> 今日题目</div>
              {selectedDay.problems.map((p) => (
                <article className={selectedProblem.slug === p.slug ? "problem active" : completed[p.id] ? "problem done" : "problem"} key={p.id}>
                  <button className="check-btn" onClick={() => toggleProblem(p.id)} aria-label="切换完成状态">
                    {completed[p.id] ? <Check size={16} /> : <Circle size={16} />}
                  </button>
                  <button className="problem-pick" onClick={() => selectProblem(p)}>
                    <span>#{p.id}</span>
                    <strong>{p.name}</strong>
                    <em>{p.tag}</em>
                  </button>
                  <button className="remove-problem" onClick={() => removeProblemFromSelectedDay(p)} title="从当前计划移除">
                    <X size={13} />
                  </button>
                </article>
              ))}
            </div>

            <section className="bank-panel">
              <div className="section-title"><Search size={17} /> 实时题库</div>
              <div className="bank-search">
                <input value={bankSearch} onChange={(e) => setBankSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && searchBank()} placeholder="题号 / 题名 / slug" />
                <select value={bankDifficulty} onChange={(e) => setBankDifficulty(e.target.value)}>
                  <option value="">全部</option>
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
                <button onClick={searchBank} disabled={bankLoading}>{bankLoading ? "搜..." : "搜索"}</button>
              </div>
              {bankError && <div className="bank-error">{bankError}</div>}
              <div className="bank-results">
                {bankResults.slice(0, 8).map((q) => (
                  <button key={q.titleSlug} className="bank-result" onClick={() => addProblemToSelectedDay(q)}>
                    <span>#{q.questionFrontendId || q.frontendQuestionId}</span>
                    <strong>{q.translatedTitle || q.titleCn || q.title}</strong>
                    <Plus size={13} />
                  </button>
                ))}
              </div>
            </section>

            <div className="day-strip all-days">
              {allDays.map((d, index) => (
                <button key={`${d.day}-${index}`} className={d.day === selectedDay.day ? "day-pill active" : "day-pill"} onClick={() => goToDay(d)}>
                  Day {d.day}
                  <span>{d.problems.every((p) => completed[p.id]) ? "完成" : d.difficulty}</span>
                </button>
              ))}
            </div>

            <section className="stats-row">
              <Metric icon={<BarChart3 size={18} />} label="完成率" value={`${pct}%`} />
              <Metric icon={<Flame size={18} />} label="已完成" value={`${doneCount} 题`} />
              <Metric icon={<Target size={18} />} label="剩余" value={`${allProblems.length - doneCount} 题`} />
            </section>
          </section>

          <div
            className="column-resizer"
            onPointerDown={(event) => startColumnResize("problem", event)}
            title="拖拽调整左栏和题解区宽度"
          >
            <GripVertical size={14} />
          </div>

          <section
            className="solve-panel"
            style={{
              gridTemplateRows: `auto ${layout.statementHeight}px 8px ${layout.codeHeight}px 8px minmax(110px, 1fr)`,
            }}
          >
            <div className="solve-toolbar">
              <div>
                <div className="eyebrow"><FileText size={14} /> 力扣题面</div>
                <h2>{problemDetail?.translatedTitle || problemDetail?.title || selectedProblem.name}</h2>
              </div>
              <div className="toolbar-actions">
                <button onClick={() => loadProblem(selectedProblem.slug)}><RefreshCw size={14} /> 刷新</button>
                <a href={selectedProblem.url} target="_blank" rel="noreferrer"><ExternalLink size={14} /> 原题</a>
              </div>
            </div>

            <div className="statement">
              {problemLoading && <p>正在从 LeetCode.cn 读取题面...</p>}
              {problemError && <p className="error-text">{problemError}</p>}
              {!problemLoading && !problemError && problemDetail && (
                <>
                  <div className="meta-row">
                    <span>{problemDetail.difficulty}</span>
                    {problemDetail.topicTags?.slice(0, 5).map((t) => <span key={t.slug}>{t.translatedName || t.name}</span>)}
                  </div>
                  <div className="leetcode-html" dangerouslySetInnerHTML={{ __html: sanitizeHtml(problemDetail.translatedContent || problemDetail.content || "") }} />
                </>
              )}
            </div>

            <div
              className="row-resizer"
              onPointerDown={(event) => startRowResize("statement", event)}
              title="拖拽调整题面和代码区高度"
            >
              <GripHorizontal size={14} />
            </div>

            <div className="editor-panel">
              <div className="editor-header">
                <strong>代码区</strong>
                <button onClick={() => askWithCurrentContext("请检查我的代码，指出 bug、边界条件、复杂度，并告诉我面试时怎么讲。")}><Bot size={14} /> 审代码</button>
              </div>
              <textarea className="code-editor" value={code} onChange={(e) => setCodeBySlug((prev) => ({ ...prev, [selectedProblem.slug]: e.target.value }))} spellCheck="false" />
            </div>

            <div
              className="row-resizer"
              onPointerDown={(event) => startRowResize("code", event)}
              title="拖拽调整代码区和笔记区高度"
            >
              <GripHorizontal size={14} />
            </div>

            <div className="notes-panel">
              <div className="editor-header">
                <strong>刷题笔记</strong>
                <button onClick={() => askWithCurrentContext("请根据当前题目、我的代码和笔记，帮我整理一份复盘卡片。")}><Save size={14} /> 整理复盘</button>
              </div>
              <textarea value={notes} onChange={(e) => setNotesBySlug((prev) => ({ ...prev, [selectedProblem.slug]: e.target.value }))} placeholder="写下卡住点、模板、错因、复杂度..." />
            </div>
          </section>

          <div
            className="column-resizer"
            onPointerDown={(event) => startColumnResize("coach", event)}
            title="拖拽调整题解区和 AI 教练宽度"
          >
            <GripVertical size={14} />
          </div>

          <section className="coach-panel">
            <div className="coach-header">
              <div>
                <div className="eyebrow"><Bot size={14} /> AI 算法教练</div>
                <h2>{provider === "claude" ? "Claude CLI" : "Codex CLI"}</h2>
              </div>
              <button className="clear-btn" onClick={() => setMessages(messages.slice(0, 1))}>清空</button>
            </div>

            <div className="quick-prompts">
              <button onClick={() => askWithCurrentContext("请用初学者能懂的方式讲这道题：先讲直觉，再讲模板，最后给 Python 代码。")}>讲题</button>
              <button onClick={() => askWithCurrentContext("请像面试官一样追问我这道题，并给我提示，不要直接给最终答案。")}>面试模拟</button>
              <button onClick={() => askWithCurrentContext("请只给我一个小提示，让我继续自己想。")}>只给提示</button>
            </div>

            <div className="chat-log">
              {messages.map((m, idx) => (
                <div className={m.role === "user" ? "message user" : "message assistant"} key={`${m.role}-${idx}`}>
                  {m.role === "assistant" ? (
                    <div className="bubble markdown-body" dangerouslySetInnerHTML={{ __html: renderMarkdown(m.content) }} />
                  ) : (
                    <div className="bubble">{m.content}</div>
                  )}
                </div>
              ))}
              {loading && <div className="message assistant"><div className="bubble typing">正在调用本地 {provider} CLI<span>.</span><span>.</span><span>.</span></div></div>}
              <div ref={chatEndRef} />
            </div>

            <div className="composer">
              <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) sendMessage(); }} placeholder="输入问题。Ctrl/Command + Enter 发送。" />
              <button className="send-rect" onClick={sendMessage} disabled={loading || !input.trim()}><Send size={16} /> 发送</button>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function Metric({ icon, label, value }) {
  return (
    <div className="metric">
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
