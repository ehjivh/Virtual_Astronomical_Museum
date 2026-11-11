/* ==========================================================================
   Virtual Astronomical Museum — common-ui.js
   --------------------------------------------------------------------------
   1. VAM_ZONES / VAM_CATALOG : 展示メタデータ（唯一の正本）
      → 新しい展示を追加するときは VAM_CATALOG に 1 オブジェクト追記するだけで、
        index.html のカード一覧・共通ヘッダー・共通フッターが自動更新されます。
   2. window.VAM : スタンプラリー状態管理 API（localStorage: "vam_progress_v1"）
   3. 共通ヘッダー（.vam-header）/ 共通フッター（.vam-footer）の自動注入
   4. index.html のスタンプ帳ダッシュボード / ゾーン別カードグリッド生成

   使い方（各展示ページ）:
     <body data-app-id="spectrum"> ... <script src="common-ui.js" defer></script>
     ミッション達成時: window.VAM && window.VAM.completeMission();

   ※ file:// でも動作するよう、外部 JSON の fetch は使わず定数で保持しています。
   ========================================================================== */
(function () {
  "use strict";

  /* ------------------------------------------------------------------
     1. マスターデータ
     ------------------------------------------------------------------ */
  const VAM_ZONES = [
    {
      id: "light",
      num: 1,
      title: "光と波を調べる",
      en: "Light & Waves",
      desc: "宇宙からのメッセンジャーである「光・電磁波」の性質を解き明かす基礎ゾーン。",
      badge: "光の探究者",
    },
    {
      id: "telescope",
      num: 2,
      title: "望遠鏡のしくみ",
      en: "Telescopes & Interferometry",
      desc: "遠く暗い天体を「くっきり見る」ための光学・電波技術を学ぶゾーン。",
      badge: "観測技術者",
    },
    {
      id: "cosmos",
      num: 3,
      title: "宇宙を測る・旅する",
      en: "Cosmic Scale & Exploration",
      desc: "時間・距離のスケールと太陽系探査を体験するゾーン。",
      badge: "宇宙航海士",
    },
  ];

  const VAM_CATALOG = [
    // ---- Zone 1: 光と波を調べる ----
    {
      id: "lens",
      file: "lens.html",
      zone: "light",
      title: "レンズと結像のしくみ",
      desc: "コマコレクター・フラットナー、レデューサー、干渉フィルターの仕組みを光線追跡シミュレーションで体験します。",
      keywords: ["レンズ", "焦点距離", "屈折"],
    },
    {
      id: "camera",
      file: "camera.html",
      zone: "light",
      title: "カメラと露出・センサー",
      desc: "高度なセンサー技術と光学機器で、遠くの銀河の微かな光をどのように捉えるのかを探ります。",
      keywords: ["天体写真", "CCD", "露出"],
    },
    {
      id: "spectrum",
      file: "spectrum.html",
      zone: "light",
      title: "光のスペクトルと分光",
      desc: "星の色・波長・黒体放射・吸収線と輝線まで、スペクトル解析で星の光を読み解きます。",
      keywords: ["スペクトル", "フラウンホーファー線", "分光観測"],
    },
    {
      id: "spectral_class",
      file: "spectral_class.html",
      zone: "light",
      title: "恒星のスペクトル分類",
      desc: "O・B・A・F・G・K・M ── 吸収線のパターンから恒星の温度と種類を見分けます。",
      keywords: ["スペクトル分類", "HR図", "黒体放射"],
    },
    {
      id: "fourier",
      file: "fourier-transform.html",
      zone: "light",
      title: "波の合成とフーリエ変換",
      desc: "音波から電波まで、あらゆる「波」を周波数成分に分解するフーリエ変換の仕組みを学びます。",
      keywords: ["フーリエ変換", "波長", "周波数"],
    },
    // ---- Zone 2: 望遠鏡のしくみ ----
    {
      id: "telescope",
      file: "telescope.html",
      zone: "telescope",
      title: "光学望遠鏡のしくみ",
      desc: "光線追跡シミュレーションで、屈折・反射望遠鏡の光学的な仕組みを体験します。",
      keywords: ["望遠鏡", "口径", "分解能"],
    },
    {
      id: "radio_telescope",
      file: "radio_telescope.html",
      zone: "telescope",
      title: "電波望遠鏡のしくみ",
      desc: "光学では見えない宇宙の姿を「電波」で捉える、電波望遠鏡と受信システムの仕組みを探ります。",
      keywords: ["電波望遠鏡", "パラボラアンテナ", "電波天文学"],
    },
    {
      id: "interferometry",
      file: "interferometry.html",
      zone: "telescope",
      title: "電波干渉計の原理",
      desc: "波の干渉・光路差・開口合成 ── 複数の望遠鏡をつないで巨大な「目」をつくる原理を体験します。",
      keywords: ["電波干渉計", "基線長", "空間周波数"],
    },
    {
      id: "vlbi",
      file: "vlbi.html",
      zone: "telescope",
      title: "VLBI（超長基線電波干渉法）",
      desc: "世界中の電波望遠鏡を結んで地球規模の望遠鏡を構成する、VLBIの原理に迫ります。",
      keywords: ["VLBI", "イベント・ホライズン・テレスコープ", "開口合成"],
    },
    // ---- Zone 3: 宇宙を測る・旅する ----
    {
      id: "cal",
      file: "cal.html",
      zone: "cosmos",
      title: "天体の運行と暦（カレンダー）",
      desc: "観測地点と日時から天体の高度・方位角を計算し、天体の運行と暦のつながりを可視化します。",
      keywords: ["暦", "太陽暦", "太陰太陽暦", "閏年"],
    },
    {
      id: "distance_ladder",
      file: "cosmological_distance_ladder.html",
      zone: "cosmos",
      title: "宇宙の距離梯子",
      desc: "年周視差からIa型超新星まで、天文学者が宇宙の距離を測る段階的な手法を体験します。",
      keywords: ["宇宙の距離梯子", "年周視差", "セファイド変光星", "Ia型超新星"],
    },
    {
      id: "voyager",
      file: "Voyager.html",
      zone: "cosmos",
      title: "ボイジャー計画とスイングバイ",
      desc: "1977年に打ち上げられたボイジャーの「グランドツアー」を、惑星スイングバイとともにシミュレートします。",
      keywords: ["ボイジャー", "スイングバイ", "第一宇宙速度"],
    },
  ];

  const STORAGE_KEY = "vam_progress_v1";
  const DICT_URL = "https://astro-dic.jp/?s=";

  /* ------------------------------------------------------------------
     2. 永続化（localStorage が使えない環境ではメモリにフォールバック）
     ------------------------------------------------------------------ */
  let memoryStore = null;

  function emptyState() {
    return { cleared: {} };
  }

  function load() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return memoryStore || emptyState();
      const data = JSON.parse(raw);
      if (!data || typeof data !== "object" || typeof data.cleared !== "object" || data.cleared === null) {
        return emptyState();
      }
      return data;
    } catch (e) {
      return memoryStore || emptyState();
    }
  }

  function save(state) {
    memoryStore = state;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      /* プライベートモード等で保存不可 — メモリ上でのみ保持 */
    }
  }

  /* ------------------------------------------------------------------
     ヘルパー
     ------------------------------------------------------------------ */
  function getApp(id) {
    return VAM_CATALOG.find((a) => a.id === id) || null;
  }
  function getZone(id) {
    return VAM_ZONES.find((z) => z.id === id) || null;
  }
  function appsInZone(zoneId) {
    return VAM_CATALOG.filter((a) => a.zone === zoneId);
  }
  function currentAppId() {
    return (document.body && document.body.dataset.appId) || "";
  }
  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  /** 小さな DOM ビルダー（innerHTML を使わずテキストを安全に挿入） */
  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    if (attrs) {
      for (const k in attrs) {
        const v = attrs[k];
        if (v === null || v === undefined || v === false) continue;
        if (k === "class") node.className = v;
        else if (k === "text") node.textContent = v;
        else if (k.slice(0, 2) === "on" && typeof v === "function") node.addEventListener(k.slice(2), v);
        else node.setAttribute(k, v === true ? "" : v);
      }
    }
    (children || []).forEach((c) => {
      if (c === null || c === undefined || c === false) return;
      node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return node;
  }

  /* ------------------------------------------------------------------
     3. 公開 API: window.VAM
     ------------------------------------------------------------------ */
  function isCleared(appId) {
    const id = appId || currentAppId();
    return !!load().cleared[id];
  }

  function getProgress() {
    const state = load();
    const zones = VAM_ZONES.map((z) => {
      const apps = appsInZone(z.id);
      const cleared = apps.filter((a) => !!state.cleared[a.id]).length;
      return {
        id: z.id,
        num: z.num,
        title: z.title,
        badge: z.badge,
        cleared: cleared,
        total: apps.length,
        complete: apps.length > 0 && cleared === apps.length,
      };
    });
    const cleared = VAM_CATALOG.filter((a) => !!state.cleared[a.id]).length;
    const total = VAM_CATALOG.length;
    return {
      cleared: cleared,
      total: total,
      ratio: total ? cleared / total : 0,
      zones: zones,
      records: state.cleared,
    };
  }

  /**
   * ミッション達成時に呼び出す。
   * @param {string} [appId]  省略時は <body data-app-id> を参照
   * @param {object} [meta]   例: { score: 9200 }
   * @returns {boolean} 今回が初回クリアなら true
   */
  function completeMission(appId, meta) {
    const id = appId || currentAppId();
    const app = getApp(id);
    if (!app) {
      console.warn("[VAM] Unknown appId:", id);
      return false;
    }
    meta = meta && typeof meta === "object" ? meta : {};
    const state = load();
    const prev = state.cleared[id];

    if (prev) {
      // 既にクリア済み: ベストスコアのみ更新
      if (typeof meta.score === "number" && (typeof prev.score !== "number" || meta.score > prev.score)) {
        prev.score = meta.score;
        save(state);
      }
      return false;
    }

    const zoneBefore = getProgress().zones.find((z) => z.id === app.zone);
    const record = { clearedAt: new Date().toISOString() };
    for (const k in meta) record[k] = meta[k];
    state.cleared[id] = record;
    save(state);

    const progress = getProgress();
    const zoneAfter = progress.zones.find((z) => z.id === app.zone);
    showStampToast(app, progress, !zoneBefore.complete && zoneAfter.complete ? zoneAfter : null);
    refresh();
    return true;
  }

  function resetProgress() {
    const ok = window.confirm("スタンプ帳の記録をすべてリセットします。よろしいですか？\n（この操作は取り消せません）");
    if (!ok) return false;
    memoryStore = emptyState();
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      /* noop */
    }
    refresh();
    return true;
  }

  /* ------------------------------------------------------------------
     4. トースト（スタンプ押印演出）
     ------------------------------------------------------------------ */
  let toastTimer = null;

  function showStampToast(app, progress, completedZone) {
    let host = document.getElementById("vam-toast");
    if (!host) {
      host = el("div", { id: "vam-toast", class: "vam-toast", role: "status", "aria-live": "polite" });
      document.body.appendChild(host);
    }
    host.textContent = "";
    const lines = [
      el("p", { class: "vam-toast__title", text: "★ 展示スタンプを獲得しました！" }),
      el("p", { class: "vam-toast__meta", text: app.title + " — " + progress.cleared + " / " + progress.total + " Stamps" }),
    ];
    if (completedZone) {
      lines.push(
        el("p", {
          class: "vam-toast__extra",
          text: "Zone " + completedZone.num + " コンプリート！ 称号「" + completedZone.badge + "」",
        })
      );
    }
    if (progress.cleared === progress.total) {
      lines.push(el("p", { class: "vam-toast__extra", text: "全展示制覇！ 博物館マスターです。" }));
    }
    host.appendChild(el("div", { class: "vam-toast__stamp", "aria-hidden": "true" }, [el("span", { text: "★" })]));
    host.appendChild(el("div", { class: "vam-toast__body" }, lines));

    host.classList.remove("is-visible");
    void host.offsetWidth; // アニメーションを再始動
    host.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => host.classList.remove("is-visible"), completedZone ? 6500 : 4500);
  }

  /* ------------------------------------------------------------------
     5. 共通ヘッダー / フッターの注入（展示ページ）
     ------------------------------------------------------------------ */
  function buildHeader(app) {
    const zone = getZone(app.zone);
    return el("header", { class: "vam-header", id: "vam-header" }, [
      el("div", { class: "vam-header__left" }, [
        el("a", { class: "vam-header__home", href: "index.html", text: "← 仮想天文博物館 トップ" }),
        el("span", { class: "vam-zone-badge", text: "Zone " + zone.num + " · " + zone.title }),
      ]),
      el("p", { class: "vam-header__title", text: app.title }),
      el("div", { class: "vam-header__right" }, [
        el("span", { class: "vam-clear-badge", "data-vam": "clear-badge" }),
        el("span", { class: "vam-stamp-count", "data-vam": "stamp-count" }),
      ]),
    ]);
  }

  function buildFooter(app) {
    const zone = getZone(app.zone);
    const siblings = appsInZone(app.zone);
    const idx = siblings.findIndex((a) => a.id === app.id);
    const prev = idx > 0 ? siblings[idx - 1] : null;
    const next = idx < siblings.length - 1 ? siblings[idx + 1] : null;

    const chips = app.keywords.map((kw) =>
      el("a", {
        class: "vam-dict-chip",
        href: DICT_URL + encodeURIComponent(kw),
        target: "_blank",
        rel: "noopener",
        text: kw,
      })
    );

    function navLink(target, dir) {
      if (!target) {
        return el("a", { class: "vam-pager__link vam-pager__link--home", href: "index.html" }, [
          el("span", { class: "vam-pager__dir", text: dir === "prev" ? "Zone " + zone.num + " のはじまり" : "Zone " + zone.num + " のおわり" }),
          el("span", { class: "vam-pager__title", text: "展示一覧へ戻る" }),
        ]);
      }
      return el("a", { class: "vam-pager__link vam-pager__link--" + dir, href: target.file }, [
        el("span", { class: "vam-pager__dir", text: dir === "prev" ? "← 前の展示へ" : "次の展示へ →" }),
        el("span", { class: "vam-pager__title" }, [
          isCleared(target.id) ? el("span", { class: "vam-pager__star", text: "★ " }) : null,
          target.title,
        ]),
      ]);
    }

    return el("footer", { class: "vam-footer", id: "vam-footer" }, [
      el("div", { class: "vam-footer__inner" }, [
        el("section", { class: "vam-footer__learn", "aria-labelledby": "vam-learn-h" }, [
          el("h2", { class: "vam-footer__h", id: "vam-learn-h", text: "さらに深く学ぶ" }),
          el("p", {
            class: "vam-footer__note",
            text: "理論や数式の詳細は、日本天文学会「天文学辞典」で調べてみましょう（外部サイトが新しいタブで開きます）。",
          }),
          el("div", { class: "vam-dict-chips" }, chips),
        ]),
        el("nav", { class: "vam-pager", "aria-label": "同じゾーンの展示" }, [navLink(prev, "prev"), navLink(next, "next")]),
        el("div", { class: "vam-footer__meta" }, [
          el("span", { text: "Virtual Astronomical Museum" }),
          el("span", { "data-vam": "stamp-count" }),
        ]),
      ]),
    ]);
  }

  /* ------------------------------------------------------------------
     6. index.html: ダッシュボード / ゾーン別カード
     ------------------------------------------------------------------ */
  function renderDashboard(host) {
    const p = getProgress();
    host.textContent = "";
    host.appendChild(
      el("div", { class: "vam-dash__head" }, [
        el("div", {}, [
          el("p", { class: "vam-dash__label", text: "Stamp Book" }),
          el("p", { class: "vam-dash__count" }, [
            el("span", { class: "vam-dash__num", text: String(p.cleared) }),
            " / " + p.total + " スタンプ獲得",
          ]),
        ]),
        el("button", { class: "vam-reset", type: "button", onclick: resetProgress, text: "記録をリセット" }),
      ])
    );
    const bar = el("div", {
      class: "vam-progress",
      role: "progressbar",
      "aria-valuemin": "0",
      "aria-valuemax": String(p.total),
      "aria-valuenow": String(p.cleared),
      "aria-label": "獲得スタンプ",
    });
    const fill = el("div", { class: "vam-progress__fill" });
    fill.style.width = (p.ratio * 100).toFixed(1) + "%";
    bar.appendChild(fill);
    host.appendChild(bar);

    host.appendChild(
      el(
        "ul",
        { class: "vam-zone-badges" },
        p.zones.map((z) =>
          el("li", { class: "vam-zone-title" + (z.complete ? " is-complete" : "") }, [
            el("span", { class: "vam-zone-title__mark", "aria-hidden": "true", text: z.complete ? "★" : String(z.num) }),
            el("span", { class: "vam-zone-title__body" }, [
              el("span", { class: "vam-zone-title__name", text: z.complete ? "称号「" + z.badge + "」" : "Zone " + z.num + " · " + z.title }),
              el("span", { class: "vam-zone-title__count", text: z.cleared + " / " + z.total + (z.complete ? " コンプリート" : " クリア") }),
            ]),
          ])
        )
      )
    );
  }

  function renderZones(host) {
    const state = load();
    host.textContent = "";
    let serial = 0;
    VAM_ZONES.forEach((z) => {
      const apps = appsInZone(z.id);
      const clearedCount = apps.filter((a) => state.cleared[a.id]).length;
      const section = el("section", { class: "vam-zone", id: "zone-" + z.id, "aria-labelledby": "zone-h-" + z.id }, [
        el("header", { class: "vam-zone__head" }, [
          el("p", { class: "vam-zone__en", text: "Zone " + z.num + " — " + z.en }),
          el("h2", { class: "vam-zone__title", id: "zone-h-" + z.id, text: z.title }),
          el("p", { class: "vam-zone__desc", text: z.desc }),
          el("span", { class: "chip", text: clearedCount + " / " + apps.length + " クリア" }),
        ]),
      ]);
      const grid = el("div", { class: "portfolio-grid vam-zone__grid" });
      apps.forEach((a) => {
        serial += 1;
        const done = !!state.cleared[a.id];
        grid.appendChild(
          el("article", { class: "exhibit-card" + (done ? " is-cleared" : ""), "data-app-id": a.id }, [
            el("div", { class: "exhibit-card__visual" }, [
              el("span", { class: "vam-card-num", "aria-hidden": "true", text: pad2(serial) }),
              done ? el("span", { class: "vam-card-stamp", text: "★ CLEARED" }) : null,
            ]),
            el("div", { class: "exhibit-card__content" }, [
              el("div", { class: "exhibit-card__meta", text: "Zone " + z.num + " · 展示 " + pad2(serial) + (done ? " · クリア済" : "") }),
              el("h3", { class: "exhibit-card__title", text: a.title }),
              el("p", { class: "exhibit-card__desc", text: a.desc }),
              el("a", { class: "exhibit-card__link", href: a.file, text: "展示を見る" }),
            ]),
          ])
        );
      });
      section.appendChild(grid);
      host.appendChild(section);
    });
  }

  /* ------------------------------------------------------------------
     7. 状態表示の更新
     ------------------------------------------------------------------ */
  function refresh() {
    const p = getProgress();
    const id = currentAppId();
    const cleared = id ? isCleared(id) : false;

    document.querySelectorAll('[data-vam="stamp-count"]').forEach((n) => {
      n.textContent = p.cleared + " / " + p.total + " Stamps";
    });
    document.querySelectorAll('[data-vam="clear-badge"]').forEach((n) => {
      n.textContent = cleared ? "★ クリア済" : "未クリア";
      n.classList.toggle("is-cleared", cleared);
    });
    const dash = document.getElementById("vam-dashboard");
    if (dash) renderDashboard(dash);
    const zones = document.getElementById("vam-zones");
    if (zones) renderZones(zones);
  }

  function init() {
    const id = currentAppId();
    const app = id ? getApp(id) : null;
    if (id && !app) console.warn("[VAM] data-app-id が VAM_CATALOG に登録されていません:", id);

    if (app) {
      if (!document.getElementById("vam-header")) document.body.insertBefore(buildHeader(app), document.body.firstChild);
      if (!document.getElementById("vam-footer")) document.body.appendChild(buildFooter(app));
    }
    refresh();

    // 別タブでスタンプを獲得した場合も表示を同期
    window.addEventListener("storage", (e) => {
      if (e.key === STORAGE_KEY || e.key === null) refresh();
    });
  }

  window.VAM = {
    catalog: VAM_CATALOG,
    zones: VAM_ZONES,
    getApp: getApp,
    completeMission: completeMission,
    isCleared: isCleared,
    getProgress: getProgress,
    resetProgress: resetProgress,
    refresh: refresh,
  };
  window.VAM_CATALOG = VAM_CATALOG;

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
