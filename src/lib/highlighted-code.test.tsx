import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import hljs from 'highlight.js/lib/core';
import python from 'highlight.js/lib/languages/python';
import { codeSamples } from '@/content/code-samples';
import { highlightedCodeNodes } from './highlighted-code';

afterEach(cleanup);

describe('highlighted code nodes', () => {
  it('preserves nested syntax classes and text in their original order', () => {
    const markup =
      '<span class="hljs-title class_">My<span class="hljs-title function_">Class</span></span> <span class="hljs-keyword vscode-control-flow">return</span> value';
    const { container } = render(<code>{highlightedCodeNodes(markup)}</code>);

    expect(container.textContent).toBe('MyClass return value');
    expect(container.querySelector('span.hljs-title.class_')?.textContent).toBe('MyClass');
    expect(container.querySelector('span.class_ > span.function_')?.textContent).toBe('Class');
    expect(container.querySelector('.hljs-keyword.vscode-control-flow')?.textContent).toBe(
      'return',
    );
  });

  it('decodes escaped code once and keeps HTML-looking source inert', () => {
    const markup =
      '<span class="hljs-string">&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; &#x27;&#39;&apos; &amp;lt;tag&amp;gt;</span>';
    const { container } = render(<code>{highlightedCodeNodes(markup)}</code>);

    expect(container.textContent).toBe("<script>alert(\"x\")</script> & ''' &lt;tag&gt;");
    expect(container.querySelectorAll('script, img, iframe')).toHaveLength(0);
    expect(container.querySelector('span.hljs-string')).toBeInTheDocument();
  });

  it.each([
    '<script>alert(1)</script>',
    '<img src=x onerror="alert(1)">',
    '<span class="hljs-string" onclick="alert(1)">text</span>',
    '<span style="color:red">text</span>',
    '<span class="hljs-string"><a href="javascript:alert(1)">text</a></span>',
    '</span>',
    '<span class="hljs-string">unfinished',
  ])('rejects arbitrary markup, attributes and malformed spans: %s', (markup) => {
    expect(() => highlightedCodeNodes(markup)).toThrow(TypeError);
  });

  it('preserves every character of the full Python example catalog', () => {
    const highlighter = hljs.newInstance();
    highlighter.registerLanguage('python', python);
    for (const sample of codeSamples) {
      const markup = highlighter.highlight(sample.code, { language: 'python' }).value;
      const { container, unmount } = render(
        <pre>
          <code>{highlightedCodeNodes(markup)}</code>
        </pre>,
      );
      expect(container.querySelector('code')?.textContent).toBe(sample.code);
      expect(container.querySelectorAll('span[class^="hljs-"]').length).toBeGreaterThan(0);
      unmount();
    }
  });
});
