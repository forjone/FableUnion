// FableUnion 浏览器插件：抓取当前页面 HTML，提交给本地后端解析入库。
// 比后端直接抓 URL 更可靠 —— 用户浏览器里的页面已通过公众号的验证/登录态。

const $ = (id) => document.getElementById(id);

async function init() {
  const { server } = await chrome.storage.local.get("server");
  if (server) $("server").value = server;
  $("open").href = $("server").value;

  $("server").addEventListener("change", async () => {
    await chrome.storage.local.set({ server: $("server").value.trim() });
    $("open").href = $("server").value.trim();
  });

  $("save").addEventListener("click", saveCurrent);
}

async function saveCurrent() {
  const btn = $("save");
  const status = $("status");
  const server = $("server").value.trim().replace(/\/+$/, "");
  await chrome.storage.local.set({ server });

  btn.disabled = true;
  status.className = "";
  status.textContent = "抓取页面中…";

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.url || !tab.url.includes("mp.weixin.qq.com")) {
      throw new Error("当前页面不是公众号文章（mp.weixin.qq.com）");
    }

    // 在页面内执行，取完整渲染后的 HTML
    const [{ result: html }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => document.documentElement.outerHTML,
    });

    status.textContent = "提交到工具箱…";
    const resp = await fetch(`${server}/api/articles/collect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: tab.url, html }),
    });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) throw new Error(data.detail || `HTTP ${resp.status}`);

    status.textContent = `✅ 已保存：${data.title || "无标题"}`;
  } catch (e) {
    status.className = "err";
    status.textContent = `❌ ${e.message}（请确认后端已启动）`;
  } finally {
    btn.disabled = false;
  }
}

init();
