// ══════════════════════════════════════════════════════════════
// Athenas — RichText: formatação leve das mensagens da Lulu
// Suporta: **negrito**, *itálico*, `código`, listas (- ou 1.) e
// quebras de linha — sem depender de biblioteca externa.
// ══════════════════════════════════════════════════════════════
import type { ReactNode } from "react";

function inline(text: string, keyBase: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**") && p.length > 4) {
      return <strong key={`${keyBase}-${i}`}>{p.slice(2, -2)}</strong>;
    }
    if (p.startsWith("`") && p.endsWith("`") && p.length > 2) {
      return <code key={`${keyBase}-${i}`} className="rich-code">{p.slice(1, -1)}</code>;
    }
    if (p.startsWith("*") && p.endsWith("*") && p.length > 2) {
      return <em key={`${keyBase}-${i}`}>{p.slice(1, -1)}</em>;
    }
    return p;
  });
}

const LIST_RE = /^(\s*)([-•*]|\d+[.)])\s+(.*)$/;

function tableRow(line: string, keyBase: string): ReactNode {
  const cells = line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((c) => c.trim());
  return (
    <div key={keyBase} className="rich-tbl-row">
      {cells.map((c, i) => (
        <span key={i} className="rich-tbl-cell">{inline(c, `${keyBase}-${i}`)}</span>
      ))}
    </div>
  );
}

/** Renderiza texto da Lulu com formatação leve (blocks + inline). */
export function RichText({ text }: { text: string }) {
  const lines = text.split(/\r?\n/);
  const blocks: ReactNode[] = [];
  let list: { ordered: boolean; items: ReactNode[] } | null = null;
  let key = 0;

  const flushList = () => {
    if (!list) return;
    const Tag = list.ordered ? "ol" : "ul";
    blocks.push(
      <Tag key={`l${key++}`} className="rich-list">
        {list.items.map((it, i) => (
          <li key={i}>{it}</li>
        ))}
      </Tag>
    );
    list = null;
  };

  for (const line of lines) {
    const m = line.match(LIST_RE);
    if (m) {
      const ordered = /^\d+[.)]/.test(m[2]);
      if (!list || list.ordered !== ordered) flushList();
      if (!list) list = { ordered, items: [] };
      list.items.push(<span key={list.items.length}>{inline(m[3], `i${key}-${list.items.length}`)}</span>);
      continue;
    }
    flushList();
    const trimmed = line.trim();
    if (!trimmed) continue;
    // separador de tabela / horizontal rule (---, ***, ___)
    if (/^[-*_]{3,}$/.test(trimmed)) {
      blocks.push(<hr key={`hr${key++}`} className="rich-hr" />);
      continue;
    }
    // linha de tabela → linha estilizada
    if (trimmed.startsWith("|")) {
      blocks.push(tableRow(trimmed, `t${key++}`));
      continue;
    }
    // blockquote (> texto)
    if (trimmed.startsWith("> ")) {
      blocks.push(
        <blockquote key={`bq${key++}`} className="rich-quote">
          {inline(trimmed.slice(2), `bq${key}`)}
        </blockquote>
      );
      continue;
    }
    // títulos markdown (## / ### )
    const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      blocks.push(
        <p key={`h${key++}`} className="rich-h" style={{ fontSize: level <= 2 ? '1.05em' : undefined }}>
          {inline(headingMatch[2], `h${key}`)}
        </p>
      );
      continue;
    }
    // bloco de código (```)
    if (trimmed.startsWith("```")) {
      // coleta até o próximo ```
      const codeLines: string[] = [];
      while (lines.length > 0) {
        const next = lines.shift()!.trim();
        if (next.startsWith("```")) break;
        codeLines.push(next);
      }
      blocks.push(
        <pre key={`code${key++}`} className="rich-code-block">
          <code>{codeLines.join("\n")}</code>
        </pre>
      );
      continue;
    }
    blocks.push(<p key={`p${key++}`} className="rich-p">{inline(trimmed, `p${key}`)}</p>);
  }
  flushList();

  return <span className="rich-text">{blocks}</span>;
}
