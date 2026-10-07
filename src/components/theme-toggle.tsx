'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';

const emptySubscribe = () => () => undefined;

interface ThemeToggleProps {
  switchToLightLabel: string;
  switchToDarkLabel: string;
}

export function ThemeToggle({ switchToLightLabel, switchToDarkLabel }: ThemeToggleProps) {
  const { setTheme, theme } = useTheme();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  const isDark = mounted && theme === 'dark';
  const Icon = isDark ? Moon : Sun;
  const switchLabel = isDark ? switchToLightLabel : switchToDarkLabel;

  return (
    <button
      type="button"
      aria-label={switchLabel}
      aria-pressed={isDark}
      title={switchLabel}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="icon-button theme-toggle"
    >
      <Icon size={17} aria-hidden="true" />
    </button>
  );
}
