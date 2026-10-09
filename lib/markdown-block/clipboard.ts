/** Convert HTML clipboard content (e.g. ChatGPT) into markdown source. */
export function convertHtmlToMarkdown(html: string): string {
  if (typeof document === "undefined") return "";

  const doc = new DOMParser().parseFromString(html, "text/html");
  const lines = renderNode(doc.body).filter((line, index, all) => {
    if (line !== "") return true;
    return index > 0 && all[index - 1] !== "";
  });

  return lines.join("\n").trim();
}

function renderNode(node: Node): string[] {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent?.replace(/\s+/g, " ") ?? "";
    return text ? [text] : [];
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return [];

  const el = node as HTMLElement;
  const tag = el.tagName.toLowerCase();

  switch (tag) {
    case "h1":
      return [`# ${inlineText(el)}`];
    case "h2":
      return [`## ${inlineText(el)}`];
    case "h3":
      return [`### ${inlineText(el)}`];
    case "h4":
      return [`#### ${inlineText(el)}`];
    case "h5":
      return [`##### ${inlineText(el)}`];
    case "h6":
      return [`###### ${inlineText(el)}`];
    case "p":
      return blockText(el);
    case "br":
      return [""];
    case "hr":
      return ["---"];
    case "blockquote": {
      const body = blockText(el)
        .join("\n")
        .split("\n")
        .map((line) => (line ? `> ${line}` : ">"))
        .join("\n");
      return body ? [body] : [];
    }
    case "pre": {
      const code = el.querySelector("code");
      const language =
        code?.className.match(/language-([\w-]+)/)?.[1] ??
        code?.getAttribute("data-language") ??
        "";
      const text = (code ?? el).textContent?.replace(/\n$/, "") ?? "";
      return text ? [`\`\`\`${language}`, text, "```"] : [];
    }
    case "code":
      return [`\`${el.textContent ?? ""}\``];
    case "ul":
      return listItems(el, false);
    case "ol":
      return listItems(el, true);
    case "table":
      return [renderTable(el)];
    case "div":
    case "article":
    case "section":
    case "main":
    case "body":
      return renderChildren(el);
    default:
      return renderChildren(el);
  }
}

function renderChildren(el: HTMLElement): string[] {
  const lines: string[] = [];
  el.childNodes.forEach((child) => {
    lines.push(...renderNode(child));
  });
  return lines;
}

function blockText(el: HTMLElement): string[] {
  const text = inlineText(el).trim();
  return text ? [text] : [];
}

function inlineText(el: HTMLElement): string {
  let out = "";
  el.childNodes.forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      out += child.textContent ?? "";
      return;
    }
    if (child.nodeType !== Node.ELEMENT_NODE) return;
    const childEl = child as HTMLElement;
    const tag = childEl.tagName.toLowerCase();
    const inner = inlineText(childEl);
    if (tag === "strong" || tag === "b") out += `**${inner}**`;
    else if (tag === "em" || tag === "i") out += `*${inner}*`;
    else if (tag === "code") out += `\`${inner}\``;
    else if (tag === "a") {
      const href = childEl.getAttribute("href");
      out += href ? `[${inner}](${href})` : inner;
    } else if (tag === "br") out += "\n";
    else out += inner;
  });
  return out.replace(/\s+/g, " ").trim();
}

function listItems(list: HTMLElement, ordered: boolean): string[] {
  const items = Array.from(list.children).filter(
    (child) => child.tagName.toLowerCase() === "li",
  );
  return items.flatMap((item, index) => {
    const prefix = ordered ? `${index + 1}. ` : "- ";
    const lines = renderNode(item);
    if (lines.length === 0) return [`${prefix}`];
    return [`${prefix}${lines[0]}`, ...lines.slice(1)];
  });
}

function renderTable(table: HTMLElement): string {
  const rows = Array.from(table.querySelectorAll("tr"));
  if (rows.length === 0) return "";

  const matrix = rows.map((row) =>
    Array.from(row.querySelectorAll("th, td")).map((cell) =>
      inlineText(cell as HTMLElement).replace(/\|/g, "\\|"),
    ),
  );
  const width = Math.max(...matrix.map((row) => row.length), 0);
  const normalized = matrix.map((row) => {
    const copy = [...row];
    while (copy.length < width) copy.push("");
    return copy;
  });

  const header = normalized[0];
  const divider = header.map(() => "---");
  const body = normalized.slice(1);

  return [
    `| ${header.join(" | ")} |`,
    `| ${divider.join(" | ")} |`,
    ...body.map((row) => `| ${row.join(" | ")} |`),
  ].join("\n");
}

function plainLooksLikeMarkdown(text: string): boolean {
  return (
    /```/.test(text) ||
    /^#{1,6}\s/m.test(text) ||
    /^\s*[-*+]\s/m.test(text) ||
    /^\s*\d+\.\s/m.test(text) ||
    /\|.+\|/.test(text)
  );
}

function plainHasStructure(text: string): boolean {
  return text.includes("\n");
}

/** Prefer markdown/plain source; fall back to HTML conversion for rich clipboard pastes. */
export function extractPastedMarkdown(data: DataTransfer): string {
  const plain = data.getData("text/plain").replace(/\r\n/g, "\n");
  const html = data.getData("text/html");

  if (
    plain.trim() &&
    plainHasStructure(plain) &&
    (plainLooksLikeMarkdown(plain) || !html)
  ) {
    return plain;
  }

  if (html.trim()) {
    const converted = convertHtmlToMarkdown(html);
    if (converted.trim()) return converted;
  }

  return plain;
}
