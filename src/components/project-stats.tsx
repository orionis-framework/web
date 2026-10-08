'use client';

import { SiGithub } from '@icons-pack/react-simple-icons';
import { ArrowUpRight, FlaskConical, Package, Star } from 'lucide-react';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Locale } from '@/i18n/routing';
import { isPreviewVersion, loadProjectStats, type ProjectStats as Stats } from '@/lib/project-stats';
import { site } from '@/lib/site';

interface ProjectStatsProps {
  locale: Locale;
  starsLabel: string;
  versionLabel: string;
  unavailableLabel: string;
}

const ProjectStatsContext = createContext<Stats | null>(null);

export function ProjectStatsProvider({
  initialStats,
  children,
}: {
  initialStats: Stats;
  children: ReactNode;
}) {
  const [stats, setStats] = useState(initialStats);

  useEffect(() => {
    const controller = new AbortController();
    loadProjectStats({ signal: controller.signal }).then((latest) => {
      if (controller.signal.aborted) return;
      setStats((current) => ({
        stars: latest.stars ?? current.stars,
        version: latest.version ?? current.version,
      }));
    });
    return () => controller.abort();
  }, []);

  return <ProjectStatsContext.Provider value={stats}>{children}</ProjectStatsContext.Provider>;
}

function useProjectStats() {
  const stats = useContext(ProjectStatsContext);
  if (!stats) throw new Error('Project statistics require ProjectStatsProvider.');
  return stats;
}

export function PreviewNotice({ message }: { message: string }) {
  const stats = useProjectStats();
  if (!isPreviewVersion(stats.version)) return null;

  return (
    <div className="preview-notice" role="status">
      <FlaskConical size={14} aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}

export function ProjectStats({
  locale,
  starsLabel,
  versionLabel,
  unavailableLabel,
}: ProjectStatsProps) {
  const stats = useProjectStats();

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
      <a href={site.pypi} className="project-stat" target="_blank" rel="noreferrer">
        <Package size={25} strokeWidth={1.5} aria-hidden="true" />
        <span className="stat-copy">
          <span className="stat-value">
            {stats.version === null ? 'PyPI' : `v${stats.version}`}
          </span>
          <span>{stats.version === null ? unavailableLabel : versionLabel}</span>
        </span>
        <ArrowUpRight size={16} aria-hidden="true" />
      </a>
    </div>
  );
}
