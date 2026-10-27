import { describe, expect, it } from 'vitest';
import {
  MAX_SCENE_ZOOM,
  MIN_SCENE_ZOOM,
  clampSceneZoom,
  fitSceneDistance,
  stepSceneZoom,
} from './scene-camera';

describe('scene zoom controls', () => {
  it('keeps wheel, pinch and button values inside the available zoom range', () => {
    expect(clampSceneZoom(-Infinity)).toBe(MIN_SCENE_ZOOM);
    expect(clampSceneZoom(0)).toBe(MIN_SCENE_ZOOM);
    expect(clampSceneZoom(Infinity)).toBe(MAX_SCENE_ZOOM);
    expect(clampSceneZoom(10)).toBe(MAX_SCENE_ZOOM);
    expect(clampSceneZoom(1)).toBe(1);
    expect(clampSceneZoom(Number.NaN)).toBe(1);
  });

  it('makes zoom-in and zoom-out reversible away from the limits', () => {
    const closer = stepSceneZoom(1, 1);
    expect(closer).toBeGreaterThan(1);
    expect(stepSceneZoom(closer, -1)).toBeCloseTo(1);
    const farther = stepSceneZoom(1, -1);
    expect(farther).toBeLessThan(1);
    expect(stepSceneZoom(farther, 1)).toBeCloseTo(1);
  });

  it('stops repeated button presses at each limit and lets visitors move away again', () => {
    let zoom = 1;
    for (let index = 0; index < 40; index++) zoom = stepSceneZoom(zoom, 1);
    expect(zoom).toBe(MAX_SCENE_ZOOM);
    expect(stepSceneZoom(zoom, -1)).toBeLessThan(MAX_SCENE_ZOOM);
    for (let index = 0; index < 40; index++) zoom = stepSceneZoom(zoom, -1);
    expect(zoom).toBe(MIN_SCENE_ZOOM);
    expect(stepSceneZoom(zoom, 1)).toBeGreaterThan(MIN_SCENE_ZOOM);
  });
});

describe('initial scene framing', () => {
  it.each([0.5, 1, 1.6, 2.8])('fits the full model at aspect ratio %s', (aspect) => {
    const distance = fitSceneDistance(aspect);
    const visibleHeight = 2 * distance * Math.tan((34 * Math.PI) / 360);
    expect(visibleHeight).toBeGreaterThanOrEqual(8.2 - 1e-10);
    expect(visibleHeight * aspect).toBeGreaterThanOrEqual(11 - 1e-10);
  });

  it('moves back in a narrow viewport and when a narrower lens is used', () => {
    expect(fitSceneDistance(0.5)).toBeGreaterThan(fitSceneDistance(2));
    expect(fitSceneDistance(1.5, 25)).toBeGreaterThan(fitSceneDistance(1.5, 45));
  });

  it('keeps the closest default-lens camera outside the physical sculpture', () => {
    expect(fitSceneDistance(3) / MAX_SCENE_ZOOM).toBeGreaterThan(6);
  });

  it('rejects unusable viewport or lens measurements', () => {
    for (const aspect of [0, -1, Infinity, NaN]) {
      expect(() => fitSceneDistance(aspect)).toThrow(RangeError);
    }
    for (const fov of [0, -1, 180, Infinity, NaN]) {
      expect(() => fitSceneDistance(1, fov)).toThrow(RangeError);
    }
  });
});
