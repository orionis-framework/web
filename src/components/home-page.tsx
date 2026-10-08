import { SiGithub } from '@icons-pack/react-simple-icons';
import Image from 'next/image';
import {
  ArrowLeftRight,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Blocks,
  Bot,
  Box,
  CalendarDays,
  Check,
  Database,
  FileCog,
  FlaskConical,
  FolderOpen,
  Gauge,
  Gem,
  Layers,
  Languages,
  KeyRound,
  Mail,
  Puzzle,
  Radio,
  RefreshCw,
  Server,
  ShieldCheck,
  Sparkles,
  Terminal,
  UsersRound,
  Workflow,
  type LucideIcon,
} from 'lucide-react';
import hljs from 'highlight.js/lib/core';
import python from 'highlight.js/lib/languages/python';
import { CodeSampleTabs, type CodeSampleTab } from './code-sample-tabs';
import { ArchitectureScene } from './architecture-scene';
import { CopyCodeButton } from './copy-code-button';
import { ProjectStats, ProjectStatsProvider } from './project-stats';
import { ProtocolSwitch } from './protocol-switch';
import { SiteHeader } from './site-header';
import { ecosystemFeatures, featureContent, getFeatures, type IconName } from '@/content/features';
import { codeSamples } from '@/content/code-samples';
import type { Locale } from '@/i18n/routing';
import { asset } from '@/lib/asset';
import { loadProjectStats } from '@/lib/project-stats';
import { site } from '@/lib/site';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';

const syntaxHighlighter = hljs.newInstance();
syntaxHighlighter.registerLanguage('python', python);

const lightModernControlKeywords = new Set([
  'as',
  'assert',
  'await',
  'break',
  'case',
  'continue',
  'del',
  'elif',
  'else',
  'except',
  'finally',
  'for',
  'from',
  'if',
  'import',
  'lazy',
  'match',
  'pass',
  'raise',
  'return',
  'try',
  'while',
  'with',
  'yield',
]);

const lightModernStorageKeywords = new Set([
  'async',
  'class',
  'def',
  'global',
  'lambda',
  'nonlocal',
]);

const lightModernLogicalOperators = new Set(['and', 'in', 'is', 'not', 'or']);

const lightModernBuiltinTypes = new Set([
  'bool',
  'bytearray',
  'bytes',
  'classmethod',
  'complex',
  'dict',
  'enumerate',
  'filter',
  'float',
  'frozendict',
  'frozenset',
  'int',
  'list',
  'map',
  'memoryview',
  'object',
  'property',
  'range',
  'reversed',
  'set',
  'slice',
  'staticmethod',
  'str',
  'super',
  'tuple',
  'type',
  'zip',
]);

function styleUnclassifiedPythonCalls(highlightedCode: string) {
  const spans = /<span class="([^"]+)">|<\/span>|([^<]+)/g;
  const activeScopes: string[] = [];
  let styledCode = '';

  for (const match of highlightedCode.matchAll(spans)) {
    const [markup, openedScope, text] = match;

    if (openedScope) {
      activeScopes.push(openedScope);
      styledCode += markup;
      continue;
    }

    if (markup === '</span>') {
      activeScopes.pop();
      styledCode += markup;
      continue;
    }

    if (text === undefined) continue;

    const isProtectedText = activeScopes.some(
      (scope) => scope === 'hljs-string' || scope === 'hljs-comment' || scope === 'hljs-meta',
    );

    styledCode += isProtectedText
      ? text
      : text.replace(
          /(^|[^A-Za-z0-9_])([A-Za-z_][A-Za-z0-9_]*)(?=\s*\()/g,
          (_match, prefix: string, name: string) => {
            const scope = /^[A-Z]/.test(name) ? 'hljs-title class_' : 'hljs-title function_';
            return `${prefix}<span class="${scope}">${name}</span>`;
          },
        );
  }

  return styledCode;
}

function applyLightModernPythonScopes(highlightedCode: string) {
  const scopedCode = highlightedCode
    .replace(
      /<span class="hljs-keyword">([A-Za-z_][A-Za-z0-9_]*)<\/span>/g,
      (markup, token: string) => {
        const scope = lightModernControlKeywords.has(token)
          ? 'vscode-control-flow'
          : lightModernStorageKeywords.has(token)
            ? 'vscode-storage'
            : lightModernLogicalOperators.has(token)
              ? 'vscode-logical-operator'
              : undefined;

        return scope ? `<span class="hljs-keyword ${scope}">${token}</span>` : markup;
      },
    )
    .replace(
      /<span class="hljs-built_in">([A-Za-z_][A-Za-z0-9_]*)<\/span>/g,
      (markup, token: string) =>
        lightModernBuiltinTypes.has(token)
          ? `<span class="hljs-built_in vscode-type">${token}</span>`
          : markup,
    );

  return styleUnclassifiedPythonCalls(scopedCode);
}

