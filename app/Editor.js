"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { useState, useEffect, useCallback } from "react";

const MenuButton = ({ onClick, active, children, title }) => (
  <button
    onClick={onClick}
    title={title}
    className="px-2 py-1 rounded transition-all"
    style={{
      fontSize: 12,
      fontWeight: 600,
      background: active ? "#2D2D2D" : "transparent",
      color: active ? "white" : "#999",
    }}
  >
    {children}
  </button>
);

function Toolbar({ editor }) {
  const addLink = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("URL:");
    if (url) editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);
  if (!editor) return null;

  return (
    <div
      className="flex flex-wrap items-center gap-0.5 px-2 py-1.5"
      style={{ borderBottom: "1px solid #F0F0F0", background: "#FAFAF9" }}
    >
      <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} title="Heading 1">H1</MenuButton>
      <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="Heading 2">H2</MenuButton>
      <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="Heading 3">H3</MenuButton>
      <span style={{ width: 1, height: 16, background: "#E8E8E8", margin: "0 4px" }} />
      <MenuButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold"><b>B</b></MenuButton>
      <MenuButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic"><i>I</i></MenuButton>
      <MenuButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline"><u>U</u></MenuButton>
      <span style={{ width: 1, height: 16, background: "#E8E8E8", margin: "0 4px" }} />
      <MenuButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet List">• List</MenuButton>
      <MenuButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Numbered List">1. List</MenuButton>
      <MenuButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Quote">❝</MenuButton>
      <span style={{ width: 1, height: 16, background: "#E8E8E8", margin: "0 4px" }} />
      <MenuButton onClick={addLink} active={editor.isActive("link")} title="Link">🔗</MenuButton>
      <span style={{ width: 1, height: 16, background: "#E8E8E8", margin: "0 4px" }} />
      <MenuButton onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Align Left">←</MenuButton>
      <MenuButton onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Align Center">↔</MenuButton>
      <MenuButton onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Align Right">→</MenuButton>
    </div>
  );
}

export default function ArticleEditor({ article, onSave, onCancel }) {
  const [title, setTitle] = useState(article?.title || "");
  const [pillar, setPillar] = useState(article?.pillar || "rethink");
  const [tags, setTags] = useState(article?.tags?.join(", ") || "");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Underline,
    ],
    content: article?.htmlContent || "<p>Start writing...</p>",
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none",
        style: "min-height:300px;padding:16px;color:#555;font-size:14px;line-height:1.8",
      },
    },
  });

  const PILLARS = {
    rethink: { label: "Rethink", color: "#3B6B9B", lightBg: "#EEF3F8" },
    rediscover: { label: "Rediscover", color: "#E8734A", lightBg: "#FDF0EB" },
    reinvent: { label: "Reinvent", color: "#2D8A6E", lightBg: "#EBF5F1" },
  };

  const handleSave = (status) => {
    if (!title.trim() || !editor) return;
    const html = editor.getHTML();
    // Extract plain text paragraphs for backward compatibility
    const div = typeof document !== "undefined" ? document.createElement("div") : null;
    let paragraphs = [];
    if (div) {
      div.innerHTML = html;
      paragraphs = Array.from(div.querySelectorAll("p,h1,h2,h3,blockquote,li"))
        .map((el) => el.textContent.trim())
        .filter(Boolean);
    }
    onSave({
      id: article?.id || "art_" + Date.now(),
      title: title.trim(),
      pillar,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      htmlContent: html,
      paragraphs,
      status,
      type: "article",
      createdAt: article?.createdAt || new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex gap-2 mb-3">
        {Object.entries(PILLARS).map(([key, p]) => (
          <button
            key={key}
            onClick={() => setPillar(key)}
            className="px-2.5 py-1 rounded-full font-semibold text-xs transition-all"
            style={{
              background: pillar === key ? p.lightBg : "white",
              color: pillar === key ? p.color : "#CCC",
              border: `1.5px solid ${pillar === key ? p.color : "#F0F0F0"}`,
            }}
          >
            {p.label}
          </button>
        ))}
      </div>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Article title..."
        className="w-full text-xl font-bold mb-3 p-3 rounded-xl border focus:outline-none"
        style={{
          fontFamily: "'Instrument Serif',Georgia,serif",
          borderColor: "#F0F0F0",
          color: "#2D2D2D",
        }}
      />
      <div
        className="rounded-xl border overflow-hidden mb-3"
        style={{ borderColor: "#F0F0F0" }}
      >
        <Toolbar editor={editor} />
        <EditorContent editor={editor} />
      </div>
      <input
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        placeholder="Tags (comma separated)..."
        className="w-full px-3 py-2 rounded-xl border focus:outline-none text-sm mb-4"
        style={{ borderColor: "#F0F0F0", color: "#555" }}
      />
      <div className="flex gap-2">
        <button
          onClick={() => handleSave("draft")}
          className="px-5 py-2 rounded-full font-semibold text-sm"
          style={{ border: "1.5px solid #E8734A", color: "#E8734A" }}
        >
          Save Draft
        </button>
        <button
          onClick={() => handleSave("published")}
          className="px-5 py-2 rounded-full font-semibold text-sm"
          style={{
            background: "linear-gradient(135deg,#E8734A,#F4A261)",
            color: "white",
          }}
        >
          Publish
        </button>
        <button
          onClick={onCancel}
          className="px-5 py-2 rounded-full font-semibold text-sm"
          style={{ border: "1.5px solid #F0F0F0", color: "#CCC" }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
