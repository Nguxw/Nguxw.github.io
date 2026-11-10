# nguxw.github.io

个人主页，纯静态站点，由 GitHub Pages 直接托管。双击 `index.html` 即可在本地预览。

## 技术随笔

文章用 Markdown 写，再用一条命令生成静态 HTML（需要 Node.js，无需安装依赖）：

```sh
node tools/build-notes.mjs           # 生成一次
node tools/build-notes.mjs --watch   # 写作时用：保存即重新生成，刷新浏览器就能看到
```

```
notes/
├── notes.json              # ✏️ 文章清单：标题、日期、摘要、标签
├── posts/
│   ├── <slug>.md           # ✏️ 正文（中文）
│   ├── <slug>.en.md        # ✏️ 可选：英文正文
│   └── _template.md        # 新文章模板
├── images/                 # ✏️ 配图，正文里写 ![说明](images/xxx.png)
├── index.html              # ⚙️ 生成：全部随笔（可按标签筛选）
└── <slug>.html             # ⚙️ 生成：文章页
```

✏️ 是你编辑的文件；⚙️ 由脚本生成，不要手改（下次生成会被覆盖）。主页「05 技术随笔」里最新 3 篇的列表也由脚本写入 `index.html` 的 `<!-- notes:latest -->` 标记之间。

### 写一篇新文章

1. 复制 `notes/posts/_template.md` 为 `notes/posts/<slug>.md`，写正文。正文不用写一级标题，`##` 二级标题会自动生成右侧目录。
2. 在 `notes/notes.json` 里加一条：

```json
{
  "slug": "agent-memory-design",
  "date": "2026-11-20",
  "title": "中文标题",
  "title_en": "English title",
  "summary": "一两句中文摘要",
  "summary_en": "One-line English summary",
  "tags": ["Agent", "Memory"]
}
```

3. 运行 `node tools/build-notes.mjs`，然后提交所有改动（包括生成的 HTML）。

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `slug` | 是 | 小写字母、数字、连字符；对应 `posts/<slug>.md` 和 `notes/<slug>.html` |
| `date` | 是 | `YYYY-MM-DD`，决定排序 |
| `title` | 是 | 中文标题 |
| `summary` | 否 | 列表和文章页顶部的摘要 |
| `title_en` / `summary_en` | 否 | 英文界面显示；不写就沿用中文 |
| `tags` | 否 | 标签，可在列表页筛选 |
| `draft` | 否 | `true` 时显示「撰写中」标记 |
| `hidden` | 否 | `true` 时不生成页面，适合还没准备好公开的文章 |

有 `<slug>.en.md` 时，英文界面显示英文正文；没有时显示中文正文，并提示 “only available in Chinese”。

脚本会检查清单格式（slug、日期、缺失的正文文件等），出错时给出中文提示并不写入任何文件。删除或隐藏文章后重新生成，对应的旧页面会被自动删除。

目前的三篇是占位草稿：写完后删掉 `"draft": true`；不需要的从 `notes.json` 删掉对应条目和 `.md` 文件，再重新生成。

Markdown 由 `assets/vendor/marked.min.js`（marked v12.0.2，MIT）解析。
