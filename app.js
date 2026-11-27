// 技術科 授業アプリ集
// 掲載一覧は data/items.json だけで管理する。このファイルを直す必要はない。
(function () {
  "use strict";

  var UNITS = [
    { code: "all", label: "すべて" },
    { code: "A", label: "A 材料と加工の技術" },
    { code: "B", label: "B 生物育成の技術" },
    { code: "C", label: "C エネルギー変換の技術" },
    { code: "D", label: "D 情報の技術" },
    { code: "other", label: "その他" }
  ];
  var TYPES = { app: "自作アプリ", site: "外部サイト" };

  var state = { unit: "all", query: "" };
  var items = [];

  var grid = document.getElementById("grid");
  var filters = document.getElementById("filters");
  var search = document.getElementById("search");
  var count = document.getElementById("count");
  var empty = document.getElementById("empty");
  var toast = document.getElementById("toast");

  function unitLabel(code) {
    for (var i = 0; i < UNITS.length; i++) if (UNITS[i].code === code) return UNITS[i].label;
    return "その他";
  }

  // 全角・半角や大文字・小文字の違いを気にせず検索できるようにする
  function normalize(s) {
    return String(s || "").normalize("NFKC").toLowerCase();
  }

  // 相対パス（apps/〇〇/）を、配布できる完全なURLに直す
  function absoluteUrl(url) {
    return new URL(url, document.baseURI).href;
  }

  function renderFilters() {
    filters.innerHTML = "";
    UNITS.forEach(function (u) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "filter-btn";
      b.textContent = u.label;
      b.setAttribute("aria-pressed", String(state.unit === u.code));
      b.addEventListener("click", function () {
        state.unit = u.code;
        renderFilters();
        render();
      });
      filters.appendChild(b);
    });
  }

  function makeCard(item) {
    var card = document.createElement("article");
    card.className = "card";
    card.style.setProperty("--unit-color", "var(--unit-" + item.unit + ")");

    var h = document.createElement("h2");
    h.textContent = item.name;

    var tags = document.createElement("div");
    tags.className = "tags";
    var tu = document.createElement("span");
    tu.className = "tag tag-unit";
    tu.textContent = unitLabel(item.unit);
    var tt = document.createElement("span");
    tt.className = "tag tag-type" + (item.type === "app" ? " is-app" : "");
    tt.textContent = TYPES[item.type] || "外部サイト";
    tags.appendChild(tu);
    tags.appendChild(tt);

    var p = document.createElement("p");
    p.textContent = item.description;

    var actions = document.createElement("div");
    actions.className = "actions";

    var open = document.createElement("a");
    open.className = "btn btn-open";
    open.href = item.url;
    open.target = "_blank";
    open.rel = "noopener noreferrer";
    open.textContent = "開く";
    open.setAttribute("aria-label", item.name + " を新しいタブで開く");

    var copy = document.createElement("button");
    copy.type = "button";
    copy.className = "btn btn-copy";
    copy.textContent = "URLをコピー";
    copy.setAttribute("aria-label", item.name + " のURLをコピー");
    copy.addEventListener("click", function () {
      copyText(absoluteUrl(item.url)).then(function () {
        copy.textContent = "コピーしました";
        copy.classList.add("is-done");
        showToast("コピーしました：" + item.name);
        setTimeout(function () {
          copy.textContent = "URLをコピー";
          copy.classList.remove("is-done");
        }, 2000);
      }, function () {
        showToast("コピーできませんでした。「開く」からURLを確認してください。");
      });
    });

    actions.appendChild(open);
    actions.appendChild(copy);

    card.appendChild(h);
    card.appendChild(tags);
    card.appendChild(p);
    card.appendChild(actions);
    return card;
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    // 古いブラウザ・https でない環境向けの予備の方法
    return new Promise(function (resolve, reject) {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      document.body.removeChild(ta);
      ok ? resolve() : reject();
    });
  }

  var toastTimer;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("show"); }, 2000);
  }

  function matches(item) {
    if (state.unit !== "all" && item.unit !== state.unit) return false;
    if (!state.query) return true;
    var hay = normalize([item.name, item.description, unitLabel(item.unit), TYPES[item.type]].join(" "));
    return normalize(state.query).split(/\s+/).filter(Boolean).every(function (w) {
      return hay.indexOf(w) !== -1;
    });
  }

  function render() {
    var shown = items.filter(matches);
    grid.innerHTML = "";
    shown.forEach(function (it) { grid.appendChild(makeCard(it)); });
    count.textContent = shown.length + " 件を表示中（全 " + items.length + " 件）";
    empty.hidden = shown.length !== 0;
  }

  search.addEventListener("input", function () {
    state.query = search.value.trim();
    render();
  });

  renderFilters();

  fetch("data/items.json", { cache: "no-cache" })
    .then(function (r) {
      if (!r.ok) throw new Error(r.status);
      return r.json();
    })
    .then(function (data) {
      var known = ["A", "B", "C", "D", "other"];
      items = (Array.isArray(data) ? data : []).filter(function (it) {
        return it && it.name && it.url;
      }).map(function (it) {
        return {
          name: String(it.name),
          description: String(it.description || ""),
          unit: known.indexOf(it.unit) !== -1 ? it.unit : "other",
          type: it.type === "app" ? "app" : "site",
          url: String(it.url)
        };
      });
      render();
    })
    .catch(function () {
      count.textContent = "";
      empty.hidden = false;
      empty.textContent = "一覧を読み込めませんでした。ファイルを直接開いている場合は、GitHub Pages上で開いてください。";
    });
})();
