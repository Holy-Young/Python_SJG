// ===================================================
// 课程配置：只需要在这里维护目录数据
// ===================================================
const COURSE_CONFIG = {
  chapters: [
    {
      title: "第一章 · 认识 Python",
      lessons: [
        { title: "1.1 Python 是什么？",       file: "chapter1.html" },
        { title: "1.2 编程语言与Python解释器", file: "chapter1-2.html" },
      ]
    },
    {
      title: "第二章 · 数据与变量",
      lessons: [
        { title: "2.1 字面量与注释",    file: "chapter2.html" },
        { title: "2.2 变量与标识符",    file: "chapter2-2.html" },
        { title: "2.3 数据类型与运算符",    file: "chapter2-3.html" },
        { title: "2.4 元组",           file: "chapter2-4.html" },
      ]
    },
    {
      title: "第三章 · 条件与循环",
      lessons: [
        { title: "3.1 if 判断",    file: "chapter3.html" },
        { title: "3.2 for 循环",   file: "chapter3-2.html" },
        { title: "3.3 while 循环", file: "chapter3-3.html" },
      ]
    },
    {
      title: "第四章 · 函数",
      lessons: [
        { title: "4.1 定义函数",      file: "chapter4.html" },
        { title: "4.2 参数与返回值",  file: "chapter4-2.html" },
        { title: "4.3 匿名函数",      file: "chapter4-3.html" },
      ]
    },
  ]
};

// ===================================================
// 工具函数：获取当前页面文件名
// ===================================================
function getCurrentFile() {
  return window.location.pathname.split("/").pop();
}

// ===================================================
// 功能零：根据 COURSE_CONFIG 自动渲染侧边栏目录
// ===================================================
function renderSidebar() {
  const sidebar = document.querySelector(".sidebar");
  if (!sidebar) return;

  // 判断当前是在 pages/ 目录下还是根目录（index.html）
  const isRoot = !window.location.pathname.includes("/pages/");

  let html = '<h3>📚 课程目录</h3>';

  COURSE_CONFIG.chapters.forEach(chapter => {
    html += `<div class="chapter-group">`;
    html += `<div class="chapter-title">${chapter.title} <span class="arrow">▼</span></div>`;
    html += `<ul>`;
    chapter.lessons.forEach(lesson => {
      // 根目录下链接加 pages/ 前缀，章节页下直接用文件名
      const href = isRoot ? `pages/${lesson.file}` : lesson.file;
      html += `<li><a href="${href}">${lesson.title}</a></li>`;
    });
    html += `</ul>`;
    html += `</div>`;
  });

  // 如果是首页，加上总体进度块
  if (isRoot) {
    html += `
      <div class="sidebar-progress">
        <div class="sidebar-progress-label">
          <span>总体完成进度</span>
          <span id="progressPercent">0%</span>
        </div>
        <div class="sidebar-progress-bg">
          <div class="sidebar-progress-fill" id="sidebarProgressFill"></div>
        </div>
        <div class="sidebar-progress-count" id="progressCount">已完成 0 / ${
          COURSE_CONFIG.chapters.reduce((s, c) => s + c.lessons.length, 0)
        } 节</div>
      </div>`;
  }

  sidebar.innerHTML = html;
}

// ===================================================
// 功能一：自动高亮当前页目录项
// ===================================================
function highlightCurrentPage() {
  const currentFile = getCurrentFile();
  document.querySelectorAll(".sidebar a").forEach(link => {
    const linkFile = link.getAttribute("href").split("/").pop();
    if (linkFile === currentFile) {
      link.classList.add("active");
      link.scrollIntoView({ block: "nearest" });
    } else {
      link.classList.remove("active");
    }
  });
}

// ===================================================
// 功能二：自动更新章节内进度条
// ===================================================
function updateProgressBar() {
  const progressFill = document.querySelector(".progress-bar-fill");
  const progressText = document.querySelector(".progress-text");
  if (!progressFill || !progressText) return;

  const currentFile = getCurrentFile();
  let currentChapter = null;
  let currentLessonIndex = -1;

  for (const chapter of COURSE_CONFIG.chapters) {
    const idx = chapter.lessons.findIndex(l => l.file === currentFile);
    if (idx !== -1) {
      currentChapter = chapter;
      currentLessonIndex = idx;
      break;
    }
  }

  if (!currentChapter || currentLessonIndex === -1) return;

  const total = currentChapter.lessons.length;
  const current = currentLessonIndex + 1;
  const percent = Math.round((current / total) * 100);

  progressFill.style.width = percent + "%";
  progressText.textContent = `${current} / ${total} 节`;
}

