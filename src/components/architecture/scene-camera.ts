export const MIN_SCENE_ZOOM = 0.72;
export const MAX_SCENE_ZOOM = 1.85;

const ZOOM_STEP = 1.2;
const SCENE_HEIGHT = 8.2;
const SCENE_WIDTH = 11;

/** A larger value brings the camera closer while keeping it outside the reactor. */
export function clampSceneZoom(zoom: number): number {
  return Number.isNaN(zoom) ? 1 : Math.min(MAX_SCENE_ZOOM, Math.max(MIN_SCENE_ZOOM, zoom));
}

export function stepSceneZoom(current: number, direction: 1 | -1): number {
  return clampSceneZoom(clampSceneZoom(current) * ZOOM_STEP ** direction);
}

/** Fit the complete sculpture before applying the visitor's zoom level. */
export function fitSceneDistance(aspect: number, verticalFovDegrees = 34): number {
  if (!Number.isFinite(aspect) || aspect <= 0) {
    throw new RangeError('The scene aspect ratio must be positive and finite.');
  }
  if (
    !Number.isFinite(verticalFovDegrees) ||
    verticalFovDegrees <= 0 ||
    verticalFovDegrees >= 180
  ) {
    throw new RangeError('The vertical field of view must be between 0 and 180 degrees.');
  }
  const halfAngle = (verticalFovDegrees * Math.PI) / 360;
  return Math.max(
    SCENE_HEIGHT / (2 * Math.tan(halfAngle)),
    SCENE_WIDTH / (2 * Math.tan(halfAngle) * aspect),
  );
}
