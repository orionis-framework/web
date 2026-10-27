'use client';

import { SiGithub } from '@icons-pack/react-simple-icons';
import { ArrowUpRight, Package, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Locale } from '@/i18n/routing';
import { loadProjectStats, type ProjectStats as Stats } from '@/lib/project-stats';
import { site } from '@/lib/site';

interface ProjectStatsProps {
  initialStats: Stats;
  locale: Locale;
  starsLabel: string;
  versionLabel: string;
  unavailableLabel: string;
}

export function ProjectStats({
  initialStats,
  locale,
  starsLabel,
  versionLabel,
  unavailableLabel,
}: ProjectStatsProps) {
  const [state, setState] = useState({
    stats: initialStats,
    pendingVersion: true,
  });
  const { stats, pendingVersion } = state;

  useEffect(() => {
    const controller = new AbortController();
    loadProjectStats({ signal: controller.signal }).then((latest) => {
      if (controller.signal.aborted) return;
      setState((current) => ({
        stats: {
          stars: latest.stars ?? current.stats.stars,
          version: latest.version ?? current.stats.version,
        },
        pendingVersion: false,
      }));
    });
    return () => controller.abort();
  }, []);

  return (
    <div className="project-stats" aria-live="polite">
      <a href={site.repo} className="project-stat" target="_blank" rel="noreferrer">
        <SiGithub size={23} color="currentColor" aria-hidden="true" />
        <span className="stat-copy">
          <span className="stat-value">
            {stats.stars === null ? 'GitHub' : new Intl.NumberFormat(locale).format(stats.stars)}
            {stats.stars !== null && <Star size={16} aria-hidden="true" />}
          </span>
          <span>{stats.stars === null ? unavailableLabel : starsLabel}</span>
        </span>
        <ArrowUpRight size={16} aria-hidden="true" />
      </a>
      <a
        href={site.pypi}
        className="project-stat"
        target="_blank"
        rel="noreferrer"
        aria-busy={pendingVersion}
      >
        <Package size={25} strokeWidth={1.5} aria-hidden="true" />
        <span className="stat-copy">
          <span className="stat-value">
            {pendingVersion || stats.version === null ? 'PyPI' : `v${stats.version}`}
          </span>
          <span>{!pendingVersion && stats.version === null ? unavailableLabel : versionLabel}</span>
        </span>
        <ArrowUpRight size={16} aria-hidden="true" />
      </a>
    </div>
  );
}
