import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { ArchitectureScene } from './architecture-scene';
import englishMessages from '@/i18n/messages/en.json';
import spanishMessages from '@/i18n/messages/es.json';
import { MAX_SCENE_ZOOM, MIN_SCENE_ZOOM } from './architecture/scene-camera';

const { createScene, themeState } = vi.hoisted(() => ({
  createScene: vi.fn(),
  themeState: { resolvedTheme: 'light' as string | undefined },
}));
vi.mock('next-themes', () => ({ useTheme: () => ({ resolvedTheme: themeState.resolvedTheme }) }));
vi.mock('./architecture/reactor-scene', () => ({
  createReactorScene: createScene,
}));

type SceneOptions = Parameters<typeof import('./architecture/reactor-scene').createReactorScene>[0];

const fontsDescriptor = Object.getOwnPropertyDescriptor(document, 'fonts');

beforeAll(() => {
  Object.defineProperty(document, 'fonts', {
    configurable: true,
    value: { ready: Promise.resolve() },
  });
});

beforeEach(() => {
  themeState.resolvedTheme = 'light';
  createScene.mockReset();
  createScene.mockImplementation(() => {
    throw new Error('WebGL is unavailable');
  });
});

it('reveals only the final scene after its first rendered frame, without an intermediate poster', async () => {
  let sceneOptions: SceneOptions | undefined;
  createScene.mockImplementation((options: SceneOptions) => {
    sceneOptions = options;
    return {
      draw: vi.fn(),
      reset: vi.fn(),
      dispose: vi.fn(),
      zoomBy: vi.fn(),
      zoomTo: vi.fn(),
    };
  });
  const messages = englishMessages.Home.scene;
  const labels = { ...messages, steps: Object.values(messages.steps) };
  const view = render(<ArchitectureScene labels={labels} />);
  const scene = view.container.firstElementChild;
  expect(scene).toHaveAttribute('data-state', 'loading');
  expect(scene).toHaveAttribute('aria-busy', 'true');
  expect(scene).toHaveAttribute('aria-hidden', 'true');
  expect(view.container.querySelector('.architecture-poster')).not.toBeInTheDocument();
  expect(screen.queryByText(labels.unavailable)).not.toBeInTheDocument();

  await waitFor(() => expect(createScene).toHaveBeenCalledOnce());
  expect(scene).toHaveAttribute('data-state', 'loading');
  expect(view.container.querySelector('canvas')).toHaveAttribute('aria-hidden', 'true');
  expect(view.container.querySelector(`[aria-label="${labels.zoomIn}"]`)).toBeDisabled();

  act(() => sceneOptions?.onReady());
  expect(scene).toHaveAttribute('data-state', 'ready');
  expect(scene).toHaveAttribute('aria-busy', 'false');
  expect(scene).not.toHaveAttribute('aria-hidden', 'true');
  expect(screen.getByRole('img', { name: labels.description })).toBeVisible();
  expect(screen.getByRole('button', { name: labels.zoomIn })).toBeEnabled();
  expect(view.container.querySelector('.architecture-poster')).not.toBeInTheDocument();
  expect(screen.queryByText(labels.unavailable)).not.toBeInTheDocument();
});

it('waits for the resolved theme and hides the previous theme until its replacement frame is ready', async () => {
  const scenes: SceneOptions[] = [];
  const dispose = vi.fn();
  createScene.mockImplementation((options: SceneOptions) => {
    scenes.push(options);
    return { draw: vi.fn(), reset: vi.fn(), dispose, zoomBy: vi.fn(), zoomTo: vi.fn() };
  });
  themeState.resolvedTheme = undefined;
  const messages = englishMessages.Home.scene;
  const labels = { ...messages, steps: Object.values(messages.steps) };
  const view = render(<ArchitectureScene labels={labels} />);
  await act(async () => {
    await Promise.resolve();
  });
  expect(createScene).not.toHaveBeenCalled();
  expect(view.container.firstElementChild).toHaveAttribute('data-state', 'loading');

  themeState.resolvedTheme = 'light';
  view.rerender(<ArchitectureScene labels={labels} />);
  await waitFor(() => expect(scenes).toHaveLength(1));
  act(() => scenes[0].onReady());
  expect(view.container.firstElementChild).toHaveAttribute('data-state', 'ready');

  themeState.resolvedTheme = 'dark';
  view.rerender(<ArchitectureScene labels={labels} />);
  expect(view.container.firstElementChild).toHaveAttribute('data-state', 'loading');
  expect(dispose).toHaveBeenCalledOnce();
  act(() => scenes[0].onReady());
  expect(view.container.firstElementChild).toHaveAttribute('data-state', 'loading');
  await waitFor(() => expect(scenes).toHaveLength(2));
  expect(scenes[1].dark).toBe(true);
  act(() => scenes[1].onReady());
  expect(view.container.firstElementChild).toHaveAttribute('data-state', 'ready');
  expect(view.container.querySelector('.architecture-poster')).not.toBeInTheDocument();
});

