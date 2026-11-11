# AGENTS.md — Virtual Astronomical Museum (仮想天文博物館) 開発規約

本ドキュメントは、AIエージェントが「Virtual Astronomical Museum」の新規コンテンツ作成、他プロジェクトからのアプリ移植（インポート）、および既存ファイルの改修を行う際に厳守すべき設計思想と技術仕様を定義したものである。作業開始前に必ず本ファイル、`style.css`、`common-ui.js`（未作成の場合は新規構築）、および `.agents/skills/hallmark/SKILL.md` を参照すること。

---

## 1. コア・フィロソフィー（3大原則）

### ① 科学的・天文学的正確性の絶対担保（No Fake Science）
* 初心者や子ども向けにUIや演出を噛み砕く場合でも、**天文学的・物理学的に誤った挙動や記述は一切禁止**する。
* CanvasやSVGの描画・アニメーションにおいて、見た目だけを似せたダミー挙動（適当な乱数や物理的根拠のない線形変化など）でごまかしてはならない。
* 必ず背後にある物理法則・天文学的定義（例：プランクの法則、ウィーンの変位則、ドップラー効果、ケプラーの法則、光学・電波の分解能 $\theta \propto \lambda / D$、逆二乗の法則など）をJavaScriptの計算ロジックとして実装し、コード内コメントに準拠した数式・法則を明記すること。
* 専門用語は正確に用い、誤解を招く比喩は避けること。

### ② インタラクティブ性とゲーミフィケーション（Playful Workbench）
* **長文解説の排除**：画面内に長い説明文を並べないこと。テキストは「操作の目的（ミッション）」「現象の直感的な要点（2〜3文）」「クリア時のフィードバック」に絞り、詳細な理論や数式導出は共通フッターの外部リンク（日本天文学会「天文学辞典」等）に譲る設計とする。
* **ミッション（課題達成型ゲーム）の必須化**：単なる「動かすだけのシミュレーター」で終わらせず、ユーザーが試行錯誤して法則に気づくための**クリア条件付きミッション（ミニゲーム要素）**を必ず1つ以上実装すること。
  * 例：「口径と波長を調整して、ターゲットの連星を分離観測せよ！」
  * 例：「吸収線パズルを照合して、未知の恒星のスペクトル型を特定せよ！」
  * 例：「スイングバイの進入角度を調整し、ボイジャーを木星から土星軌道へ送り出せ！」

### ③ デザインとアーキテクチャの完全統一
* **Vanilla構成**：外部JSフレームワーク（React, Vue等）やビルドツールは使用せず、Vanilla HTML5 / CSS3 / JavaScript で完結させる。ローカル環境（`file://`）でもCORSエラーなく動作する構成とすること。
* **Hallmarkデザインシステムと `style.css` の準拠**：
  * 独自のカラーパレットやインラインスタイルの乱用を禁ずる。必ずルートの `style.css` に定義されたCSS変数（カラートークン、タイポグラフィ、余白、カード・ボタンスタイル）を使用すること。
  * `.agents/skills/hallmark/SKILL.md` および `references/macrostructures/05-workbench.md` の原則に従い、「片側にインタラクティブなCanvas/ビジュアライザー、もう片側にコントロールパネルとミッション表示」という **Workbench（作業台）構造** を基本とすること。

---

## 2. 共通UIと「博物館スタンプラリー」アーキテクチャ（`common-ui.js`）

全HTMLファイルへのヘッダー・フッター直書きによる保守性低下を防ぎ、サイト全体をひとつの回遊型ゲーム教材として機能させるため、ルートの `common-ui.js` で以下の機能を一元管理する。

### 2.1. 展示カタログと3つの学習ゾーン（`VAM_CATALOG`）
`common-ui.js` 内の定数 `VAM_CATALOG` にて全展示のメタデータを管理する。

* **Zone 1: 光と波を調べる（Light & Waves）**
  * `lens` (`lens.html`)：レンズと結像のしくみ / Keywords: `["レンズ", "焦点距離", "屈折"]`
  * `camera` (`camera.html`)：カメラと露出・センサー / Keywords: `["天体写真", "固体撮像素子", "露出"]`
  * `spectrum` (`spectrum.html`)：光のスペクトルと分光 / Keywords: `["スペクトル", "フラウンホーファー線", "分光観測"]`
  * `spectral_class` (`spectral_class.html`)：恒星のスペクトル分類 / Keywords: `["スペクトル分類", "HR図", "黒体放射"]`
  * `fourier` (`fourier-transform.html`)：波の合成とフーリエ変換 / Keywords: `["フーリエ変換", "波長", "周波数"]`
* **Zone 2: 望遠鏡のしくみ（Telescopes & Interferometry）**
  * `telescope` (`telescope.html`)：光学望遠鏡のしくみ / Keywords: `["望遠鏡", "口径", "分解能"]`
  * `radio_telescope` (`radio_telescope.html`)：電波望遠鏡のしくみ / Keywords: `["電波望遠鏡", "パラボラアンテナ", "電波天文学"]`
  * `interferometry` (`interferometry.html`)：電波干渉計の原理 / Keywords: `["電波干渉計", "基線長", "空間周波数"]`
  * `vlbi` (`vlbi.html`)：VLBI（超長基線電波干渉法） / Keywords: `["VLBI", "イベント・ホライズン・テレスコープ", "開口合成"]`
