'use client';

import { Check, Copy } from 'lucide-react';
import { useEffect, useState } from 'react';

interface CopyCodeButtonProps {
  code: string;
  label: string;
  copiedLabel: string;
}

export function CopyCodeButton({ code, label, copiedLabel }: CopyCodeButtonProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;

    const timeoutId = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(timeoutId);
  }, [copied]);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  const Icon = copied ? Check : Copy;

  return (
    <button
      type="button"
      onClick={copyCode}
      aria-label={copied ? copiedLabel : label}
      title={copied ? copiedLabel : label}
      className="icon-button copy-button"
    >
      <Icon size={15} aria-hidden="true" />
    </button>
  );
}
