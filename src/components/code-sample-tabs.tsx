'use client';

import { useRef, useState, type KeyboardEvent } from 'react';
import Image from 'next/image';
import { Terminal } from 'lucide-react';
import { asset } from '@/lib/asset';
import { CopyCodeButton } from './copy-code-button';

export interface CodeSampleTab {
  id: string;
  label: string;
  fileName?: string;
  code: string;
  highlightedCode: string;
  command?: string;
}

interface CodeSampleTabsProps {
  tabs: CodeSampleTab[];
  tabsLabel: string;
  copyLabel: string;
  copiedLabel: string;
  copyCommandLabel?: string;
}

export function CodeSampleTabs({
  tabs,
  tabsLabel,
  copyLabel,
  copiedLabel,
  copyCommandLabel = copyLabel,
}: CodeSampleTabsProps) {
  const [activeTabId, setActiveTabId] = useState(tabs[0]?.id ?? '');
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? tabs[0];

  if (!activeTab) return null;

  function selectTab(index: number) {
    const nextIndex = (index + tabs.length) % tabs.length;
    const nextTab = tabs[nextIndex];

    setActiveTabId(nextTab.id);
    tabRefs.current[nextIndex]?.focus();
  }

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      selectTab(index + 1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      selectTab(index - 1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      selectTab(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      selectTab(tabs.length - 1);
    }
  }

  return (
    <div className="code-editor min-w-0">
      <div className="editor-tabs">
        <div role="tablist" aria-label={tabsLabel} className="editor-tablist">
          {tabs.map((tab, index) => {
            const isSelected = tab.id === activeTab.id;

            return (
              <button
                key={tab.id}
                ref={(element) => {
                  tabRefs.current[index] = element;
                }}
                id={`${tab.id}-tab`}
                type="button"
                role="tab"
                aria-selected={isSelected}
                aria-controls={`${tab.id}-panel`}
                tabIndex={isSelected ? 0 : -1}
                onClick={() => setActiveTabId(tab.id)}
                onKeyDown={(event) => handleTabKeyDown(event, index)}
                className="editor-tab"
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="editor-filebar">
        <div className="editor-filename">
          <Image src={asset('/python-logo.svg')} alt="" width={16} height={16} />
          <span>{activeTab.fileName ?? activeTab.label}</span>
        </div>
        <span className="editor-language">Python 3.14+</span>
        <CopyCodeButton code={activeTab.code} label={copyLabel} copiedLabel={copiedLabel} />
      </div>

      {tabs.map((tab) => {
        const isSelected = tab.id === activeTab.id;

        return (
          <div
            key={tab.id}
            id={`${tab.id}-panel`}
            role="tabpanel"
            aria-labelledby={`${tab.id}-tab`}
            tabIndex={0}
            hidden={!isSelected}
            className="code-panel"
          >
            <div className="code-body">
              <div className="code-line-numbers" aria-hidden="true">
                {tab.code.split('\n').map((_, index) => (
                  <span key={index}>{index + 1}</span>
                ))}
              </div>
              <pre>
                <code
                  lang="python"
                  className="hljs"
                  dangerouslySetInnerHTML={{ __html: tab.highlightedCode }}
                />
              </pre>
            </div>
          </div>
        );
      })}
      {activeTab.command && (
        <div className="code-command">
          <Terminal size={16} aria-hidden="true" />
          <code>{activeTab.command}</code>
          <CopyCodeButton
            code={activeTab.command}
            label={copyCommandLabel}
            copiedLabel={copiedLabel}
          />
        </div>
      )}
    </div>
  );
}
