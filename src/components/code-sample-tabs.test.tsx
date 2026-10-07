import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CodeSampleTabs, type CodeSampleTab } from './code-sample-tabs';
import { ProtocolSwitch } from './protocol-switch';
import { codeSamples } from '@/content/code-samples';
import englishMessages from '@/i18n/messages/en.json';
import spanishMessages from '@/i18n/messages/es.json';

const tabs: CodeSampleTab[] = [
  {
    id: 'http',
    label: 'HTTP',
    fileName: 'controller.py',
    code: 'return response.json({})',
    highlightedCode: 'return response.json({})',
    command: 'make:http-controller StatusController',
  },
  {
    id: 'orm',
    label: 'ORM',
    fileName: 'user.py',
    code: 'class User(Model): pass',
    highlightedCode: 'class User(Model): pass',
    command: 'make:model User',
  },
];

function renderTabs(sampleTabs = tabs) {
  return render(
    <CodeSampleTabs
      tabs={sampleTabs}
      tabsLabel="Examples"
      copyLabel="Copy code"
      copiedLabel="Copied"
      copyCommandLabel="Copy command"
      commandRunnerLabel="Creation command"
    />,
  );
}

function renderCatalog() {
  const catalog = codeSamples.map((sample) => {
    const code = document.createElement('code');
    code.textContent = sample.code;
    return { ...sample, highlightedCode: code.innerHTML };
  });
  return renderTabs(catalog);
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('code examples', () => {
  it('shows one panel and switches the filename, command, and selected tab', () => {
    renderTabs();
    expect(screen.getByRole('tabpanel', { name: 'HTTP' })).toBeVisible();
    expect(screen.getAllByRole('tabpanel')).toHaveLength(1);

    fireEvent.click(screen.getByRole('tab', { name: 'ORM' }));
    expect(screen.getByRole('tab', { name: 'ORM' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel', { name: 'ORM' })).toBeVisible();
    expect(screen.getByText('user.py')).toBeVisible();
    expect(screen.getByText('python -B reactor make:model User')).toBeVisible();
  });

  it('switches command runners and keeps the selected runner across examples', () => {
    renderTabs();
    expect(
      screen.getByText('python -B reactor make:http-controller StatusController'),
    ).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'orionis' }));
    expect(screen.getByRole('button', { name: 'orionis' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('orionis make:http-controller StatusController')).toBeVisible();

    fireEvent.click(screen.getByRole('tab', { name: 'ORM' }));
    expect(screen.getByText('orionis make:model User')).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'python -B reactor' }));
    expect(screen.getByText('python -B reactor make:model User')).toBeVisible();
    expect(screen.getByRole('tab', { name: 'ORM' })).toHaveAttribute('aria-selected', 'true');
  });

  it('supports arrow-key navigation with wrapping and focus', () => {
    renderTabs();
    fireEvent.keyDown(screen.getByRole('tab', { name: 'HTTP' }), { key: 'ArrowLeft' });
    expect(screen.getByRole('tab', { name: 'ORM' })).toHaveFocus();
    fireEvent.keyDown(screen.getByRole('tab', { name: 'ORM' }), { key: 'ArrowRight' });
    expect(screen.getByRole('tab', { name: 'HTTP' })).toHaveFocus();
  });

  it('supports Home and End keys', () => {
    renderTabs();
    fireEvent.keyDown(screen.getByRole('tab', { name: 'HTTP' }), { key: 'End' });
    expect(screen.getByRole('tab', { name: 'ORM' })).toHaveFocus();
    fireEvent.keyDown(screen.getByRole('tab', { name: 'ORM' }), { key: 'Home' });
    expect(screen.getByRole('tab', { name: 'HTTP' })).toHaveFocus();
  });

  it('copies only the active code, without line numbers or editor labels', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal(
      'navigator',
      Object.assign(Object.create(navigator), { clipboard: { writeText } }),
    );
    renderTabs();
    fireEvent.click(screen.getByRole('tab', { name: 'ORM' }));
    fireEvent.click(screen.getByRole('button', { name: 'Copy code' }));

    await waitFor(() => expect(writeText).toHaveBeenCalledWith(tabs[1].code));
    expect(screen.getByRole('button', { name: 'Copied' })).toBeVisible();
  });

  it.each(['python -B reactor', 'orionis'])(
    'copies the selected generator command using %s',
    async (runner) => {
      const writeText = vi.fn().mockResolvedValue(undefined);
      vi.stubGlobal(
        'navigator',
        Object.assign(Object.create(navigator), { clipboard: { writeText } }),
      );
      renderTabs();
      fireEvent.click(screen.getByRole('button', { name: runner }));
      fireEvent.click(screen.getByRole('tab', { name: 'ORM' }));
      fireEvent.click(screen.getByRole('button', { name: 'Copy command' }));

      await waitFor(() => expect(writeText).toHaveBeenCalledWith(`${runner} ${tabs[1].command}`));
    },
  );

  it('omits command controls when the example has no generator command', () => {
    renderTabs([{ ...tabs[0], command: undefined }]);
    expect(screen.getByRole('tabpanel', { name: 'HTTP' })).toBeVisible();
    expect(screen.queryByRole('group', { name: 'Creation command' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Copy command' })).not.toBeInTheDocument();
  });

  it('renders nothing when there are no examples', () => {
    expect(renderTabs([]).container).toBeEmptyDOMElement();
  });
});

describe('component catalog', () => {
  it('provides ten unique examples with translations in both languages', () => {
    const identifiers = new Set(codeSamples.map((sample) => sample.id));
    expect(codeSamples).toHaveLength(10);
    expect(identifiers.size).toBe(10);
    for (const messages of [englishMessages, spanishMessages]) {
      expect(new Set(Object.keys(messages.Home.examples.labels))).toEqual(identifiers);
    }
    expect(codeSamples.find((sample) => sample.id === 'mcp')).toMatchObject({
      fileName: 'app/mcp/servers/orionis_server.py',
      command: 'make:mcp-server OrionisServer',
      source: 'mcp_server.stub',
    });
  });

  it.each(['python -B reactor', 'orionis'])(
    'shows all ten generator commands using %s without changing their arguments',
    (runner) => {
      renderCatalog();
      fireEvent.click(screen.getByRole('button', { name: runner }));

      for (const sample of codeSamples) {
        fireEvent.click(screen.getByRole('tab', { name: sample.label }));
        expect(screen.getByText(`${runner} ${sample.command}`)).toBeVisible();
        expect(screen.getByRole('button', { name: runner })).toHaveAttribute(
          'aria-pressed',
          'true',
        );
      }
    },
  );

  it('renders and selects the migration and facade examples', () => {
    renderCatalog();
    expect(screen.getAllByRole('tab')).toHaveLength(10);

    fireEvent.click(screen.getByRole('tab', { name: 'Migrations' }));
    expect(screen.getByRole('tabpanel', { name: 'Migrations' })).toHaveTextContent(
      'class CreateSchedulerTasksTable(Migration)',
    );
    fireEvent.click(screen.getByRole('tab', { name: 'Facades' }));
    expect(screen.getByRole('tabpanel', { name: 'Facades' })).toHaveTextContent(
      'getFacadeAccessor',
    );
    expect(
      screen.getByText('python -B reactor make:facade MyService --accessor my-service'),
    ).toBeVisible();
  });
});

describe('server interface preview', () => {
  it('switches between the native Rust interface and ASGI compatibility', () => {
    render(
      <ProtocolSwitch
        labels={{
          label: 'Server interface',
          rsgi: 'Native Granian interface',
          asgi: 'ASGI ecosystem compatibility',
        }}
      />,
    );
    expect(screen.getByRole('button', { name: 'RSGI' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('Native Granian interface')).toBeVisible();
    expect(screen.getByRole('img', { name: 'Granian' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Granian' })).toHaveAttribute(
      'href',
      'https://github.com/emmett-framework/granian',
    );

    fireEvent.click(screen.getByRole('button', { name: 'ASGI' }));
    expect(screen.getByRole('button', { name: 'ASGI' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'RSGI' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByText('ASGI ecosystem compatibility')).toBeVisible();
  });
});