afterEach(cleanup);

afterAll(() => {
  if (fontsDescriptor) Object.defineProperty(document, 'fonts', fontsDescriptor);
  else Reflect.deleteProperty(document, 'fonts');
});

it('connects the ready scene controls to playback, expansion, camera reset and cleanup', async () => {
  const draw = vi.fn();
  const reset = vi.fn();
  const dispose = vi.fn();
  const zoomBy = vi.fn();
  const zoomTo = vi.fn();
  let sceneOptions: SceneOptions | undefined;
  createScene.mockImplementation((options: SceneOptions) => {
    sceneOptions = options;
    queueMicrotask(options.onReady);
    return { draw, reset, dispose, zoomBy, zoomTo };
  });
  const messages = englishMessages.Home.scene;
  const labels = { ...messages, steps: Object.values(messages.steps) };
  const view = render(<ArchitectureScene labels={labels} />);
  await waitFor(() => {
    expect(view.container.firstElementChild).toHaveAttribute('data-state', 'ready');
  });
  expect(screen.getByRole('button', { name: labels.pause })).toBeEnabled();

  fireEvent.click(screen.getByRole('button', { name: labels.steps[2].title }));
  expect(sceneOptions?.settings.phase).toBe(2);
  expect(sceneOptions?.settings.paused).toBe(true);
  expect(screen.getByRole('button', { name: labels.play })).toHaveAttribute('aria-pressed', 'true');
  expect(draw).toHaveBeenCalledTimes(1);

  fireEvent.click(screen.getByRole('button', { name: labels.play }));
  expect(sceneOptions?.settings.paused).toBe(false);
  expect(screen.getByRole('button', { name: labels.pause })).toHaveAttribute(
    'aria-pressed',
    'false',
  );

  fireEvent.click(screen.getByRole('button', { name: labels.expand }));
  expect(sceneOptions?.settings.expanded).toBe(true);
  expect(screen.getByRole('button', { name: labels.collapse })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  fireEvent.click(screen.getByRole('button', { name: labels.collapse }));
  expect(sceneOptions?.settings.expanded).toBe(false);
  expect(draw).toHaveBeenCalledTimes(4);

  fireEvent.click(screen.getByRole('button', { name: labels.reset }));
  expect(reset).toHaveBeenCalledOnce();
  view.unmount();
  expect(dispose).toHaveBeenCalledOnce();
});

it('offers accessible zoom controls, reflects wheel or pinch updates, and respects zoom limits', async () => {
  let sceneOptions: SceneOptions | undefined;
  const zoomBy = vi.fn();
  const zoomTo = vi.fn((value: number) => sceneOptions?.onZoom(value));
  const reset = vi.fn(() => sceneOptions?.onZoom(1));
  createScene.mockImplementation((options: SceneOptions) => {
    sceneOptions = options;
    queueMicrotask(options.onReady);
    return { draw: vi.fn(), reset, dispose: vi.fn(), zoomBy, zoomTo };
  });
  const messages = englishMessages.Home.scene;
  const labels = { ...messages, steps: Object.values(messages.steps) };
  const view = render(<ArchitectureScene labels={labels} />);
  await waitFor(() => {
    expect(view.container.firstElementChild).toHaveAttribute('data-state', 'ready');
  });

  const zoomIn = screen.getByRole('button', { name: labels.zoomIn });
  const zoomOut = screen.getByRole('button', { name: labels.zoomOut });
  const resetZoom = screen.getByRole('button', { name: labels.resetZoom });
  expect(zoomIn).toBeEnabled();
  expect(zoomOut).toBeEnabled();
  expect(resetZoom).toHaveTextContent('100%');
  expect(sceneOptions?.settings.zoom).toBe(1);

  fireEvent.click(zoomIn);
  expect(zoomBy).toHaveBeenLastCalledWith(1);
  fireEvent.click(zoomOut);
  expect(zoomBy).toHaveBeenLastCalledWith(-1);

  act(() => sceneOptions?.onZoom(MAX_SCENE_ZOOM));
  expect(zoomIn).toBeDisabled();
  expect(zoomOut).toBeEnabled();
  expect(resetZoom).toHaveTextContent('185%');
  fireEvent.click(zoomIn);
  expect(zoomBy).toHaveBeenCalledTimes(2);

  act(() => sceneOptions?.onZoom(MIN_SCENE_ZOOM));
  expect(zoomOut).toBeDisabled();
  expect(zoomIn).toBeEnabled();
  expect(resetZoom).toHaveTextContent('72%');
  fireEvent.click(zoomOut);
  expect(zoomBy).toHaveBeenCalledTimes(2);

  fireEvent.click(resetZoom);
  expect(zoomTo).toHaveBeenCalledWith(1);
  expect(resetZoom).toHaveTextContent('100%');
  expect(zoomIn).toBeEnabled();
  expect(zoomOut).toBeEnabled();

  act(() => sceneOptions?.onZoom(1.4));
  expect(resetZoom).toHaveTextContent('140%');
  fireEvent.click(screen.getByRole('button', { name: labels.reset }));
  expect(reset).toHaveBeenCalledOnce();
  expect(resetZoom).toHaveTextContent('100%');
});

describe.each([
  ['English', englishMessages.Home.scene],
  ['Spanish', spanishMessages.Home.scene],
] as const)('application lifecycle in %s without WebGL', (_language, messages) => {
  async function renderFallback() {
    const labels = { ...messages, steps: Object.values(messages.steps) };
    const view = render(<ArchitectureScene labels={labels} />);
    await waitFor(() => {
      expect(view.container.firstElementChild).toHaveAttribute('data-state', 'fallback');
    });
    return labels;
  }

  it('shows only a localized failure message and retains all five manual lifecycle controls', async () => {
    const labels = await renderFallback();
    expect(screen.getByRole('img', { name: labels.description })).toBeVisible();
    expect(screen.getByText(labels.unavailable)).toBeVisible();
    expect(document.querySelector('.architecture-poster')).not.toBeInTheDocument();
    const lifecycle = screen.getByRole('group', { name: labels.lifecycle });
    expect(within(lifecycle).getAllByRole('button')).toHaveLength(5);
    labels.steps.forEach((step) => {
      expect(
        within(lifecycle).getByRole('button', { name: (name) => name.endsWith(step.title) }),
      ).toBeEnabled();
    });
    expect(within(lifecycle).getByText(labels.steps[0].description)).toBeVisible();
    expect(within(lifecycle).getByText(labels.steps[0].scope)).toBeVisible();
    expect(screen.getByRole('button', { name: labels.pause })).toBeDisabled();
    expect(screen.getByRole('button', { name: labels.expand })).toBeDisabled();
    expect(screen.getByRole('button', { name: labels.reset })).toBeDisabled();
    expect(screen.getByRole('button', { name: labels.zoomIn })).toBeDisabled();
    expect(screen.getByRole('button', { name: labels.zoomOut })).toBeDisabled();
    expect(screen.getByRole('button', { name: labels.resetZoom })).toBeDisabled();
  });

  it('lets visitors inspect every lifecycle stage and keeps exactly one stage selected', async () => {
    const labels = await renderFallback();
    const lifecycle = screen.getByRole('group', { name: labels.lifecycle });
    const buttons = within(lifecycle).getAllByRole('button');

    for (const index of [1, 2, 3, 4, 0]) {
      fireEvent.click(buttons[index]);
      buttons.forEach((button, buttonIndex) => {
        expect(button).toHaveAttribute('aria-pressed', String(buttonIndex === index));
      });
      expect(within(lifecycle).getByText(labels.steps[index].description)).toBeVisible();
      expect(within(lifecycle).getByText(labels.steps[index].scope)).toBeVisible();
      const previous = labels.steps[(index + 4) % 5];
      expect(within(lifecycle).queryByText(previous.description)).not.toBeInTheDocument();
    }
  });

  it('keeps automatic playback silent and announces a manually selected stage', async () => {
    const labels = await renderFallback();
    const lifecycle = screen.getByRole('group', { name: labels.lifecycle });
    const initialDetail = within(lifecycle)
      .getByText(labels.steps[0].description)
      .closest('[aria-live]');
    expect(initialDetail).toHaveAttribute('aria-live', 'off');
    expect(within(lifecycle).queryByRole('status')).not.toBeInTheDocument();
    expect(within(lifecycle).queryByRole('alert')).not.toBeInTheDocument();

    fireEvent.click(
      within(lifecycle).getByRole('button', {
        name: (name) => name.endsWith(labels.steps[2].title),
      }),
    );
    const selectedDetail = within(lifecycle)
      .getByText(labels.steps[2].description)
      .closest('[aria-live]');
    expect(selectedDetail).toHaveAttribute('aria-live', 'polite');
  });
});
