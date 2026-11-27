# 技術科 授業アプリ集

中学校技術の授業で使えるWebサイトと自作Webアプリを1か所にまとめたポータルサイトです（教員向け）。

## ファイル構成
```
index.html          ポータル（カード一覧・単元の絞り込み・キーワード検索）
data/items.json     掲載一覧 ← 追加するときはここだけ書き足す
assets/             見た目（style.css）と動き（app.js）
apps/<アプリ名>/    自作アプリ（1つにつき1フォルダ）
.nojekyll           GitHub Pagesでそのまま表示するための空ファイル
```

## 掲載を追加する
Claude Codeに「〇〇を授業アプリ集に追加して」と頼めば、`CLAUDE.md` のルールに沿って `data/items.json` に書き足します。

手で追加する場合は、`data/items.json` の `[ ]` の中に次のような1件を足します（前の件の `}` の後ろに `,` を付けるのを忘れずに）。
```json
{
  "name": "名前",
  "description": "何に使えるか（1〜2行）",
  "unit": "D",
  "type": "site",
  "url": "https://example.com/"
}
```
- `unit`: `A` / `B` / `C` / `D` / `other`
- `type`: `app`（自作アプリ）/ `site`（外部サイト）

## 手元で確認する
`index.html` をダブルクリックで開いただけでは一覧が表示されません（ブラウザの制限）。確認するときはフォルダで次を実行し、http://localhost:8000 を開きます。
```
python3 -m http.server 8000
```
