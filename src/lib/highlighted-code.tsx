import type { ReactNode } from 'react';

interface SpanFrame {
  className: string;
  offset: number;
  children: ReactNode[];
}

const openingSpan = /^<span class="([A-Za-z_][A-Za-z\d_-]*(?: [A-Za-z_][A-Za-z\d_-]*)*)">/;
const escapedCharacters: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#x27;': "'",
  '&#39;': "'",
  '&apos;': "'",
};

function decodeText(text: string): string {
  return text.replace(/&(?:amp|lt|gt|quot|apos|#x27|#39);/g, (entity) => escapedCharacters[entity]);
}

/** Convert the highlighter's span-only output into React elements on the server. */
export function highlightedCodeNodes(markup: string): ReactNode {
  const nodes: ReactNode[] = [];
  const stack: SpanFrame[] = [];
  let offset = 0;

  function append(node: ReactNode) {
    const parent = stack.at(-1);
    (parent ? parent.children : nodes).push(node);
  }

  while (offset < markup.length) {
    if (markup.startsWith('</span>', offset)) {
      const frame = stack.pop();
      if (!frame) throw new TypeError('Unexpected closing syntax-highlight span.');
      append(
        <span key={frame.offset} className={frame.className}>
          {frame.children}
        </span>,
      );
      offset += '</span>'.length;
    } else if (markup[offset] === '<') {
      const span = openingSpan.exec(markup.slice(offset));
      if (!span) throw new TypeError('Only spans with syntax-highlight classes are supported.');
      stack.push({ className: span[1], offset, children: [] });
      offset += span[0].length;
    } else {
      const nextTag = markup.indexOf('<', offset);
      const end = nextTag === -1 ? markup.length : nextTag;
      append(decodeText(markup.slice(offset, end)));
      offset = end;
    }
  }

  if (stack.length) throw new TypeError('Unclosed syntax-highlight span.');
  return nodes;
}
