'use client';

import { useEffect, useState } from 'react';
import snapshot from '@/content/benchmark-summary.json';
import environment from '@/content/benchmark-environment.json';
import type { Locale } from '@/i18n/routing';

const source =
  'https://raw.githubusercontent.com/orionis-framework/framework/refs/heads/benchmark-results/http-compare/';
const evidence =
  'https://github.com/orionis-framework/framework/tree/benchmark-results/http-compare';

export function BenchmarkSection({ locale }: { locale: Locale }) {
  const es = locale === 'es';
  const [data, setData] = useState({ summary: snapshot, environment });
  const [fresh, setFresh] = useState(false);
  const [workers, setWorkers] = useState(1);
  useEffect(() => {
    const controller = new AbortController();
    let pending = false;
    async function refresh() {
      if (pending || controller.signal.aborted) return;
      pending = true;
      const timeout = new AbortController();
      const timer = window.setTimeout(() => timeout.abort(), 15000);
      const signal = AbortSignal.any([controller.signal, timeout.signal]);
      const revision = Date.now();
      try {
        const read = async (file: string) => {
          const response = await fetch(source + file + '?refresh=' + revision, {
            signal,
            cache: 'no-store',
          });
          if (!response.ok) throw new Error('Benchmark unavailable');
          return response.json();
        };
        const [summary, env] = await Promise.all([read('summary.json'), read('environment.json')]);
        if (
          summary.schema_version !== 2 ||
          !Array.isArray(summary.results) ||
          !summary.results.length ||
          !Array.isArray(summary.settings?.workers) ||
          !summary.settings.workers.length ||
          !summary.settings.workers.every((w: number) => Number.isInteger(w) && w > 0) ||
          !summary.results.every(
            (r: (typeof snapshot.results)[number]) =>
              typeof r.framework === 'string' &&
              Number.isInteger(r.workers) &&
              Number.isFinite(r.requests_per_second) &&
              r.requests_per_second >= 0 &&
              Number.isFinite(r.mean_latency_ms) &&
              Number.isFinite(r.p95_latency_ms) &&
              Number.isFinite(r.errors),
          ) ||
          !Number.isFinite(Date.parse(env.recorded_at)) ||
          typeof env.commit !== 'string' ||
          typeof env.cpu !== 'string' ||
          !env.versions
        )
          return;
        if (!controller.signal.aborted) {
          setData((current) =>
            Date.parse(env.recorded_at) >= Date.parse(current.environment.recorded_at)
              ? { summary, environment: env }
              : current,
          );
          setWorkers((current) =>
            summary.settings.workers.includes(current) ? current : summary.settings.workers[0],
          );
          setFresh(true);
        }
      } catch {
        if (!controller.signal.aborted) setFresh(false);
        /* Preserve the last successful result on network failure. */
      } finally {
        window.clearTimeout(timer);
        pending = false;
      }
    }
    void refresh();
    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') void refresh();
    }, 60000);
    const onVisible = () => {
      if (document.visibilityState === 'visible') void refresh();
    };
    window.addEventListener('focus', onVisible);
    window.addEventListener('online', onVisible);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      controller.abort();
      window.clearInterval(interval);
      window.removeEventListener('focus', onVisible);
      window.removeEventListener('online', onVisible);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);
  const rows = data.summary.results
    .filter((r) => r.workers === workers && r.status === 'ok')
    .sort((a, b) => b.requests_per_second - a.requests_per_second);
  const top = rows[0]?.requests_per_second || 1;
  const orionis = rows.find((r) => r.framework.startsWith('orionis'));
  const number = (n: number, digits = 0) =>
    new Intl.NumberFormat(locale, { maximumFractionDigits: digits }).format(n);
  const name = (value: string) =>
    ({
      'orionis-asgi': 'Orionis ASGI',
      'orionis-rsgi': 'Orionis RSGI',
      fastapi: 'FastAPI',
      litestar: 'Litestar',
      starlette: 'Starlette',
    })[value] ?? value;
  return (
    <section
      id="benchmarks"
      className="benchmark-section page-container"
      aria-labelledby="benchmark-title"
    >
      <div className="benchmark-intro">
        <span className="eyebrow">HTTP BENCHMARK · 1.x</span>
        <h2 id="benchmark-title">
          {es ? 'Velocidad que puedes comprobar.' : 'Performance you can verify.'}
        </h2>
        <p>
          {es
            ? 'Todo el poder de Orionis. Resultados abiertos para explorar su rendimiento HTTP.'
            : 'All the power of Orionis. Open results to explore its HTTP performance.'}
        </p>
      </div>
      <div className="benchmark-panel">
        <div className="benchmark-controls">
          <span>{es ? 'Explora la ejecución' : 'Explore the run'}</span>
          <div role="group" aria-label="Workers">
            {data.summary.settings.workers.map((w) => (
              <button
                key={w}
                type="button"
                aria-pressed={workers === w}
                onClick={() => setWorkers(w)}
              >
                {w} {w === 1 ? 'worker' : 'workers'}
              </button>
            ))}
          </div>
        </div>
        <div className="benchmark-layout" aria-live="polite">
          <div className="benchmark-highlight">
            <span>{orionis ? name(orionis.framework) : 'Orionis'}</span>
            <strong>{orionis ? number(orionis.requests_per_second) : '—'}</strong>
            <span>{es ? 'solicitudes / segundo' : 'requests / second'}</span>
            <p>
              {orionis ? number(orionis.mean_latency_ms, 2) : '—'} ms ·{' '}
              {es ? 'latencia media' : 'mean latency'}
            </p>
            <small>
              {es ? 'Mejor resultado de Orionis con' : 'Best Orionis result with'} {workers}{' '}
              {workers === 1 ? 'worker' : 'workers'}.
            </small>
          </div>
          <div className="benchmark-chart">
            <p>
              {es
                ? 'Solicitudes por segundo · más es mejor'
                : 'Requests per second · higher is better'}
            </p>
            <p>
              {es
                ? 'Orionis (ASGI y RSGI) con Granian · FastAPI, Litestar y Starlette con Uvicorn.'
                : 'Orionis (ASGI and RSGI) with Granian · FastAPI, Litestar and Starlette with Uvicorn.'}
            </p>
            {rows.map((row) => (
              <div className="benchmark-row" key={row.framework}>
                <div>
                  <span>{name(row.framework)}</span>
                  <b>{number(row.requests_per_second)}</b>
                </div>
                <div className="benchmark-track">
                  <div
                    className={
                      row.framework.startsWith('orionis')
                        ? 'benchmark-bar orionis'
                        : 'benchmark-bar'
                    }
                    style={{ width: (row.requests_per_second / top) * 100 + '%' }}
                  />
                </div>
                <small>
                  P95 {number(row.p95_latency_ms, 2)} ms · {number(row.errors)}{' '}
                  {es ? 'errores' : 'errors'}
                </small>
              </div>
            ))}
          </div>
        </div>
        <details className="benchmark-context">
          <summary>
            {es ? 'Fecha, entorno y metodología' : 'Date, environment and methodology'}
          </summary>
          <p>
            {fresh
              ? es
                ? 'Datos actualizados'
                : 'Updated results'
              : es
                ? 'Último resultado disponible · actualización sin confirmar'
                : 'Last available result · update unconfirmed'}{' '}
            ·{' '}
            <time dateTime={data.environment.recorded_at}>
              {new Intl.DateTimeFormat(locale, {
                dateStyle: 'medium',
                timeStyle: 'short',
                timeZone: 'UTC',
              }).format(new Date(data.environment.recorded_at))}{' '}
              UTC
            </time>{' '}
            · {data.environment.commit.slice(0, 7)}
          </p>
          <p>
            Python {data.environment.python} · Orionis {data.environment.versions.orionis} ·{' '}
            {data.environment.cpu} · {data.environment.logical_cpus} vCPU
          </p>
          <p>
            {es
              ? 'Mediciones de esta ejecución de CI; el rendimiento depende del entorno y de la carga. Se muestran únicamente resultados completados correctamente. ASGI y RSGI son configuraciones distintas.'
              : 'Measurements from this CI run; performance depends on environment and workload. Only successful results are shown. ASGI and RSGI are distinct configurations.'}
          </p>
          <div className="benchmark-links">
            <a href={evidence}>{es ? 'Ver todas las pruebas ↗' : 'Explore the evidence ↗'}</a>
            <a href={source + 'environment.json'}>
              {es ? 'Entorno completo ↗' : 'Full environment ↗'}
            </a>
            <a
              href={
                es
                  ? 'https://docs.orionis-framework.com/es/getting-started'
                  : 'https://docs.orionis-framework.com/en/getting-started'
              }
            >
              {es ? 'Empieza con Orionis →' : 'Get started with Orionis →'}
            </a>
          </div>
        </details>
      </div>
    </section>
  );
}
