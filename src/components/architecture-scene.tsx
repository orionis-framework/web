'use client';

import { Layers3, Minus, Pause, Play, Plus, RotateCcw } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useId, useRef, useState } from 'react';
import { lifecycleSequence, phaseDuration } from './architecture/lifecycle';
import { MAX_SCENE_ZOOM, MIN_SCENE_ZOOM } from './architecture/scene-camera';

interface ArchitectureSceneProps {
  labels: {
    description: string;
    pause: string;
    play: string;
    expand: string;
    collapse: string;
    reset: string;
    zoomIn: string;
    zoomOut: string;
    resetZoom: string;
    unavailable: string;
    lifecycle: string;
    interact: string;
    steps: { title: string; description: string; scope: string }[];
  };
}

export function ArchitectureScene({ labels }: ArchitectureSceneProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const settingsRef = useRef({
    paused: false,
    expanded: false,
    reducedMotion: false,
    phase: 0,
    zoom: 1,
  });
  const timelineRef = useRef(0);
  const resetRef = useRef<(() => void) | null>(null);
  const drawRef = useRef<(() => void) | null>(null);
  const zoomByRef = useRef<((direction: 1 | -1) => void) | null>(null);
  const zoomToRef = useRef<((value: number) => void) | null>(null);
  const [sceneStatus, setSceneStatus] = useState<{
    theme?: string;
    value: 'loading' | 'ready' | 'fallback';
  }>({ value: 'loading' });
  const [paused, setPaused] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [phase, setPhase] = useState(0);
  const [zoom, setZoom] = useState(1);
  const instructionsId = useId();
  const { resolvedTheme } = useTheme();
  const status = sceneStatus.theme === resolvedTheme ? sceneStatus.value : 'loading';

  useEffect(() => {
    const host = viewportRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas || !resolvedTheme) return;
    let cancelled = false;
    let dispose = () => {};
    function updateStatus(value: 'loading' | 'ready' | 'fallback') {
      if (!cancelled) setSceneStatus({ theme: resolvedTheme, value });
    }

    async function initialize() {
      const [{ createReactorScene }] = await Promise.all([
        import('./architecture/reactor-scene'),
        document.fonts.ready,
      ]);
      if (cancelled || !host || !canvas) return;
      updateStatus('loading');
      const scene = createReactorScene({
        canvas,
        host,
        dark: resolvedTheme === 'dark',
        settings: settingsRef.current,
        timeline: timelineRef,
        onPhase: setPhase,
        onReducedMotion: () => setPaused(true),
        onContextLost: () => updateStatus('fallback'),
        onReady: () => updateStatus('ready'),
        onZoom: setZoom,
      });
      dispose = scene.dispose;
      drawRef.current = scene.draw;
      resetRef.current = scene.reset;
      zoomByRef.current = scene.zoomBy;
      zoomToRef.current = scene.zoomTo;
    }
    initialize().catch(() => {
      dispose();
      updateStatus('fallback');
    });
    return () => {
      cancelled = true;
      dispose();
      resetRef.current = null;
      drawRef.current = null;
      zoomByRef.current = null;
      zoomToRef.current = null;
    };
  }, [resolvedTheme]);
  function selectPhase(index: number) {
    settingsRef.current.phase = index;
    settingsRef.current.paused = true;
    timelineRef.current = lifecycleSequence.indexOf(index) * phaseDuration;
    setPhase(index);
    setPaused(true);
    drawRef.current?.();
  }
  function togglePause() {
    // Reduced motion pauses autoplay. Explicit play lets the visitor opt into motion.
    if (paused) settingsRef.current.reducedMotion = false;
    settingsRef.current.paused = !paused;
    setPaused(!paused);
    drawRef.current?.();
  }
  function toggleExpanded() {
    settingsRef.current.expanded = !expanded;
    setExpanded(!expanded);
    drawRef.current?.();
  }

  return (
    <div
      className="architecture-scene"
      data-state={status}
      data-phase={phase}
      aria-busy={status === 'loading'}
      aria-hidden={status === 'loading'}
    >
      <div className="scene-heading" aria-hidden="true">
        <span>
          <span className="scene-status-dot" />
          {labels.lifecycle}
        </span>
        <span>01 — 05</span>
      </div>
      <div ref={viewportRef} className="scene-viewport">
        <div className="scene-instrument" aria-hidden="true">
          <span className="scene-corner scene-corner-top" />
          <span className="scene-corner scene-corner-bottom" />
        </div>
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={labels.description}
          aria-describedby={instructionsId}
          aria-hidden={status !== 'ready'}
        />
        {status === 'fallback' && (
          <p className="scene-unavailable" role="img" aria-label={labels.description}>
            {labels.unavailable}
          </p>
        )}
      </div>
      <div className="scene-toolbar">
        <span className="scene-interact" id={instructionsId}>
          {labels.interact}
        </span>
        <div className="scene-controls">
          <div className="scene-zoom-controls">
            <button
              type="button"
              className="icon-button"
              onClick={() => zoomByRef.current?.(-1)}
              disabled={status !== 'ready' || zoom <= MIN_SCENE_ZOOM + 0.001}
              aria-label={labels.zoomOut}
              title={labels.zoomOut}
            >
              <Minus size={16} />
            </button>
            <button
              type="button"
              className="scene-zoom-value"
              onClick={() => zoomToRef.current?.(1)}
              disabled={status !== 'ready'}
              aria-label={labels.resetZoom}
              title={labels.resetZoom}
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              type="button"
              className="icon-button"
              onClick={() => zoomByRef.current?.(1)}
              disabled={status !== 'ready' || zoom >= MAX_SCENE_ZOOM - 0.001}
              aria-label={labels.zoomIn}
              title={labels.zoomIn}
            >
              <Plus size={16} />
            </button>
          </div>
          <button
            type="button"
            className="icon-button"
            onClick={togglePause}
            disabled={status !== 'ready'}
            aria-pressed={paused}
            aria-label={paused ? labels.play : labels.pause}
            title={paused ? labels.play : labels.pause}
          >
            {paused ? <Play size={15} /> : <Pause size={15} />}
          </button>
          <button
            type="button"
            className="icon-button"
            onClick={toggleExpanded}
            disabled={status !== 'ready'}
            aria-pressed={expanded}
            aria-label={expanded ? labels.collapse : labels.expand}
            title={expanded ? labels.collapse : labels.expand}
          >
            <Layers3 size={16} />
          </button>
          <button
            type="button"
            className="icon-button"
            onClick={() => resetRef.current?.()}
            disabled={status !== 'ready'}
            aria-label={labels.reset}
            title={labels.reset}
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </div>
      <div className="scene-lifecycle" role="group" aria-label={labels.lifecycle}>
        <div
          className="scene-phase-detail"
          aria-live={paused ? 'polite' : 'off'}
          aria-atomic="true"
        >
          <span className="scene-phase-number">0{phase + 1}</span>
          <div>
            <span className="scene-phase-scope">{labels.steps[phase].scope}</span>
            <p>{labels.steps[phase].description}</p>
          </div>
        </div>
        <ol className="scene-steps">
          {labels.steps.map((step, index) => (
            <li key={step.title}>
              <button
                type="button"
                onClick={() => selectPhase(index)}
                aria-pressed={phase === index}
              >
                <span className="scene-step-track">
                  <span />
                </span>
                <span className="scene-step-label">
                  <span aria-hidden="true">0{index + 1}</span>
                  {step.title}
                </span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
