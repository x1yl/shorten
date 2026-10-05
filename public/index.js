(function () {
  try {
    var t = localStorage.getItem("kz-theme");
    var d = t
      ? t === "dark"
      : matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.dataset.theme = d ? "dark" : "light";
  } catch (e) {}
})();
const th = document.getElementById("th");
function paintTh() {
  const dark = document.documentElement.dataset.theme === "dark";
  document.getElementById("ic-moon").style.display = dark ? "none" : "block";
  document.getElementById("ic-sun").style.display = dark ? "block" : "none";
}
th.onclick = () => {
  const next =
    document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  localStorage.setItem("kz-theme", next);
  paintTh();
};
paintTh();

const hist = JSON.parse(localStorage.getItem("kzlinks") || "[]");
function renderHist() {
  document.getElementById("hist").innerHTML = hist
    .map(
      (h) =>
        `<div><a href="${h.short}" target="_blank" rel="noopener">${h.short.replace(/^https?:\/\//, "")}</a><span>${h.url}</span></div>`,
    )
    .join("");
}
async function go() {
  const url = document.getElementById("u").value.trim();
  const err = document.getElementById("err"),
    out = document.getElementById("out");
  err.style.display = "none";
  out.style.display = "none";
  if (!/^https?:\/\//i.test(url)) {
    err.textContent = "URL must start with http:// or https://";
    err.style.display = "block";
    return;
  }
  try {
    const r = await fetch("/api/shorten", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    const j = await r.json();
    if (!r.ok) throw new Error(j.error || "Failed");
    document.getElementById("short").textContent = j.short;
    document.getElementById("meta").textContent =
      "Expires in " + j.expiresInDays + " days · code " + j.code;
    out.style.display = "block";
    try {
      await navigator.clipboard.writeText(j.short);
      document.getElementById("meta").textContent += " · copied to clipboard";
    } catch (e) {}
    hist.unshift({ short: j.short, url });
    localStorage.setItem("kzlinks", JSON.stringify(hist.slice(0, 20)));
    renderHist();
  } catch (e) {
    err.textContent = String(e.message || e);
    err.style.display = "block";
  }
}
renderHist();