// ===================================================
// 功能三：目录章节折叠 / 展开
// ===================================================
function initSidebarCollapse() {
  document.querySelectorAll(".chapter-title").forEach(title => {
    const ul = title.nextElementSibling;
    const arrow = title.querySelector(".arrow");

    const currentFile = getCurrentFile();
    const hasActive = [...ul.querySelectorAll("a")].some(
      a => a.getAttribute("href").split("/").pop() === currentFile
    );

    if (!hasActive) {
      ul.classList.add("collapsed");
      if (arrow) arrow.textContent = "▶";
    }

    title.addEventListener("click", () => {
      const isCollapsed = ul.classList.toggle("collapsed");
      if (arrow) arrow.textContent = isCollapsed ? "▶" : "▼";
    });
  });
}

// ===================================================
// 功能四：章节完成标记
// ===================================================
function getCompletedLessons() {
  return JSON.parse(localStorage.getItem("completedLessons") || "[]");
}

function markLesson(file, done) {
  let completed = getCompletedLessons();
  if (done) {
    if (!completed.includes(file)) completed.push(file);
  } else {
    completed = completed.filter(f => f !== file);
  }
  localStorage.setItem("completedLessons", JSON.stringify(completed));
}

function renderCompletedMarks() {
  const completed = getCompletedLessons();
  document.querySelectorAll(".sidebar ul li a").forEach(link => {
    const file = link.getAttribute("href").split("/").pop();
    const li = link.parentElement;
    const old = li.querySelector(".done-mark");
    if (old) old.remove();

    if (completed.includes(file)) {
      const mark = document.createElement("span");
      mark.className = "done-mark";
      mark.textContent = "✓";
      li.appendChild(mark);
    }
  });
}

function initCompleteButton() {
  const btn = document.getElementById("markCompleteBtn");
  if (!btn) return;

  const currentFile = getCurrentFile();
  const completed = getCompletedLessons();

  if (completed.includes(currentFile)) {
    btn.textContent = "✓ 已完成本节";
    btn.classList.add("done");
  }

  btn.addEventListener("click", () => {
    const isDone = btn.classList.toggle("done");
    markLesson(currentFile, isDone);
    btn.textContent = isDone ? "✓ 已完成本节" : "标记本节完成";
    renderCompletedMarks();
    updateSidebarProgress(); // 点击后同步更新总进度
  });
}

// ===================================================
// 功能五：手机端侧边栏开关
// ===================================================
function initMobileMenu() {
  const toggle = document.getElementById("menuToggle");
  const sidebar = document.querySelector(".sidebar");
  if (!toggle || !sidebar) return;

  toggle.addEventListener("click", () => {
    sidebar.classList.toggle("sidebar-open");
  });
}

// ===================================================
// 功能六：首页侧边栏总体进度统计
// ===================================================
function updateSidebarProgress() {
  const fill = document.getElementById("sidebarProgressFill");
  const percent = document.getElementById("progressPercent");
  const count = document.getElementById("progressCount");
  if (!fill || !percent || !count) return;

  const total = COURSE_CONFIG.chapters.reduce(
    (sum, ch) => sum + ch.lessons.length, 0
  );
  const completedCount = getCompletedLessons().length;
  const pct = total === 0 ? 0 : Math.round((completedCount / total) * 100);

  fill.style.width = pct + "%";
  percent.textContent = pct + "%";
  count.textContent = `已完成 ${completedCount} / ${total} 节`;
}

// ===================================================
// 功能七：自动更新首页统计数字
// ===================================================
function updateHomeStats() {
  const chaptersEl = document.getElementById("statChapters");
  const lessonsEl  = document.getElementById("statLessons");
  if (!chaptersEl || !lessonsEl) return;

  const totalChapters = COURSE_CONFIG.chapters.length;
  const totalLessons  = COURSE_CONFIG.chapters.reduce(
    (sum, ch) => sum + ch.lessons.length, 0
  );

  chaptersEl.textContent = totalChapters;
  lessonsEl.textContent  = totalLessons;
}

// ===================================================
// 页面加载完成后执行
// ===================================================
document.addEventListener("DOMContentLoaded", () => {
  renderSidebar();          
  highlightCurrentPage();
  updateProgressBar();
  initSidebarCollapse();
  renderCompletedMarks();
  initCompleteButton();
  initMobileMenu();
  updateSidebarProgress();
  updateHomeStats();
});