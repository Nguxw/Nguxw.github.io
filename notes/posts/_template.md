<!--
  新文章模板（这个文件不会出现在网站上）。
  1. 复制本文件为 notes/posts/<slug>.md，slug 用小写英文和连字符，例如 agent-memory-design
  2. 在 notes/notes.json 里加一条记录：
     必填 slug、date（YYYY-MM-DD）、title；
     可选 summary、title_en、summary_en、tags、draft（显示“撰写中”）、hidden（不发布）
  3. 标题、日期、摘要、标签都写在 notes.json 里，正文这里不用再写一级标题
  4. 运行 node tools/build-notes.mjs 生成页面（写作时可加 --watch），再提交推送
-->

开头一两段，交代这篇想讨论的问题。

## 第一部分

正文。支持常见的 Markdown 语法：**加粗**、*斜体*、`行内代码`、[链接](https://example.com)。

```python
def example():
    return "代码块"
```

> 引用

| 表头 | 表头 |
| --- | --- |
| 内容 | 内容 |

图片放在 notes/images/ 下，引用写成：![说明文字](images/example.png)

## 第二部分

---

## 小结