* **Zone 3: 宇宙を測る・旅する（Cosmic Scale & Exploration）**
  * `cal` (`cal.html`)：天体の運行と暦 / Keywords: `["暦", "太陽暦", "太陰太陽暦", "閏年"]`
  * `distance_ladder` (`cosmological_distance_ladder.html`)：宇宙の距離梯子 / Keywords: `["宇宙の距離梯子", "年周視差", "セファイド変光星", "Ia型超新星"]`
  * `voyager` (`Voyager.html`)：ボイジャー計画とスイングバイ / Keywords: `["ボイジャー", "スイングバイ", "宇宙速度"]`

### 2.2. 自動DOM注入の仕様
各展示HTMLの `<body data-app-id="アプリID">` を検知し、`common-ui.js` が自動で以下を挿入する（したがって**各HTML内に個別のナビゲーションバーやフッターを直書きしてはならない**）。
1. **共通ヘッダー（`.vam-header`）**：トップ（`index.html`）への戻る導線、所属ゾーンバッジ、展示タイトル、現在のクリア状態バッジ（「未クリア」/「★ クリア済」）、および全体のスタンプ獲得数（例：`5 / 12 Stamps`）。
2. **共通フッター（`.vam-footer`）**：
   * **「さらに深く学ぶ」外部リンク集**：カタログの `Keywords` から日本天文学会「天文学辞典」（`https://astro-dic.jp/?s={キーワード}`）への検索リンクチップを自動生成する。
   * **前後ナビゲーション**：同一ゾーン内の前の展示・次の展示への移動リンク。

### 2.3. スタンプラリー状態管理API（`window.VAM`）
ブラウザの `localStorage`（キー：`vam_progress_v1`）を用いてクリア状況を永続化する。
* `VAM.completeMission(appId, meta)`：
  * 各展示アプリのミッション達成時に呼び出す。`appId` 省略時は `document.body.dataset.appId` を自動使用する。
  * 初回クリア時は画面上にスタンプ獲得トースト通知（「★ 展示スタンプを獲得しました！」）をアニメーション表示し、ヘッダーのスタンプ数を即時更新する。
* `VAM.isCleared(appId)`：指定アプリのクリア状態を返す。
* `VAM.getProgress()`：全体およびゾーン別のクリア数・達成率を返す。
* `VAM.resetProgress()`：進捗データを初期化する。

---

## 3. 各展示HTMLの基本テンプレート

新規作成およびインポート時は、以下のHTML骨格を厳守すること。

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[展示タイトル] | Virtual Astronomical Museum</title>
  <link rel="stylesheet" href="style.css">
  <script src="common-ui.js" defer></script>
</head>
<body data-app-id="[VAM_CATALOGのid]">
  <!-- 共通ヘッダーは common-ui.js により body 先頭へ自動挿入される -->

  <main class="vam-workbench">
    <!-- 左（または上）：インタラクティブ描画領域 -->
    <section class="vam-stage">
      <canvas id="sim-canvas"></canvas>
      <!-- 必要に応じてオーバーレイUIやステータス表示 -->
    </section>

    <!-- 右（または下）：ミッション＆コントロールパネル -->
    <aside class="vam-panel">
      <div class="vam-mission-card">
        <span class="vam-mission-label">MISSION</span>
        <h2 class="vam-mission-title">[ミッションのタイトル]</h2>
        <p class="vam-mission-desc">[2〜3文の簡潔な操作目的・ヒント]</p>
      </div>

      <div class="vam-controls">
        <!-- スライダー、ボタン等の操作系 -->
      </div>
    </aside>
  </main>

  <!-- 共通フッター（天文学辞典リンク・前後ナビ）は common-ui.js により body 末尾へ自動挿入される -->

  <script>
    // 1. 準拠する物理法則・数式の定義（コメントで明記）
    // 2. シミュレーションおよびCanvas描画ロジック
    // 3. ミッションクリア判定：条件達成時に以下を呼び出す
    //    if (window.VAM) window.VAM.completeMission();
  </script>
</body>
</html>

```

---

## 4. タスク別ワークフロー

### A. 新規展示アプリを作成する場合

1. **設計**：テーマとなる天文現象の「正確な物理モデル（数式）」と、ユーザーが楽しく法則を発見できる「ミッション（クリア条件）」を策定する。
2. **カタログ登録**：`common-ui.js` の `VAM_CATALOG` 内の適切なゾーン（Zone 1〜3）に、新規アプリのID、ファイル名、タイトル、概要、天文学辞典用の関連キーワード（2〜4語）を追加する。
3. **実装**：セクション3のテンプレートと `style.css` を用いてHTML/JSを作成し、ミッション達成時に `window.VAM.completeMission()` が発火するように実装する。
4. **検証**：科学的誤りがないか、Hallmarkのアンチパターン（AI特有の過剰な装飾や崩れた余白）に抵触していないか、スタンプ獲得が正常に動作するかを確認する。

### B. 他プロジェクトからアプリをインポート（移植）する場合

1. **ロジック抽出と科学考証**：インポート元のソースコードから計算ロジックとCanvas/SVG描画処理のみを抽出し、物理的・天文学的な誤りや不適切な近似がないか検証・修正する。
2. **UIの完全リスキン**：インポート元の独自HTML構造やCSSはすべて破棄し、`style.css` のクラス体系とセクション3のWorkbenchテンプレートに完全に組み替える。
3. **ゲーミフィケーションの付与**：元のアプリが単なるシミュレーターや図解である場合、具体的なクリア目標を持つ「ミッション」を追加し、達成時に `window.VAM.completeMission()` を呼び出すよう改修する。
4. **カタログ登録**：`common-ui.js` の `VAM_CATALOG`（および `index.html` が静的リストを持つ場合は該当ゾーン）にエントリを追加する。