const featureIcons: Record<IconName, LucideIcon> = {
  server: Server,
  layers: Layers,
  gauge: Gauge,
  flask: FlaskConical,
  terminal: Terminal,
  fileCog: FileCog,
  workflow: Workflow,
  shieldCheck: ShieldCheck,
  box: Box,
  blocks: Blocks,
  puzzle: Puzzle,
  refreshCw: RefreshCw,
  bot: Bot,
  badgeCheck: BadgeCheck,
  gem: Gem,
  database: Database,
  radio: Radio,
  mail: Mail,
  calendar: CalendarDays,
  key: KeyRound,
  folder: FolderOpen,
  languages: Languages,
};

export default async function HomePage({ locale }: { locale: Locale }) {
  const [translate, messages, stats] = await Promise.all([
    getTranslations({ locale, namespace: 'Home' }),
    getMessages({ locale }),
    loadProjectStats({ cache: 'force-cache' }),
  ]);
  const features = getFeatures();
  const codeTabs: CodeSampleTab[] = codeSamples.map((sample) => ({
    ...sample,
    label: translate(`examples.labels.${sample.id}`),
    highlightedCode: applyLightModernPythonScopes(
      syntaxHighlighter.highlight(sample.code, { language: 'python' }).value,
    ),
  }));
  const docsUrl = site.docs.replace('/en/', `/${locale}/`);
  const installCommand = site.installCommand;
  const examplePoints = [
    { key: 'types', icon: BadgeCheck },
    { key: 'async', icon: Workflow },
    { key: 'di', icon: Box },
  ];
  const pipeline = [
    { key: 'request', icon: Server },
    { key: 'route', icon: Workflow },
    { key: 'middleware', icon: Layers },
    { key: 'controller', icon: Box },
    { key: 'response', icon: ArrowUpRight },
  ];
  const architectureDetails = [
    { key: 'scope', icon: Box },
    { key: 'compile', icon: Gauge },
    { key: 'contracts', icon: Puzzle },
  ];
  const footerGroups = [
    {
      label: translate('footer.learn'),
      links: [
        { label: translate('nav.docs'), href: docsUrl },
        { label: translate('footer.api'), href: site.apiReference },
        {
          label: translate('footer.installation'),
          href: new URL(`/${locale}/getting-started/installation/`, docsUrl).href,
        },
      ],
    },
    {
      label: translate('footer.project'),
      links: [
        { label: 'GitHub', href: site.repo },
        { label: 'PyPI', href: site.pypi },
        { label: translate('footer.releases'), href: `${site.repo}/releases` },
        {
          label: translate('footer.thirdPartyNotices'),
          href: asset(site.granian.license),
        },
      ],
    },
    {
      label: translate('footer.community'),
      links: [
        {
          label: translate('footer.contribute'),
          href: new URL(`/${locale}/contribute/guide/`, docsUrl).href,
        },
        { label: translate('footer.issues'), href: `${site.repo}/issues` },
        {
          label: translate('footer.contributors'),
          href: new URL(`/${locale}/contribute/contributors/`, docsUrl).href,
        },
      ],
    },
  ];

  const page = (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div lang={locale} className="site-shell">
        <a className="skip-link" href="#main-content">
          {translate('nav.skip')}
        </a>
        <SiteHeader locale={locale} />
        <main id="main-content">
          <section className="hero-section" aria-labelledby="hero-title">
            <ArchitectureScene
              labels={{
                description: translate('scene.description'),
                pause: translate('scene.pause'),
                play: translate('scene.play'),
                expand: translate('scene.expand'),
                collapse: translate('scene.collapse'),
                reset: translate('scene.reset'),
              }}
            />
            <div className="page-container hero-inner">
              <div className="hero-copy">
                <p className="eyebrow">
                  <span className="status-mark" aria-hidden="true" />
                  {translate('hero.eyebrow')}
                </p>
                <h1 id="hero-title">
                  Orionis{' '}
                  <span>
                    Framework
                    <span className="brand-dot" aria-hidden="true">
                      .
                    </span>
                  </span>
                </h1>
                <p className="hero-tagline">
                  {translate('hero.taglineFirst')}
                  <br />
                  <span>{translate('hero.taglineSecond')}</span>
                </p>
                <p className="hero-description">{translate('hero.description')}</p>
                <div className="hero-actions">
                  <a href={docsUrl} className="button button-primary">
                    {translate('hero.docsCta')}
                    <ArrowRight size={17} aria-hidden="true" />
                  </a>
                  <a
                    href={site.repo}
                    className="button button-secondary"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <SiGithub size={18} color="currentColor" aria-hidden="true" />
                    {translate('hero.githubCta')}
                  </a>
                </div>
                <div className="hero-meta">
                  <span>
                    <BadgeCheck size={16} aria-hidden="true" />
                    {translate('hero.engine')}
                  </span>
                  <span>Python 3.14+</span>
                </div>
              </div>
            </div>
            <div className="hero-annotation" aria-hidden="true">
              <span>APPLICATION STACK</span>
              <span>ASGI / RSGI</span>
            </div>
          </section>

          <div className="stack-strip">
            <div className="page-container stack-inner">
              <span className="stack-lead">
                <Sparkles size={19} aria-hidden="true" />
                {translate('proof.title')}
              </span>
              <div className="stack-list">
                {['HTTP', 'WebSocket', 'SSE', 'Realtime', 'ORM', 'Cache', 'Queues', 'MCP'].map(
                  (name) => (
                    <span key={name}>{name}</span>
                  ),
                )}
              </div>
            </div>
          </div>

          <section
            id="examples"
            className="examples-section section-space"
            aria-labelledby="examples-title"
          >
            <div className="page-container examples-layout">
              <div className="examples-copy">
                <p className="eyebrow">{translate('examples.eyebrow')}</p>
                <h2 id="examples-title">
                  {translate('examples.titleFirst')}
                  <br />
                  <span className="text-accent">{translate('examples.titleSecond')}</span>
                </h2>
                <p className="section-description">{translate('examples.description')}</p>
                <ul className="example-points">
                  {examplePoints.map(({ key, icon: Icon }) => (
                    <li key={key}>
                      <Icon size={21} strokeWidth={1.6} aria-hidden="true" />
                      <div>
                        <strong>{translate(`examples.points.${key}.title`)}</strong>
                        <p>{translate(`examples.points.${key}.description`)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <CodeSampleTabs
                tabs={codeTabs}
                tabsLabel={translate('examples.tabsLabel')}
                copyLabel={translate('examples.copyCode')}
                copiedLabel={translate('examples.copied')}
                copyCommandLabel={translate('examples.copyCommand')}
                commandRunnerLabel={translate('examples.commandRunner')}
              />
            </div>
          </section>

          <section
            id="features"
            className="capabilities-section section-space"
            aria-labelledby="capabilities-title"
          >
            <div className="page-container">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">{translate('features.eyebrow')}</p>
                  <h2 id="capabilities-title">
                    {translate('features.titleFirst')}
                    <br />
                    <span className="text-accent">{translate('features.titleSecond')}</span>
                  </h2>
                </div>
                <p className="section-description">{translate('features.description')}</p>
              </div>
              <div className="capabilities-grid">
                {features.map((feature, index) => {
                  const Icon = featureIcons[feature.icon];
                  const content = featureContent(feature, locale);
                  return (
                    <article
                      key={feature.slug}
                      id={`${feature.slug}-capability`}
                      className={`capability-card${index < 2 ? ' capability-featured' : ''}`}
                      data-accent={feature.accent}
                    >
                      <div className="capability-heading">
                        <Icon size={25} strokeWidth={1.6} aria-hidden="true" />
                        <span>{content.tagline}</span>
                        <span className="capability-index" aria-hidden="true">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                      </div>
                      <h3>{content.title}</h3>
                      <p>{content.summary}</p>
                      {feature.slug === 'http' && (
                        <ProtocolSwitch
                          labels={{
                            label: translate('transport.label'),
                            rsgi: translate('transport.rsgi'),
                            asgi: translate('transport.asgi'),
                          }}
                        />
                      )}
                      {feature.slug === 'realtime' && (
                        <div className="realtime-preview" aria-hidden="true">
                          <div className="realtime-flow">
                            <span>
                              <UsersRound size={28} />
                              Clients
                            </span>
                            <ArrowLeftRight size={22} />
                            <span className="hub-node">
                              <Radio size={29} />
                              Hub
                            </span>
                            <ArrowLeftRight size={22} />
                            <span>
                              <Layers size={28} />
                              Groups
                            </span>
                          </div>
                          <div className="wire-labels">
                            <code>@remote</code>
                            <span>JSON</span>
                            <span>MessagePack</span>
                          </div>
                        </div>
                      )}
                      <ul className="capability-bullets">
                        {content.bullets.map((bullet) => (
                          <li key={bullet}>
                            <Check size={14} strokeWidth={2} aria-hidden="true" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>

          <section
            id="architecture"
            className="architecture-section section-space"
            aria-labelledby="architecture-title"
          >
            <div className="page-container">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">{translate('architecture.eyebrow')}</p>
                  <h2 id="architecture-title">
                    {translate('architecture.titleFirst')}
                    <br />
                    <span className="text-accent">{translate('architecture.titleSecond')}</span>
                  </h2>
                </div>
                <p className="section-description">{translate('architecture.description')}</p>
              </div>
              <ol className="request-pipeline" aria-label={translate('architecture.pipelineLabel')}>
                {pipeline.map(({ key, icon: Icon }, index) => (
                  <li key={key}>
                    <span className="pipeline-number" aria-hidden="true">
                      0{index + 1}
                    </span>
                    <Icon size={28} strokeWidth={1.4} aria-hidden="true" />
                    <strong>{translate(`architecture.steps.${key}`)}</strong>
                    {index < pipeline.length - 1 && (
                      <ArrowRight className="pipeline-arrow" size={21} aria-hidden="true" />
                    )}
                  </li>
                ))}
              </ol>
              <div className="architecture-details">
                {architectureDetails.map(({ key, icon: Icon }) => (
                  <article key={key}>
                    <h3>
                      <Icon size={19} aria-hidden="true" />
                      {translate(`architecture.details.${key}.title`)}
                    </h3>
                    <p>{translate(`architecture.details.${key}.description`)}</p>
                  </article>
                ))}
              </div>
              <div className="bootstrap-note">
                <FileCog size={17} aria-hidden="true" />
                <code>bootstrap/app.py</code>
                <span>{translate('architecture.bootstrap')}</span>
              </div>
            </div>
          </section>

          <section
            id="ecosystem"
            className="ecosystem-section section-space"
            aria-labelledby="ecosystem-title"
          >
            <div className="page-container">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">{translate('ecosystem.eyebrow')}</p>
                  <h2 id="ecosystem-title">{translate('ecosystem.title')}</h2>
                </div>
                <p className="section-description">{translate('ecosystem.description')}</p>
              </div>
              <div className="ecosystem-grid">
                {ecosystemFeatures.map((feature) => {
                  const Icon = featureIcons[feature.icon];
                  const content = feature.content[locale];
                  return (
                    <article key={feature.slug} className="ecosystem-item">
                      <Icon size={24} strokeWidth={1.5} aria-hidden="true" />
                      <div>
                        <h3>{content.title}</h3>
                        <p>{content.summary}</p>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>
        </main>

        <footer id="community" className="site-footer">
          <div className="page-container">
            <section id="getting-started" className="footer-cta" aria-labelledby="start-title">
              <div>
                <p className="eyebrow">{translate('start.eyebrow')}</p>
                <h2 id="start-title">
                  {translate('start.titleFirst')}
                  <br />
                  <span>{translate('start.titleSecond')}</span>
                </h2>
                <p>{translate('start.description')}</p>
                <div className="hero-actions">
                  <a href={docsUrl} className="button button-primary">
                    {translate('hero.docsCta')}
                    <ArrowRight size={17} aria-hidden="true" />
                  </a>
                  <a
                    href={site.repo}
                    className="button button-footer"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <SiGithub size={17} color="currentColor" aria-hidden="true" />
                    GitHub
                  </a>
                </div>
              </div>
              <div className="install-command">
                <Terminal size={19} aria-hidden="true" />
                <code>{installCommand}</code>
                <CopyCodeButton
                  code={installCommand}
                  label={translate('examples.copyCommand')}
                  copiedLabel={translate('examples.copied')}
                />
              </div>
            </section>
            <div className="footer-main">
              <div className="footer-brand">
                <a href={asset(`/${locale}/`)}>
                  <Image src={asset('/favicon.svg')} alt="" width={44} height={44} />
                  <strong>Orionis Framework</strong>
                </a>
                <p>{translate('footer.description')}</p>
                <ProjectStats
                  locale={locale}
                  starsLabel={translate('footer.stars')}
                  versionLabel={translate('footer.version')}
                  unavailableLabel={translate('footer.unavailable')}
                />
              </div>
              <div className="footer-links">
                {footerGroups.map((group) => (
                  <div key={group.label}>
                    <h3>{group.label}</h3>
                    <ul>
                      {group.links.map((link) => (
                        <li key={link.href}>
                          <a href={link.href} target="_blank" rel="noreferrer">
                            {link.label}
                            <ArrowUpRight size={13} aria-hidden="true" />
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
            <div className="footer-wordmark" aria-hidden="true">
              ORIONIS<span>.</span>
            </div>
            <div className="footer-bottom">
              <p>
                {translate('footer.copyright', {
                  year: new Date().getFullYear(),
                  name: site.author,
                })}
              </p>
              <span>
                <span className="status-mark" aria-hidden="true" />
                {translate('footer.madeFor')}
              </span>
            </div>
          </div>
        </footer>
      </div>
    </NextIntlClientProvider>
  );

  return <ProjectStatsProvider initialStats={stats}>{page}</ProjectStatsProvider>;
}
